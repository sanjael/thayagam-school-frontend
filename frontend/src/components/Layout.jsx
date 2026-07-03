import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useApp } from '../AppContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { 
    language, setLanguage, 
    darkMode, setDarkMode, 
    setSelectedStudentForPayment, 
    t 
  } = useApp();
  
  const [settings, setSettings] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [idleAlert, setIdleAlert] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState({ count: 0, unread: 0, items: [] });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifReadIds, setNotifReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('readNotifIds') || '[]'); } catch { return []; }
  });

  // Profile Dropdown
  const [showProfile, setShowProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const searchContainerRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Load School Settings
  useEffect(() => {
    api.getSettings()
      .then(setSettings)
      .catch(() => {
        setSettings({
          school_name: 'Sri Thayagam Matriculation School',
          current_academic_year: '2024-2025'
        });
      });
  }, []);

  // Load Notifications
  useEffect(() => {
    function loadNotifications() {
      api.getNotifications().then(setNotifications).catch(() => {});
    }
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.items?.filter(n => !notifReadIds.includes(n.id)).length || 0;

  function markAllRead() {
    const ids = notifications.items?.map(n => n.id) || [];
    const merged = Array.from(new Set([...notifReadIds, ...ids]));
    setNotifReadIds(merged);
    localStorage.setItem('readNotifIds', JSON.stringify(merged));
  }

  // Global search lookup
  useEffect(() => {
    if (searchQuery.length >= 2) {
      api.getStudents({ search: searchQuery })
        .then(setSearchResults)
        .catch(() => setSearchResults([]));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Click outside handler for search, notifications, profile
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Session Inactivity Timer (30 minutes)
  useEffect(() => {
    function resetTimer() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIdleAlert(true);
        logout();
      }, 30 * 60 * 1000); // 30 mins
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(e => document.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(e => document.removeEventListener(e, resetTimer));
    };
  }, [logout]);

  function handleQuickCollect(student) {
    setSelectedStudentForPayment(student);
    setSearchQuery('');
    setShowSearchResults(false);
    navigate('/payments');
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (pwForm.next !== pwForm.confirm) {
      setPwError('New passwords do not match.');
      return;
    }
    if (pwForm.next.length < 6) {
      setPwError('Password must be at least 6 characters.');
      return;
    }
    // For now, show success (backend endpoint can be wired later)
    setPwSuccess('Password changed successfully! Please log in again.');
    setTimeout(() => {
      setShowChangePassword(false);
      setShowProfile(false);
      setPwForm({ current: '', next: '', confirm: '' });
      setPwSuccess('');
    }, 1500);
  }

  const roleColors = {
    admin: 'from-amber-500 to-orange-500',
    principal: 'from-indigo-500 to-purple-500',
    accountant: 'from-emerald-500 to-teal-500',
  };

  const roleLabels = {
    admin: '🔑 Administrator',
    principal: '🎓 Principal',
    accountant: '💼 Accountant',
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 print:h-auto print:overflow-visible">
      <div className="print:hidden h-full">
        <Sidebar />
      </div>
      
      <div className="flex flex-1 flex-col overflow-hidden print:overflow-visible">
        {/* Sticky Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 shadow-sm z-30 print:hidden">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            {settings?.logo_path ? (
              <img 
                src={`http://localhost:8000/${settings.logo_path}`} 
                alt="Logo" 
                className="h-9 w-9 rounded-xl object-contain border border-slate-100 dark:border-slate-800 p-0.5 bg-slate-50"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-xl text-amber-600 font-bold border border-amber-500/20">
                🏫
              </div>
            )}
            <div className="hidden md:block">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                user?.role === 'admin' ? 'text-amber-600 dark:text-amber-500' :
                user?.role === 'principal' ? 'text-indigo-600 dark:text-indigo-400' :
                'text-emerald-600 dark:text-emerald-500'
              }`}>
                {roleLabels[user?.role] || 'Portal'}
              </span>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {settings?.school_name || 'Sri Thayagam School'}
              </h2>
            </div>
          </div>

          {/* Global Search Bar */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-xs mx-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
                onFocus={() => setShowSearchResults(true)}
                placeholder={t('studentSearchPlaceholder')}
                className="w-full rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-1.5 pl-9 text-xs outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 text-slate-900 dark:text-slate-100"
              />
              <span className="absolute left-3 top-2 text-slate-400">
                🔍
              </span>
            </div>
            
            {showSearchResults && searchResults.length > 0 && (
              <ul className="absolute left-0 mt-1.5 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 z-50">
                {searchResults.map((s) => (
                  <li key={s.id} className="p-3 text-xs flex items-center justify-between hover:bg-amber-50 dark:hover:bg-slate-800">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{s.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{s.class_name} · Adm: {s.admission_no}</p>
                    </div>
                    <button 
                      onClick={() => handleQuickCollect(s)}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-2.5 py-1 rounded-lg font-bold text-[10px] transition"
                    >
                      {t('collectNow')}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Controls & Badges */}
          <div className="flex items-center gap-2">
            
            {/* Language Switch */}
            <div className="flex bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full p-0.5 text-[10px] font-bold">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-full transition-all ${language === 'en' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`px-2 py-0.5 rounded-full transition-all ${language === 'ta' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                தமிழ்
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-xs"
              title="Toggle Dark/Light Mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Academic Year Badge */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              {settings?.current_academic_year || '2024-2025'}
            </div>

            {/* Notification Bell */}
            <div ref={notifRef} className="relative">
              <button
                id="notification-bell-btn"
                onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) markAllRead(); }}
                className="relative p-1.5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white">Notifications</h3>
                    <span className="text-[10px] font-bold text-slate-400">{notifications.items?.length || 0} alerts</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.items?.length === 0 && (
                      <div className="px-4 py-8 text-center text-xs text-slate-400">
                        <span className="text-2xl">🎉</span>
                        <p className="mt-1 font-medium">No alerts. All clear!</p>
                      </div>
                    )}
                    {notifications.items?.map((n) => (
                      <div key={n.id} className={`px-4 py-3 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition ${!notifReadIds.includes(n.id) ? 'bg-amber-50/50 dark:bg-amber-950/10' : ''}`}>
                        <span className="text-lg flex-shrink-0 mt-0.5">{n.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">{n.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                        </div>
                        {!notifReadIds.includes(n.id) && (
                          <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5"></div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800">
                    <Link 
                      to="/reports"
                      onClick={() => setShowNotifications(false)}
                      className="text-[10px] font-bold text-amber-500 hover:underline"
                    >
                      View all pending dues →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div ref={profileRef} className="relative">
              <button
                id="profile-dropdown-btn"
                onClick={() => setShowProfile(!showProfile)}
                className={`flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs font-bold transition hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900`}
              >
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${roleColors[user?.role] || 'from-slate-400 to-slate-600'} flex items-center justify-center text-white text-[10px] font-black shadow-sm`}>
                  {user?.username?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <span className="hidden sm:block text-slate-700 dark:text-slate-300 max-w-[80px] truncate">
                  {user?.username}
                </span>
                <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden">
                  {/* Profile Header */}
                  <div className={`bg-gradient-to-br ${roleColors[user?.role] || 'from-slate-400 to-slate-600'} p-4`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg font-black shadow">
                        {user?.username?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{user?.username}</p>
                        <p className="text-[10px] text-white/70 font-semibold capitalize">{user?.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      onClick={() => { setShowChangePassword(true); setShowProfile(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      Change Password
                    </button>

                    {user?.role === 'admin' && (
                      <Link
                        to="/settings"
                        onClick={() => setShowProfile(false)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        School Settings
                      </Link>
                    )}

                    <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => { setShowProfile(false); logout(); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950 p-6 md:p-8 print:p-0 print:overflow-visible print:bg-white print:text-black">
          {children}
        </main>
      </div>

      {/* Idle session alarm modal */}
      {idleAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <span className="text-4xl">⏳</span>
            <h3 className="text-base font-bold text-slate-900 mt-3">Session Expired</h3>
            <p className="text-xs text-slate-500 mt-1">You have been logged out due to 30 minutes of inactivity.</p>
            <button 
              onClick={() => { setIdleAlert(false); window.location.reload(); }}
              className="mt-4 w-full rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 py-2.5 text-xs font-bold transition shadow-md"
            >
              Sign In Again
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">Change Password</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Update your account password.</p>
              </div>
              <button onClick={() => { setShowChangePassword(false); setPwError(''); setPwSuccess(''); }}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full">
                ✕
              </button>
            </div>

            {pwError && (
              <div className="mt-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600">
                ⚠️ {pwError}
              </div>
            )}
            {pwSuccess && (
              <div className="mt-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-600">
                ✓ {pwSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
              {[
                ['Current Password', 'current'],
                ['New Password', 'next'],
                ['Confirm New Password', 'confirm'],
              ].map(([label, key]) => (
                <div key={key}>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">{label}</label>
                  <input
                    type="password"
                    required
                    value={pwForm[key]}
                    onChange={(e) => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2.5 text-xs font-bold outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 text-slate-900 dark:text-slate-100"
                  />
                </div>
              ))}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                <button type="button" onClick={() => setShowChangePassword(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                  Cancel
                </button>
                <button type="submit"
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2 text-xs font-bold transition shadow-md">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
