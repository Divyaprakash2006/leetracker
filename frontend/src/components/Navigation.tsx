import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTrackedUsers } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { trackedUsers } = useTrackedUsers();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/users', label: 'Tracked Users' },
    { path: '/analytics', label: 'Analytics' }
  ];

  const handleSearch = () => {
    const username = searchQuery.trim().toLowerCase();
    if (!username) return;

    // Check if user is in tracked list
    const user = trackedUsers.find(u => u.username.toLowerCase() === username);
    
    if (user) {
      navigate(`/user/${user.username}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    } else {
      alert(`User "${searchQuery}" is not being tracked. Please add them first from the Tracked Users page.`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container mx-auto max-w-[1200px] px-3 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-bold text-gray-900 group">
              {/* LeetCode-style Logo with hover effect */}
              <div className="relative w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <div className="absolute inset-0 bg-orange-500 rounded-lg opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500"></div>
                <svg viewBox="0 0 24 24" className="w-full h-full relative z-10">
                  {/* Left bracket */}
                  <path
                    d="M 4 4 C 3 4 2 5 2 6 L 2 18 C 2 19 3 20 4 20"
                    fill="none"
                    stroke="#000"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Middle dash */}
                  <line
                    x1="9"
                    y1="12"
                    x2="15"
                    y2="12"
                    stroke="#a0a0a0"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Right orange bracket */}
                  <path
                    d="M 20 4 C 21 4 22 5 22 6 L 22 18 C 22 19 21 20 20 20"
                    fill="none"
                    stroke="#FFA116"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="hidden sm:inline tracking-tight group-hover:tracking-wide bg-gradient-to-r from-gray-900 via-orange-500 to-gray-900 bg-clip-text group-hover:text-transparent transition-all duration-500" style={{fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>LeetTrack</span>
            </Link>
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3 lg:px-4 py-2 text-xs lg:text-sm font-semibold uppercase tracking-wider transition-all duration-300 group/nav
                    ${location.pathname === item.path
                      ? 'text-orange-500 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-orange-500 after:animate-pulse'
                      : 'text-gray-600 hover:text-gray-900 hover:scale-105 before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:w-0 before:h-0.5 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-full'
                    }`}
                  style={{fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', letterSpacing: '0.05em'}}
                >
                  <span className="relative z-10">{item.label}</span>
                  {location.pathname !== item.path && (
                    <div className="absolute inset-0 bg-orange-500/10 rounded-lg opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 -z-10"></div>
                  )}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Optimized Search - Hidden on small screens */}
            <div className="hidden sm:block">
              <div className="relative group">
                {/* Gradient border glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-xl opacity-0 group-hover:opacity-100 blur transition-all duration-300 group-focus-within:opacity-100"></div>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                  className="relative flex items-center bg-white backdrop-blur-xl rounded-xl border border-gray-200 focus-within:border-gray-300 transition-all duration-300 shadow-lg overflow-hidden"
                >
                  {/* Background gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Search Icon */}
                  <div className="relative z-10 pl-3 sm:pl-4 pr-2 py-2 sm:py-2.5">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 transition-colors duration-200 group-hover:text-orange-400 group-focus-within:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  {/* Optimized Input Field */}
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="relative z-10 w-24 sm:w-32 md:w-40 lg:w-48 py-2 sm:py-2.5 pr-2 sm:pr-3 bg-transparent text-xs sm:text-sm text-gray-600 placeholder-gray-400 font-normal focus:outline-none transition-all duration-300 focus:w-32 sm:focus:w-40 md:focus:w-48 lg:focus:w-56"
                    style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}
                  />
                  
                  {/* Clear Button */}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="relative z-10 pr-2 sm:pr-3"
                    >
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95">
                        <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 hover:text-gray-200 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    </button>
                  )}
                </form>
              </div>
            </div>

            {/* User Profile Dropdown */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 rounded-full border-2 border-gray-200 hover:border-orange-500 transition-all duration-200 p-1 hover:shadow-lg"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              </button>

              {/* Dropdown Menu */}
              {profileMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  
                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                          <p className="text-xs text-gray-500 truncate">@{user?.username || 'username'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate('/dashboard');
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-150 flex items-center gap-3"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>My Profile</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate('/users');
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-150 flex items-center gap-3"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>Tracked Users</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate('/analytics');
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-150 flex items-center gap-3"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>Analytics</span>
                      </button>
                    </div>

                    {/* Logout Button */}
                    <div className="border-t border-gray-100 pt-2 px-2">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-full border border-slate-300 p-2 text-slate-600 transition hover:border-blue-500 hover:text-blue-600"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white py-4">
            <div className="space-y-3">
              {/* Mobile Navigation Links */}
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Search */}
              <div className="pt-2 sm:hidden">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                  className="relative flex items-center rounded-lg border border-slate-200 bg-white shadow-sm focus-within:border-blue-300 transition"
                >
                  <div className="pl-3 pr-2 py-2.5 text-blue-500">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search tracked users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent py-2.5 pr-3 text-sm text-slate-600 placeholder-slate-400 focus:outline-none"
                    style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="pr-3 text-slate-400 transition hover:text-slate-600"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </form>
              </div>

              {/* Mobile User Info and Logout */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="px-4 py-2 mb-2">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-95"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
