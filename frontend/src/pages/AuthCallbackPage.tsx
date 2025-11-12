import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleCallback = () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        // Handle OAuth error
        console.error('OAuth error:', error);
        navigate('/login?error=' + error);
        return;
      }

      if (token) {
        // Store token and redirect to home
        localStorage.setItem('auth_token', token);
        
        // Force auth context to refresh
        window.location.href = '/';
      } else {
        // No token received
        navigate('/login?error=no_token');
      }
    };

    handleCallback();
  }, [searchParams, navigate, logout]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-orange-50 to-slate-50">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-[#ffa116]"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Completing authentication...</p>
        <p className="mt-2 text-sm text-gray-500">Please wait while we log you in</p>
      </div>
    </div>
  );
};
