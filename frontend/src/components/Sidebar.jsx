import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../AppContext';
import { useAuth } from '../AuthContext';
import { api, BASE_URL } from '../api';

import { LayoutDashboard, Users, BookOpen, CreditCard, Receipt, FileBarChart, Settings, ShieldAlert, LogOut } from 'lucide-react';

const nav = [
  { to: '/dashboard', labelKey: 'dashboard', icon: <LayoutDashboard size={20} strokeWidth={2.5} /> },
  { to: '/students', labelKey: 'students', icon: <Users size={20} strokeWidth={2.5} /> },
  { to: '/classes', labelKey: 'classes', icon: <BookOpen size={20} strokeWidth={2.5} /> },
  { to: '/fees', labelKey: 'feeStructure', icon: <CreditCard size={20} strokeWidth={2.5} /> },
  { to: '/payments', labelKey: 'payments', icon: <Receipt size={20} strokeWidth={2.5} /> },
  { to: '/reports', labelKey: 'reports', icon: <FileBarChart size={20} strokeWidth={2.5} /> },
  { to: '/settings', labelKey: 'settings', icon: <Settings size={20} strokeWidth={2.5} /> },
  { to: '/audit-logs', labelKey: 'auditLogs', icon: <ShieldAlert size={20} strokeWidth={2.5} /> },
];

export default function Sidebar({ onClose }) {
  const { t } = useApp();
  const { user, logout } = useAuth();
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    async function fetchLogo() {
      try {
        const s = await api.getSettings();
        if (s?.logo_path) {
          if (s.logo_path.startsWith('data:image')) {
            setLogoUrl(s.logo_path);
          } else {
            setLogoUrl(`${BASE_URL}/${s.logo_path}`);
          }
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    }
    fetchLogo();
  }, []);

  return (
    <aside className="flex h-screen w-72 flex-col bg-slate-950 border-r border-slate-900 text-slate-100 shadow-2xl z-20 font-sans">
      {/* Brand Header */}
      <div className="px-6 py-8 flex flex-col items-center text-center gap-2">
        <div className="w-16 h-16 bg-white border-4 border-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 overflow-hidden p-1 relative group">
          {logoUrl ? (
            <img src={logoUrl} alt="Institution Logo" className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110" />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">TA</div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-[18px] font-black uppercase tracking-[0.15em] text-white">THAYAGAM</p>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-500 mt-1">ACADEMY</p>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5 px-4 py-2 overflow-y-auto">
        {nav.map((item) => {
          if (item.adminOnly && user?.role !== 'admin') return null;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`
              }
              onClick={() => onClose && onClose()}
            >
              <span className="transition-transform duration-200 group-hover:scale-110">{item.icon}</span>
              {item.labelKey === 'auditLogs' ? 'Audit Logs' : t(item.labelKey)}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile / Admin Info */}
      {user && (
        <div className="px-4 mt-2 mb-2">
          <div className="bg-slate-900 rounded-2xl p-3 flex items-center gap-4 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-emerald-500 font-bold text-lg border border-emerald-500/20">
              {user.role === 'admin' ? 'A' : user.role === 'principal' ? 'P' : user.role === 'accountant' ? 'Ac' : 'S'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user.username || user.role}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Button */}
      <div className="px-4 py-3">
         <button 
           onClick={() => logout && logout()}
           className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 group text-slate-400 hover:bg-rose-500 hover:text-white w-full hover:shadow-lg hover:shadow-rose-500/20"
         >
            <LogOut size={20} className="transition-transform duration-200 group-hover:-translate-x-1" strokeWidth={2.5} />
            Sign Out
         </button>
      </div>

      {/* Footer Info */}
      <div className="px-4 pb-6 border-t border-white/5 pt-4 text-center">
        <p className="text-[9px] text-slate-500 font-medium tracking-[0.1em] uppercase leading-relaxed">
          THAYAGAM ACADEMY<br/>SYSTEM v1.0.0
        </p>
      </div>
    </aside>
  );
}
