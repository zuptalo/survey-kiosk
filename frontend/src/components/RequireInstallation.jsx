import { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';

function RequireInstallation() {
  const { appName } = useConfig();
  const [platform, setPlatform] = useState('unknown');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [checkingInstallation, setCheckingInstallation] = useState(true);

  useEffect(() => {
    // Debug: Log user agent
    console.log('User Agent:', navigator.userAgent);

    // Check if app is already installed using getInstalledRelatedApps API
    const checkIfInstalled = async () => {
      try {
        if ('getInstalledRelatedApps' in navigator) {
          const relatedApps = await navigator.getInstalledRelatedApps();
          console.log('Related apps:', relatedApps);

          // If any related apps are found, the PWA is installed
          if (relatedApps.length > 0) {
            setIsInstalled(true);
            setCheckingInstallation(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error checking installed apps:', error);
      }

      setCheckingInstallation(false);
    };

    checkIfInstalled();

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    const isChrome = /chrome/.test(userAgent);

    if (isIOS && isSafari) {
      setPlatform('ios-safari');
    } else if (isAndroid && isChrome) {
      setPlatform('android-chrome');
    } else if (isChrome) {
      setPlatform('desktop-chrome');
    } else {
      setPlatform('other');
    }

    // Listen for the beforeinstallprompt event (Chrome/Edge)
    const handleBeforeInstallPrompt = (e) => {
      console.log('beforeinstallprompt event fired!');
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check after a delay if event fired
    setTimeout(() => {
      if (!deferredPrompt) {
        console.log('beforeinstallprompt event did NOT fire - PWA may already be installed or dismissed');
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        // Set flag to indicate app was just installed
        sessionStorage.setItem('justInstalled', 'true');
      }

      setDeferredPrompt(null);
    }
  };

  // Debug: Log the state
  useEffect(() => {
    console.log('RequireInstallation state:', { isInstalled, deferredPrompt: !!deferredPrompt, platform });
  }, [isInstalled, deferredPrompt, platform]);

  const getInstallInstructions = () => {
    switch (platform) {
      case 'ios-safari':
        return [
          'Tap the Share button ⬆️',
          'Select "Add to Home Screen"',
          'Tap "Add" to install',
          'Open from your home screen'
        ];
      case 'android-chrome':
        return deferredPrompt
          ? ['Tap "Install" below']
          : [
              'Tap menu (⋮) → "Add to Home screen"',
              'Tap "Install"',
              'Open from your home screen'
            ];
      case 'desktop-chrome':
        return deferredPrompt
          ? ['Click "Install" below']
          : [
              'Look for install icon ⊕ in address bar',
              'Or menu (⋮) → "Install..."',
              'Click "Install"'
            ];
      default:
        return [
          'Look for "Add to Home Screen"',
          'Or "Install" in browser menu',
          'Complete installation',
          'Open the installed app'
        ];
    }
  };

  // Show loading while checking installation status
  if (checkingInstallation) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <img src="/icon-192.png" alt={appName} style={styles.loadingIcon} />
          <p style={styles.loadingText}>Checking...</p>
        </div>
      </div>
    );
  }

  const instructions = getInstallInstructions();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* App Icon */}
        <img src="/icon-192.png" alt={appName} style={styles.appIcon} />

        {/* App Name */}
        <h1 style={styles.appName}>{appName}</h1>

        {/* Message */}
        <p style={styles.message}>Installation Required</p>

        {/* Install button for Chrome/Edge - prioritize showing if available */}
        {deferredPrompt && (
          <button onClick={handleInstallClick} style={styles.installButton}>
            Install
          </button>
        )}

        {/* Instructions */}
        {(!deferredPrompt || isInstalled) && (
          <div style={styles.instructions}>
            {instructions.map((step, index) => (
              <div key={index} style={styles.step}>
                <span style={styles.stepNumber}>{index + 1}</span>
                <span style={styles.stepText}>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'var(--gradient-bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    overflow: 'hidden',
  },
  content: {
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  appIcon: {
    width: '120px',
    height: '120px',
    borderRadius: '24px',
    boxShadow: 'var(--shadow-lg)',
  },
  appName: {
    fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
    fontWeight: '700',
    fontFamily: "'Poppins', sans-serif",
    color: 'var(--espresso)',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  message: {
    fontSize: 'clamp(1rem, 3vw, 1.25rem)',
    fontFamily: "'Inter', sans-serif",
    color: 'var(--text-secondary)',
    margin: 0,
  },
  installButton: {
    width: '100%',
    maxWidth: '280px',
    background: 'var(--gradient-coffee)',
    color: 'var(--cream)',
    border: 'none',
    borderRadius: '16px',
    padding: 'clamp(14px, 3vw, 18px) clamp(24px, 5vw, 32px)',
    fontSize: 'clamp(16px, 3vw, 18px)',
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif",
    cursor: 'pointer',
    boxShadow: 'var(--shadow-lg)',
    transition: 'all 0.3s ease',
    marginTop: '8px',
  },
  instructions: {
    width: '100%',
    maxWidth: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(10px, 2vw, 12px)',
    marginTop: '8px',
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: 'clamp(13px, 2.5vw, 15px)',
    color: 'var(--text-primary)',
    textAlign: 'left',
    lineHeight: '1.4',
  },
  stepNumber: {
    background: 'var(--gradient-coffee)',
    color: 'var(--cream)',
    width: 'clamp(24px, 5vw, 28px)',
    height: 'clamp(24px, 5vw, 28px)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    fontWeight: '600',
    flexShrink: 0,
  },
  stepText: {
    flex: 1,
    fontFamily: "'Inter', sans-serif",
  },
  loadingIcon: {
    width: '120px',
    height: '120px',
    borderRadius: '24px',
    boxShadow: 'var(--shadow-lg)',
    animation: 'pulse 2s ease-in-out infinite',
  },
  loadingText: {
    fontSize: '18px',
    fontFamily: "'Inter', sans-serif",
    color: 'var(--text-secondary)',
  }
};

// Add keyframe animations via a style tag
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.05); opacity: 1; }
    }
  `;
  if (!document.querySelector('style[data-require-installation]')) {
    style.setAttribute('data-require-installation', 'true');
    document.head.appendChild(style);
  }
}

export default RequireInstallation;
