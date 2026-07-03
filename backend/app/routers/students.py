from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import models, schemas
from app.auth import require_role

router = APIRouter(prefix="/students", tags=["Students"])


def _enrich(s: models.Student) -> schemas.StudentOut:
    out = schemas.StudentOut.from_orm(s)
    out.class_name = s.class_.name if s.class_ else None
    return out


@router.get("/", response_model=List[schemas.StudentOut])
def get_students(
    search: Optional[str] = Query(None),
    class_id: Optional[int] = Query(None),
    gender: Optional[str] = Query(None),
    status: Optional[str] = Query("active"),  # active | inactive | all
    db: Session = Depends(get_db),
):
    q = db.query(models.Student)
    if status == "active":
        q = q.filter(models.Student.is_active == True)
    elif status == "inactive":
        q = q.filter(models.Student.is_active == False)
    # status == "all" → no filter
    if search:
        q = q.filter(
            (models.Student.name.ilike(f"%{search}%")) |
            (models.Student.admission_no.ilike(f"%{search}%")) |
            (models.Student.phone.ilike(f"%{search}%"))
        )
    if class_id:
        q = q.filter(models.Student.class_id == class_id)
    if gender:
        q = q.filter(models.Student.gender == gender)
    return [_enrich(s) for s in q.order_by(models.Student.name).all()]


@router.get("/{student_id}", response_model=schemas.StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db)):
    s = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not s:
        raise HTTPException(404, "Student not found")
    return _enrich(s)


@router.post("/", response_model=schemas.StudentOut, dependencies=[Depends(require_role(["admin", "accountant"]))])
def create_student(payload: schemas.StudentCreate, db: Session = Depends(get_db)):
    if db.query(models.Student).filter(models.Student.admission_no == payload.admission_no).first():
        raise HTTPException(400, "Admission number already exists")
    s = models.Student(**payload.dict())
    db.add(s)
    db.commit()
    db.refresh(s)
    return _enrich(s)


@router.put("/{student_id}", response_model=schemas.StudentOut, dependencies=[Depends(require_role(["admin", "accountant"]))])
def update_student(student_id: int, payload: schemas.StudentUpdate, db: Session = Depends(get_db)):
    s = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not s:
        raise HTTPException(404, "Student not found")
    for k, v in payload.dict(exclude_none=True).items():
        setattr(s, k, v)
    
    # Audit Log
    current_user = db.query(models.User).filter(models.User.id == getattr(db, "_current_user_id", 1)).first() # fallback if not injected
    
    db.commit()
    db.refresh(s)
    return _enrich(s)


@router.delete("/{student_id}")
def delete_student(
    student_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(["admin"]))
):
    s = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not s:
        raise HTTPException(404, "Student not found")
    s.is_active = False
    
    audit = models.AuditLog(
        user_id=current_user.id,
        action="Delete Student",
        details=f"Deactivated student {s.name} ({s.admission_no})"
    )
    db.add(audit)
    
    db.commit()
    return {"message": "Student deactivated"}
