import { useState } from 'react';
import axios from 'axios';
import { useTrackedUsers } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../config/api';

interface UserData {
  username: string;
  ranking: string | number;
  country: string;
  avatar: string;
  contestRating: string | number;
  contestStats: {
    globalRanking: string | number;
    attendedContests: number;
    topPercentage: string | number;
  };
  problems: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  };
  dailyActivity: Array<{ date: string; count: number }>;
  recentSubmissions: Array<{
    title: string;
    titleSlug: string;
    timestamp: string;
    timeAgo: string;
    problemUrl: string;
    solutionUrl: string;
    submissionUrl: string;
  }>;
  stats: {
    totalTime: string;
    solveRate: string;
  };
}

export const SearchPage = () => {
  const [input, setInput] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { addUser, isUserTracked } = useTrackedUsers();
  const navigate = useNavigate();

  const extractUsername = (input: string): string => {
    const urlPattern = /leetcode\.com\/u?\/([^\/]+)/;
    const match = input.match(urlPattern);
    return match ? match[1] : input.trim();
  };

  const handleSearch = async () => {
    if (!input.trim()) {
      setError('Please enter a LeetCode userID');
      return;
    }

    const username = extractUsername(input);
    setLoading(true);
    setError('');
    setSuggestions([]);
    setUserData(null);

    try {
      console.log(` Fetching user: ${username}`);
      console.log(` URL: ${apiClient.getUser(username)}`);
      
      const response = await axios.get(apiClient.getUser(username), {
        timeout: 15000
      });
      
  console.log('Response received:', response.data);
      setUserData(response.data);
    } catch (err: any) {
  console.error('Error:', err);
      const responseData = err.response?.data;
      const errorMessage = responseData?.message || err.message || 'Failed to fetch data from LeetCode API';
      const newSuggestions = responseData?.suggestions || [];
      
      setError(errorMessage);
      setSuggestions(newSuggestions);
      
      if (newSuggestions.length > 0) {
        console.log('Suggestions:', newSuggestions);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTrackUser = async () => {
    if (userData) {
      try {
        await addUser(userData.username);
        alert(`Started tracking ${userData.username}!`);
        navigate('/users');
      } catch (trackError: any) {
        console.error('❌ Failed to track user:', trackError);
        setError(trackError?.message || 'Failed to add user to tracked list');
      }
    }
  };

  return (
    <div className="w-full min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Search LeetCode User
          </h1>
          <p className="text-gray-600">
            Enter a username or profile URL to view detailed statistics
          </p>
        </div>

        {/* Search Box - iOS Style */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex gap-4">
            <div className="flex-1 relative group">
              {/* Search Icon */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter LeetCode userID"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-800 placeholder-gray-400 font-medium"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="group relative overflow-hidden px-8 py-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl font-semibold transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              <div className="relative flex items-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search</span>
                  </>
                )}
              </div>
            </button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-400 rounded-lg">
              <div className="text-red-700 font-semibold mb-2">Error: {error}</div>
              {suggestions && suggestions.length > 0 ? (
                <div className="text-red-600 text-sm space-y-1">
                  <p> Suggestions:</p>
                  <ul className="list-disc list-inside">
                    {suggestions.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-red-600 text-sm space-y-1">
                  <p> Tips:</p>
                  <ul className="list-disc list-inside">
                    <li>Check if the username is spelled correctly</li>
                    <li>Try a different username (e.g., "awice")</li>
                    <li>Wait a moment and try again (API rate limiting)</li>
                    <li>Make sure you have internet connectivity</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* User Profile */}
        {userData && !loading && (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                    {userData.avatar && (
                      <img
                        src={userData.avatar}
                        alt={userData.username}
                        className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                      />
                    )}
                    <div className="text-white">
                      <h2 className="text-3xl font-bold">{userData.username}</h2>
                      <p className="text-blue-100 mt-1">
                        {userData.country} • Ranking: #{userData.ranking}
                      </p>
                    </div>
                  </div>
                  {!isUserTracked(userData.username) && (
                    <button
                      onClick={handleTrackUser}
                      className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors"
                    >
                      Track User
                    </button>
                  )}
                  {isUserTracked(userData.username) && (
                    <div className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold">
                      Tracking
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">{userData.contestRating}</div>
                    <div className="text-sm text-gray-600">Contest Rating</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{userData.problems.total}</div>
                    <div className="text-sm text-gray-600">Total Solved</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{userData.contestStats.attendedContests}</div>
                    <div className="text-sm text-gray-600">Contests</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{userData.stats?.totalTime || 'N/A'}</div>
                    <div className="text-sm text-gray-600">Est. Time</div>
                  </div>
                </div>

                {/* Problems Breakdown */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Problems Solved</h3>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <span className="font-semibold text-green-700">Easy</span>
                    <span className="text-2xl font-bold text-green-600">{userData.problems.easy}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <span className="font-semibold text-yellow-700">Medium</span>
                    <span className="text-2xl font-bold text-yellow-600">{userData.problems.medium}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <span className="font-semibold text-red-700">Hard</span>
                    <span className="text-2xl font-bold text-red-600">{userData.problems.hard}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Submissions */}
            {userData.recentSubmissions && userData.recentSubmissions.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Recent Submissions</h3>
                  <button
                    onClick={() => navigate(`/user/${userData.username}/submissions`)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold transition-colors"
                  >
                    View All Submissions
                  </button>
                </div>
                <div className="space-y-2">
                  {userData.recentSubmissions.map((sub, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <div className="font-medium text-gray-800">{sub.title}</div>
                        <div className="text-sm text-gray-500">{sub.timeAgo}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
