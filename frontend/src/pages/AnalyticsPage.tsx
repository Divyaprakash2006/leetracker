import { useState, useEffect } from 'react';
import { useTrackedUsers } from '../context/UserContext';
import axios from 'axios';
import { apiClient } from '../config/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (usersData.length === 0) {
    return (
      <div className="w-full min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">No Data Available</h2>
          <p className="text-gray-600">Track some users to see analytics</p>
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

  // Difficulty distribution chart data
  const difficultyData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        label: 'Problems Solved',
        data: [totalStats.easy, totalStats.medium, totalStats.hard],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // User comparison chart
  const comparisonData = {
    labels: usersData.map(u => u.username),
    datasets: [
      {
        label: 'Easy',
        data: usersData.map(u => u.problems.easy),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Medium',
        data: usersData.map(u => u.problems.medium),
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
      },
      {
        label: 'Hard',
        data: usersData.map(u => u.problems.hard),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };

  // Daily activity chart (combine all users or show selected)
  const getDailyActivityData = () => {
    if (selectedUser === 'all') {
      // Combine all users' activity
      const combinedActivity: Record<string, number> = {};
      usersData.forEach(user => {
        user.dailyActivity?.forEach(day => {
          combinedActivity[day.date] = (combinedActivity[day.date] || 0) + day.count;
        });
      });
      
      const sortedDates = Object.keys(combinedActivity).sort();
      return {
        labels: sortedDates,
        datasets: [{
          label: 'Total Daily Submissions',
          data: sortedDates.map(date => combinedActivity[date]),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        }]
      };
    } else {
      // Show single user activity
      const userData = usersData.find(u => u.username === selectedUser);
      if (!userData?.dailyActivity) {
        return { labels: [], datasets: [] };
      }
      
      return {
        labels: userData.dailyActivity.map(d => d.date),
        datasets: [{
          label: `${selectedUser}'s Daily Activity`,
          data: userData.dailyActivity.map(d => d.count),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        }]
      };
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <div className="w-full min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Analytics Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-2">Total Users</div>
          <div className="text-3xl font-bold text-blue-600">{usersData.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-2">Total Problems</div>
          <div className="text-3xl font-bold text-gray-800">{totalStats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-2">Average per User</div>
          <div className="text-3xl font-bold text-purple-600">
            {Math.round(totalStats.total / usersData.length)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-2">Hard Problems</div>
          <div className="text-3xl font-bold text-red-600">{totalStats.hard}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Difficulty Distribution */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Difficulty Distribution</h3>
          <div className="h-64">
            <Doughnut data={difficultyData} options={chartOptions} />
          </div>
        </div>

        {/* User Comparison */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">User Comparison</h3>
          <div className="h-64">
            <Bar data={comparisonData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Daily Activity Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Daily Activity (Last 30 Days)</h3>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <Line data={getDailyActivityData()} options={chartOptions} />
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Leaderboard</h3>
        <div className="space-y-2">
          {usersData
            .sort((a, b) => b.problems.total - a.problems.total)
            .map((user, index) => (
              <div
                key={user.username}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold ${
                    index === 0 ? 'text-yellow-500' :
                    index === 1 ? 'text-gray-400' :
                    index === 2 ? 'text-orange-600' :
                    'text-gray-600'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{user.username}</div>
                    <div className="text-sm text-gray-600">
                      E:{user.problems.easy} M:{user.problems.medium} H:{user.problems.hard}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600">{user.problems.total}</div>
              </div>
            ))}
        </div>
      </div>
      </div>
    </div>
  );
};
