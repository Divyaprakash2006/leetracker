import { useState, useEffect, useMemo } from 'react';
import hljs from 'highlight.js/lib/common';
import { buildApiUrl, getAuthHeaders } from '../config/api';
import { Loader } from './Loader';
import { Skeleton } from './ui/skeleton';
import './SolutionViewer.css';

interface Solution {
  code: string;
  language: string;
  runtime?: string;
  memory?: string;
  problemName?: string;
  difficulty?: string;
  status?: string;
}

interface SolutionViewerProps {
  submissionId: string;
  language: string;
  username?: string;
  onError?: (error: string) => void;
  onLoading?: (loading: boolean) => void;
}

const LANGUAGE_MAP: Record<string, string> = {
  'c++': 'cpp',
  cpp: 'cpp',
  'c#': 'csharp',
  csharp: 'csharp',
  java: 'java',
  javascript: 'javascript',
  'java script': 'javascript',
  js: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  python: 'python',
  python3: 'python',
  py: 'python',
  go: 'go',
  golang: 'go',
  rust: 'rust',
  ruby: 'ruby',
  swift: 'swift',
  kotlin: 'kotlin',
  scala: 'scala',
  php: 'php',
  c: 'c',
  dart: 'dart'
};

const normalizeLanguage = (lang?: string): string => {
  if (!lang) return 'plaintext';
  const normalized = lang.toLowerCase().trim();
  return LANGUAGE_MAP[normalized] || normalized || 'plaintext';
};

const escapeHtml = (code: string): string =>
  code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const wrapWithLineSpans = (html: string): string =>
  html
    .split('\n')
    .map((line) => `<span class="line">${line.length > 0 ? line : '&nbsp;'}</span>`)
    .join('');

