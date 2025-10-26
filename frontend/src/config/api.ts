const sanitizeBaseUrl = (url?: string | null) => {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/\/+$/, '');
};

const resolveBaseUrl = () => {
  const rawEnvUrl = sanitizeBaseUrl((import.meta as any).env?.VITE_API_URL);

  if (rawEnvUrl) {
    return rawEnvUrl;
  }

  if ((import.meta as any).env?.DEV) {
    return 'http://localhost:5001';
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }

  return 'http://localhost:5001';
};

const API_BASE_URL = resolveBaseUrl();

const buildUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const apiClient = {
  getUser: (username: string) => buildUrl(`/api/user/${username}`),
  getUserStats: (username: string) => buildUrl(`/api/user/${username}/stats`),
  getUserSolutions: (username: string) => buildUrl(`/api/user/${username}/solutions`),
  syncUser: (username: string) => buildUrl(`/api/user/${username}/sync`),
  getSubmission: (submissionId: string) => buildUrl(`/api/submission/${submissionId}`),
  testLeetCode: () => buildUrl('/api/test-leetcode'),
  health: () => buildUrl('/health')
};