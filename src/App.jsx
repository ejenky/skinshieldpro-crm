import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ContactsPage from './pages/ContactsPage';
import PipelinePage from './pages/PipelinePage';
import ImportPage from './pages/ImportPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/layout/Layout';
import './pages/LoginPage.css';
import './pages/LandingPage.css';

function ProtectedRoute({ children }) {
  const { isValid } = useAuth();
  if (!isValid) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const { isValid } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          index
          element={isValid ? <Navigate to="/dashboard" replace /> : <LandingPage />}
        />
        <Route
          path="/login"
          element={isValid ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="contacts/:id" element={<ContactsPage />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route path="import" element={<ImportPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