export const SolutionViewer = ({
  submissionId,
  language,
  username,
  onError,
  onLoading
}: SolutionViewerProps): JSX.Element => {
  const [solution, setSolution] = useState<Solution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightedHtml, setHighlightedHtml] = useState<string>('');

  // Fetch solution data
  useEffect(() => {
    let mounted = true;

    const fetchSolution = async () => {
      if (!submissionId) {
        setError('No submission ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`📝 Fetching solution code for submission ${submissionId}...`);

        // Try viewer endpoint first
        const viewerQuery = username ? `?username=${encodeURIComponent(username)}` : '';
        const headers = getAuthHeaders();
        const viewerUrl = buildApiUrl(`/api/solutions/viewer/${submissionId}${viewerQuery}`);
        console.log(`📡 Trying viewer endpoint: ${viewerUrl}`);
        let response = await fetch(viewerUrl, { headers });
        let data = await response.json();

        if (response.status === 401 || response.status === 403) {
          throw new Error('You need to sign in to view submission code.');
        }

        // If first endpoint fails, try legacy endpoint
        if (!response.ok || !data.success) {
          console.log('⚠️ Viewer endpoint failed, trying legacy endpoint...');
          const legacyUrl = buildApiUrl(`/api/submission/${submissionId}${viewerQuery}`);
          console.log(`📡 Trying legacy endpoint: ${legacyUrl}`);
          response = await fetch(legacyUrl, { headers });
          data = await response.json();

          if (response.status === 401 || response.status === 403) {
            throw new Error('You need to sign in to view submission code.');
          }
        }

        // Handle errors
        if (!mounted) return;

        if (!response.ok || !data.success) {
          throw new Error(data.message || `Failed to fetch solution (Status: ${response.status})`);
        }

        if (!data.solution?.code) {
          throw new Error('No code found in solution response');
        }

        console.log('✅ Solution code loaded successfully');
        // Update state
        setSolution({
          ...data.solution,
          language: language || data.solution.language || 'unknown'
        });
      } catch (err) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : 'Failed to load solution';
        setError(message);
        console.error('❌ Error fetching solution:', message, err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSolution();
    return () => { mounted = false; };
  }, [submissionId, language, username]);

  // Notify parent of state changes
  useEffect(() => {
    onLoading?.(isLoading);
  }, [isLoading, onLoading]);

  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  const resolvedLanguage = solution?.language || language;
  const normalizedLanguage = useMemo(() => normalizeLanguage(resolvedLanguage), [resolvedLanguage]);

  useEffect(() => {
    if (!solution?.code) {
      setHighlightedHtml('');
      return;
    }

    const sanitizedCode = solution.code.replace(/\r\n/g, '\n');

    try {
      const highlighted = normalizedLanguage
        ? hljs.highlight(sanitizedCode, { language: normalizedLanguage }).value
        : hljs.highlightAuto(sanitizedCode).value;

      setHighlightedHtml(wrapWithLineSpans(highlighted));
    } catch (err) {
      console.error('Highlighting failed, falling back to plain text rendering.', err);
      setHighlightedHtml(wrapWithLineSpans(escapeHtml(sanitizedCode)));
    }
  }, [solution?.code, normalizedLanguage]);

  const fallbackHtml = useMemo(() => {
    if (!solution?.code) return '';
    return wrapWithLineSpans(escapeHtml(solution.code.replace(/\r\n/g, '\n')));
  }, [solution?.code]);

  const renderedHtml = highlightedHtml || fallbackHtml;

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-3 w-24 rounded-full" />
            </div>
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader size={40} />
            <p className="text-sm text-slate-500">Fetching submission code…</p>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-10/12" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="solution-viewer-error p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Unable to Load Submission</h3>
            <p className="text-red-800 mb-3">{error}</p>
            <div className="text-sm text-red-700 bg-red-100 p-3 rounded border border-red-200">
              <strong>Note:</strong> LeetCode only allows viewing your own submissions. Make sure:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>You're logged into LeetCode as the user who created this submission</li>
                <li>Your LEETCODE_SESSION token in .env matches the submission owner</li>
                <li>The submission ID is correct and belongs to you</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }



  if (!solution?.code) {
    // If we have metadata but no code, show helpful message
    if (solution) {
      return (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 my-4">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-amber-500 text-2xl">📝</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900">Code Not Available</h3>
              <p className="text-amber-700 mt-2">
                This submission's code is private or couldn't be fetched. However, we have the submission metadata:
              </p>
            </div>
          </div>
          <div className="bg-white border border-amber-200 rounded-xl p-4 space-y-2">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {solution.problemName && (
                <div>
                  <span className="font-semibold text-slate-700">Problem:</span>
                  <p className="text-slate-900">{solution.problemName}</p>
                </div>
              )}
              {solution.language && (
                <div>
                  <span className="font-semibold text-slate-700">Language:</span>
                  <p className="text-slate-900">{solution.language}</p>
                </div>
              )}
              {solution.runtime && (
                <div>
                  <span className="font-semibold text-slate-700">Runtime:</span>
                  <p className="text-emerald-600">{solution.runtime}</p>
                </div>
              )}
              {solution.memory && (
                <div>
                  <span className="font-semibold text-slate-700">Memory:</span>
                  <p className="text-blue-600">{solution.memory}</p>
                </div>
              )}
              {solution.difficulty && (
                <div>
                  <span className="font-semibold text-slate-700">Difficulty:</span>
                  <p className={`font-semibold ${
                    solution.difficulty === 'Easy' ? 'text-emerald-600' :
                    solution.difficulty === 'Medium' ? 'text-amber-600' :
                    'text-red-600'
                  }`}>{solution.difficulty}</p>
                </div>
              )}
              {solution.status && (
                <div>
                  <span className="font-semibold text-slate-700">Status:</span>
                  <p className="text-emerald-600">{solution.status}</p>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 bg-amber-100/60 border border-amber-200 rounded-lg px-3 py-2">
              Have authorization for this account? Add the submitter&apos;s LeetCode session token to their tracked-user settings so the code can be fetched automatically.
            </p>
            <div className="mt-4 pt-4 border-t border-amber-200">
              <a 
                href={`https://leetcode.com/submissions/detail/${submissionId}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffa116] text-white rounded-lg hover:bg-[#ff8800] transition-colors font-medium text-sm"
              >
                View Full Submission on LeetCode →
              </a>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 my-4">
        <div className="flex items-center">
          <span className="text-2xl mr-3">📝</span>
          <h3 className="text-lg font-semibold text-amber-900">No Solution Found</h3>
        </div>
        <p className="text-amber-700 mt-2">
          The solution code could not be loaded. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            {solution.problemName && (
              <h2 className="text-xl font-semibold text-slate-900">
                {solution.problemName}
              </h2>
            )}
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
              <span>
                Language: <span className="font-semibold text-slate-900">{solution.language}</span>
              </span>
              {solution.runtime && (
                <span>
                  Runtime: <span className="font-semibold text-emerald-600">{solution.runtime}</span>
                </span>
              )}
              {solution.memory && (
                <span>
                  Memory: <span className="font-semibold text-blue-600">{solution.memory}</span>
                </span>
              )}
            </div>
          </div>
          {solution.difficulty && (
            <span className={`px-4 py-2 text-sm font-semibold rounded-full ${
              solution.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
              solution.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
              'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {solution.difficulty}
            </span>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <pre className="p-6 text-sm">
          <code
            className={`hljs language-${normalizedLanguage || 'plaintext'}`}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </pre>
      </div>
    </div>
  );
};