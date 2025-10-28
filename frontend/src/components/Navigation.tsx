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
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 text-2xl font-bold text-gray-800">
              {/* Simple LeetCode-style Logo */}
              <div className="relative w-8 h-8">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  {/* Left black bracket */}
                  <path
                    d="M 4 4 C 3 4 2 5 2 6 L 2 18 C 2 19 3 20 4 20"
                    fill="none"
                    stroke="#000000"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Middle gray dash */}
                  <line
                    x1="9"
                    y1="12"
                    x2="15"
                    y2="12"
                    stroke="#BDBDBD"
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
              <span className="tracking-tight">LeetTrack</span>
            </Link>
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 text-sm font-medium uppercase tracking-wide transition-all duration-200
                    ${location.pathname === item.path
                      ? 'text-[#ff4454] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#ff4454]'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Trendy Search Box */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></div>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="relative flex items-center bg-white rounded-full border-2 border-gray-200 focus-within:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="pl-4 pr-2">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search tracked users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-56 py-2 pr-4 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:w-64 transition-all duration-300"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="pr-3 text-gray-400 hover:text-gray-600"
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
