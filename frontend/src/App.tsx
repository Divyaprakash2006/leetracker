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
      <div className="flex flex-col items-center gap-3 text-gray-600">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        <span className="text-sm font-medium">Loading dashboard…</span>
      </div>
    </div>
  );

  return (
    <Router>
      <UserProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Navigation />
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
      </UserProvider>
    </Router>
  );
}

export default App;
