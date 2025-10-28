import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { UserProvider } from './context/UserContext';
import { Navigation } from './components/Navigation';

const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const UsersPage = lazy(() => import('./pages/UsersPage').then((m) => ({ default: m.UsersPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const UserProgressPage = lazy(() => import('./pages/UserProgressPage').then((m) => ({ default: m.UserProgressPage })));
const SubmissionsPage = lazy(() => import('./pages/SubmissionsPage').then((m) => ({ default: m.SubmissionsPage })));
const SubmissionViewerPage = lazy(() => import('./pages/SubmissionViewerPage').then((m) => ({ default: m.SubmissionViewerPage })));

function App() {
  const renderFallback = () => (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="w-8 h-8 border-4 border-leetcode-border border-t-leetcode-orange rounded-full animate-spin"></div>
    </div>
  );

  return (
    <Router>
      <UserProvider>
        <div className="min-h-screen bg-leetcode-dark">
          <Navigation />
          <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
            <Suspense fallback={renderFallback()}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/user/:username" element={<UserProgressPage />} />
                <Route path="/user/:username/submissions" element={<SubmissionsPage />} />
                <Route path="/user/:username/submission/:submissionId" element={<SubmissionViewerPage />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </UserProvider>
    </Router>
  );
}

export default App;
