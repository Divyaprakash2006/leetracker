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
          <h2 className="text-3xl font-bold text-gray-800 mb-4">No Users Tracked</h2>
          <p className="text-gray-600 mb-8">
            Start tracking LeetCode users to monitor their progress and compare statistics
          </p>
          <Link
            to="/search"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md"
          >
            Search Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Tracked Users</h1>
          <p className="text-gray-600 mt-2">
            Monitoring {trackedUsers.length} {trackedUsers.length === 1 ? 'user' : 'users'}
          </p>
        </div>
        <Link
          to="/search"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          Add User
        </Link>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trackedUsers.map((user) => {
          const data = usersData[user.username];
          const isLoading = loading[user.username];

          return (
            <div key={user.username} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
              {isLoading ? (
                <div className="flex-1 flex justify-center items-center min-h-[450px]">
                  <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : data ? (
                <>
                  {/* Header with Gradient */}
                  <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-6">
                    <div className="flex items-center gap-4">
                      {data.avatar && (
                        <img
                          src={data.avatar}
                          alt={data.username}
                          className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                        />
                      )}
                      <div className="text-white flex-1">
                        <h3 className="text-2xl font-bold tracking-tight">{data.username}</h3>
                        <p className="text-sm text-blue-100 mt-1">{data.country}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="p-6 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
                        <div className="text-3xl font-bold text-gray-800">{data.problems.total}</div>
                        <div className="text-sm text-gray-600 mt-1 font-medium">Total Solved</div>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl shadow-sm border border-orange-200 text-center">
                        <div className="text-3xl font-bold text-orange-600">{data.contestRating || 'N/A'}</div>
                        <div className="text-sm text-gray-700 mt-1 font-medium">Rating</div>
                      </div>
                    </div>

                    {/* Difficulty Breakdown */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-green-700">Easy</span>
                        <span className="text-lg font-bold text-green-600">{data.problems.easy}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-yellow-700">Medium</span>
                        <span className="text-lg font-bold text-yellow-600">{data.problems.medium}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-red-700">Hard</span>
                        <span className="text-lg font-bold text-red-600">{data.problems.hard}</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500 text-center mt-4 font-medium">
                      Rank #{data.ranking}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 bg-white border-t border-gray-200 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to={`/user/${user.username}`}
                        className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold text-center transition-colors shadow-md hover:shadow-lg"
                      >
                        View Progress
                      </Link>
                      <Link
                        to={`/user/${user.username}/submissions`}
                        className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold text-center transition-colors shadow-md hover:shadow-lg"
                      >
                        View Submissions
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleRefresh(user.username)}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors shadow-md hover:shadow-lg"
                      >
                        Refresh
                      </button>
                      <button
                        onClick={() => handleRemove(user.username)}
                        className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold transition-colors shadow-md hover:shadow-lg"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-600">Failed to load data</p>
                  <button
                    onClick={() => handleRefresh(user.username)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
