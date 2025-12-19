import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import SplashScreen from './components/SplashScreen';
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
  const [showSplash, setShowSplash] = useState(true);
  const [splashShown, setSplashShown] = useState(false);

  useEffect(() => {
    // Check if splash was already shown in this session
    const splashShownInSession = sessionStorage.getItem('splashShown');

    if (splashShownInSession) {
      // Already shown in this session, skip splash
      setShowSplash(false);
      setSplashShown(true);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setSplashShown(true);
    // Mark splash as shown in this session
    sessionStorage.setItem('splashShown', 'true');
  };

  // Show splash on first load
  if (showSplash && !splashShown) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

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
