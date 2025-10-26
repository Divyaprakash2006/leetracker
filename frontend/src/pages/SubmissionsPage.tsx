import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiClient } from '../config/api';

interface Submission {
  id: string;
  title: string;
  titleSlug?: string;
  timestamp: string;
  lang: string;
  runtime?: string;
  memory?: string;
  status?: string;
  problemUrl?: string;
  solutionUrl?: string;
  submissionUrl?: string;
  timeAgo?: string;
  timestampMs?: number;
  solvedAt?: string;
  code?: string;
}

interface StoredSolution {
  submissionId: string;
  problemName: string;
  problemSlug: string;
  problemUrl?: string;
  language?: string;
  code?: string;
  runtime?: string;
  memory?: string;
  status?: string;
  timestamp: number;
  submittedAt?: string;
  difficulty?: string;
}

interface UserData {
  username: string;
  avatar: string;
  recentSubmissions: Submission[];
  streak: {
    currentStreak: number;
    maxStreak: number;
    lastSolvedDate: string;
  };
}

export const SubmissionsPage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [allSolutions, setAllSolutions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'python' | 'javascript' | 'cpp' | 'java'>('all');

  const formatTimeAgo = (timestampMs: number) => {
    const now = Date.now();
    const diffSeconds = Math.max(0, Math.floor((now - timestampMs) / 1000));
    if (diffSeconds < 60) return 'just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minute${diffSeconds < 120 ? '' : 's'} ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hour${diffSeconds < 7200 ? '' : 's'} ago`;
    if (diffSeconds < 2592000) return `${Math.floor(diffSeconds / 86400)} day${diffSeconds < 172800 ? '' : 's'} ago`;
    const months = Math.floor(diffSeconds / 2592000);
    if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
    const years = Math.floor(diffSeconds / 31536000);
    return `${years} year${years === 1 ? '' : 's'} ago`;
  };

  const formatSolvedAt = (timestampMs: number) => {
    if (!timestampMs || Number.isNaN(timestampMs)) return 'Unknown';
    return new Date(timestampMs).toLocaleString();
  };

  const fetchAllData = async (targetUsername = username) => {
    if (!targetUsername) {
      setError('Username is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fetchStoredSolutions = async (): Promise<StoredSolution[]> => {
        const aggregated: StoredSolution[] = [];
        const pageSize = 500;
        let skip = 0;
        let total = Number.POSITIVE_INFINITY;

        while (skip < total) {
          const response = await axios.get(apiClient.getUserSolutions(targetUsername), {
            params: { limit: pageSize, skip },
          });

          if (!response.data?.success || !Array.isArray(response.data.solutions)) {
            break;
          }

          const { solutions, count = response.data.solutions.length, total: totalFromServer } = response.data;
          aggregated.push(...solutions);

          if (typeof totalFromServer === 'number' && Number.isFinite(totalFromServer)) {
            total = totalFromServer;
          }

          if (count < pageSize) {
            break;
          }

          skip += pageSize;
        }

        return aggregated;
      };

      const [legacyResponse, storedSolutionsRaw] = await Promise.all([
        axios.get(apiClient.getUser(targetUsername)),
        fetchStoredSolutions(),
      ]);

      const legacySubmissionsRaw: Submission[] = legacyResponse.data?.recentSubmissions || [];
      const legacyMapped: Submission[] = legacySubmissionsRaw.map((legacy) => {
        const timestampValue = Number(legacy.timestamp) * 1000;
        const timestampMs = Number.isFinite(timestampValue) ? timestampValue : Date.now();
        const id =
          legacy.id ||
          (legacy as any).submissionId ||
          `${targetUsername}-${legacy.titleSlug || legacy.title || 'submission'}-${legacy.timestamp}`;

        return {
          ...legacy,
          id,
          title: legacy.title || (legacy as any).problemName || 'Unknown Problem',
          lang: legacy.lang || 'Unknown',
          timestamp: timestampMs.toString(),
          timestampMs,
          solvedAt: formatSolvedAt(timestampMs),
          timeAgo: formatTimeAgo(timestampMs),
          status: legacy.status || 'Accepted',
        };
      });

      const storedMapped: Submission[] = (storedSolutionsRaw || []).map((sol) => {
        const timestampMs = sol.submittedAt ? new Date(sol.submittedAt).getTime() : sol.timestamp * 1000;
        const safeTimestamp = Number.isFinite(timestampMs) ? timestampMs : Date.now();

        return {
          id: sol.submissionId,
          title: sol.problemName || 'Unknown Problem',
          titleSlug: sol.problemSlug,
          timestamp: safeTimestamp.toString(),
          timestampMs: safeTimestamp,
          solvedAt: formatSolvedAt(safeTimestamp),
          timeAgo: formatTimeAgo(safeTimestamp),
          lang: sol.language || 'Unknown',
          runtime: sol.runtime || 'N/A',
          memory: sol.memory || 'N/A',
          status: sol.status || 'Accepted',
          problemUrl: sol.problemUrl || (sol.problemSlug ? `https://leetcode.com/problems/${sol.problemSlug}/` : ''),
          solutionUrl: '',
          submissionUrl: `https://leetcode.com/submissions/detail/${sol.submissionId}/`,
          code: sol.code,
        };
      });

      const combinedSolutions = [...storedMapped];
      const existingIds = new Set(combinedSolutions.map((solution) => solution.id));

      legacyMapped.forEach((legacy) => {
        if (!existingIds.has(legacy.id)) {
          combinedSolutions.push(legacy);
        }
      });

      combinedSolutions.sort((a, b) => {
        const bValue = b.timestampMs ?? Number(b.timestamp) ?? 0;
        const aValue = a.timestampMs ?? Number(a.timestamp) ?? 0;
        return bValue - aValue;
      });

      setUserData({
        ...(legacyResponse.data as UserData),
        recentSubmissions: legacyMapped,
      });

      setAllSolutions(combinedSolutions.length > 0 ? combinedSolutions : legacyMapped);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchAllData(username);
    }
  }, [username]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading submissions...</p>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Error Loading Data</h2>
        <p className="text-gray-600 mb-8">{error}</p>
        <button
          onClick={() => navigate('/users')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Users
        </button>
      </div>
    );
  }

  const submissionsSource = allSolutions.length > 0 ? allSolutions : userData.recentSubmissions || [];

  const filteredSubmissions = submissionsSource.filter((sub) => {
    if (!sub.lang) return filter === 'all';
    if (filter === 'all') return true;
    const lang = sub.lang.toLowerCase();
    if (filter === 'python') return lang.includes('python');
    if (filter === 'javascript') return lang.includes('javascript') || lang.includes('js');
    if (filter === 'cpp') return lang.includes('c++') || lang.includes('cpp');
    if (filter === 'java') return lang.includes('java');
    return true;
  });

  const getLanguageColor = (lang: string) => {
    const l = lang.toLowerCase();
    if (l.includes('python')) return 'bg-blue-100 text-blue-800';
    if (l.includes('javascript') || l.includes('js')) return 'bg-yellow-100 text-yellow-800';
    if (l.includes('java')) return 'bg-red-100 text-red-800';
    if (l.includes('c++') || l.includes('cpp')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/users')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            ← Back
          </button>
          {userData.avatar && (
            <img
              src={userData.avatar}
              alt={userData.username}
              className="w-12 h-12 rounded-full border-2 border-blue-600"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{userData.username}'s Submissions</h1>
            <p className="text-gray-600">Track Performance, Stats & Activity</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchAllData(username)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📊</span>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 mb-1">Submission Tracking</h3>
            <p className="text-sm text-gray-700">
              View all submission metadata including execution time, memory usage, and language.
              Click <span className="font-semibold text-indigo-600">"👁️ View Code"</span> to view the solution in the tracker.
            </p>
          </div>
        </div>
      </div>

      {/* Daily Streak Card */}
      {userData.streak?.currentStreak && userData.streak.currentStreak > 0 ? (
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center gap-4">
            <div className="text-6xl">🔥</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-1">LeetCode Streak</h3>
              <p className="text-sm text-orange-100">Matches your current solving streak on leetcode.com</p>
            </div>
            <div className="text-center bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-5xl font-bold">{userData.streak.currentStreak}</div>
              <div className="text-sm text-orange-100 mt-1">day streak</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 mb-6 text-gray-600">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">No active streak</h3>
              <p className="text-sm">Solve a problem on LeetCode today to start your streak.</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({submissionsSource.length})
          </button>
          <button
            onClick={() => setFilter('python')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'python'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🐍 Python
          </button>
          <button
            onClick={() => setFilter('javascript')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'javascript'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📜 JavaScript
          </button>
          <button
            onClick={() => setFilter('cpp')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'cpp'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ⚡ C++
          </button>
          <button
            onClick={() => setFilter('java')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'java'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ☕ Java
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Submissions Found</h3>
            <p className="text-gray-600">Try a different filter or refresh the data</p>
          </div>
        ) : (
          filteredSubmissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{sub.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getLanguageColor(sub.lang || 'Unknown')}`}>
                      {sub.lang || 'Unknown'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      ✓ {sub.status || 'Accepted'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-sm">🕒</span>
                      <div className="text-sm">
                        <div>
                          Solved: {sub.solvedAt || formatSolvedAt(Number(sub.timestampMs ?? sub.timestamp) || 0)}
                        </div>
                        {sub.timeAgo && <div className="text-xs text-gray-500">({sub.timeAgo})</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-sm">⚡</span>
                      <span className="text-sm">Execution Time: {sub.runtime || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-sm">💾</span>
                      <span className="text-sm">Memory: {sub.memory || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        navigate(`/user/${username}/submission/${sub.id}`, { state: { submission: sub } })
                      }
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 text-sm font-semibold shadow-md"
                    >
                      👁️ View Code
                    </button>
                    {sub.problemUrl && (
                      <a
                        href={sub.problemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-semibold"
                      >
                        🔗 Problem
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold">{submissionsSource.length}</div>
            <div className="text-sm text-blue-100 mt-1">Total Submissions</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{filteredSubmissions.length}</div>
            <div className="text-sm text-blue-100 mt-1">Filtered Results</div>
          </div>
          <div>
            <div className="text-3xl font-bold">
              {new Set(submissionsSource.map((s) => s.lang || 'Unknown')).size}
            </div>
            <div className="text-sm text-blue-100 mt-1">Languages Used</div>
          </div>
          <div>
            <div className="text-3xl font-bold">
              {new Set(submissionsSource.map((s) => s.title || 'Unknown Problem')).size}
            </div>
            <div className="text-sm text-blue-100 mt-1">Unique Problems</div>
          </div>
        </div>
      </div>
    </div>
  );
};
