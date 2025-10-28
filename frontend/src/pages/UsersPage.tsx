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
                  {/* Header with Avatar and User Info */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-yellow-500/10 p-6">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-yellow-400"></div>
                    </div>
                    
                    <div className="relative flex items-start gap-4">
                      {/* Avatar with Premium Ring */}
                      {data.avatar && (
                        <div className="relative group/avatar">
                          {/* Glow Ring */}
                          <div className="absolute -inset-1 bg-gradient-to-br from-orange-400 via-yellow-400 to-orange-500 rounded-full opacity-75 blur-md group-hover/avatar:opacity-100 transition-all duration-300"></div>
                          {/* Avatar */}
                          <img
                            src={data.avatar}
                            alt={data.username}
                            className="relative w-20 h-20 rounded-full border-4 border-leetcode-card shadow-2xl transform group-hover/avatar:scale-105 transition-all duration-300 object-cover"
                          />
                          {/* Online Indicator */}
                          <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-leetcode-card shadow-lg"></div>
                        </div>
                      )}
                      
                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-leetcode-text-primary truncate mb-1">
                          {data.username}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-leetcode-text-secondary mb-3">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="truncate">{data.country}</span>
                        </div>
                        
                        {/* Rank Badge - Professional iOS Style */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 shadow-lg backdrop-blur-sm">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rank</span>
                          </div>
                          <div className="h-4 w-px bg-gray-700/50"></div>
                          <span className="text-sm font-bold text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 bg-clip-text">
                            #{data.ranking}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="p-6 space-y-4">
                    {/* Main Stats - iOS Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative group/stat overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 p-4 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-transparent"></div>
                        <div className="relative">
                          <div className="text-xs font-semibold text-leetcode-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Total Solved
                          </div>
                          <div className="text-3xl font-black text-transparent bg-gradient-to-br from-orange-400 to-orange-600 bg-clip-text">
                            {data.problems.total}
                          </div>
                        </div>
                      </div>

                      <div className="relative group/stat overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 p-4 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent"></div>
                        <div className="relative">
                          <div className="text-xs font-semibold text-leetcode-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Rating
                          </div>
                          <div className="text-3xl font-black text-transparent bg-gradient-to-br from-yellow-400 to-yellow-600 bg-clip-text">
                            {data.contestRating || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Difficulty Breakdown - Modern List */}
                    <div className="rounded-2xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-5 border border-gray-700/30 backdrop-blur-sm space-y-3">
                      <div className="flex items-center justify-between group/item cursor-pointer hover:translate-x-1 transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/50"></div>
                          <span className="text-sm font-bold text-green-400 uppercase tracking-wide">Easy</span>
                        </div>
                        <span className="text-xl font-black text-green-400">{data.problems.easy}</span>
                      </div>
                      
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"></div>
                      
                      <div className="flex items-center justify-between group/item cursor-pointer hover:translate-x-1 transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/50"></div>
                          <span className="text-sm font-bold text-yellow-400 uppercase tracking-wide">Medium</span>
                        </div>
                        <span className="text-xl font-black text-yellow-400">{data.problems.medium}</span>
                      </div>
                      
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"></div>
                      
                      <div className="flex items-center justify-between group/item cursor-pointer hover:translate-x-1 transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/50"></div>
                          <span className="text-sm font-bold text-red-400 uppercase tracking-wide">Hard</span>
                        </div>
                        <span className="text-xl font-black text-red-400">{data.problems.hard}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Professional iOS Style */}
                  <div className="p-4 bg-gradient-to-b from-transparent to-black/5">
                    <div className="space-y-2.5">
                      {/* Primary Actions */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <Link
                          to={`/user/${user.username}`}
                          className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {/* Gradient Background */}
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500"></div>
                          {/* Shine Effect */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          {/* Shadow Glow */}
                          <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500/50 to-cyan-500/50 opacity-0 group-hover:opacity-70 blur-md transition-all duration-300 -z-10"></div>
                          
                          {/* Content */}
                          <div className="relative px-3 py-2.5 flex items-center justify-center gap-1.5">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="text-xs font-bold text-white tracking-wide">Progress</span>
                          </div>
                        </Link>

                        <Link
                          to={`/user/${user.username}/submissions`}
                          className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {/* Gradient Background */}
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500"></div>
                          {/* Shine Effect */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          {/* Shadow Glow */}
                          <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-500/50 to-yellow-500/50 opacity-0 group-hover:opacity-70 blur-md transition-all duration-300 -z-10"></div>
                          
                          {/* Content */}
                          <div className="relative px-3 py-2.5 flex items-center justify-center gap-1.5">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-xs font-bold text-white tracking-wide">Submissions</span>
                          </div>
                        </Link>
                      </div>

                      {/* Secondary Actions */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => handleRefresh(user.username)}
                          className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {/* Gradient Background */}
                          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 via-orange-500 to-amber-600"></div>
                          {/* Shine Effect */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          {/* Shadow Glow */}
                          <div className="absolute -inset-0.5 bg-gradient-to-br from-yellow-500/50 to-orange-500/50 opacity-0 group-hover:opacity-70 blur-md transition-all duration-300 -z-10"></div>
                          
                          {/* Content */}
                          <div className="relative px-3 py-2.5 flex items-center justify-center gap-1.5">
                            <svg className="w-4 h-4 text-white group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="text-xs font-bold text-white tracking-wide">Refresh</span>
                          </div>
                        </button>

                        <button
                          onClick={() => handleRemove(user.username)}
                          className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {/* Gradient Background */}
                          <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-rose-500 to-pink-600"></div>
                          {/* Shine Effect */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          {/* Shadow Glow */}
                          <div className="absolute -inset-0.5 bg-gradient-to-br from-red-500/50 to-pink-500/50 opacity-0 group-hover:opacity-70 blur-md transition-all duration-300 -z-10"></div>
                          
                          {/* Content */}
                          <div className="relative px-3 py-2.5 flex items-center justify-center gap-1.5">
                            <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="text-xs font-bold text-white tracking-wide">Remove</span>
                          </div>
                        </button>
                      </div>
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
