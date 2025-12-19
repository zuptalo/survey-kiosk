import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ConfigProvider } from './context/ConfigContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { useFullscreen } from './hooks/useFullscreen';
import SplashScreen from './components/SplashScreen';
import RequireInstallation from './components/RequireInstallation';
import ConnectivityMonitor from './components/ConnectivityMonitor';
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
  const [isStandalone, setIsStandalone] = useState(false);

  // Enable fullscreen handling
  useFullscreen();

  useEffect(() => {
    // Check if app is running as installed PWA (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      window.navigator.standalone ||
                      document.referrer.includes('android-app://');

    setIsStandalone(standalone);

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

  // Force installation - show requirement screen if not running as PWA
  if (!isStandalone) {
    return (
      <ConfigProvider>
        <RequireInstallation />
      </ConfigProvider>
    );
  }

  // Show splash on first load
  if (showSplash && !splashShown) {
    return (
      <ConfigProvider>
        <SplashScreen onComplete={handleSplashComplete} />
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider>
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

          {/* Connectivity monitor - blocks app when offline */}
          <ConnectivityMonitor />
        </AuthProvider>
      </NotificationProvider>
    </ConfigProvider>
  );
}

export default App;
