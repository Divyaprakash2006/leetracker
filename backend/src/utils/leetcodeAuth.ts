import TrackedUser from '../models/TrackedUser';

export interface ResolvedLeetCodeAuth {
  session?: string;
  csrfToken?: string;
  source: 'tracked-user' | 'env' | 'none';
  username?: string;
}

const sanitizeToken = (token?: string | null) => {
  if (!token) return undefined;
  const trimmed = token.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const resolveLeetCodeAuth = async (username?: string): Promise<ResolvedLeetCodeAuth> => {
  const envSession = sanitizeToken(process.env.LEETCODE_SESSION);
  const envCsrf =
    sanitizeToken(process.env.LEETCODE_CSRF_TOKEN) || sanitizeToken(process.env.LEETCODE_CSRFTOKEN);

  if (username) {
    const normalized = username.trim().toLowerCase();
    const trackedUser = await TrackedUser.findOne({
      normalizedUsername: normalized,
      leetcodeSession: { $exists: true, $ne: '' },
    })
      .sort({ leetcodeSessionUpdatedAt: -1, updatedAt: -1 })
      .select('+leetcodeSession +leetcodeCsrfToken');

    if (trackedUser?.leetcodeSession) {
      return {
        session: sanitizeToken(trackedUser.leetcodeSession) ?? envSession,
        csrfToken: sanitizeToken(trackedUser.leetcodeCsrfToken) ?? envCsrf,
        source: 'tracked-user',
        username: trackedUser.username,
      };
    }
  }

  if (envSession) {
    return {
      session: envSession,
      csrfToken: envCsrf,
      source: 'env',
      username,
    };
  }

  return {
    source: 'none',
    username,
  };
};
