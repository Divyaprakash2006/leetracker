import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiClient } from '../config/api';
import { Loader } from '../components/Loader';
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
    <div className="relative min-h-screen overflow-hidden bg-slate-50 py-12">
      <div className="absolute inset-x-0 -top-32 -z-10 h-72 bg-gradient-to-b from-blue-100 via-transparent to-transparent"></div>
      <div className="absolute bottom-0 left-1/2 -z-20 h-64 w-[32rem] -translate-x-1/2 rounded-full bg-blue-100/40 blur-3xl"></div>

      <div className="mx-auto max-w-6xl px-4 space-y-8">
        <button
          onClick={() => navigate('/users')}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600"
        >
          ← Back to Users
        </button>

        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent"></div>
          <div className="relative p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                {userData.avatar && (
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-blue-500 to-sky-400 opacity-70 blur-lg"></div>
                    <img
                      src={userData.avatar}
                      alt={userData.username}
                      className="relative h-24 w-24 rounded-full border-4 border-white shadow-xl"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-4xl font-bold text-slate-900">{userData.username}</h1>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                    <span>{userData.country}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                    <span>Rank #{userData.ranking}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate(`/user/${username}/submissions`)}
                  className="group relative overflow-hidden rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700"
                >
                  <span className="absolute inset-0 bg-white/30 opacity-0 transition-opacity group-hover:opacity-20"></span>
                  <span className="relative">View All Submissions</span>
                </button>
                <button
                  onClick={() => username && fetchUserData(username)}
                  className="rounded-full border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600"
                >
                  Refresh
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="text-sm uppercase tracking-wide text-slate-500">Total Solved</div>
                <div className="mt-3 text-4xl font-bold text-blue-600">{userData.problems.total}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="text-sm uppercase tracking-wide text-slate-500">Contest Rating</div>
                <div className="mt-3 text-4xl font-bold text-amber-500">{userData.contestRating}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="text-sm uppercase tracking-wide text-slate-500">Contests</div>
                <div className="mt-3 text-4xl font-bold text-emerald-500">{userData.contestStats.attendedContests}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">Problem Distribution</h3>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Solved overview</span>
            </div>
            <div className="mt-6 h-64">
              <Bar data={distributionData} options={horizontalChartOptions} />
            </div>
          </div>

          {userData.dailyActivity && userData.dailyActivity.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">Daily Activity (Last 30 Days)</h3>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Consistency timeline</span>
              </div>
              <div className="mt-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaChartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                    <defs>
                      <linearGradient id="leetcodeArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.55} />
                        <stop offset="75%" stopColor="#2563eb" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.6)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(203,213,225,0.8)' }}
                      tick={{
                        fill: axisTickColor,
                        fontSize: 11,
                        fontFamily: 'Inter, sans-serif',
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
                      cursor={{ stroke: '#2563eb', strokeWidth: 1.2, strokeDasharray: '4 4' }}
                      content={customAreaTooltip}
                    />
                    <Area
                      type="natural"
                      dataKey="submissions"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      fill="url(#leetcodeArea)"
                      activeDot={{ r: 6, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {userData.recentSubmissions && userData.recentSubmissions.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">Recent Submissions</h3>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Latest activity</span>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                {userData.recentSubmissions.map((sub, idx) => (
                  <div
                    key={idx}
                    className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:-translate-y-1 hover:border-blue-300 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold text-slate-900">{sub.title}</div>
                      <div className="text-sm text-slate-500">{sub.timeAgo}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
