from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import require_role
import os, shutil

router = APIRouter(prefix="/settings", tags=["Settings"])
UPLOAD_DIR = "static/logos"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/", response_model=schemas.SchoolSettingsOut)
def get_settings(db: Session = Depends(get_db)):
    s = db.query(models.SchoolSettings).first()
    if not s:
        raise HTTPException(404, "Settings not configured")
    return s


@router.put("/", response_model=schemas.SchoolSettingsOut, dependencies=[Depends(require_role(["admin"]))])
def update_settings(payload: schemas.SchoolSettingsUpdate, db: Session = Depends(get_db)):
    s = db.query(models.SchoolSettings).first()
    if not s:
        s = models.SchoolSettings(school_name="School")
        db.add(s)
    for k, v in payload.dict(exclude_none=True).items():
        setattr(s, k, v)
    db.commit()
    db.refresh(s)
    return s


@router.post("/logo", dependencies=[Depends(require_role(["admin"]))])
def upload_logo(file: UploadFile = File(...), db: Session = Depends(get_db)):
    ext = file.filename.split(".")[-1].lower()
    if ext not in ("png", "jpg", "jpeg"):
        raise HTTPException(400, "Only PNG/JPG allowed")
    path = f"{UPLOAD_DIR}/school_logo.{ext}"
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    s = db.query(models.SchoolSettings).first()
    if s:
        s.logo_path = path
        db.commit()
    return {"logo_path": path}
