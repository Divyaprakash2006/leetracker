import { useState, useEffect, useMemo } from 'react';
import hljs from 'highlight.js/lib/common';
import { API_URL } from '../config/constants';
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

        // Try viewer endpoint first
        let response = await fetch(`${API_URL}/api/solutions/viewer/${submissionId}`);
        let data = await response.json();

        // If first endpoint fails, try legacy endpoint
        if (!response.ok || !data.success) {
          response = await fetch(`${API_URL}/api/solution/${submissionId}`);
          data = await response.json();
        }

        // Handle errors
        if (!mounted) return;

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to fetch solution');
        }

        if (!data.solution?.code) {
          throw new Error('No code found in solution');
        }

        // Update state
        setSolution({
          ...data.solution,
          language: language || data.solution.language || 'unknown'
        });
      } catch (err) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : 'Failed to load solution';
        setError(message);
        console.error('Error fetching solution:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSolution();
    return () => { mounted = false; };
  }, [submissionId, language]);

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
      <div className="flex items-center justify-center p-8">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-leetcode-border border-t-leetcode-orange rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-leetcode-yellow rounded-full animate-spin" style={{animationDuration: '1.5s'}}></div>
        </div>
        <span className="ml-3 text-leetcode-text">Loading solution...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-leetcode-red/10 border-2 border-leetcode-red/50 rounded-lg p-4 my-4">
        <div className="flex items-center">
          <span className="text-leetcode-red text-xl mr-2">⚠️</span>
          <h3 className="text-lg font-semibold text-leetcode-red">Error Loading Solution</h3>
        </div>
        <p className="text-leetcode-red/80 mt-2">{error}</p>
      </div>
    );
  }

  if (!solution?.code) {
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