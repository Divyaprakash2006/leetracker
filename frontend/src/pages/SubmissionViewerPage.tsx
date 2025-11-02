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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold mb-4 text-slate-900">Error Loading Submission</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(`/user/${username}/submissions`)}
            className="px-6 py-3 bg-white text-slate-700 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-medium transition-all duration-200 shadow-sm"
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
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-6xl mb-4">📭</div>
          <h1 className="text-3xl font-bold mb-4 text-slate-900">No Submission Found</h1>
          <p className="text-slate-600 mb-6">Could not find submission with ID: {submissionId}</p>
          <button
            onClick={() => navigate(`/user/${username}/submissions`)}
            className="px-6 py-3 bg-white text-slate-700 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-medium transition-all duration-200 shadow-sm"
          >
            Back to Submissions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/user/${username}/submissions`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-medium transition-all duration-200 shadow-sm"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          <div className="flex-1">
            <a 
              href={submission.problemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <h1 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                {submission.title}
              </h1>
            </a>
            <p className="text-sm text-slate-500 mt-1">Submitted by {username} · {submission.timeAgo}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Submitted Code</h2>
                    <p className="text-sm text-slate-500 mt-1">Language: <span className="text-blue-600 font-semibold">{submission.lang}</span> · {submission.timeAgo}</p>
                  </div>
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
          </div>

          <div className="space-y-6">
            
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold mb-6 text-slate-900">Code Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 font-medium">Language:</span>
                  <span className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-blue-700">
                    {submission.lang}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-4 text-lg">Performance Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200">
                  <span className="text-slate-600 text-sm font-medium">Execution Time</span>
                  <span className="font-bold text-emerald-600 text-xl">{submission.runtime}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                  <span className="text-slate-600 text-sm font-medium">Memory</span>
                  <span className="font-bold text-blue-600 text-xl">{submission.memory}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200">
                  <span className="text-slate-600 text-sm font-medium">Status</span>
                  <span className="font-bold text-emerald-600 text-xl">{submission.status}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

