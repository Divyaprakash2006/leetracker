import { Link, useLocation } from 'react-router-dom';

export const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: '🏠 Dashboard', icon: '📊' },
    { path: '/users', label: '👥 Tracked Users', icon: '👥' },
    { path: '/analytics', label: '📈 Analytics', icon: '📈' },
    { path: '/search', label: '🔍 Search', icon: '🔍' }
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white text-2xl font-bold flex items-center gap-2">
              🎯 LeetTrack
            </Link>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-white text-blue-600 font-semibold'
                    : 'text-white hover:bg-blue-700'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label.split(' ')[1]}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
