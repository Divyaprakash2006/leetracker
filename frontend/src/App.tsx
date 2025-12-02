import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { UserProvider } from './context/UserContext';
import { Navigation } from './components/Navigation';
import { Loader } from './components/Loader';
import { PrivateRoute } from './components/PrivateRoute';

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
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));

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
              
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Navigation />
                    <HomePage />
                  </PrivateRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Navigation />
                    <DashboardPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <PrivateRoute>
                    <Navigation />
                    <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                      <SearchPage />
                    </div>
                  </PrivateRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <PrivateRoute>
                    <Navigation />
                    <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                      <UsersPage />
                    </div>
                  </PrivateRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <PrivateRoute>
                    <Navigation />
                    <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                      <AnalyticsPage />
                    </div>
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Navigation />
                    <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                      <ProfilePage />
                    </div>
                  </PrivateRoute>
                }
              />
              <Route
                path="/user/:username"
                element={
                  <PrivateRoute>
                    <Navigation />
                    <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                      <UserProgressPage />
                    </div>
                  </PrivateRoute>
                }
              />
              <Route
                path="/user/:username/submissions"
                element={
                  <PrivateRoute>
                    <Navigation />
                    <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                      <SubmissionsPage />
                    </div>
                  </PrivateRoute>
                }
              />
              <Route
                path="/user/:username/submission/:submissionId"
                element={
                  <PrivateRoute>
                    <Navigation />
                    <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                      <SubmissionViewerPage />
                    </div>
                  </PrivateRoute>
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
