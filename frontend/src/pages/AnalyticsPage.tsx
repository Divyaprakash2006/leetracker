import { useState, useEffect } from 'react';
import { useTrackedUsers } from '../context/UserContext';
import axios from 'axios';
import { apiClient } from '../config/api';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface UserData {
  username: string;
  problems: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  };
  dailyActivity: Array<{ date: string; count: number }>;
}

export const AnalyticsPage = () => {
  const { trackedUsers } = useTrackedUsers();
  const [usersData, setUsersData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchAllData();
  }, [trackedUsers]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Optimized: Parallel fetch with timeout and error handling
      const promises = trackedUsers.map(user =>
        axios.get(apiClient.getUser(user.username), { timeout: 8000 })
          .catch(err => {
            console.error(`Failed to fetch data for ${user.username}:`, err);
            return null;
          })
      );
      
      const responses = await Promise.all(promises);
      const validData = responses
        .filter(r => r !== null)
        .map(r => r!.data);
      
      setUsersData(validData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen py-16 bg-leetcode-bg">
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
          <div className="flex flex-col items-center">
            {/* LeetCode-themed spinner */}
            <div className="relative">
              <div className="w-16 h-16 border-4 border-leetcode-border border-t-leetcode-orange rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-leetcode-yellow rounded-full animate-spin" style={{animationDuration: '1.5s'}}></div>
            </div>
            
            {/* Loading text with LeetCode orange */}
            <p className="mt-4 text-lg font-medium text-leetcode-text">
              Loading analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (usersData.length === 0) {
    return (
      <div className="w-full min-h-screen py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-12 border-2 border-gray-300 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Data Available</h2>
            <p className="text-gray-600">Track some users to see analytics</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total stats
  const totalStats = usersData.reduce(
    (acc, user) => ({
      easy: acc.easy + user.problems.easy,
      medium: acc.medium + user.problems.medium,
      hard: acc.hard + user.problems.hard,
      total: acc.total + user.problems.total,
    }),
    { easy: 0, medium: 0, hard: 0, total: 0 }
  );

  // Difficulty distribution chart data for recharts
  const difficultyData = [
    { name: 'Easy', value: totalStats.easy, color: '#34C759' },
    { name: 'Medium', value: totalStats.medium, color: '#FFC107' },
    { name: 'Hard', value: totalStats.hard, color: '#FF69B4' },
  ];

  // Daily activity chart data for recharts
const getDailyActivityData = () => {
  // Helper function to format dates as "Month Day" (e.g., "Nov 1")
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateStr);
        return dateStr;
      }
      return date.toLocaleDateString('en-US', { 
        month: 'short', // "Nov"
        day: 'numeric'  // "1"
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateStr;
    }
  };

  if (selectedUser === 'all') {
    const combinedActivity: Record<string, number> = {};
    usersData.forEach(user => {
      user.dailyActivity?.forEach(day => {
        combinedActivity[day.date] = (combinedActivity[day.date] || 0) + day.count;
      });
    });
    
    const sortedDates = Object.keys(combinedActivity).sort();
    return sortedDates.map(date => ({
      date: formatDate(date),
      submissions: combinedActivity[date],
    }));
  } else {
    const userData = usersData.find(u => u.username === selectedUser);
    if (!userData?.dailyActivity) {
      return [];
    }
    
    return userData.dailyActivity
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(d => ({
        date: formatDate(d.date),
        submissions: d.count,
      }));
  }
};

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-lg shadow-lg p-4 border-2 border-gray-300">
          <p className="text-gray-900 font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full min-h-screen py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 bg-clip-text hover:text-transparent transition-all duration-500 mb-8">Analytics Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-300 hover:border-blue-500 transition-all duration-300 group">
          <div className="text-sm text-gray-600 mb-2">Total Users</div>
          <div className="text-3xl font-bold text-blue-500 group-hover:scale-110 transition-transform duration-300">{usersData.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-300 hover:border-yellow-500 transition-all duration-300 group">
          <div className="text-sm text-gray-600 mb-2">Total Problems</div>
          <div className="text-3xl font-bold text-yellow-500 group-hover:scale-110 transition-transform duration-300">{totalStats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-300 hover:border-red-500 transition-all duration-300 group">
          <div className="text-sm text-gray-600 mb-2">Hard Problems</div>
          <div className="text-3xl font-bold text-red-500 group-hover:scale-110 transition-transform duration-300">{totalStats.hard}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Difficulty Distribution */}
        <div className="relative group/chart">
          {/* Glow effect on hover */}
          <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 via-blue-300/20 to-blue-500/20 rounded-2xl opacity-0 group-hover/chart:opacity-100 blur-xl transition-all duration-500"></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-300/50 hover:border-blue-500/30 transition-all duration-500 backdrop-blur-sm">
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Difficulty Distribution
              </h3>
              <p className="text-sm text-gray-600">Problems solved by difficulty level</p>
            </div>

            {/* Chart Container */}
            <div className="h-80 relative mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {/* Gradient definitions for iOS-style colors */}
                    <linearGradient id="easyGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#34C759" stopOpacity={1} />
                      <stop offset="100%" stopColor="#2E865F" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="mediumGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FFC107" stopOpacity={1} />
                      <stop offset="100%" stopColor="#FFA07A" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="hardGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FF69B4" stopOpacity={1} />
                      <stop offset="100%" stopColor="#FF3E80" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="85%"
                    dataKey="value"
                    paddingAngle={4}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={3}
                    animationBegin={0}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  >
                    {difficultyData.map((_entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          index === 0 ? 'url(#easyGradient)' :
                          index === 1 ? 'url(#mediumGradient)' :
                          'url(#hardGradient)'
                        }
                        className="cursor-pointer transition-all duration-300"
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                        style={{
                          filter: activeIndex === index 
                            ? 'brightness(1.15) drop-shadow(0 0 12px rgba(255, 193, 30, 0.5))' 
                            : 'brightness(1) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
                          transform: activeIndex === index ? 'scale(1.03)' : 'scale(1)',
                          transformOrigin: 'center',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center Content - iOS Style */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="relative">
                    <div className="text-6xl font-black text-transparent bg-gradient-to-br from-blue-500 via-blue-300 to-blue-500 bg-clip-text animate-gradient">
                      {totalStats.total}
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 opacity-20 blur-2xl -z-10"></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-3 font-semibold tracking-wider uppercase">Total Problems</div>
                </div>
              </div>
            </div>

            {/* Legend - iOS Style Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div 
                className="relative group/legend cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 p-4 border border-green-500/20 hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20"
                onMouseEnter={() => setActiveIndex(0)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-transparent"></div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/50"></div>
                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Easy</div>
                  </div>
                  <div className="text-2xl font-bold text-green-500">{totalStats.easy}</div>
                </div>
              </div>

              <div 
                className="relative group/legend cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 p-4 border border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/20"
                onMouseEnter={() => setActiveIndex(1)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent"></div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/50"></div>
                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Medium</div>
                  </div>
                  <div className="text-2xl font-bold text-yellow-500">{totalStats.medium}</div>
                </div>
              </div>

              <div 
                className="relative group/legend cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/10 p-4 border border-red-500/20 hover:border-red-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20"
                onMouseEnter={() => setActiveIndex(2)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-400/5 to-transparent"></div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/50"></div>
                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Hard</div>
                  </div>
                  <div className="text-2xl font-bold text-red-500">{totalStats.hard}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Comparison */}
        <div className="relative group/chart">
          {/* Glow effect on hover */}
          <div className="absolute -inset-1 bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-yellow-500/20 rounded-2xl opacity-0 group-hover/chart:opacity-100 blur-xl transition-all duration-500"></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-300/50 hover:border-yellow-500/30 transition-all duration-500 backdrop-blur-sm">
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                User Comparison
              </h3>
              <p className="text-sm text-gray-600">Total problems solved by each user</p>
            </div>

            {/* Chart Container */}
            <div className="h-[420px] -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={usersData.map(u => ({ username: u.username, total: u.problems.total }))}
                  margin={{ top: 20, right: 30, left: 10, bottom: 90 }}
                >
                  <defs>
                    {/* Gradient for bars */}
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFC107" stopOpacity={1} />
                      <stop offset="50%" stopColor="#FFA07A" stopOpacity={1} />
                      <stop offset="100%" stopColor="#FF8C69" stopOpacity={0.9} />
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="rgba(239,242,246,0.08)" 
                    vertical={false}
                    strokeOpacity={0.5}
                  />
                  
                  <XAxis 
                    dataKey="username" 
                    stroke="transparent"
                    tick={{ 
                      fill: '#eff2f699', 
                      fontSize: 11,
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontWeight: 600
                    }}
                    axisLine={{ stroke: 'rgba(255, 193, 30, 0.2)', strokeWidth: 2 }}
                    tickLine={{ stroke: 'rgba(255, 193, 30, 0.3)', strokeWidth: 1 }}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={90}
                  />
                  
                  <YAxis 
                    stroke="transparent"
                    tick={{ 
                      fill: '#eff2f699', 
                      fontSize: 12,
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontWeight: 600
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={12}
                    width={50}
                  />
                  
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ 
                      fill: 'rgba(255, 193, 30, 0.15)',
                      radius: 8
                    }}
                  />
                  
                  <Bar 
                    dataKey="total" 
                    fill="url(#barGradient)"
                    radius={[16, 16, 0, 0]}
                    maxBarSize={50}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  >
                    {usersData.map((_entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        style={{
                          filter: 'drop-shadow(0 4px 12px rgba(255, 193, 30, 0.4))',
                          transition: 'all 0.3s ease',
                        }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Activity Chart */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 rounded-lg opacity-20 blur-xl"></div>
        <div className="relative bg-white rounded-lg shadow-lg p-6 border-2 border-gray-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Daily Activity</h3>
            <div className="relative inline-block">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="h-10 w-full min-w-[240px] appearance-none rounded-lg border-2 border-blue-500/50 bg-white px-4 py-2 pr-10 text-sm font-medium text-gray-900 shadow-lg transition-all hover:border-blue-500 hover:bg-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                style={{
                  colorScheme: 'dark'
                }}
              >
                <option value="all" className="bg-white text-gray-900 font-semibold py-2">
                  All Users Combined
                </option>
                {usersData.map(user => (
                  <option 
                    key={user.username} 
                    value={user.username} 
                    className="bg-white text-gray-600 font-normal py-2"
                  >
                    {user.username}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="h-4 w-4 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={getDailyActivityData()}
                margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFC107" stopOpacity={0.5}/>
                    <stop offset="50%" stopColor="#FFA07A" stopOpacity={0.25}/>
                    <stop offset="100%" stopColor="#FF8C69" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke="transparent" />
                <XAxis 
                  dataKey="date" 
                  stroke="transparent"
                  tick={{ 
                    fill: '#eff2f666', 
                    fontSize: 11,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontWeight: 400
                  }}
                  axisLine={{ stroke: '#3a3a3a', strokeWidth: 1 }}
                  tickLine={false}
                  tickMargin={8}
                />
                <YAxis 
                  stroke="transparent"
                  tick={{ 
                    fill: '#eff2f666', 
                    fontSize: 11,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontWeight: 400
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  width={40}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ stroke: '#FFC107', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="natural" 
                  dataKey="submissions" 
                  stroke="#FFC107" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorSubmissions)" 
                  dot={false}
                  activeDot={{ 
                    r: 5, 
                    fill: '#FFC107',
                    stroke: '#1a1a1a',
                    strokeWidth: 2
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6 border-2 border-gray-300 hover:border-blue-500/30 transition-all duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Leaderboard</h3>
        <div className="space-y-2">
          {usersData
            .sort((a, b) => b.problems.total - a.problems.total)
            .map((user, index) => (
              <div
                key={user.username}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-300 hover:border-blue-500 transition-all duration-300 leetcode-hover group"
              >
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold ${
                    index === 0 ? 'text-yellow-500' :
                    index === 1 ? 'text-gray-600' :
                    index === 2 ? 'text-red-500' :
                    'text-gray-900'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-blue-500 transition-colors duration-300">{user.username}</div>
                    <div className="text-sm text-gray-600">
                      <span className="text-green-500">E:{user.problems.easy}</span> <span className="text-yellow-500">M:{user.problems.medium}</span> <span className="text-red-500">H:{user.problems.hard}</span>
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-500 group-hover:scale-110 transition-transform duration-300">{user.problems.total}</div>
              </div>
            ))}
        </div>
      </div>
      </div>
    </div>
  );
};
