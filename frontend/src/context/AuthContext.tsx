import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface User {
  id: string;
  userId?: string;
  username?: string;
  email?: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Setup axios interceptor to handle 401 errors globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.warn('⚠️ Received 401/403, clearing invalid token');
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('auth_token');
      
      if (!savedToken) {
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('🔍 Checking authentication status...');
        
        const response = await axios.get(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
          timeout: 8000, // 8 second timeout
        });
        
        if (response.data.success && response.data.user) {
          setUser(response.data.user);
          setToken(savedToken);
          console.log('✅ User authenticated:', response.data.user.username);
        } else {
          console.log('⚠️ Invalid auth response, clearing token');
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
        }
      } catch (error: any) {
        // Only clear token if it's actually invalid (401/403), not for network errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.warn('⚠️ Token is invalid or expired, clearing');
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
        } else {
          // Network error or server down - keep token and assume still valid
          console.warn('⚠️ Could not verify token (network issue), keeping session');
          setToken(savedToken);
          // Try to restore user from previous session if available
          const cachedUser = localStorage.getItem('cached_user');
          if (cachedUser) {
            try {
              setUser(JSON.parse(cachedUser));
            } catch {
              // Ignore parse errors
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log('📡 Sending login request to:', `${API_URL}/api/auth/login`);
      
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        { username, password },
        {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📥 Login response:', response.data);

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        
        // Validate response data
        if (!newToken || !userData) {
          throw new Error('Invalid response from server');
        }
        
        setToken(newToken);
        setUser({ ...userData, userId: userData.userId ?? userData.id });
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('cached_user', JSON.stringify({ ...userData, userId: userData.userId ?? userData.id }));
        
        console.log('✅ Login successful for user:', userData.username);
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // Handle different error types
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please check your internet connection.');
      }
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Network error. Please check if the backend server is running.');
      }
      
      if (error.response) {
        // Server responded with error
        const message = error.response.data?.message || 'Login failed';
        throw new Error(message);
      } else if (error.request) {
        // Request made but no response
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Other errors
        throw new Error(error.message || 'Login failed');
      }
    }
  };

  const register = async (username: string, password: string, name: string) => {
    try {
      console.log('Attempting registration with:', { username, name, apiUrl: `${API_URL}/api/auth/register` });
      
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        password,
        name,
      });

      console.log('Registration response:', response.data);

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        setToken(newToken);
        setUser({ ...userData, userId: userData.userId ?? userData.id });
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('cached_user', JSON.stringify({ ...userData, userId: userData.userId ?? userData.id }));
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  };

  const logout = () => {
    const activeUserId = user?.userId ?? user?.id;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('cached_user');
      localStorage.removeItem('trackedUsers');
      if (activeUserId) {
        localStorage.removeItem(`trackedUsers_${activeUserId}`);
      }
    }

    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
