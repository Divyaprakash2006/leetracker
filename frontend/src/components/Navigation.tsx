import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTrackedUsers } from '../context/UserContext';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { trackedUsers } = useTrackedUsers();
  
  const navItems = [
    { path: '/', label: 'Dashboard' },
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
    } else {
      alert(`User "${searchQuery}" is not being tracked. Please add them first from the Tracked Users page.`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-leetcode-card/80 backdrop-blur-xl shadow-lg border-b border-leetcode-border/50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-leetcode-orange/5 via-transparent to-leetcode-orange/5"></div>
      <div className="absolute inset-0 animate-shimmer pointer-events-none"></div>
      <div className="relative mx-auto max-w-[1200px] px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold text-leetcode-text-primary group">
              {/* LeetCode-style Logo with hover effect */}
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <div className="absolute inset-0 bg-leetcode-orange rounded-lg opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500"></div>
                <svg viewBox="0 0 24 24" className="w-full h-full relative z-10">
                  {/* Left bracket */}
                  <path
                    d="M 4 4 C 3 4 2 5 2 6 L 2 18 C 2 19 3 20 4 20"
                    fill="none"
                    stroke="#ffffff"
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
              <span className="hidden sm:inline tracking-tight group-hover:tracking-wide bg-gradient-to-r from-leetcode-text-primary via-leetcode-orange to-leetcode-text-primary bg-clip-text group-hover:text-transparent transition-all duration-500" style={{fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>LeetTrack</span>
            </Link>
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3 lg:px-4 py-2 text-xs lg:text-sm font-semibold uppercase tracking-wider transition-all duration-300 group/nav
                    ${location.pathname === item.path
                      ? 'text-leetcode-orange after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-gradient-to-r after:from-transparent after:via-leetcode-orange after:to-transparent after:animate-pulse'
                      : 'text-leetcode-text-secondary hover:text-leetcode-text-primary hover:scale-105 before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:w-0 before:h-0.5 before:bg-leetcode-orange before:transition-all before:duration-300 hover:before:w-full'
                    }`}
                  style={{fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', letterSpacing: '0.05em'}}
                >
                  <span className="relative z-10">{item.label}</span>
                  {location.pathname !== item.path && (
                    <div className="absolute inset-0 bg-leetcode-orange/10 rounded-lg opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 -z-10"></div>
                  )}
                </Link>
              ))}
            </div>
          </div>
          
          {/* LeetCode-style Search Box */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              {/* Animated gradient glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-leetcode-orange via-leetcode-yellow to-leetcode-orange rounded-full opacity-0 group-hover:opacity-75 blur-lg transition-all duration-500 animate-pulse"></div>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="relative flex items-center bg-leetcode-darker/90 backdrop-blur-sm rounded-full border-2 border-leetcode-border focus-within:border-leetcode-orange transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-leetcode-orange/20 focus-within:shadow-leetcode-orange/30"
              >
                <div className="pl-4 pr-2">
                  <svg className="h-5 w-5 text-leetcode-text-secondary group-focus-within:text-leetcode-orange group-hover:scale-110 group-focus-within:rotate-90 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search tracked users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-32 sm:w-48 lg:w-56 py-2 pr-4 bg-transparent text-xs sm:text-sm text-leetcode-text-primary placeholder-leetcode-text-secondary focus:outline-none focus:w-48 sm:focus:w-56 lg:focus:w-64 transition-all duration-300"
                  style={{fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="pr-3 text-leetcode-text-secondary hover:text-leetcode-orange hover:scale-125 hover:rotate-90 transition-all duration-300 group/clear"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
