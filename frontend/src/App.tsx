import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { UserProvider } from './context/UserContext';
import { Navigation } from './components/Navigation';
import { Loader } from './components/Loader';

const HomePage = lazy(() => import('./pages/HomePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const UsersPage = lazy(() => import('./pages/UsersPage').then((m) => ({ default: m.UsersPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const UserProgressPage = lazy(() => import('./pages/UserProgressPage').then((m) => ({ default: m.UserProgressPage })));
const SubmissionsPage = lazy(() => import('./pages/SubmissionsPage').then((m) => ({ default: m.SubmissionsPage })));
const SubmissionViewerPage = lazy(() => import('./pages/SubmissionViewerPage').then((m) => ({ default: m.SubmissionViewerPage })));

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
              <Route
                path="/"
                element={
                  <>
                    <Navigation />
                    <HomePage />
                  </>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <>
                    <Navigation />
                    <DashboardPage />
                  </>
                }
              />
              <Route
                path="/search"
                element={
                  <>
                    <Navigation />
                    <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                      <SearchPage />
                    </div>
                  </>
                }
              />
              <Route
                path="/users"
                element={
                  <>
                    <Navigation />
                    <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                      <UsersPage />
                    </div>
                  </>
                }
              />
              <Route
                path="/analytics"
                element={
                  <>
                    <Navigation />
                    <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                      <AnalyticsPage />
                    </div>
                  </>
                }
              />
              <Route
                path="/user/:username"
                element={
                  <>
                    <Navigation />
                    <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                      <UserProgressPage />
                    </div>
                  </>
                }
              />
              <Route
                path="/user/:username/submissions"
                element={
                  <>
                    <Navigation />
                    <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                      <SubmissionsPage />
                    </div>
                  </>
                }
              />
              <Route
                path="/user/:username/submission/:submissionId"
                element={
                  <>
                    <Navigation />
                    <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                      <SubmissionViewerPage />
                    </div>
                  </>
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
