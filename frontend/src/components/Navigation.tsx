import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTrackedUsers } from '../context/UserContext';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      setMobileMenuOpen(false);
    } else {
      alert(`User "${searchQuery}" is not being tracked. Please add them first from the Tracked Users page.`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-leetcode-card/80 backdrop-blur-xl shadow-lg border-b border-leetcode-border/50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-leetcode-orange/5 via-transparent to-leetcode-orange/5"></div>
      <div className="absolute inset-0 animate-shimmer pointer-events-none"></div>
      <div className="relative mx-auto max-w-[1200px] px-3 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-bold text-leetcode-text-primary group">
              {/* LeetCode-style Logo with hover effect */}
              <div className="relative w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
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
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Optimized Search - Hidden on small screens */}
            <div className="hidden sm:block">
              <div className="relative group">
                {/* Gradient border glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 rounded-xl opacity-0 group-hover:opacity-100 blur transition-all duration-300 group-focus-within:opacity-100"></div>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                  className="relative flex items-center bg-gray-900/90 backdrop-blur-xl rounded-xl border border-gray-800 focus-within:border-gray-700 transition-all duration-300 shadow-xl overflow-hidden"
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
                    className="relative z-10 w-24 sm:w-32 md:w-40 lg:w-48 py-2 sm:py-2.5 pr-2 sm:pr-3 bg-transparent text-xs sm:text-sm text-gray-200 placeholder-gray-500 font-normal focus:outline-none transition-all duration-300 focus:w-32 sm:focus:w-40 md:focus:w-48 lg:focus:w-56"
                    style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}
                  />
                  
                  {/* Clear Button */}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="relative z-10 pr-2 sm:pr-3"
                    >
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95">
                        <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 hover:text-gray-200 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    </button>
                  )}
                </form>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700/80 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="md:hidden py-4 border-t border-gray-700/50">
            <div className="space-y-3">
              {/* Mobile Navigation Links */}
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-leetcode-orange border border-orange-500/30'
                      : 'text-leetcode-text-secondary hover:bg-gray-800/50 hover:text-leetcode-text-primary'
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
                  className="relative flex items-center bg-gray-900/90 backdrop-blur-xl rounded-lg border border-gray-800 focus-within:border-gray-700 transition-all duration-300 shadow-lg overflow-hidden"
                >
                  <div className="pl-3 pr-2 py-2.5">
                    <svg className="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search tracked users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 py-2.5 pr-3 bg-transparent text-sm text-gray-200 placeholder-gray-500 font-normal focus:outline-none"
                    style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="pr-3"
                    >
                      <div className="w-6 h-6 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-all duration-200">
                        <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
