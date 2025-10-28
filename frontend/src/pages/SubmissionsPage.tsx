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

  if (error || !userData) {
    return (
      <div className="w-full min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="leetcode-card p-12 rounded-2xl border-2 border-leetcode-border max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-leetcode-text-primary mb-4">Error Loading Data</h2>
            <p className="text-leetcode-text mb-8">{error}</p>
            <button
              onClick={() => navigate('/users')}
              className="px-6 py-3 bg-gradient-to-r from-leetcode-orange to-leetcode-orange-dark text-white rounded-lg hover:scale-105 shadow-lg hover:shadow-leetcode-orange/30 transition-all duration-300"
            >
              Back to Users
            </button>
          </div>
        </div>
      </div>
    );
  }

  const submissionsSource = allSolutions.length > 0 ? allSolutions : userData.recentSubmissions || [];
  const filteredSubmissions = submissionsSource;

  const getLanguageColor = (lang: string) => {
    const l = lang.toLowerCase();
    if (l.includes('python')) return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    if (l.includes('javascript') || l.includes('js')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    if (l.includes('java')) return 'bg-red-500/20 text-red-400 border-red-500/50';
    if (l.includes('c++') || l.includes('cpp')) return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
    return 'bg-leetcode-text-secondary/20 text-leetcode-text-secondary border-leetcode-border';
  };

  return (
    <div className="w-full min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/users')}
            className="px-4 py-2 bg-leetcode-card text-leetcode-text-primary rounded-lg hover:bg-leetcode-darker border-2 border-leetcode-border hover:border-leetcode-orange transition-all duration-300"
          >
            Back
          </button>
          {userData.avatar && (
            <div className="relative group">
              <div className="absolute inset-0 bg-leetcode-orange rounded-full opacity-0 group-hover:opacity-50 blur-lg transition-all duration-300"></div>
              <img
                src={userData.avatar}
                alt={userData.username}
                className="relative w-12 h-12 rounded-full border-2 border-leetcode-orange transform group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-leetcode-text-primary">{userData.username}'s Submissions</h1>
            <p className="text-leetcode-text">Track Performance, Stats & Activity</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchAllData(username)}
            className="px-6 py-3 bg-gradient-to-r from-leetcode-orange to-leetcode-orange-dark text-white rounded-lg hover:scale-105 font-semibold shadow-lg hover:shadow-leetcode-orange/30 transition-all duration-300"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Daily Streak Card - Mobile Optimized */}
      {userData.streak?.currentStreak && userData.streak.currentStreak > 0 ? (
        <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl shadow-2xl border border-gray-700/30 mb-4 md:mb-6">
          {/* Smooth Animated Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-yellow-500/15 opacity-80"></div>
          
          {/* Subtle Animated Mesh */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-400/20 via-transparent to-transparent animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-amber-400/20 via-transparent to-transparent animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          
          {/* Smooth Glow Effect */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-orange-500/30 to-amber-500/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-yellow-500/30 to-orange-500/30 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 p-4 sm:p-5 md:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-5 md:gap-6">
              {/* Left Side - Responsive Icon & Title */}
              <div className="flex items-center gap-3 sm:gap-3.5 md:gap-4">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl md:rounded-2xl opacity-50 group-hover:opacity-75 blur transition-all duration-300"></div>
                  <div className="relative w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-xl md:rounded-2xl shadow-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    <svg className="w-6 h-6 sm:w-6.5 sm:h-6.5 md:w-7 md:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    {/* Smooth shine */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent rounded-xl md:rounded-2xl"></div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg sm:text-xl md:text-xl font-bold bg-gradient-to-r from-orange-300 via-amber-300 to-yellow-300 bg-clip-text text-transparent drop-shadow-lg">
                    LeetCode Streak
                  </h3>
                </div>
              </div>
              
              {/* Right Side - Responsive Counter */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-orange-500/40 to-amber-500/40 rounded-xl md:rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 rounded-xl md:rounded-2xl px-5 py-3 sm:px-5.5 sm:py-3.5 md:px-6 md:py-4 border border-orange-500/30 backdrop-blur-md shadow-xl">
                  <div className="text-center">
                    <div className="text-4xl sm:text-4xl md:text-5xl font-black bg-gradient-to-br from-orange-300 via-amber-300 to-yellow-300 bg-clip-text text-transparent leading-tight drop-shadow-2xl">
                      {userData.streak.currentStreak}
                    </div>
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-1">
                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full shadow-lg shadow-orange-500/50"></div>
                      <span className="text-xs font-semibold text-orange-200 uppercase tracking-wide whitespace-nowrap">day streak</span>
                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full shadow-lg shadow-amber-500/50"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl shadow-xl border border-gray-700/30 p-4 sm:p-4.5 md:p-5 mb-4 md:mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700/10 via-gray-600/5 to-transparent opacity-50"></div>
          <div className="relative z-10 flex items-center gap-3 sm:gap-3.5 md:gap-4">
            <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-br from-gray-700/80 to-gray-600/80 rounded-lg md:rounded-xl shadow-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base sm:text-lg md:text-lg font-bold text-gray-300">No active streak</h3>
              <p className="text-xs text-gray-500 mt-0.5">Solve a problem on LeetCode today to start your streak.</p>
            </div>
          </div>
        </div>
      )}

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="leetcode-card rounded-lg shadow-lg p-12 text-center border-2 border-leetcode-border">
            <h3 className="text-2xl font-bold text-leetcode-text-primary mb-2">No Submissions Found</h3>
            <p className="text-leetcode-text">Try a different filter or refresh the data</p>
          </div>
        ) : (
          filteredSubmissions.map((sub) => (
            <div key={sub.id} className="relative group/submission">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-leetcode-orange via-leetcode-yellow to-leetcode-orange rounded-lg opacity-0 group-hover/submission:opacity-20 blur-lg transition-all duration-500"></div>
              <div className="relative leetcode-card rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-2 border-leetcode-border hover:border-leetcode-orange/50">
            
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-bold text-leetcode-text-primary group-hover/submission:text-leetcode-orange transition-colors duration-300">{sub.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getLanguageColor(sub.lang || 'Unknown')}`}>
                        {sub.lang || 'Unknown'}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-leetcode-green/20 text-leetcode-green border border-leetcode-green/50">
                        {sub.status || 'Accepted'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-leetcode-text">
                        <div className="text-sm">
                          <div>
                            Solved: {sub.solvedAt || formatSolvedAt(Number(sub.timestampMs ?? sub.timestamp) || 0)}
                          </div>
                          {sub.timeAgo && <div className="text-xs text-leetcode-text-secondary">({sub.timeAgo})</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-leetcode-text">
                        <span className="text-sm">Execution Time: <span className="text-leetcode-orange font-semibold">{sub.runtime || 'N/A'}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-leetcode-text">
                        <span className="text-sm">Memory: <span className="text-leetcode-yellow font-semibold">{sub.memory || 'N/A'}</span></span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          navigate(`/user/${username}/submission/${sub.id}`, { state: { submission: sub } })
                        }
                        className="px-4 py-2 bg-gradient-to-r from-leetcode-orange to-leetcode-orange-dark text-white rounded-lg hover:scale-105 text-sm font-semibold shadow-lg hover:shadow-leetcode-orange/30 transition-all duration-300"
                      >
                        View Code
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="mt-8 relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-leetcode-orange via-leetcode-yellow to-leetcode-orange rounded-lg opacity-30 blur-xl"></div>
        <div className="relative bg-gradient-to-r from-leetcode-orange/20 via-leetcode-yellow/20 to-leetcode-orange/20 rounded-lg shadow-lg p-6 border-2 border-leetcode-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="group/stat hover:scale-110 transition-transform duration-300">
              <div className="text-3xl font-bold text-leetcode-orange">{submissionsSource.length}</div>
              <div className="text-sm text-leetcode-text mt-1">Total Submissions</div>
            </div>
            <div className="group/stat hover:scale-110 transition-transform duration-300">
              <div className="text-3xl font-bold text-leetcode-yellow">{filteredSubmissions.length}</div>
              <div className="text-sm text-leetcode-text mt-1">Filtered Results</div>
            </div>
            <div className="group/stat hover:scale-110 transition-transform duration-300">
              <div className="text-3xl font-bold text-leetcode-green">
                {new Set(submissionsSource.map((s) => s.lang || 'Unknown')).size}
              </div>
              <div className="text-sm text-leetcode-text mt-1">Languages Used</div>
            </div>
            <div className="group/stat hover:scale-110 transition-transform duration-300">
              <div className="text-3xl font-bold text-leetcode-blue">
                {new Set(submissionsSource.map((s) => s.title || 'Unknown Problem')).size}
              </div>
              <div className="text-sm text-leetcode-text mt-1">Unique Problems</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
