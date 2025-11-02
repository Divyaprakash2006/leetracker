import { useState } from 'react';
import axios from 'axios';
import { useTrackedUsers } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../config/api';
import { Loader } from '../components/Loader';

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
  stats: {
    totalTime: string;
    solveRate: string;
  };
}

export const SearchPage = () => {
  const [input, setInput] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { addUser, isUserTracked } = useTrackedUsers();
  const navigate = useNavigate();

  const extractUsername = (input: string): string => {
    const urlPattern = /leetcode\.com\/u?\/([^\/]+)/;
    const match = input.match(urlPattern);
    return match ? match[1] : input.trim();
  };

  const handleSearch = async () => {
    if (!input.trim()) {
      setError('Please enter a LeetCode userID');
      return;
    }

    const username = extractUsername(input);
    setLoading(true);
    setError('');
    setSuggestions([]);
    setUserData(null);

    try {
      console.log(` Fetching user: ${username}`);
      console.log(` URL: ${apiClient.getUser(username)}`);
      
      // Optimized: Reduced timeout and added abort controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await axios.get(apiClient.getUser(username), {
        timeout: 10000,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('Response received:', response.data);
      setUserData(response.data);
    } catch (err: any) {
      console.error('Error:', err);
      const responseData = err.response?.data;
      const errorMessage = responseData?.message || err.message || 'Failed to fetch data from LeetCode API';
      const newSuggestions = responseData?.suggestions || [];
      
      setError(errorMessage);
      setSuggestions(newSuggestions);
      
      if (newSuggestions.length > 0) {
        console.log('Suggestions:', newSuggestions);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTrackUser = async () => {
    if (userData) {
      try {
        await addUser(userData.username);
        alert(`Started tracking ${userData.username}!`);
        navigate('/users');
      } catch (trackError: any) {
        console.error('❌ Failed to track user:', trackError);
        setError(trackError?.message || 'Failed to add user to tracked list');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-6xl px-4 space-y-10">
        <header className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">Find tracked users</p>
          <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">Search LeetCode profiles instantly</h1>
          <p className="text-base text-slate-500 md:text-lg">Enter a username or profile link to explore detailed progress, stats, and submissions.</p>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.8-5.8M16 10.1a5.9 5.9 0 11-11.8 0 5.9 5.9 0 0111.8 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by username or profile URL"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-sm font-medium text-slate-700 shadow-inner transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="btn-leetcode gap-2"
            >
              {loading ? (
                <>
                  <Loader size={16} />
                  Searching...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.8-5.8M16 10.1a5.9 5.9 0 11-11.8 0 5.9 5.9 0 0111.8 0z" />
                  </svg>
                  Search
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5 text-left">
              <div className="font-semibold text-red-600">{error}</div>
              <div className="mt-2 text-sm text-red-500">
                {suggestions && suggestions.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {suggestions.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                ) : (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Check the username spelling.</li>
                    <li>Try a different profile or wait a moment.</li>
                    <li>Confirm the profile is already tracked.</li>
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>

        {loading && (
          <div className="flex justify-center py-16">
            <Loader size={48} />
          </div>
        )}

        {userData && !loading && (
          <section className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-6 sm:px-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    {userData.avatar && (
                      <img
                        src={userData.avatar}
                        alt={userData.username}
                        className="h-20 w-20 rounded-full border-4 border-white shadow-lg ring-2 ring-slate-200"
                      />
                    )}
                    <div>
                      <h2 className="text-3xl font-semibold text-slate-900">{userData.username}</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {userData.country} · Ranking #{userData.ranking}
                      </p>
                    </div>
                  </div>
                  <div>
                    {!isUserTracked(userData.username) ? (
                      <button
                        onClick={handleTrackUser}
                        className="btn-black gap-2"
                      >
                        Track user
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-600">
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8.5 12.086 6.207 9.793a1 1 0 00-1.414 1.414l2.999 3a1 1 0 001.414 0l7.501-7.5a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                        Tracking
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8 px-6 py-6 sm:px-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Contest rating</p>
                    <p className="mt-3 text-3xl font-bold text-slate-900">{userData.contestRating}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Total solved</p>
                    <p className="mt-3 text-3xl font-bold text-blue-600">{userData.problems.total}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Contests</p>
                    <p className="mt-3 text-3xl font-bold text-emerald-500">{userData.contestStats.attendedContests}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Solve time</p>
                    <p className="mt-3 text-3xl font-bold text-slate-900">{userData.stats?.totalTime || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Problems solved</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-sm font-semibold text-slate-500">Easy</p>
                      <p className="mt-2 text-2xl font-bold text-emerald-500">{userData.problems.easy}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-sm font-semibold text-slate-500">Medium</p>
                      <p className="mt-2 text-2xl font-bold text-blue-600">{userData.problems.medium}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-sm font-semibold text-slate-500">Hard</p>
                      <p className="mt-2 text-2xl font-bold text-amber-500">{userData.problems.hard}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {userData.recentSubmissions && userData.recentSubmissions.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Recent submissions</h3>
                    <p className="text-sm text-slate-500">Latest accepted problems from {userData.username}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/user/${userData.username}/submissions`)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
                  >
                    View submission history
                  </button>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {userData.recentSubmissions.map((sub, idx) => (
                    <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-1 hover:border-blue-300 hover:bg-white hover:shadow-md">
                      <div className="font-semibold text-slate-900">{sub.title}</div>
                      <div className="mt-1 text-sm text-slate-500">{sub.timeAgo}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};
