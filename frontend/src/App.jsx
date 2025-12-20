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
  const [standaloneChecked, setStandaloneChecked] = useState(false);

  // Enable fullscreen handling
  useFullscreen();

  useEffect(() => {
    // Listen for the appinstalled event (fires when PWA is installed via browser UI)
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      sessionStorage.setItem('justInstalled', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    let retryCount = 0;
    const maxRetries = 20; // Increased to 20 retries (2 seconds total)
    const retryInterval = 100; // Check every 100ms

    const checkStandaloneMode = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        window.navigator.standalone ||
                        document.referrer.includes('android-app://');

      // Check if user just completed installation (flag set by RequireInstallation or browser install)
      const justInstalledFlag = sessionStorage.getItem('justInstalled');

      // If we detect standalone mode, just installed flag, or we've exhausted retries
      if (standalone || justInstalledFlag || retryCount >= maxRetries) {
        setIsStandalone(standalone || justInstalledFlag === 'true');
        setStandaloneChecked(true);

        // Clear the flag after using it
        if (justInstalledFlag) {
          sessionStorage.removeItem('justInstalled');
        }

        // Check if splash was already shown in this session
        const splashShownInSession = sessionStorage.getItem('splashShown');

        if (splashShownInSession) {
          // Already shown in this session, skip splash
          setShowSplash(false);
          setSplashShown(true);
        }
      } else {
        // Retry after interval
        retryCount++;
        setTimeout(checkStandaloneMode, retryInterval);
      }
    };

    // Start checking after a small initial delay
    const timer = setTimeout(checkStandaloneMode, 100);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setSplashShown(true);
    // Mark splash as shown in this session
    sessionStorage.setItem('splashShown', 'true');
  };

  // Wait for standalone detection to complete
  if (!standaloneChecked) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

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
