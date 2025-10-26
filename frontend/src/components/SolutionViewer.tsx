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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading solution...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
        <div className="flex items-center">
          <span className="text-red-500 text-xl mr-2">⚠️</span>
          <h3 className="text-lg font-semibold text-red-800">Error Loading Solution</h3>
        </div>
        <p className="text-red-600 mt-2">{error}</p>
      </div>
    );
  }

  if (!solution?.code) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
        <div className="flex items-center">
          <span className="text-yellow-500 text-xl mr-2">📝</span>
          <h3 className="text-lg font-semibold text-yellow-800">No Solution Found</h3>
        </div>
        <p className="text-yellow-600 mt-2">
          The solution code could not be loaded. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            {solution.problemName && (
              <h2 className="text-xl font-semibold text-gray-800">
                {solution.problemName}
              </h2>
            )}
            <div className="mt-1 text-sm text-gray-500">
              Language: <span className="font-medium">{solution.language}</span>
              {solution.runtime && (
                <span className="ml-4">Execution Time: <span className="font-medium">{solution.runtime}</span></span>
              )}
              {solution.memory && (
                <span className="ml-4">Memory: <span className="font-medium">{solution.memory}</span></span>
              )}
            </div>
          </div>
          {solution.difficulty && (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              solution.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
              solution.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {solution.difficulty}
            </span>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm">
          <code
            className={`hljs language-${normalizedLanguage || 'plaintext'}`}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </pre>
      </div>
    </div>
  );
};