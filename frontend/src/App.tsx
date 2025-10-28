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
      <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <Router>
      <UserProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <Navigation />
          <div className="w-full">
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
