const sanitizeBaseUrl = (url?: string | null) => {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/\/+$/, '');
};

const resolveBaseUrl = () => {
  const envSource = (import.meta as any).env ?? {};
  const rawEnvUrl = sanitizeBaseUrl(envSource.VITE_API_URL);
  const isDev = Boolean(envSource?.DEV);

  const isAbsoluteUrl = (url: string) => /^https?:\/\//i.test(url);
  const isLocalAbsoluteUrl = (url: string) => /^https?:\/\/(localhost|127(?:\.\d+){3}|0\.0\.0\.0)(:\d+)?(?:\/.*)?$/i.test(url);

  if (rawEnvUrl) {
    if (!isAbsoluteUrl(rawEnvUrl)) {
      // Relative base (e.g., "/api") should be honoured in all environments
      return rawEnvUrl;
    }

    if (isDev || !isLocalAbsoluteUrl(rawEnvUrl)) {
      // Accept custom absolute URLs in dev or any non-local absolute URL in prod
      return rawEnvUrl;
    }
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }

  // Fallback for SSR/build contexts - use local dev API as a sensible default
  return isDev ? 'http://localhost:5001' : '';
};

export const API_BASE_URL = resolveBaseUrl();

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!API_BASE_URL) {
    return normalizedPath;
  }

  if (API_BASE_URL.startsWith('/')) {
    if (normalizedPath.startsWith(API_BASE_URL)) {
      return normalizedPath;
    }

    const joined = `${API_BASE_URL}${normalizedPath}`;
    return joined.replace(/\/+/g, '/');
  }

  if (typeof window !== 'undefined') {
    const currentOrigin = window.location?.origin?.replace(/\/+$/, '') ?? '';
    if (currentOrigin && API_BASE_URL === currentOrigin) {
      return normalizedPath;
    }
  }

  return `${API_BASE_URL}${normalizedPath}`;
};

export const apiClient = {
  getUser: (username: string) => buildApiUrl(`/api/user/${username}`),
  getUserStats: (username: string) => buildApiUrl(`/api/user/${username}/stats`),
  getUserSolutions: (username: string) => buildApiUrl(`/api/user/${username}/solutions`),
  syncUser: (username: string) => buildApiUrl(`/api/user/${username}/sync`),
  getSubmission: (submissionId: string) => buildApiUrl(`/api/submission/${submissionId}`),
  getSolutionViewer: (submissionId: string) => buildApiUrl(`/api/solutions/viewer/${submissionId}`),
  testLeetCode: () => buildApiUrl('/api/test-leetcode'),
  health: () => buildApiUrl('/health')
};