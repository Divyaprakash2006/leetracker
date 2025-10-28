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
      <div className="w-full min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-leetcode-border border-t-leetcode-orange rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-leetcode-yellow rounded-full animate-spin" style={{animationDuration: '1.5s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full min-h-screen py-16">
        <div className="max-w-md mx-auto px-4">
          <div className="leetcode-card rounded-lg shadow-lg p-8 border-2 border-leetcode-border">
            <h2 className="text-2xl font-bold text-leetcode-text-primary mb-4">Error Loading Submission</h2>
            <p className="text-leetcode-text mb-6">{error}</p>
            <button
              onClick={() => navigate(`/user/${username}/submissions`)}
              className="w-full px-6 py-3 bg-leetcode-red/20 text-leetcode-red rounded-lg hover:bg-leetcode-red/30 border border-leetcode-red/50 font-semibold transition-all duration-300"
            >
              Back to Submissions
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No submission data
  if (!submission) {
    return (
      <div className="w-full min-h-screen py-16">
        <div className="max-w-md mx-auto px-4">
          <div className="leetcode-card rounded-lg shadow-lg p-8 border-2 border-leetcode-border">
            <h2 className="text-2xl font-bold text-leetcode-text-primary mb-4">No Submission Found</h2>
            <p className="text-leetcode-text mb-6">The requested submission could not be found.</p>
            <button
              onClick={() => navigate(`/user/${username}/submissions`)}
              className="w-full px-6 py-3 bg-gradient-to-r from-leetcode-orange to-leetcode-orange-dark text-white rounded-lg hover:scale-105 font-semibold transition-all duration-300 shadow-lg hover:shadow-leetcode-orange/30"
            >
              Back to Submissions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/user/${username}/submissions`)}
            className="px-4 py-2 bg-leetcode-card text-leetcode-text-primary rounded-lg hover:bg-leetcode-darker border-2 border-leetcode-border hover:border-leetcode-orange transition-all duration-300"
          >
            Back
          </button>
          <div className="flex-1">
            <a 
              href={submission.problemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <h1 className="text-2xl font-bold text-leetcode-text-primary group-hover:text-leetcode-orange transition-colors duration-300">
                {submission.title}
              </h1>
            </a>
            <p className="text-sm text-leetcode-text mt-1">Submitted by {username}  {submission.timeAgo}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            <div className="relative group/code">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-leetcode-orange via-leetcode-yellow to-leetcode-orange rounded-lg opacity-0 group-hover/code:opacity-20 blur-lg transition-all duration-500"></div>
              <div className="relative leetcode-card rounded-lg shadow border-2 border-leetcode-border hover:border-leetcode-orange/50 transition-all duration-300">
                <div className="border-b border-leetcode-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-leetcode-text-primary">Submitted Code: {submission.timeAgo}</h2>
                      <p className="text-sm text-leetcode-text mt-1">Language: <span className="text-leetcode-orange font-semibold">{submission.lang}</span></p>
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
            </div>
          </div>

          <div className="space-y-6">
            
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-leetcode-orange to-leetcode-yellow rounded-lg opacity-30 blur-lg"></div>
              <div className="relative bg-gradient-to-r from-leetcode-darker to-leetcode-card rounded-lg shadow p-6 border-2 border-leetcode-border">
                <h3 className="text-lg font-bold mb-4 text-leetcode-text-primary">Solution Code</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-leetcode-orange/20 border border-leetcode-orange/50 rounded-full text-xs font-mono text-leetcode-orange">
                      {submission.lang}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="leetcode-card rounded-lg shadow p-6 border-2 border-leetcode-border hover:border-leetcode-orange/30 transition-all duration-300">
              <h3 className="font-bold text-leetcode-text-primary mb-4">Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-leetcode-darker rounded-lg border border-leetcode-border hover:border-leetcode-orange transition-all duration-300 group">
                  <span className="text-leetcode-text text-sm">Execution Time</span>
                  <span className="font-bold text-leetcode-orange text-xl group-hover:scale-110 transition-transform duration-300">{submission.runtime}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-leetcode-darker rounded-lg border border-leetcode-border hover:border-leetcode-yellow transition-all duration-300 group">
                  <span className="text-leetcode-text text-sm">Memory</span>
                  <span className="font-bold text-leetcode-yellow text-xl group-hover:scale-110 transition-transform duration-300">{submission.memory}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-leetcode-darker rounded-lg border border-leetcode-border hover:border-leetcode-green transition-all duration-300 group">
                  <span className="text-leetcode-text text-sm">Status</span>
                  <span className="font-bold text-leetcode-green text-xl group-hover:scale-110 transition-transform duration-300"> {submission.status}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
