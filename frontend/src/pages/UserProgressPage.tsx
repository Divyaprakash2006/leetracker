import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiClient } from '../config/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface UserData {
  username: string;
  ranking: string | number;
  country: string;
  avatar: string;
  contestRating: string | number;
  contestStats: {
    globalRanking: string | number;
    attendedContests: number;
    topPercentage: string | number;
  };
  problems: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  };
  dailyActivity: Array<{ date: string; count: number }>;
  recentSubmissions: Array<{
    title: string;
    titleSlug: string;
    timestamp: string;
    timeAgo: string;
    problemUrl: string;
    solutionUrl: string;
    submissionUrl: string;
  }>;
  stats?: {
    totalTime: string;
    solveRate: string;
  };
}

export const UserProgressPage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (username) {
      fetchUserData(username);
    }
  }, [username]);

  const fetchUserData = async (targetUsername: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(apiClient.getUser(targetUsername));
      setUserData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch user data');
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

  if (error || !userData) {
    return (
      <div className="w-full min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Error Loading Data</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => navigate('/users')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  // Daily Activity Line Chart
  const activityChartData = {
    labels: userData.dailyActivity?.map(d => d.date) || [],
    datasets: [
      {
        label: 'Daily Submissions',
        data: userData.dailyActivity?.map(d => d.count) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Problem Distribution Horizontal Bar
  const distributionData = {
    labels: ['Total Solved', 'Easy', 'Medium', 'Hard'],
    datasets: [
      {
        label: 'Count',
        data: [
          userData.problems.total,
          userData.problems.easy,
          userData.problems.medium,
          userData.problems.hard,
        ],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(99, 102, 241)',
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const horizontalChartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="w-full min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
      <button
        onClick={() => navigate('/users')}
        className="mb-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Back to Users
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
          <div className="flex items-center gap-4">
            {userData.avatar && (
              <img
                src={userData.avatar}
                alt={userData.username}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
              />
            )}
            <div className="text-white flex-1">
              <h1 className="text-4xl font-bold">{userData.username}</h1>
              <p className="text-blue-100 mt-2">
                {userData.country} • Rank #{userData.ranking}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/user/${username}/submissions`)}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-colors"
              >
                View All Submissions
              </button>
              <button
                onClick={() => username && fetchUserData(username)}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 p-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{userData.problems.total}</div>
            <div className="text-sm text-gray-600 mt-1">Total Solved</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">{userData.contestRating}</div>
            <div className="text-sm text-gray-600 mt-1">Contest Rating</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{userData.contestStats.attendedContests}</div>
            <div className="text-sm text-gray-600 mt-1">Contests</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* Problem Distribution Horizontal Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Problem Distribution</h3>
          <div className="h-64">
            <Bar data={distributionData} options={horizontalChartOptions} />
          </div>
        </div>
      </div>

      {/* Daily Activity Chart */}
      {userData.dailyActivity && userData.dailyActivity.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Daily Activity (Last 30 Days)</h3>
          <div className="h-80">
            <Line data={activityChartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Recent Submissions */}
      {userData.recentSubmissions && userData.recentSubmissions.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Submissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userData.recentSubmissions.map((sub, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{sub.title}</div>
                  <div className="text-sm text-gray-500">{sub.timeAgo}</div>
                </div>
                <div className="ml-4 flex gap-2">
                  <a
                    href={sub.problemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                  >
                    Problem
                  </a>
                  <a
                    href={sub.solutionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
                  >
                    Solutions
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
