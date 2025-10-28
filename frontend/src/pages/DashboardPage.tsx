import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTrackedUsers } from "../context/UserContext";
import axios from "axios";
import { apiClient } from "../config/api";

interface UserStats {
  username: string;
  problemsSolved: number;
  addedAt: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
}

interface StatusCardProps {
  label: string;
  value: string | number;
  description: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ label, value, description }) => (
  <div className="rounded-lg bg-white shadow-md p-6 border border-gray-200">
    <h3 className="mb-1 text-sm font-medium uppercase tracking-wider text-gray-600">{label}</h3>
    <div className="text-3xl font-bold text-gray-900">{value}</div>
    <p className="mt-1 text-sm text-gray-500">{description}</p>
  </div>
);

export const DashboardPage: React.FC = () => {
  const { trackedUsers } = useTrackedUsers();
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (trackedUsers.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const stats = await Promise.all(
          trackedUsers.map(async (user) => {
            try {
              const response = await axios.get(apiClient.getUser(user.username));
              const data = response.data;
              
              const problems = data?.problems || { total: 0, easy: 0, medium: 0, hard: 0 };
              const ranking = data?.ranking || 999999;
              
              const totalSolved = problems.total || 0;
              const easySolved = problems.easy || 0;
              const mediumSolved = problems.medium || 0;
              const hardSolved = problems.hard || 0;
              
              return {
                username: user.username,
                problemsSolved: totalSolved,
                totalSolved,
                easySolved,
                mediumSolved,
                hardSolved,
                ranking,
                addedAt: user.addedAt
              };
            } catch (err) {
              console.error(`Failed to fetch stats for ${'$'}{user.username}:`, err);
              return {
                username: user.username,
                problemsSolved: 0,
                totalSolved: 0,
                easySolved: 0,
                mediumSolved: 0,
                hardSolved: 0,
                ranking: 999999,
                addedAt: user.addedAt
              };
            }
          })
        );
        
        const sorted = stats.sort((a, b) => {
          if (b.totalSolved !== a.totalSolved) {
            return b.totalSolved - a.totalSolved;
          }
          return a.ranking - b.ranking;
        });
        
        setUserStats(sorted);
        setLastUpdate(new Date());
      } catch (err) {
        console.error("Failed to fetch user stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [trackedUsers]);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12">
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 px-8 py-12 shadow-lg">
          <div className="absolute inset-0 opacity-10"></div>
          <div className="relative z-10 mx-auto max-w-4xl space-y-8">
            <div className="flex items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white shadow-lg">
                <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">LeetCode Stats</h1>
                <p className="mt-2 text-lg text-blue-100">
                  Track your competitive programming progress
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <Link
                to="/search"
                className="rounded-full bg-[#ff4454] px-8 py-3 text-lg font-semibold text-white hover:bg-[#ff2c3c] transition-colors shadow-lg hover:shadow-xl"
              >
                Track Now
              </Link>
              <p className="text-blue-100 text-sm">Search and track LeetCode users</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <StatusCard
            label="Active Users"
            value={trackedUsers.length}
            description={`${trackedUsers.length} users being tracked`}
          />
          <StatusCard
            label="Total Problems"
            value={userStats.reduce((acc, user) => acc + user.totalSolved, 0)}
            description="Combined problems solved"
          />
          {lastUpdate && (
            <StatusCard
              label="Last Update"
              value={lastUpdate.toLocaleString('en-IN', { 
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              })}
              description="Auto-updates every 5 minutes"
            />
          )}
        </div>

        {/* Top 3 Leaderboard */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* iOS-style Trophy Icon */}
              <div className="relative group">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl shadow-lg flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  {/* Trophy SVG */}
                  <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C11.5 2 11 2.19 10.59 2.59L2.59 10.59C1.8 11.37 1.8 12.63 2.59 13.41L10.59 21.41C11.37 22.2 12.63 22.2 13.41 21.41L21.41 13.41C22.2 12.63 22.2 11.37 21.41 10.59L13.41 2.59C13 2.19 12.5 2 12 2M12 4L20 12L12 20L4 12L12 4M7 7.5C7 7.5 7 10.5 10 10.5V15.5C10 15.5 7 15.5 7 12.5C7 9.5 7 7.5 7 7.5M17 7.5C17 7.5 17 10.5 14 10.5V15.5C14 15.5 17 15.5 17 12.5C17 9.5 17 7.5 17 7.5M12 7C10.9 7 10 7.9 10 9C10 10.1 10.9 11 12 11C13.1 11 14 10.1 14 9C14 7.9 13.1 7 12 7Z"/>
                  </svg>
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-20 rounded-2xl"></div>
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-yellow-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity -z-10"></div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Top Performers</h2>
                <p className="text-gray-600 mt-1">Leading coders on the platform</p>
              </div>
            </div>
            {userStats.length > 3 && (
              <Link
                to="/users"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View All Users
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : userStats.length > 0 ? (
              userStats.slice(0, 3).map((user, index) => {
                // Rank badge colors
                const rankColors = [
                  { bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600', text: 'text-yellow-900', border: 'border-yellow-300', badge: 'bg-yellow-500' },
                  { bg: 'bg-gradient-to-br from-gray-300 to-gray-500', text: 'text-gray-900', border: 'border-gray-300', badge: 'bg-gray-400' },
                  { bg: 'bg-gradient-to-br from-orange-400 to-orange-600', text: 'text-orange-900', border: 'border-orange-300', badge: 'bg-orange-500' }
                ];
                const colors = rankColors[index] || rankColors[2];

                return (
                  <div
                    key={user.username}
                    className="group relative overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100"
                  >
                    {/* Header with Gradient and Rank Badge */}
                    <div className={`relative h-32 ${colors.bg}`}>
                      {/* Rank Badge */}
                      <div className="absolute right-4 top-4">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full ${colors.badge} text-white font-bold text-lg shadow-lg border-3 border-white`}>
                          #{index + 1}
                        </div>
                      </div>
                      
                      {/* Avatar Circle */}
                      <div className="absolute -bottom-12 left-6">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-orange-500 to-orange-700 text-4xl font-bold text-white shadow-xl">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="px-6 pt-16 pb-4">
                      <h3 className="text-xl font-bold text-gray-900 truncate">{user.username}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        India
                      </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="px-6 pb-4">
                      <div className="grid grid-cols-2 gap-3">
                        {/* Total Solved */}
                        <div className="rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 text-center border border-yellow-200">
                          <div className="text-3xl font-bold text-yellow-900">{user.totalSolved}</div>
                          <div className="text-xs font-semibold text-yellow-700 mt-1">Total Solved</div>
                        </div>
                        {/* Rating */}
                        <div className="rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 text-center border border-yellow-200">
                          <div className="text-3xl font-bold text-yellow-900">
                            {user.ranking > 0 ? Math.floor(1500 + (user.totalSolved * 2)) : 'N/A'}
                          </div>
                          <div className="text-xs font-semibold text-yellow-700 mt-1">Rating</div>
                        </div>
                      </div>
                    </div>

                    {/* Difficulty Breakdown */}
                    <div className="px-6 pb-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-green-600">Easy</span>
                          <span className="text-lg font-bold text-green-700">{user.easySolved}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-orange-600">Medium</span>
                          <span className="text-lg font-bold text-orange-700">{user.mediumSolved}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-red-600">Hard</span>
                          <span className="text-lg font-bold text-red-700">{user.hardSolved}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rank Info */}
                    <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
                      <p className="text-xs text-gray-600 text-center font-medium">
                        Global Rank #{user.ranking.toLocaleString()}
                      </p>
                    </div>

                    {/* Action Buttons - iOS Style */}
                    <div className="grid grid-cols-2 gap-3 px-6 pb-6">
                      <Link
                        to={`/user/${user.username}`}
                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 py-3.5 text-center text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                        <div className="relative flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span>View Progress</span>
                        </div>
                      </Link>
                      <Link
                        to={`/user/${user.username}/submissions`}
                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 py-3.5 text-center text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                        <div className="relative flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Submissions</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full rounded-lg bg-white shadow-lg border border-gray-200 p-8 text-center">
                <h3 className="mb-4 text-xl font-medium text-gray-800">No Users Tracked</h3>
                <p className="mb-6 text-gray-600">Start tracking LeetCode users to see their progress here.</p>
                <Link
                  to="/search"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition-colors shadow-md"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Add Your First User
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
