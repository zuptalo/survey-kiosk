import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Home from './pages/Home';
import SurveyList from './pages/SurveyList';
import SurveyForm from './pages/SurveyForm';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminNewSurvey from './pages/AdminNewSurvey';
import AdminEditSurvey from './pages/AdminEditSurvey';
import AdminResults from './pages/AdminResults';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/surveys" element={<SurveyList />} />
        <Route path="/survey/:id" element={<SurveyForm />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/survey/new"
          element={
            <ProtectedRoute>
              <AdminNewSurvey />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/survey/:id/edit"
          element={
            <ProtectedRoute>
              <AdminEditSurvey />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/survey/:id/results"
          element={
            <ProtectedRoute>
              <AdminResults />
            </ProtectedRoute>
          }
        />
        </Routes>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
