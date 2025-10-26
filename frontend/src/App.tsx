import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { Navigation } from './components/Navigation';
import { DashboardPage } from './pages/DashboardPage';
import { SearchPage } from './pages/SearchPage';
import { UsersPage } from './pages/UsersPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { UserProgressPage } from './pages/UserProgressPage';
import { SubmissionsPage } from './pages/SubmissionsPage';
import { SubmissionViewerPage } from './pages/SubmissionViewerPage';

function App() {
  return (
    <Router>
      <UserProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Navigation />
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/user/:username" element={<UserProgressPage />} />
            <Route path="/user/:username/submissions" element={<SubmissionsPage />} />
            <Route path="/user/:username/submission/:submissionId" element={<SubmissionViewerPage />} />
          </Routes>
        </div>
      </UserProvider>
    </Router>
  );
}

export default App;
