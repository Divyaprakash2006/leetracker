import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { SolutionViewer } from '../components/SolutionViewer';

interface Submission {
  id: string;
  title: string;
  lang: string;
  runtime: string;
  memory: string;
  status: string;
  timeAgo: string;
}

export const SolutionViewerPage: React.FC = () => {
  const { username, submissionId } = useParams<{ username: string; submissionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const submission = location.state?.submission as Submission | null;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!submissionId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-red-800">Invalid Submission ID</h2>
          <p className="text-red-600 mt-2">No submission ID was provided.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 w-full px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold"
          >
            ← Back to Submissions
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading solution...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Solution</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(`/user/${username}/submissions`)}
            className="w-full px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold transition-colors"
          >
            ← Back to Submissions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/user/${username}/submissions`)}
            className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 shadow font-semibold flex items-center gap-2"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          <div className="flex-1">
            {submission && (
              <>
                <h1 className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
                  {submission.title}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Submitted by {username} • {submission.timeAgo}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column - Solution Code */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Solution Code Card */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">Submitted Code</h2>
                    {submission && (
                      <p className="text-sm text-gray-600 mt-1">Language: <span className="font-medium">{submission.lang}</span></p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-0">
                <SolutionViewer 
                  submissionId={submissionId} 
                  language={submission?.lang || 'unknown'}
                  onError={(err) => setError(err)}
                  onLoading={(loading) => setIsLoading(loading)}
                />
              </div>
            </div>

            {/* Performance Metrics */}
            {submission && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="text-2xl font-bold text-indigo-600">{submission.runtime}</div>
                    <div className="text-sm text-gray-600 mt-1">Execution Time</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">{submission.memory}</div>
                    <div className="text-sm text-gray-600 mt-1">Memory Usage</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            
            {/* Status Card */}
            {submission && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow p-6 border border-green-200">
                <h3 className="font-bold text-gray-800 mb-4">Submission Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-2xl">✓</span>
                    <div>
                      <div className="text-sm text-gray-600">Status</div>
                      <div className="font-semibold text-gray-800">{submission.status}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 text-2xl">🔤</span>
                    <div>
                      <div className="text-sm text-gray-600">Language</div>
                      <div className="font-semibold text-gray-800">{submission.lang}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-600 text-2xl">🕒</span>
                    <div>
                      <div className="text-sm text-gray-600">Submitted</div>
                      <div className="font-semibold text-gray-800">{submission.timeAgo}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Features Card */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow p-6 border border-purple-200">
              <h3 className="font-bold text-gray-800 mb-4">✨ Features</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span>
                  Real-time code display
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span>
                  Performance metrics
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span>
                  Language detection
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span>
                  Error handling
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span>
                  Syntax highlighting
                </li>
              </ul>
            </div>

            {/* Help Card */}
            <div className="bg-blue-50 rounded-lg shadow p-6 border border-blue-200">
              <h3 className="font-bold text-gray-800 mb-3">💡 Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Code loads automatically</li>
                <li>• Check metrics below code</li>
                <li>• Errors display clearly</li>
                <li>• Supports all languages</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};