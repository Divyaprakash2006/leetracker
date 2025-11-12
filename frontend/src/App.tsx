import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { UserProvider } from './context/UserContext';
import { Navigation } from './components/Navigation';
import { Loader } from './components/Loader';
import { ProtectedRoute } from './components/ProtectedRoute';

const HomePage = lazy(() => import('./pages/HomePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const UsersPage = lazy(() => import('./pages/UsersPage').then((m) => ({ default: m.UsersPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const UserProgressPage = lazy(() => import('./pages/UserProgressPage').then((m) => ({ default: m.UserProgressPage })));
const SubmissionsPage = lazy(() => import('./pages/SubmissionsPage').then((m) => ({ default: m.SubmissionsPage })));
const SubmissionViewerPage = lazy(() => import('./pages/SubmissionViewerPage').then((m) => ({ default: m.SubmissionViewerPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then((m) => ({ default: m.SignupPage })));
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage').then((m) => ({ default: m.AuthCallbackPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));

function App() {
  const renderFallback = () => (
    <div className="flex min-h-[40vh] items-center justify-center bg-slate-50">
      <Loader size={40} />
    </div>
  );

  return (
    <Router>
      <UserProvider>
        <div className="relative min-h-screen bg-slate-50">
          <Suspense fallback={renderFallback()}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <HomePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                      <SearchPage />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                      <UsersPage />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                      <AnalyticsPage />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/:username"
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                      <UserProgressPage />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/:username/submissions"
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                      <SubmissionsPage />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/:username/submission/:submissionId"
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                      <SubmissionViewerPage />
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </div>
      </UserProvider>
    </Router>
  );
}

export default App;
