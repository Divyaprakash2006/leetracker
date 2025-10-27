import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { SolutionViewer } from '../components/SolutionViewer';

export const SubmissionViewerPage = () => {
  const { username, submissionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const submission = location.state?.submission || null;
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Loading state
  if (isLoading && !submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading submission...</h2>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Submission</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(`/user/${username}/submissions`)}
            className="w-full px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold transition-colors"
          >
            Back to Submissions
          </button>
        </div>
      </div>
    );
  }

  // No submission data
  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Submission Found</h2>
          <p className="text-gray-600 mb-6">The requested submission could not be found.</p>
          <button
            onClick={() => navigate(`/user/${username}/submissions`)}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-colors"
          >
            Back to Submissions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/user/${username}/submissions`)}
            className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 shadow font-semibold"
          >
            Back
          </button>
          <div className="flex-1">
            <a 
              href={submission.problemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600"
            >
              <h1 className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
                {submission.title}
              </h1>
            </a>
            <p className="text-sm text-gray-600 mt-1">Submitted by {username}  {submission.timeAgo}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-lg shadow">
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">Submitted Code: {submission.timeAgo}</h2>
                    <p className="text-sm text-gray-600 mt-1">Language: {submission.lang}</p>
                  </div>
                  {/* Loading indicator handled by SolutionViewer component */}
                </div>
              </div>

              <div className="p-0">
                <SolutionViewer 
                  submissionId={submissionId!} 
                  language={submission.lang}
                  onError={(err) => setError(err)}
                  onLoading={(loading) => setIsLoading(loading)}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Performance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{submission.runtime}</div>
                  <div className="text-sm text-gray-600 mt-1">Execution Time</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{submission.memory}</div>
                  <div className="text-sm text-gray-600 mt-1">Memory</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Solution Code</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gray-700 rounded-full text-xs font-mono">
                    {submission.lang}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-800 mb-4">Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700 text-sm">Execution Time</span>
                  <span className="font-bold text-indigo-600 text-sm">{submission.runtime}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700 text-sm">Memory</span>
                  <span className="font-bold text-purple-600 text-sm">{submission.memory}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700 text-sm">Status</span>
                  <span className="font-bold text-green-600 text-sm"> {submission.status}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
