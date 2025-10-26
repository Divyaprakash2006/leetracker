const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001';

export const apiClient = {
  getUser: (username: string) => `${API_BASE_URL}/api/user/${username}`,
  getUserStats: (username: string) => `${API_BASE_URL}/api/user/${username}/stats`,
  getUserSolutions: (username: string) => `${API_BASE_URL}/api/user/${username}/solutions`,
  syncUser: (username: string) => `${API_BASE_URL}/api/user/${username}/sync`,
  getSubmission: (submissionId: string) => `${API_BASE_URL}/api/submission/${submissionId}`,
  testLeetCode: () => `${API_BASE_URL}/api/test-leetcode`,
  health: () => `${API_BASE_URL}/health`
};