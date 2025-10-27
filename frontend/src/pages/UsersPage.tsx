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
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">No Users Tracked</h2>
          <p className="text-gray-600 mb-8">
            Start tracking LeetCode users to monitor their progress and compare statistics
          </p>
          <Link
            to="/search"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Search Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
            <div key={user.username} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading...</p>
                </div>
              ) : data ? (
                <>
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                    <div className="flex items-center gap-3">
                      {data.avatar && (
                        <img
                          src={data.avatar}
                          alt={data.username}
                          className="w-14 h-14 rounded-full border-2 border-white"
                        />
                      )}
                      <div className="text-white flex-1">
                        <h3 className="text-xl font-bold">{data.username}</h3>
                        <p className="text-sm text-blue-100">{data.country}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <div className="text-xl font-bold text-gray-800">{data.problems.total}</div>
                        <div className="text-xs text-gray-600">Total Solved</div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg text-center">
                        <div className="text-xl font-bold text-yellow-600">{data.contestRating}</div>
                        <div className="text-xs text-gray-600">Rating</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-700">Easy</span>
                        <span className="font-bold text-green-600">{data.problems.easy}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-yellow-700">Medium</span>
                        <span className="font-bold text-yellow-600">{data.problems.medium}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-red-700">Hard</span>
                        <span className="font-bold text-red-600">{data.problems.hard}</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 text-center pt-2 border-t">
                      Rank #{data.ranking}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-gray-50 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Link
                        to={`/user/${user.username}`}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold text-center"
                      >
                        View Progress
                      </Link>
                      <Link
                        to={`/user/${user.username}/submissions`}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold text-center"
                      >
                        View Submissions
                      </Link>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRefresh(user.username)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                      >
                        Refresh
                      </button>
                      <button
                        onClick={() => handleRemove(user.username)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold"
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
  );
};
