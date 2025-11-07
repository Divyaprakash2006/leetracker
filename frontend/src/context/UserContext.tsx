import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { apiClient } from '../config/api';

interface TrackedUser {
  username: string;
  userId: string;
  realName?: string;
  addedAt: number;
  lastUpdated?: number;
}

interface UserContextType {
  trackedUsers: TrackedUser[];
  loading: boolean;
  error: string | null;
  refreshTrackedUsers: () => Promise<void>;
  addUser: (username: string, realName?: string) => Promise<void>;
  removeUser: (username: string) => Promise<void>;
  isUserTracked: (username: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [trackedUsers, setTrackedUsers] = useState<TrackedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const persistToLocalStorage = useCallback((users: TrackedUser[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('trackedUsers', JSON.stringify(users));
    }
  }, []);

  const loadLocalCache = useCallback((): TrackedUser[] => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const stored = localStorage.getItem('trackedUsers');
      return stored ? JSON.parse(stored) : [];
    } catch (storageError) {
      console.warn('⚠️ Failed to parse trackedUsers from localStorage', storageError);
      return [];
    }
  }, []);

  const normalizeTrackedUsers = useCallback((users: any[]): TrackedUser[] => {
    return users
      .filter(Boolean)
      .map((user) => ({
        username: user.username,
        userId: user.userId || user.username,
        realName: user.realName,
        addedAt: user.addedAt ? new Date(user.addedAt).getTime() : Date.now(),
        lastUpdated: user.updatedAt ? new Date(user.updatedAt).getTime() : undefined,
      }))
      .sort((a, b) => a.addedAt - b.addedAt);
  }, []);

  const refreshTrackedUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(apiClient.listTrackedUsers(), {
        timeout: 10000,
      });

      const users = normalizeTrackedUsers(response.data?.users || []);
      setTrackedUsers(users);
      persistToLocalStorage(users);
    } catch (err: any) {
      console.error('❌ Failed to load tracked users from API:', err?.message || err);
      setError(err?.response?.data?.message || 'Failed to load tracked users');

      // Fallback to local cache if available
      const cached = loadLocalCache();
      if (cached.length > 0) {
        setTrackedUsers(cached);
      }
    } finally {
      setLoading(false);
    }
  }, [loadLocalCache, normalizeTrackedUsers, persistToLocalStorage]);

  useEffect(() => {
    const cached = loadLocalCache();
    if (cached.length > 0) {
      setTrackedUsers(cached);
    }

    refreshTrackedUsers();
  }, [loadLocalCache, refreshTrackedUsers]);

  useEffect(() => {
    persistToLocalStorage(trackedUsers);
  }, [trackedUsers, persistToLocalStorage]);

  const isUserTracked = useCallback(
    (username: string) =>
      trackedUsers.some((user) => user.username.toLowerCase() === username.toLowerCase()),
    [trackedUsers]
  );

  const addUser = useCallback(async (username: string, realName?: string) => {
    const trimmed = username.trim();
    if (!trimmed) {
      throw new Error('Username is required');
    }

    if (isUserTracked(trimmed)) {
      return;
    }

    try {
      setLoading(true);
      const payload: { username: string; realName?: string } = { username: trimmed };
      if (realName && realName.trim()) {
        payload.realName = realName.trim();
      }
      
      const response = await axios.post(apiClient.addTrackedUser(), payload);
      const userPayload = response.data?.user || { username: trimmed, userId: trimmed, addedAt: new Date().toISOString() };
      const newUser: TrackedUser = {
        username: userPayload.username,
        userId: userPayload.userId || userPayload.username,
        realName: userPayload.realName,
        addedAt: userPayload.addedAt ? new Date(userPayload.addedAt).getTime() : Date.now(),
        lastUpdated: userPayload.updatedAt ? new Date(userPayload.updatedAt).getTime() : Date.now(),
      };

      setTrackedUsers((prev) => {
        const next = [...prev, newUser].sort((a, b) => a.addedAt - b.addedAt);
        persistToLocalStorage(next);
        return next;
      });
    } catch (err: any) {
      console.error('❌ Failed to add tracked user:', err?.message || err);
      const errorMessage = err?.response?.data?.message || 'Failed to add tracked user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [persistToLocalStorage, isUserTracked]);

  const removeUser = useCallback(async (username: string) => {
    const trimmed = username.trim();
    if (!trimmed) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(apiClient.removeTrackedUser(trimmed));
      setTrackedUsers((prev) => {
        const next = prev.filter((user) => user.username.toLowerCase() !== trimmed.toLowerCase());
        persistToLocalStorage(next);
        return next;
      });
    } catch (err: any) {
      console.error('❌ Failed to remove tracked user:', err?.message || err);
      const errorMessage = err?.response?.data?.message || 'Failed to remove tracked user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [persistToLocalStorage]);

  return (
    <UserContext.Provider
      value={{
        trackedUsers,
        loading,
        error,
        refreshTrackedUsers,
        addUser,
        removeUser,
        isUserTracked,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useTrackedUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useTrackedUsers must be used within UserProvider');
  }
  return context;
};
