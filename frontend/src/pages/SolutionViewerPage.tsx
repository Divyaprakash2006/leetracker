// SolutionViewerPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient, getAuthHeaders } from '../config/api';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader } from '../components/Loader';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { duotoneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Solution {
  id: string;
  problem: {
    title: string;
    difficulty: string;
  };
  language: string;
  code: string;
  explanation: string;
  createdAt: string;
}

export const SolutionViewerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSolution = async () => {
      if (!id) {
        setError('No solution ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const url = apiClient.getSolutionViewer(id);
        const response = await axios.get(url, { 
          timeout: 10000,
          headers: getAuthHeaders() 
        });
        
        // Backend returns { success: true, solution: {...} }
        if (response.data.success && response.data.solution) {
          setSolution(response.data.solution);
        } else {
          setError(response.data.message || 'Solution not found');
        }
      } catch (err: any) {
        const status = err?.response?.status;
        const errorMsg = status === 401 || status === 403
          ? 'Please sign in to view this solution.'
          : err.code === 'ECONNABORTED' 
            ? 'Request timeout - solution took too long to load'
            : status === 404
              ? 'Solution not found'
              : 'Failed to load solution';
        setError(errorMsg);
        console.error('Error fetching solution:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSolution();
  }, [id]);

  if (loading) {
    return <Loader centered />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-2xl mx-4">
          <div className="mb-6">
            <svg className="w-20 h-20 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Submission</h2>
            <p className="text-gray-600 mb-6">{error}</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Why is this happening?
            </h3>
            <p className="text-sm text-blue-800 mb-3">
              LeetCode's API only allows you to view your own submission code. This is a privacy feature by LeetCode.
            </p>
            <div className="text-sm text-blue-800">
              <strong>Solutions:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Make sure your <code className="bg-blue-100 px-1 rounded">LEETCODE_SESSION</code> token matches the submission owner</li>
                <li>Only submissions from user <strong>Divi_10</strong> can be viewed with your current setup</li>
                <li>View the submission directly on LeetCode instead</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.href = '/submissions'} variant="outline">
              Back to Submissions
            </Button>
            <Button 
              onClick={() => window.open(`https://leetcode.com/submissions/detail/${id}/`, '_blank')}
              className="bg-[#ffa116] hover:bg-[#ff8800]"
            >
              View on LeetCode →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Solution Not Found</h2>
          <p className="text-gray-600 mb-6">The requested solution could not be found.</p>
          <Button asChild>
            <a href="/solutions">Back to Solutions</a>
          </Button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(solution.createdAt).toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const difficultyBadgeClasses =
    solution.problem.difficulty === 'Easy'
      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100'
      : solution.problem.difficulty === 'Medium'
        ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100'
        : 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100';

  const submissionDetails = [
    { label: 'Language', value: solution.language },
    { label: 'Difficulty', value: solution.problem.difficulty },
    { label: 'Submitted', value: formattedDate },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-100 bg-gradient-to-br from-white via-slate-50 to-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <Button
            variant="outline"
            asChild
            className="rounded-full border-gray-200 bg-white/70 text-sm font-medium text-gray-600 backdrop-blur transition hover:border-gray-300 hover:bg-white"
          >
            <a href="/solutions">← Back to Solutions</a>
          </Button>

          <div className="mt-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
                  Submission Overview
                </p>
                <h1 className="text-3xl font-semibold leading-tight text-gray-900 md:text-4xl">
                  {solution.problem.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${difficultyBadgeClasses}`}
                  >
                    {solution.problem.difficulty}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600">
                    {solution.language}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-6 text-sm text-gray-600">
                <p className="font-medium text-gray-800">Submitted on</p>
                <p>{formattedDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
          <Card className="rounded-3xl border border-gray-100 bg-white shadow-sm">
            <CardContent className="space-y-10 p-8">
              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Solution Code</h2>
                  <p className="text-sm text-gray-500">Well-formatted with syntax highlighting for streamlined reviews.</p>
                </div>
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                  <SyntaxHighlighter
                    language={solution.language.toLowerCase()}
                    style={duotoneLight}
                    customStyle={{
                      margin: 0,
                      padding: '1.5rem',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      fontSize: '0.92rem',
                      lineHeight: '1.7',
                      borderRadius: '1rem',
                      border: '1px solid #f1f5f9',
                    }}
                    codeTagProps={{
                      style: {
                        fontFamily: '"Fira Code", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                        backgroundColor: '#ffffff',
                        color: '#0f172a',
                      },
                    }}
                    wrapLines
                  >
                    {solution.code}
                  </SyntaxHighlighter>
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Explanation</h2>
                  <p className="text-sm text-gray-500">Author’s commentary capturing the rationale behind the approach.</p>
                </div>
                <div className="prose prose-slate max-w-none rounded-2xl border border-gray-100 bg-gray-50 p-6 text-gray-700">
                  {solution.explanation}
                </div>
              </section>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-3xl border border-gray-100 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-900">Submission Details</CardTitle>
                <p className="text-sm text-gray-500">Key execution metrics presented at a glance.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {submissionDetails.map((detail) => (
                  <div key={detail.label} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <span className="text-sm font-medium text-gray-500">{detail.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{detail.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-gray-100 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-900">Problem Overview</CardTitle>
                <p className="text-sm text-gray-500">Context describing the challenge addressed here.</p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p>
                  This solution tackles <span className="font-semibold text-gray-900">{solution.problem.title}</span> using a
                  {` ${solution.language.toLowerCase()}`} implementation. Explore the explanation for algorithmic decisions and
                  potential opportunities to iterate.
                </p>
                <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-xs uppercase tracking-[0.2em] text-gray-500">
                  Focus · Iterate · Improve
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};