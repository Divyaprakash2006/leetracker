import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTrackedUsers } from '../context/UserContext';
import axios from 'axios';
import { API_URL } from '../config/constants';

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

export const DashboardPage = () => {
  const { trackedUsers } = useTrackedUsers();
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const medals = ['🥇', '🥈', '🥉'];

  // Fetch user stats on mount and refresh periodically
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
              const response = await axios.get(`${API_URL}/api/user/${user.username}`);
              const data = response.data;
              
              // Get problems data from the correct structure
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
              console.error(`Failed to fetch stats for ${user.username}:`, err);
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
        
        // Sort by total problems solved (descending), then by ranking (ascending)
        const sorted = stats
          .sort((a, b) => {
            if (b.totalSolved !== a.totalSolved) {
              return b.totalSolved - a.totalSolved;
            }
            return a.ranking - b.ranking;
          });
        
        setUserStats(sorted);
        setLastUpdate(new Date());
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [trackedUsers]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🎯 Welcome to LeetTrack
          </h1>
          <p className="text-xl text-gray-600">
            Track, analyze, and compare LeetCode progress in real-time
          </p>
        </div>

        {/* Leaderboard Snapshot */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-2xl p-8 text-white">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Podium • All Tracked Users</h2>
                  <p className="text-blue-100 text-sm">
                    {trackedUsers.length === 0 
                      ? 'Add users to start tracking their progress' 
                      : `Showing all ${trackedUsers.length} tracked ${trackedUsers.length === 1 ? 'user' : 'users'}, sorted by problems solved. Auto-updates every 5 minutes.`
                    }
                  </p>
                </div>
                {lastUpdate && (
                  <div className="text-xs text-blue-200">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                  <div className="col-span-full text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                    <div className="text-blue-100">Loading leaderboard...</div>
                  </div>
                ) : userStats.length > 0 ? (
                  userStats.map((user: UserStats, index: number) => (
                    <Link
                      key={user.username}
                      to={`/user/${user.username}/submissions`}
                      className="bg-white/10 bg-opacity-30 rounded-xl p-4 text-center shadow-lg border border-white/20 hover:bg-white/20 transition group"
                    >
                      <div className="text-4xl mb-2">
                        {index < 3 ? medals[index] : `#${index + 1}`}
                      </div>
                      <div className="mt-2 text-lg font-semibold truncate">{user.username}</div>
                      <div className="text-sm text-blue-100 mt-2 space-y-1">
                        <div className="font-bold text-2xl text-white">
                          {user.totalSolved}
                        </div>
                        <div className="text-xs">Total Problems</div>
                        <div className="text-xs opacity-75 space-y-0.5">
                          <div>🟢 Easy: {user.easySolved}</div>
                          <div>🟡 Medium: {user.mediumSolved}</div>
                          <div>🔴 Hard: {user.hardSolved}</div>
                        </div>
                        {user.ranking < 999999 && (
                          <div className="text-xs mt-2 bg-white/20 rounded px-2 py-1">
                            Rank: #{user.ranking.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <div className="text-6xl mb-2">📋</div>
                    <div className="text-blue-100 mb-4">No tracked users yet. Search and add users to see the leaderboard.</div>
                    <Link
                      to="/search"
                      className="inline-block px-6 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-blue-50 transition"
                    >
                      Add Your First User
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full lg:w-64 bg-white/10 rounded-2xl p-6 flex flex-col justify-between border border-white/20">
              <div className="space-y-4">
                <div>
                  <div className="text-sm uppercase tracking-wider text-blue-100">Total Tracked</div>
                  <div className="text-5xl font-bold">{trackedUsers.length}</div>
                  <div className="text-blue-100 mt-1">
                    {trackedUsers.length === 0 ? 'No profiles yet' : 
                     trackedUsers.length === 1 ? 'profile on watchlist' : 
                     'profiles on watchlist'}
                  </div>
                </div>
                {userStats.length > 0 && (
                  <div className="pt-4 border-t border-white/20">
                    <div className="text-sm uppercase tracking-wider text-blue-100">Leaderboard</div>
                    <div className="text-3xl font-bold">{userStats.length}</div>
                    <div className="text-blue-100 mt-1 text-xs">
                      {userStats.length === trackedUsers.length 
                        ? 'All users shown'
                        : `${userStats.length} of ${trackedUsers.length} with stats`}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Link
                  to="/users"
                  className="block text-center px-4 py-2 bg-white text-indigo-600 font-semibold rounded-full hover:bg-blue-50 transition"
                >
                  Manage Users →
                </Link>
                <Link
                  to="/search"
                  className="block text-center px-4 py-2 bg-white/20 text-white font-semibold rounded-full hover:bg-white/30 transition"
                >
                  + Add User
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        {trackedUsers.length === 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="text-3xl">💡</div>
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">Getting Started</h4>
                <p className="text-gray-700 mb-4">
                  You haven't tracked any users yet. Start by searching for a LeetCode username!
                </p>
                <Link
                  to="/search"
                  className="inline-block px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-semibold"
                >
                  Search Your First User
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
