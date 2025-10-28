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
          <h1 className="text-4xl font-bold text-leetcode-text-primary mb-3 bg-gradient-to-r from-leetcode-text-primary via-leetcode-orange to-leetcode-text-primary bg-clip-text hover:text-transparent transition-all duration-500">
            Search LeetCode User
          </h1>
          <p className="text-leetcode-text">
            Enter a username or profile URL to view detailed statistics
          </p>
        </div>

        {/* Search Box - LeetCode Style */}
        <div className="relative group/search">
          <div className="absolute -inset-1 bg-gradient-to-r from-leetcode-orange via-leetcode-yellow to-leetcode-orange rounded-2xl opacity-0 group-hover/search:opacity-20 blur-xl transition-all duration-500"></div>
          <div className="relative leetcode-card rounded-2xl shadow-xl p-8 mb-8 border-2 border-leetcode-border hover:border-leetcode-orange/50 transition-all duration-300">
            <div className="flex gap-4">
              <div className="flex-1 relative group">
                {/* Search Icon */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-leetcode-text-secondary group-focus-within:text-leetcode-orange transition-all duration-300 group-focus-within:scale-110 group-focus-within:rotate-12">
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
                  className="w-full pl-12 pr-4 py-4 bg-leetcode-darker border-2 border-leetcode-border rounded-2xl focus:outline-none focus:border-leetcode-orange focus:shadow-lg focus:shadow-leetcode-orange/20 transition-all text-leetcode-text-primary placeholder-leetcode-text-secondary font-medium hover:border-leetcode-orange/30"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="group relative overflow-hidden px-8 py-4 bg-gradient-to-br from-leetcode-orange to-leetcode-orange-dark text-white rounded-2xl font-semibold transition-all hover:scale-105 hover:shadow-xl hover:shadow-leetcode-orange/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Search</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          {error && (
            <div className="mt-4 p-4 bg-leetcode-red/10 border-2 border-leetcode-red/50 rounded-lg backdrop-blur-sm">
              <div className="text-leetcode-red font-semibold mb-2">Error: {error}</div>
              {suggestions && suggestions.length > 0 ? (
                <div className="text-leetcode-red/80 text-sm space-y-1">
                  <p> Suggestions:</p>
                  <ul className="list-disc list-inside">
                    {suggestions.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-leetcode-red/80 text-sm space-y-1">
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
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-leetcode-border border-t-leetcode-orange rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-leetcode-yellow rounded-full animate-spin" style={{animationDuration: '1.5s'}}></div>
            </div>
          </div>
        )}

        {/* User Profile */}
        {userData && !loading && (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="relative group/profile">
              <div className="absolute -inset-1 bg-gradient-to-r from-leetcode-orange via-leetcode-yellow to-leetcode-orange rounded-xl opacity-0 group-hover/profile:opacity-30 blur-xl transition-all duration-500"></div>
              <div className="relative leetcode-card rounded-xl shadow-2xl overflow-hidden border-2 border-leetcode-border">
                <div className="bg-gradient-to-r from-leetcode-orange/20 via-leetcode-yellow/20 to-leetcode-orange/20 p-6 border-b border-leetcode-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {userData.avatar && (
                        <div className="relative group/avatar">
                          <div className="absolute inset-0 bg-leetcode-orange rounded-full opacity-0 group-hover/avatar:opacity-50 blur-lg transition-all duration-300"></div>
                          <img
                            src={userData.avatar}
                            alt={userData.username}
                            className="relative w-20 h-20 rounded-full border-4 border-leetcode-orange shadow-lg transform group-hover/avatar:scale-110 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div>
                        <h2 className="text-3xl font-bold text-leetcode-text-primary">{userData.username}</h2>
                        <p className="text-leetcode-text mt-1">
                          {userData.country} • Ranking: #{userData.ranking}
                        </p>
                      </div>
                    </div>
                    {!isUserTracked(userData.username) && (
                      <button
                        onClick={handleTrackUser}
                        className="px-6 py-3 bg-leetcode-orange text-white rounded-lg hover:bg-leetcode-orange-dark hover:scale-105 font-semibold transition-all duration-300 shadow-lg hover:shadow-leetcode-orange/30"
                      >
                        Track User
                      </button>
                    )}
                    {isUserTracked(userData.username) && (
                      <div className="px-6 py-3 bg-leetcode-green text-white rounded-lg font-semibold shadow-lg">
                        ✓ Tracking
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-leetcode-darker p-4 rounded-lg text-center border border-leetcode-border hover:border-leetcode-yellow transition-all duration-300 leetcode-hover group">
                      <div className="text-2xl font-bold text-leetcode-yellow">{userData.contestRating}</div>
                      <div className="text-sm text-leetcode-text-secondary">Contest Rating</div>
                    </div>
                    <div className="bg-leetcode-darker p-4 rounded-lg text-center border border-leetcode-border hover:border-leetcode-orange transition-all duration-300 leetcode-hover group">
                      <div className="text-2xl font-bold text-leetcode-orange">{userData.problems.total}</div>
                      <div className="text-sm text-leetcode-text-secondary">Total Solved</div>
                    </div>
                    <div className="bg-leetcode-darker p-4 rounded-lg text-center border border-leetcode-border hover:border-leetcode-green transition-all duration-300 leetcode-hover group">
                      <div className="text-2xl font-bold text-leetcode-green">{userData.contestStats.attendedContests}</div>
                      <div className="text-sm text-leetcode-text-secondary">Contests</div>
                    </div>
                    <div className="bg-leetcode-darker p-4 rounded-lg text-center border border-leetcode-border hover:border-leetcode-blue transition-all duration-300 leetcode-hover group">
                      <div className="text-2xl font-bold text-leetcode-blue">{userData.stats?.totalTime || 'N/A'}</div>
                      <div className="text-sm text-leetcode-text-secondary">Est. Time</div>
                    </div>
                  </div>

                  {/* Problems Breakdown */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-leetcode-text-primary mb-4">Problems Solved</h3>
                    <div className="flex items-center justify-between p-4 bg-leetcode-darker rounded-lg border border-leetcode-border hover:border-leetcode-easy transition-all duration-300 leetcode-hover group">
                      <span className="font-semibold text-leetcode-easy">Easy</span>
                      <span className="text-2xl font-bold text-leetcode-easy group-hover:scale-110 transition-transform duration-300">{userData.problems.easy}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-leetcode-darker rounded-lg border border-leetcode-border hover:border-leetcode-medium transition-all duration-300 leetcode-hover group">
                      <span className="font-semibold text-leetcode-medium">Medium</span>
                      <span className="text-2xl font-bold text-leetcode-medium group-hover:scale-110 transition-transform duration-300">{userData.problems.medium}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-leetcode-darker rounded-lg border border-leetcode-border hover:border-leetcode-hard transition-all duration-300 leetcode-hover group">
                      <span className="font-semibold text-leetcode-hard">Hard</span>
                      <span className="text-2xl font-bold text-leetcode-hard group-hover:scale-110 transition-transform duration-300">{userData.problems.hard}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Submissions */}
            {userData.recentSubmissions && userData.recentSubmissions.length > 0 && (
              <div className="leetcode-card rounded-xl shadow-lg p-6 border-2 border-leetcode-border hover:border-leetcode-orange/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-leetcode-text-primary">Recent Submissions</h3>
                  <button
                    onClick={() => navigate(`/user/${userData.username}/submissions`)}
                    className="px-4 py-2 bg-gradient-to-r from-leetcode-orange to-leetcode-orange-dark text-white rounded-lg hover:scale-105 text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-leetcode-orange/30"
                  >
                    View All Submissions
                  </button>
                </div>
                <div className="space-y-2">
                  {userData.recentSubmissions.map((sub, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-leetcode-darker rounded-lg border border-leetcode-border hover:border-leetcode-orange/50 transition-all duration-300 leetcode-hover group">
                      <div>
                        <div className="font-medium text-leetcode-text-primary group-hover:text-leetcode-orange transition-colors duration-300">{sub.title}</div>
                        <div className="text-sm text-leetcode-text-secondary">{sub.timeAgo}</div>
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
