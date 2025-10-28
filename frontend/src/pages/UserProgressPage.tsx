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
      <div className="min-h-screen bg-leetcode-dark flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-leetcode-border border-t-leetcode-orange rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-leetcode-dark flex items-center justify-center px-4">
        <div className="leetcode-card border-2 border-leetcode-border max-w-md w-full text-center rounded-2xl p-10">
          <h2 className="text-3xl font-bold text-leetcode-text-primary mb-4">Error Loading Data</h2>
          <p className="text-leetcode-text mb-8">{error}</p>
          <button
            onClick={() => navigate('/users')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-leetcode-orange to-leetcode-yellow px-6 py-3 font-semibold text-leetcode-dark transition-transform hover:scale-105"
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
          'rgba(255, 161, 22, 0.7)',
          'rgba(0, 184, 163, 0.7)',
          'rgba(255, 192, 30, 0.7)',
          'rgba(239, 71, 67, 0.7)',
        ],
        borderColor: [
          'rgba(255, 161, 22, 1)',
          'rgba(0, 184, 163, 1)',
          'rgba(255, 192, 30, 1)',
          'rgba(239, 71, 67, 1)',
        ],
        borderWidth: 1.5,
        borderRadius: 12,
        barThickness: 26,
        hoverBackgroundColor: [
          'rgba(255, 161, 22, 0.95)',
          'rgba(0, 184, 163, 0.95)',
          'rgba(255, 192, 30, 0.95)',
          'rgba(239, 71, 67, 0.95)',
        ],
      },
    ],
  };

  const baseGridColor = 'rgba(239, 242, 246, 0.08)';
  const axisTickColor = '#eff2f6cc';
  const tooltipBg = 'rgba(10, 10, 10, 0.9)';

  const customAreaTooltip = (props: any) => {
    const { active, payload, label } = props ?? {};
    if (!active || !payload || payload.length === 0) return null;

    const formattedDate = new Date((label as string) ?? '').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return (
      <div className="rounded-xl border border-leetcode-border bg-leetcode-darker/95 px-4 py-3 shadow-xl">
        <div className="text-sm font-semibold text-leetcode-text-primary">{formattedDate}</div>
        {payload.map((item: { value?: number }, index: number) => (
          <div key={index} className="text-xs text-leetcode-text">
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
        borderColor: 'rgba(0, 184, 163, 0.3)',
        borderWidth: 1,
        titleFont: { size: 12, weight: 700 },
        bodyFont: { size: 12 },
        padding: 10,
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
          color: 'transparent',
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
    <div className="relative min-h-screen overflow-hidden bg-leetcode-dark py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,161,22,0.15),transparent_55%)]"></div>
      <div className="absolute inset-0 -z-20 opacity-40 bg-[radial-gradient(circle_at_bottom_left,rgba(0,184,163,0.12),transparent_60%)]"></div>

      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <button
          onClick={() => navigate('/users')}
          className="inline-flex items-center gap-2 rounded-xl border border-leetcode-border bg-leetcode-card px-4 py-2 text-sm font-semibold text-leetcode-text-primary transition-all hover:border-leetcode-orange hover:text-leetcode-orange"
        >
          ← Back to Users
        </button>

        <div className="relative overflow-hidden rounded-2xl border border-leetcode-border bg-gradient-to-br from-leetcode-darker via-leetcode-card to-leetcode-darker shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)]">
          <div className="absolute inset-0 bg-gradient-to-r from-leetcode-orange/40 via-leetcode-yellow/25 to-transparent opacity-70"></div>
          <div className="relative p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                {userData.avatar && (
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-leetcode-orange to-leetcode-yellow opacity-60 blur-lg"></div>
                    <img
                      src={userData.avatar}
                      alt={userData.username}
                      className="relative h-24 w-24 rounded-full border-4 border-leetcode-card shadow-2xl"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-4xl font-bold text-leetcode-text-primary">{userData.username}</h1>
                  <p className="mt-2 text-leetcode-text flex items-center gap-2 text-sm font-medium">
                    <span>{userData.country}</span>
                    <span className="h-1 w-1 rounded-full bg-leetcode-text/60"></span>
                    <span>Rank #{userData.ranking}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate(`/user/${username}/submissions`)}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-leetcode-green to-leetcode-orange px-6 py-3 font-semibold text-leetcode-dark transition-transform hover:scale-105"
                >
                  <span className="absolute inset-0 bg-white/30 opacity-0 transition-opacity group-hover:opacity-20"></span>
                  <span className="relative">View All Submissions</span>
                </button>
                <button
                  onClick={() => username && fetchUserData(username)}
                  className="rounded-xl border border-leetcode-border bg-leetcode-card px-6 py-3 font-semibold text-leetcode-text-primary transition-all hover:border-leetcode-orange hover:text-leetcode-orange"
                >
                  Refresh
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-leetcode-border bg-leetcode-darker/80 p-6 text-center transition-transform hover:-translate-y-1 hover:border-leetcode-orange">
                <div className="text-sm uppercase tracking-wide text-leetcode-text-secondary">Total Solved</div>
                <div className="mt-3 text-4xl font-bold text-leetcode-orange">{userData.problems.total}</div>
              </div>
              <div className="rounded-2xl border border-leetcode-border bg-leetcode-darker/80 p-6 text-center transition-transform hover:-translate-y-1 hover:border-leetcode-yellow">
                <div className="text-sm uppercase tracking-wide text-leetcode-text-secondary">Contest Rating</div>
                <div className="mt-3 text-4xl font-bold text-leetcode-yellow">{userData.contestRating}</div>
              </div>
              <div className="rounded-2xl border border-leetcode-border bg-leetcode-darker/80 p-6 text-center transition-transform hover:-translate-y-1 hover:border-leetcode-green">
                <div className="text-sm uppercase tracking-wide text-leetcode-text-secondary">Contests</div>
                <div className="mt-3 text-4xl font-bold text-leetcode-green">{userData.contestStats.attendedContests}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="rounded-2xl border border-leetcode-border bg-leetcode-card p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-leetcode-text-primary">Problem Distribution</h3>
              <span className="text-xs uppercase tracking-widest text-leetcode-text">Solved overview</span>
            </div>
            <div className="mt-6 h-64">
              <Bar data={distributionData} options={horizontalChartOptions} />
            </div>
          </div>

          {userData.dailyActivity && userData.dailyActivity.length > 0 && (
            <div className="rounded-2xl border border-leetcode-border bg-leetcode-card p-6 shadow-lg">
              <div className="flex itemscenter justify-between">
                <h3 className="text-xl font-semibold text-leetcode-text-primary">Daily Activity (Last 30 Days)</h3>
                <span className="text-xs uppercase tracking-widest text-leetcode-text">Consistency timeline</span>
              </div>
              <div className="mt-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaChartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                    <defs>
                      <linearGradient id="leetcodeArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ffa116" stopOpacity={0.6} />
                        <stop offset="75%" stopColor="#ffa116" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#ffa116" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" stroke="rgba(239,242,246,0.07)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(239,242,246,0.15)' }}
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
                      cursor={{ stroke: '#ffa116', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                      content={customAreaTooltip}
                    />
                    <Area
                      type="natural"
                      dataKey="submissions"
                      stroke="#ffa116"
                      strokeWidth={2.5}
                      fill="url(#leetcodeArea)"
                      activeDot={{ r: 6, fill: '#ffa116', stroke: '#0a0a0a', strokeWidth: 2 }}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {userData.recentSubmissions && userData.recentSubmissions.length > 0 && (
            <div className="rounded-2xl border border-leetcode-border bg-leetcode-card p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-leetcode-text-primary">Recent Submissions</h3>
                <span className="text-xs uppercase tracking-widest text-leetcode-text">Latest activity</span>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                {userData.recentSubmissions.map((sub, idx) => (
                  <div
                    key={idx}
                    className="group rounded-xl border border-leetcode-border bg-leetcode-darker/70 p-4 transition-all hover:border-leetcode-orange hover:bg-leetcode-darker"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold text-leetcode-text-primary">{sub.title}</div>
                      <div className="text-sm text-leetcode-text">{sub.timeAgo}</div>
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
