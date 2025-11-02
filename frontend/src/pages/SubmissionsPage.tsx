import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiClient } from '../config/api';
import { Loader } from '../components/Loader';

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
    return new Date(timestampMs).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
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
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <Loader size={48} />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">
          <h2 className="text-3xl font-semibold text-slate-900">Unable to load submissions</h2>
          <p className="mt-3 text-sm text-slate-500">{error || 'We could not retrieve the user data. Try again from the users list.'}</p>
          <button
            onClick={() => navigate('/users')}
            className="mt-6 btn-black"
          >
            Back to users
          </button>
        </div>
      </div>
    );
  }

  const submissionsSource = allSolutions.length > 0 ? allSolutions : userData.recentSubmissions || [];
  const filteredSubmissions = submissionsSource;

  const getLanguageColor = (lang: string) => {
    const l = lang.toLowerCase();
    if (l.includes('python')) return 'bg-blue-50 text-blue-600 border-blue-100';
    if (l.includes('javascript') || l.includes('js')) return 'bg-amber-50 text-amber-600 border-amber-100';
    if (l.includes('java')) return 'bg-red-50 text-red-600 border-red-100';
    if (l.includes('c++') || l.includes('cpp')) return 'bg-violet-50 text-violet-600 border-violet-100';
    return 'bg-slate-50 text-slate-500 border-slate-200';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/users')}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
            >
              Back
            </button>
            {userData.avatar ? (
              <img
                src={userData.avatar}
                alt={userData.username}
                className="h-12 w-12 rounded-full border border-slate-200 object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-500">
                {userData.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{userData.username}'s submissions</h1>
              <p className="text-sm text-slate-500">Problem timeline, accepted runs, and stored code.</p>
            </div>
          </div>
          <button
            onClick={() => fetchAllData(username)}
            className="btn-black"
          >
            Refresh data
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Total submissions</span>
              <span className="text-3xl font-semibold text-slate-900">{submissionsSource.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Stored solutions</span>
              <span className="text-3xl font-semibold text-slate-900">{allSolutions.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Languages</span>
              <span className="text-3xl font-semibold text-slate-900">{new Set(submissionsSource.map((s) => s.lang || 'Unknown')).size}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Unique problems</span>
              <span className="text-3xl font-semibold text-slate-900">{new Set(submissionsSource.map((s) => s.title || 'Unknown Problem')).size}</span>
            </div>
          </div>
        </div>

        {userData.streak?.currentStreak ? (
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100 p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">Daily streak</p>
                <h2 className="text-2xl font-semibold text-slate-900">Consistent solver</h2>
                <p className="text-sm text-slate-500">LeetCode streaks update automatically with fresh data.</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-white px-6 py-4 text-center shadow">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">Current streak</p>
                <p className="mt-1 text-4xl font-bold text-amber-600">{userData.streak.currentStreak}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">No submissions yet</h3>
              <p className="mt-2 text-sm text-slate-500">We couldn’t find any submissions for this user.</p>
            </div>
          ) : (
            filteredSubmissions.map((sub) => (
              <div key={sub.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <h3 className="truncate text-lg font-semibold text-slate-900">{sub.title}</h3>
                      <p className="text-xs text-slate-500">Solved {sub.solvedAt || formatSolvedAt(Number(sub.timestampMs ?? sub.timestamp) || 0)}{sub.timeAgo ? ` · ${sub.timeAgo}` : ''}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getLanguageColor(sub.lang || 'Unknown')}`}>
                        {sub.lang || 'Unknown'}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                        {sub.status || 'Accepted'}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      <span className="font-semibold text-slate-900">Runtime:</span> {sub.runtime || 'N/A'}
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      <span className="font-semibold text-slate-900">Memory:</span> {sub.memory || 'N/A'}
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      <span className="font-semibold text-slate-900">Submission ID:</span> {sub.id}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate(`/user/${username}/submission/${sub.id}`, { state: { submission: sub } })}
                      className="btn-black"
                    >
                      View code
                    </button>
                    {sub.problemUrl && (
                      <a
                        href={sub.problemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
                      >
                        Open problem
                      </a>
                    )}
                    {sub.submissionUrl && (
                      <a
                        href={sub.submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
                      >
                        View submission
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
;
