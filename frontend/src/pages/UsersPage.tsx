import { useState, useEffect } from 'react';
import { useTrackedUsers } from '../context/UserContext';
import axios from 'axios';
import { apiClient } from '../config/api';
import { Link } from 'react-router-dom';

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
    // Fetch data for all tracked users
    trackedUsers.forEach(user => {
      if (!usersData[user.username]) {
        fetchUserData(user.username);
      }
    });
  }, [trackedUsers]);

  const fetchUserData = async (username: string) => {
    setLoading(prev => ({ ...prev, [username]: true }));
    try {
      const response = await axios.get(apiClient.getUser(username));
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
      <div className="w-full min-h-screen py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-leetcode-orange via-leetcode-yellow to-leetcode-orange rounded-2xl opacity-20 blur-xl"></div>
            <div className="relative leetcode-card p-12 rounded-2xl border-2 border-leetcode-border">
              <h2 className="text-3xl font-bold text-leetcode-text-primary mb-4">No Users Tracked</h2>
              <p className="text-leetcode-text mb-8">
                Start tracking LeetCode users to monitor their progress and compare statistics
              </p>
              <Link
                to="/search"
                className="inline-block px-6 py-3 bg-gradient-to-r from-leetcode-orange to-leetcode-orange-dark text-white rounded-lg hover:scale-105 font-semibold shadow-lg hover:shadow-leetcode-orange/30 transition-all duration-300"
              >
                Search Users
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-leetcode-text-primary bg-gradient-to-r from-leetcode-text-primary via-leetcode-orange to-leetcode-text-primary bg-clip-text hover:text-transparent transition-all duration-500">Tracked Users</h1>
            <p className="text-leetcode-text mt-2">
              Monitoring {trackedUsers.length} {trackedUsers.length === 1 ? 'user' : 'users'}
            </p>
          </div>
          <Link
            to="/search"
            className="px-6 py-3 bg-gradient-to-r from-leetcode-orange to-leetcode-orange-dark text-white rounded-lg hover:scale-105 font-semibold shadow-lg hover:shadow-leetcode-orange/30 transition-all duration-300"
          >
            Add User
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trackedUsers.map((user) => {
          const data = usersData[user.username];
          const isLoading = loading[user.username];

          return (
            <div key={user.username} className="relative group/card">
              <div className="absolute -inset-1 bg-gradient-to-r from-leetcode-orange via-leetcode-yellow to-leetcode-orange rounded-2xl opacity-0 group-hover/card:opacity-30 blur-xl transition-all duration-500"></div>
              <div className="relative leetcode-card rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-leetcode-border hover:border-leetcode-orange/50 flex flex-col">
                {isLoading ? (
                  <div className="flex-1 flex justify-center items-center min-h-[450px]">
                    <div className="relative">
                      <div className="w-10 h-10 border-4 border-leetcode-border border-t-leetcode-orange rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-10 h-10 border-4 border-transparent border-t-leetcode-yellow rounded-full animate-spin" style={{animationDuration: '1.5s'}}></div>
                    </div>
                  </div>
                ) : data ? (
                <>
                  {/* Header with Gradient */}
                  <div className="bg-gradient-to-br from-leetcode-orange/20 via-leetcode-yellow/20 to-leetcode-orange/20 p-6 border-b border-leetcode-border">
                    <div className="flex items-center gap-4">
                      {data.avatar && (
                        <div className="relative group/avatar">
                          <div className="absolute inset-0 bg-leetcode-orange rounded-full opacity-0 group-hover/avatar:opacity-50 blur-lg transition-all duration-300"></div>
                          <img
                            src={data.avatar}
                            alt={data.username}
                            className="relative w-16 h-16 rounded-full border-4 border-leetcode-orange shadow-lg transform group-hover/avatar:scale-110 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold tracking-tight text-leetcode-text-primary">{data.username}</h3>
                        <p className="text-sm text-leetcode-text mt-1">{data.country}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-leetcode-darker p-4 rounded-xl shadow-sm border border-leetcode-border hover:border-leetcode-orange transition-all duration-300 leetcode-hover text-center group">
                        <div className="text-3xl font-bold text-leetcode-orange group-hover:scale-110 transition-transform duration-300">{data.problems.total}</div>
                        <div className="text-sm text-leetcode-text-secondary mt-1 font-medium">Total Solved</div>
                      </div>
                      <div className="bg-leetcode-darker p-4 rounded-xl shadow-sm border border-leetcode-border hover:border-leetcode-yellow transition-all duration-300 leetcode-hover text-center group">
                        <div className="text-3xl font-bold text-leetcode-yellow group-hover:scale-110 transition-transform duration-300">{data.contestRating || 'N/A'}</div>
                        <div className="text-sm text-leetcode-text-secondary mt-1 font-medium">Rating</div>
                      </div>
                    </div>

                    {/* Difficulty Breakdown */}
                    <div className="bg-leetcode-darker p-4 rounded-xl shadow-sm border border-leetcode-border space-y-3">
                      <div className="flex items-center justify-between group hover:scale-105 transition-transform duration-300">
                        <span className="text-sm font-semibold text-leetcode-easy">Easy</span>
                        <span className="text-lg font-bold text-leetcode-easy">{data.problems.easy}</span>
                      </div>
                      <div className="flex items-center justify-between group hover:scale-105 transition-transform duration-300">
                        <span className="text-sm font-semibold text-leetcode-medium">Medium</span>
                        <span className="text-lg font-bold text-leetcode-medium">{data.problems.medium}</span>
                      </div>
                      <div className="flex items-center justify-between group hover:scale-105 transition-transform duration-300">
                        <span className="text-sm font-semibold text-leetcode-hard">Hard</span>
                        <span className="text-lg font-bold text-leetcode-hard">{data.problems.hard}</span>
                      </div>
                    </div>

                    <div className="text-sm text-leetcode-text-secondary text-center mt-4 font-medium">
                      Rank #{data.ranking}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 border-t border-leetcode-border space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        to={`/user/${user.username}`}
                        className="group relative overflow-hidden px-4 py-3 bg-gradient-to-br from-leetcode-green to-leetcode-blue text-white rounded-2xl text-sm font-semibold text-center transition-all hover:scale-105 hover:shadow-xl hover:shadow-leetcode-green/30 active:scale-95"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                        <div className="relative flex items-center justify-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span>View Progress</span>
                        </div>
                      </Link>
                      <Link
                        to={`/user/${user.username}/submissions`}
                        className="group relative overflow-hidden px-4 py-3 bg-gradient-to-br from-leetcode-orange to-leetcode-orange-dark text-white rounded-2xl text-sm font-semibold text-center transition-all hover:scale-105 hover:shadow-xl hover:shadow-leetcode-orange/30 active:scale-95"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                        <div className="relative flex items-center justify-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>View Submissions</span>
                        </div>
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleRefresh(user.username)}
                        className="group relative overflow-hidden px-4 py-3 bg-gradient-to-br from-leetcode-yellow to-leetcode-orange text-white rounded-2xl text-sm font-semibold transition-all hover:scale-105 hover:shadow-xl hover:shadow-leetcode-yellow/30 active:scale-95"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                        <div className="relative flex items-center justify-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>Refresh</span>
                        </div>
                      </button>
                      <button
                        onClick={() => handleRemove(user.username)}
                        className="group relative overflow-hidden px-4 py-3 bg-gradient-to-br from-leetcode-red to-red-700 text-white rounded-2xl text-sm font-semibold transition-all hover:scale-105 hover:shadow-xl hover:shadow-leetcode-red/30 active:scale-95"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                        <div className="relative flex items-center justify-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Remove</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-leetcode-text">Failed to load data</p>
                    <button
                      onClick={() => handleRefresh(user.username)}
                      className="mt-4 px-4 py-2 bg-leetcode-orange text-white rounded-lg hover:bg-leetcode-orange-dark hover:scale-105 transition-all duration-300"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};
