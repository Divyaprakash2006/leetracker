import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { apiClient } from "../config/api";
import { useTrackedUsers } from "../context/UserContext";

interface UserStats {
  username: string;
  ranking: string | number;
  country: string;
  avatar: string;
  contestRating: string | number;
  problems: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  };
}

export const UsersPage = () => {
  const { trackedUsers, removeUser } = useTrackedUsers();
  const [usersData, setUsersData] = useState<Record<string, UserStats>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Optimized: Fetch all users in parallel batch
    const usersToFetch = trackedUsers.filter(user => !usersData[user.username]);
    
    if (usersToFetch.length > 0) {
      fetchAllUsersData(usersToFetch.map(u => u.username));
    }
  }, [trackedUsers]);

  const fetchAllUsersData = async (usernames: string[]) => {
    // Set loading state for all users
    const loadingState = usernames.reduce((acc, username) => ({ ...acc, [username]: true }), {});
    setLoading(prev => ({ ...prev, ...loadingState }));

    try {
      // Fetch all users in parallel with timeout
      const promises = usernames.map(username => 
        axios.get(apiClient.getUser(username), { timeout: 8000 })
          .then(response => ({ username, data: response.data, error: null }))
          .catch(error => ({ username, data: null, error }))
      );

      const results = await Promise.all(promises);

      // Update state with all results at once
      const newUsersData: Record<string, UserStats> = {};
      const newLoadingState: Record<string, boolean> = {};

      results.forEach(({ username, data, error }) => {
        if (data) {
          newUsersData[username] = data;
        }
        if (error) {
          console.error(`Error fetching data for ${username}:`, error);
        }
        newLoadingState[username] = false;
      });

      setUsersData(prev => ({ ...prev, ...newUsersData }));
      setLoading(prev => ({ ...prev, ...newLoadingState }));
    } catch (error) {
      console.error('Batch fetch error:', error);
      // Clear all loading states on failure
      const loadingState = usernames.reduce((acc, username) => ({ ...acc, [username]: false }), {});
      setLoading(prev => ({ ...prev, ...loadingState }));
    }
  };

  const fetchUserData = async (username: string) => {
    setLoading(prev => ({ ...prev, [username]: true }));
    try {
      const response = await axios.get(apiClient.getUser(username), { timeout: 8000 });
      setUsersData(prev => ({ ...prev, [username]: response.data }));
    } catch (error) {
      console.error(`Error fetching data for ${username}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [username]: false }));
    }
  };

  const handleRefresh = (username: string) => {
    fetchUserData(username);
  };

  const handleRemove = async (username: string) => {
    if (window.confirm(`Stop tracking ${username}?`)) {
      try {
        await removeUser(username);
        const newData = { ...usersData };
        delete newData[username];
        setUsersData(newData);
      } catch (err) {
        console.error('Failed to remove tracked user:', err);
        alert(`Failed to remove ${username}. Please try again.`);
      }
    }
  };

  if (trackedUsers.length === 0) {
    return (
      <div className="min-h-[70vh] bg-slate-50 py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5V4H2v16h5m3 0l2-2 2 2m-4-6l2-2 2 2" />
            </svg>
          </div>
          <h2 className="text-3xl font-semibold text-slate-900">No users tracked yet</h2>
          <p className="mt-3 text-sm text-slate-500">
            Add the first LeetCode profile to start monitoring solved counts, rankings, and activity.
          </p>
          <Link
            to="/search"
            className="mt-6 btn-leetcode"
          >
            Search users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Team overview</p>
            <h1 className="text-4xl font-bold text-slate-900">Tracked users</h1>
            <p className="text-sm text-slate-500">
              Monitoring {trackedUsers.length} {trackedUsers.length === 1 ? 'profile' : 'profiles'} across the leaderboard.
            </p>
          </div>
          <Link
            to="/search"
            className="btn-leetcode"
          >
            Add user
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trackedUsers.map((user) => {
          const data = usersData[user.username];
          const isLoading = loading[user.username];

          return (
            <div key={user.username} className="group/card relative rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                {isLoading ? (
                  <div className="space-y-5 p-6">
                    {/* Skeleton Loader */}
                    <div className="flex items-start gap-4">
                      {/* Avatar Skeleton */}
                      <div className="h-16 w-16 animate-pulse rounded-full bg-slate-200"></div>
                      {/* Text Skeleton */}
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="h-6 w-32 animate-pulse rounded-full bg-slate-200"></div>
                        <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200"></div>
                        <div className="h-5 w-24 animate-pulse rounded-full bg-slate-200"></div>
                      </div>
                    </div>
                    
                    {/* Stats Skeleton */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-20 animate-pulse rounded-2xl bg-slate-100"></div>
                      <div className="h-20 animate-pulse rounded-2xl bg-slate-100"></div>
                    </div>
                    
                    {/* Progress Bars Skeleton */}
                    <div className="space-y-3">
                      <div className="h-4 w-full animate-pulse rounded-full bg-slate-100"></div>
                      <div className="h-4 w-full animate-pulse rounded-full bg-slate-100"></div>
                      <div className="h-4 w-full animate-pulse rounded-full bg-slate-100"></div>
                    </div>
                    
                    {/* Buttons Skeleton */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-10 animate-pulse rounded-full bg-slate-100"></div>
                      <div className="h-10 animate-pulse rounded-full bg-slate-100"></div>
                    </div>
                  </div>
                ) : data ? (
                <>
                  <div className="space-y-5 p-6">
                    <div className="flex items-start gap-4">
                      {data.avatar ? (
                        <img
                          src={data.avatar}
                          alt={data.username}
                          className="h-16 w-16 rounded-full border border-slate-200 object-cover shadow-sm"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-lg font-semibold text-slate-500">
                          {data.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 space-y-1">
                        <h3 className="truncate text-xl font-semibold text-slate-900">
                          {user.realName || data.username}
                        </h3>
                        {user.realName && (
                          <p className="text-sm text-slate-600">@{data.username}</p>
                        )}
                        <p className="flex items-center gap-2 text-sm text-slate-500">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.086A7.5 7.5 0 0012 4.5a7.5 7.5 0 00-7.5 5.586c0 4.162 3.364 7.925 7.5 9.414 4.136-1.489 7.5-5.252 7.5-9.414z" />
                          </svg>
                          <span className="truncate">{data.country}</span>
                        </p>
                        <span className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                          Rank #{data.ranking}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Total solved</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">{data.problems.total}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Contest rating</p>
                        <p className="mt-2 text-2xl font-semibold text-blue-600">{data.contestRating || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                        <span className="text-sm text-slate-500">Easy</span>
                        <span className="text-base font-semibold text-emerald-500">{data.problems.easy}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                        <span className="text-sm text-slate-500">Medium</span>
                        <span className="text-base font-semibold text-blue-600">{data.problems.medium}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                        <span className="text-sm text-slate-500">Hard</span>
                        <span className="text-base font-semibold text-amber-500">{data.problems.hard}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        to={`/user/${user.username}`}
                        className="btn-outline"
                      >
                        Progress
                      </Link>
                      <Link
                        to={`/user/${user.username}/submissions`}
                        className="btn-leetcode"
                      >
                        Submissions
                      </Link>
                      <button
                        onClick={() => handleRefresh(user.username)}
                        className="btn-leetcode"
                      >
                        Refresh
                      </button>
                      <button
                        onClick={() => handleRemove(user.username)}
                        className="inline-flex items-center justify-center rounded-full border border-red-100 px-3 py-2 text-sm font-semibold text-red-500 transition hover:border-red-200 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </>
                ) : (
                  <div className="px-8 py-12 text-center">
                    <p className="text-sm text-slate-500">Failed to load data</p>
                    <button
                      onClick={() => handleRefresh(user.username)}
                      className="mt-4 btn-leetcode"
                    >
                      Retry
                    </button>
                  </div>
                )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};
