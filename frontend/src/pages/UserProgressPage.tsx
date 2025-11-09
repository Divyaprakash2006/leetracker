import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiClient } from '../config/api';
import { Loader } from '../components/Loader';
import { useTrackedUsers } from '../context/UserContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
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
  const { trackedUsers } = useTrackedUsers();
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
      // Optimized: Added timeout and better error handling
      const response = await axios.get(apiClient.getUser(targetUsername), { 
        timeout: 10000 
      });
      setUserData(response.data);
    } catch (err: any) {
      const errorMsg = err.code === 'ECONNABORTED' 
        ? 'Request timeout - server took too long to respond'
        : err.response?.data?.message || 'Failed to fetch user data';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader size={48} />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">
          <h2 className="mb-4 text-3xl font-semibold text-slate-900">Error Loading Data</h2>
          <p className="mb-8 text-slate-600">{error}</p>
          <button
            onClick={() => navigate('/users')}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-700"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  const areaChartData = userData.dailyActivity?.map(d => ({
    date: d.date,
    submissions: d.count,
  })) || [];

  // Problem Distribution Horizontal Bar
  const distributionData = {
    labels: ['Total Solved', 'Easy', 'Medium', 'Hard'],
    datasets: [
      {
        label: 'Solved Count',
        data: [
          userData.problems.total,
          userData.problems.easy,
          userData.problems.medium,
          userData.problems.hard,
        ],
        backgroundColor: [
          'rgba(79, 70, 229, 0.9)',
          'rgba(34, 197, 94, 0.85)',
          'rgba(14, 165, 233, 0.85)',
          'rgba(245, 158, 11, 0.85)',
        ],
        borderColor: [
          'rgba(79, 70, 229, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(245, 158, 11, 1)',
        ],
        borderWidth: 1.5,
        borderRadius: 12,
        barThickness: 26,
        hoverBackgroundColor: [
          'rgba(79, 70, 229, 0.95)',
          'rgba(34, 197, 94, 0.95)',
          'rgba(14, 165, 233, 0.95)',
          'rgba(245, 158, 11, 0.95)',
        ],
      },
    ],
  };

  const baseGridColor = 'rgba(226, 232, 240, 0.6)';
  const axisTickColor = '#475467';
  const tooltipBg = '#ffffff';

  const customAreaTooltip = (props: any) => {
    const { active, payload, label } = props ?? {};
    if (!active || !payload || payload.length === 0) return null;

    const formattedDate = new Date((label as string) ?? '').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-md">
        <div className="text-sm font-semibold text-slate-900">{formattedDate}</div>
        {payload.map((item: { value?: number }, index: number) => (
          <div key={index} className="text-xs text-slate-600">
            Submissions: {Number(item.value ?? 0)}
          </div>
        ))}
      </div>
    );
  };

  const horizontalChartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: tooltipBg,
        borderColor: 'rgba(37, 99, 235, 0.35)',
        borderWidth: 1,
        titleColor: '#1f2937',
        bodyColor: '#475467',
        titleFont: { size: 12, weight: 700 },
        bodyFont: { size: 12 },
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: baseGridColor,
        },
        ticks: {
          color: axisTickColor,
          font: {
            family: 'Inter, sans-serif',
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(226, 232, 240, 0.4)',
        },
        ticks: {
          color: axisTickColor,
          font: {
            family: 'Inter, sans-serif',
            size: 11,
            weight: 600,
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Top Navigation Bar - LeetCode Style */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <button
            onClick={() => navigate('/users')}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* User Profile Header - LeetCode Style */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-5">
              {userData.avatar && (
                <img
                  src={userData.avatar}
                  alt={userData.username}
                  className="h-20 w-20 rounded-lg border border-gray-200"
                />
              )}
              <div>
                {(() => {
                  const trackedUser = trackedUsers.find(u => u.username === userData.username);
                  const displayName = trackedUser?.realName || userData.username;
                  return (
                    <>
                      <h1 className="text-2xl font-semibold text-gray-900">{displayName}</h1>
                      {trackedUser?.realName && (
                        <p className="mt-1 text-base text-gray-600">@{userData.username}</p>
                      )}
                    </>
                  );
                })()}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {userData.country}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span>Ranking: #{userData.ranking?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate(`/user/${username}/submissions`)}
                className="rounded-lg bg-[#ffa116] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#ff9502]"
              >
                View Submissions
              </button>
              <button
                onClick={() => username && fetchUserData(username)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards - LeetCode Style */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs font-medium text-gray-500">Total Solved</div>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-3xl font-semibold text-gray-900">{userData.problems.total}</div>
              <div className="text-sm text-gray-500">problems</div>
            </div>
          </div>
          
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs font-medium text-gray-500">Contest Rating</div>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-3xl font-semibold text-[#ffa116]">{userData.contestRating}</div>
              <div className="text-sm text-gray-500">rating</div>
            </div>
          </div>
          
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs font-medium text-gray-500">Contests Attended</div>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-3xl font-semibold text-gray-900">{userData.contestStats.attendedContests}</div>
              <div className="text-sm text-gray-500">contests</div>
            </div>
          </div>
          
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs font-medium text-gray-500">Global Ranking</div>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-3xl font-semibold text-gray-900">
                #{typeof userData.contestStats.globalRanking === 'number' 
                  ? userData.contestStats.globalRanking.toLocaleString() 
                  : userData.contestStats.globalRanking}
              </div>
            </div>
          </div>
        </div>

        {/* Problem Solving - LeetCode Style */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Problem Solving</h2>
          
          {/* Progress Bars */}
          <div className="space-y-4">
            {/* Easy */}
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Easy</span>
                <span className="text-gray-600">{userData.problems.easy} solved</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div 
                  className="h-full rounded-full bg-[#00b8a3]" 
                  style={{ width: `${Math.min((userData.problems.easy / 800) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Medium */}
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Medium</span>
                <span className="text-gray-600">{userData.problems.medium} solved</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div 
                  className="h-full rounded-full bg-[#ffc01e]" 
                  style={{ width: `${Math.min((userData.problems.medium / 1700) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Hard */}
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Hard</span>
                <span className="text-gray-600">{userData.problems.hard} solved</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div 
                  className="h-full rounded-full bg-[#ff375f]" 
                  style={{ width: `${Math.min((userData.problems.hard / 700) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Distribution Chart */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="mb-4 text-base font-medium text-gray-900">Distribution</h3>
            <div className="h-64">
              <Bar data={distributionData} options={horizontalChartOptions} />
            </div>
          </div>
        </div>

        {/* Daily Activity Chart */}
        {userData.dailyActivity && userData.dailyActivity.length > 0 && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Submission Activity</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaChartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="leetcodeArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffa116" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#ffa116" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={{ stroke: '#d1d5db' }}
                    tick={{
                      fill: '#6b7280',
                      fontSize: 12,
                      fontFamily: 'system-ui, sans-serif',
                    }}
                    tickMargin={12}
                    minTickGap={28}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                  />
                  <RechartsTooltip
                    cursor={{ stroke: '#ffa116', strokeWidth: 1, strokeDasharray: '4 4' }}
                    content={customAreaTooltip}
                  />
                  <Area
                    type="monotone"
                    dataKey="submissions"
                    stroke="#ffa116"
                    strokeWidth={2}
                    fill="url(#leetcodeArea)"
                    activeDot={{ r: 5, fill: '#ffa116', stroke: '#ffffff', strokeWidth: 2 }}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Submissions */}
        {userData.recentSubmissions && userData.recentSubmissions.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Recent Submissions</h2>
            <div className="space-y-2">
              {userData.recentSubmissions.slice(0, 10).map((sub, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-3 transition hover:border-gray-300 hover:bg-white"
                >
                  <div className="font-medium text-gray-900">{sub.title}</div>
                  <div className="text-xs text-gray-500">{sub.timeAgo}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
