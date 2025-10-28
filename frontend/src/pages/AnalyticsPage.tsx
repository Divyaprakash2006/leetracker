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
      const promises = trackedUsers.map(user =>
        axios.get(apiClient.getUser(user.username))
      );
      const responses = await Promise.all(promises);
      setUsersData(responses.map(r => r.data));
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-leetcode-border border-t-leetcode-orange rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-leetcode-yellow rounded-full animate-spin" style={{animationDuration: '1.5s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (usersData.length === 0) {
    return (
      <div className="w-full min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="leetcode-card p-12 rounded-2xl border-2 border-leetcode-border max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-leetcode-text-primary mb-4">No Data Available</h2>
            <p className="text-leetcode-text">Track some users to see analytics</p>
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
    { name: 'Easy', value: totalStats.easy, color: '#00b8a3' },
    { name: 'Medium', value: totalStats.medium, color: '#ffc01e' },
    { name: 'Hard', value: totalStats.hard, color: '#ef4743' },
  ];


  // Daily activity chart data for recharts
  const getDailyActivityData = () => {
    if (selectedUser === 'all') {
      const combinedActivity: Record<string, number> = {};
      usersData.forEach(user => {
        user.dailyActivity?.forEach(day => {
          combinedActivity[day.date] = (combinedActivity[day.date] || 0) + day.count;
        });
      });
      
      const sortedDates = Object.keys(combinedActivity).sort();
      return sortedDates.map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        submissions: combinedActivity[date],
      }));
    } else {
      const userData = usersData.find(u => u.username === selectedUser);
      if (!userData?.dailyActivity) {
        return [];
      }
      
      return userData.dailyActivity.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        submissions: d.count,
      }));
    }
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="leetcode-card p-3 border-2 border-leetcode-border rounded-lg shadow-lg">
          <p className="text-leetcode-text-primary font-semibold">{label}</p>
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
    <div className="w-full min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-leetcode-text-primary bg-gradient-to-r from-leetcode-text-primary via-leetcode-orange to-leetcode-text-primary bg-clip-text hover:text-transparent transition-all duration-500 mb-8">Analytics Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="leetcode-card rounded-lg shadow-lg p-6 border-2 border-leetcode-border hover:border-leetcode-orange transition-all duration-300 group">
          <div className="text-sm text-leetcode-text-secondary mb-2">Total Users</div>
          <div className="text-3xl font-bold text-leetcode-orange group-hover:scale-110 transition-transform duration-300">{usersData.length}</div>
        </div>
        <div className="leetcode-card rounded-lg shadow-lg p-6 border-2 border-leetcode-border hover:border-leetcode-yellow transition-all duration-300 group">
          <div className="text-sm text-leetcode-text-secondary mb-2">Total Problems</div>
          <div className="text-3xl font-bold text-leetcode-yellow group-hover:scale-110 transition-transform duration-300">{totalStats.total}</div>
        </div>
        <div className="leetcode-card rounded-lg shadow-lg p-6 border-2 border-leetcode-border hover:border-leetcode-red transition-all duration-300 group">
          <div className="text-sm text-leetcode-text-secondary mb-2">Hard Problems</div>
          <div className="text-3xl font-bold text-leetcode-red group-hover:scale-110 transition-transform duration-300">{totalStats.hard}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Difficulty Distribution */}
        <div className="relative group/chart">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-leetcode-easy via-leetcode-medium to-leetcode-hard rounded-lg opacity-0 group-hover/chart:opacity-20 blur-lg transition-all duration-500"></div>
          <div className="relative leetcode-card rounded-lg shadow-lg p-6 border-2 border-leetcode-border hover:border-leetcode-orange/50 transition-all duration-300">
            <h3 className="text-xl font-bold text-leetcode-text-primary mb-2">Difficulty Distribution</h3>
            <p className="text-sm text-leetcode-text-secondary mb-6">Problems solved by difficulty level</p>
            <div className="h-72 sm:h-80 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="75%"
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={3}
                    stroke="#ffffff"
                    strokeWidth={2}
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        className="cursor-pointer hover:brightness-110 transition-all duration-300"
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                        style={{
                          filter: activeIndex === index 
                            ? 'brightness(1.2) drop-shadow(0 0 8px rgba(255, 161, 22, 0.6))' 
                            : 'brightness(1)',
                          transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                          transformOrigin: 'center',
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center animate-fade-in">
                  <div className="text-5xl sm:text-6xl font-bold text-transparent bg-gradient-to-r from-leetcode-orange via-leetcode-yellow to-leetcode-orange bg-clip-text">
                    {totalStats.total}
                  </div>
                  <div className="text-sm text-leetcode-text-secondary mt-2 font-medium">Total Problems</div>
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 group/legend cursor-pointer">
                <div className="w-3 h-3 rounded-full bg-leetcode-easy group-hover/legend:scale-125 transition-transform duration-200"></div>
                <div>
                  <div className="text-xs text-leetcode-text-secondary">Easy</div>
                  <div className="text-lg font-bold text-leetcode-easy">{totalStats.easy}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 group/legend cursor-pointer">
                <div className="w-3 h-3 rounded-full bg-leetcode-medium group-hover/legend:scale-125 transition-transform duration-200"></div>
                <div>
                  <div className="text-xs text-leetcode-text-secondary">Medium</div>
                  <div className="text-lg font-bold text-leetcode-medium">{totalStats.medium}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 group/legend cursor-pointer">
                <div className="w-3 h-3 rounded-full bg-leetcode-hard group-hover/legend:scale-125 transition-transform duration-200"></div>
                <div>
                  <div className="text-xs text-leetcode-text-secondary">Hard</div>
                  <div className="text-lg font-bold text-leetcode-hard">{totalStats.hard}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Comparison */}
        <div className="leetcode-card rounded-lg shadow-lg p-6 border-2 border-leetcode-border hover:border-leetcode-orange/30 transition-all duration-300">
          <h3 className="text-xl font-bold text-leetcode-text-primary mb-4">User Comparison</h3>
          <p className="text-sm text-leetcode-text-secondary mb-6">Total problems solved by each user</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={usersData.map(u => ({ username: u.username, total: u.problems.total }))}
                margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="0" stroke="transparent" />
                <XAxis 
                  dataKey="username" 
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
                  cursor={{ fill: 'rgba(255, 193, 30, 0.1)' }}
                />
                <Bar 
                  dataKey="total" 
                  fill="#ffc01e" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={80}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily Activity Chart */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-leetcode-orange via-leetcode-yellow to-leetcode-orange rounded-lg opacity-20 blur-xl"></div>
        <div className="relative leetcode-card rounded-lg shadow-lg p-6 border-2 border-leetcode-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-leetcode-text-primary">Daily Activity</h3>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-4 py-2 bg-leetcode-darker border-2 border-leetcode-border text-leetcode-text rounded-lg focus:outline-none focus:ring-2 focus:ring-leetcode-orange hover:border-leetcode-orange transition-all duration-300"
            >
              <option value="all">All Users Combined</option>
              {usersData.map(user => (
                <option key={user.username} value={user.username}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={getDailyActivityData()}
                margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffc01e" stopOpacity={0.5}/>
                    <stop offset="50%" stopColor="#ffc01e" stopOpacity={0.25}/>
                    <stop offset="100%" stopColor="#ffc01e" stopOpacity={0.05}/>
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
                  cursor={{ stroke: '#ffc01e', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="natural" 
                  dataKey="submissions" 
                  stroke="#ffc01e" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorSubmissions)" 
                  dot={false}
                  activeDot={{ 
                    r: 5, 
                    fill: '#ffc01e',
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
      <div className="leetcode-card rounded-lg shadow-lg p-6 mt-6 border-2 border-leetcode-border hover:border-leetcode-orange/30 transition-all duration-300">
        <h3 className="text-xl font-bold text-leetcode-text-primary mb-4">Leaderboard</h3>
        <div className="space-y-2">
          {usersData
            .sort((a, b) => b.problems.total - a.problems.total)
            .map((user, index) => (
              <div
                key={user.username}
                className="flex items-center justify-between p-4 bg-leetcode-darker rounded-lg border border-leetcode-border hover:border-leetcode-orange transition-all duration-300 leetcode-hover group"
              >
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold ${
                    index === 0 ? 'text-leetcode-yellow' :
                    index === 1 ? 'text-leetcode-text-secondary' :
                    index === 2 ? 'text-leetcode-orange' :
                    'text-leetcode-text'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-leetcode-text-primary group-hover:text-leetcode-orange transition-colors duration-300">{user.username}</div>
                    <div className="text-sm text-leetcode-text">
                      <span className="text-leetcode-easy">E:{user.problems.easy}</span> <span className="text-leetcode-medium">M:{user.problems.medium}</span> <span className="text-leetcode-hard">H:{user.problems.hard}</span>
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-leetcode-orange group-hover:scale-110 transition-transform duration-300">{user.problems.total}</div>
              </div>
            ))}
        </div>
      </div>
      </div>
    </div>
  );
};
