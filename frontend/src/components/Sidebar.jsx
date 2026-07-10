import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../AppContext';
import { useAuth } from '../AuthContext';
import { api } from '../api';

const nav = [
  { 
    to: '/dashboard', 
    labelKey: 'dashboard',     
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  { 
    to: '/students',  
    labelKey: 'students',       
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-4-9 4 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    )
  },
  { 
    to: '/classes',   
    labelKey: 'classes',        
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  { 
    to: '/fees',      
    labelKey: 'feeStructure',  
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    )
  },
  { 
    to: '/payments',  
    labelKey: 'payments',       
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  { 
    to: '/reports',   
    labelKey: 'reports',        
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  { 
    to: '/settings',  
    labelKey: 'settings',       
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    adminOnly: true
  },
  { 
    to: '/audit-logs',  
    labelKey: 'auditLogs',       
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    adminOnly: true
  },
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
          setLogoUrl(`http://localhost:8000/${s.logo_path}`);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    }
    fetchLogo();
  }, []);

  return (
    <aside className="flex h-screen w-72 flex-col bg-[#02021c] border-r border-[#02021c] text-slate-100 shadow-2xl z-20">
      {/* Brand Header */}
      <div className="px-6 py-8 flex flex-col items-center text-center gap-2">
        <div className="w-16 h-16 bg-white border-[2.5px] border-[#efc000] rounded-2xl flex items-center justify-center shadow-lg overflow-hidden p-1">
          {logoUrl ? (
            <img src={logoUrl} alt="Institution Logo" className="w-full h-full object-contain" />
          ) : (
            <span className="text-[#efc000] font-bold text-2xl">🏫</span>
          )}
        </div>
        <div className="mt-3">
          <p className="text-[18px] font-bold uppercase tracking-[0.15em] text-white">THAYAGAM</p>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#efc000] mt-1">ACADEMY</p>
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
                    ? 'bg-[#efc000] text-[#02021c] shadow-md'
                    : 'text-slate-300 hover:bg-[#111133] hover:text-white'
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
        <div className="px-4 mt-2">
          <div className="bg-[#0b0b2b] rounded-2xl p-3 flex items-center gap-4 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-[#02021c] flex items-center justify-center text-[#efc000] font-bold text-lg border border-[#efc000]/20">
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
           className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 group text-slate-300 hover:bg-[#111133] hover:text-white w-full"
         >
            <svg className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
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
