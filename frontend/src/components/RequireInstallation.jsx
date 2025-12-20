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

  const getOpenInstructions = () => {
    switch (platform) {
      case 'ios-safari':
        return {
          icon: '✨',
          title: 'App Already Installed!',
          subtitle: `${appName} is already installed on your device`,
          steps: [
            'Go to your home screen',
            `Look for the "${appName}" app icon ☕`,
            'Tap to open the app',
            'Enjoy the full-screen experience!'
          ]
        };
      case 'android-chrome':
        return {
          icon: '✨',
          title: 'App Already Installed!',
          subtitle: `${appName} is already installed on your device`,
          steps: [
            'Open your app drawer or home screen',
            `Look for the "${appName}" app`,
            'Tap to open the app',
            'Enjoy the full-screen experience!'
          ]
        };
      case 'desktop-chrome':
        return {
          icon: '✨',
          title: 'App Already Installed!',
          subtitle: `${appName} is already installed on your computer`,
          steps: [
            'Check your applications/programs',
            'Or look in your browser\'s app menu',
            `Click "${appName}" to open`,
            'Enjoy the dedicated app experience!'
          ]
        };
      default:
        return {
          icon: '✨',
          title: 'App Already Installed!',
          subtitle: `${appName} is already installed`,
          steps: [
            'Find the app in your apps/home screen',
            `Open "${appName}"`,
            'Enjoy the app experience!'
          ]
        };
    }
  };

  const getInstallInstructions = () => {
    switch (platform) {
      case 'ios-safari':
        return {
          icon: '📱',
          title: 'Install Required',
          subtitle: 'This app must be installed to work properly',
          steps: [
            'Tap the Share button ⬆️ at the bottom',
            'Scroll down and tap "Add to Home Screen"',
            'Tap "Add" to complete installation',
            'Open the app from your home screen'
          ]
        };
      case 'android-chrome':
        return {
          icon: '📱',
          title: 'Install Required',
          subtitle: 'This app must be installed to work properly',
          steps: deferredPrompt
            ? ['Tap the "Install App" button below to get started']
            : [
                'Tap the menu (⋮) in the top right',
                'Tap "Add to Home screen" or "Install app"',
                'Tap "Install" to complete',
                'Open the app from your home screen'
              ]
        };
      case 'desktop-chrome':
        return {
          icon: '💻',
          title: 'Install Required',
          subtitle: 'This app must be installed to work properly',
          steps: deferredPrompt
            ? ['Click the "Install App" button below to get started']
            : [
                'Look for the install icon ⊕ in the address bar',
                `Or go to menu (⋮) → "Install ${appName}"`,
                'Click "Install" to complete',
                'Open the app from your applications'
              ]
        };
      default:
        return {
          icon: '📱',
          title: 'Install Required',
          subtitle: 'This app must be installed to work properly',
          steps: [
            'Look for "Add to Home Screen" or "Install" option',
            'Check your browser menu or share options',
            'Install the app to continue',
            'Open the installed app to use it'
          ]
        };
    }
  };

  // Show loading while checking installation status
  if (checkingInstallation) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.loadingIcon}>☕</div>
          <p style={styles.loadingText}>Checking installation...</p>
        </div>
      </div>
    );
  }

  // Show install instructions if we have the install prompt, otherwise check if installed
  const instructions = (deferredPrompt || !isInstalled) ? getInstallInstructions() : getOpenInstructions();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Icon */}
        <div style={styles.iconContainer}>
          <div style={styles.icon}>{instructions.icon}</div>
        </div>

        {/* App branding */}
        <div style={styles.branding}>
          <div style={styles.coffeeIcon}>☕</div>
          <h1 style={styles.appName}>{appName}</h1>
          <h2 style={styles.appSubtitle}>Survey Kiosk</h2>
        </div>

        {/* Title */}
        <h3 style={styles.title}>{instructions.title}</h3>
        <p style={styles.subtitle}>{instructions.subtitle}</p>

        {/* Why install section - only show if not already installed or install button is available */}
        {(!isInstalled || deferredPrompt) && (
          <div style={styles.whySection}>
            <h4 style={styles.whyTitle}>Why install?</h4>
            <div style={styles.benefits}>
              <div style={styles.benefit}>
                <span style={styles.benefitIcon}>📱</span>
                <span>Full-screen experience</span>
              </div>
              <div style={styles.benefit}>
                <span style={styles.benefitIcon}>⚡</span>
                <span>Faster performance</span>
              </div>
              <div style={styles.benefit}>
                <span style={styles.benefitIcon}>🎯</span>
                <span>Dedicated app experience</span>
              </div>
            </div>
          </div>
        )}

        {/* Install button for Chrome/Edge - prioritize showing if available */}
        {deferredPrompt && (
          <button onClick={handleInstallClick} style={styles.installButton}>
            Install App
          </button>
        )}

        {/* Open app link - show if already installed and no install button */}
        {isInstalled && !deferredPrompt && (
          <div style={styles.openAppSection}>
            <a href="/" style={styles.openAppLink}>
              Try Opening App
            </a>
            <p style={styles.openAppHint}>
              If this doesn't work, use the instructions below
            </p>
          </div>
        )}

        {/* Instructions */}
        <div style={styles.instructions}>
          <h4 style={styles.instructionsTitle}>
            {(deferredPrompt || !isInstalled) ? 'Installation steps:' : 'How to open the app:'}
          </h4>
          {instructions.steps.map((step, index) => (
            <div key={index} style={styles.step}>
              <span style={styles.stepNumber}>{index + 1}</span>
              <span style={styles.stepText}>{step}</span>
            </div>
          ))}
        </div>
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
    background: 'var(--gradient-coffee)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    overflow: 'auto',
  },
  content: {
    maxWidth: '600px',
    width: '100%',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 247, 242, 0.98) 100%)',
    borderRadius: '24px',
    padding: '48px 32px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    textAlign: 'center',
  },
  iconContainer: {
    marginBottom: '24px',
  },
  icon: {
    fontSize: '72px',
    animation: 'pulse 2s ease-in-out infinite',
  },
  branding: {
    marginBottom: '32px',
    paddingBottom: '32px',
    borderBottom: '2px solid rgba(107, 68, 35, 0.1)',
  },
  coffeeIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  appName: {
    fontSize: '2.5rem',
    fontWeight: '700',
    fontFamily: "'Poppins', sans-serif",
    color: 'var(--espresso)',
    marginBottom: '8px',
    letterSpacing: '-0.02em',
  },
  appSubtitle: {
    fontSize: '1.25rem',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    color: 'var(--text-secondary)',
    letterSpacing: '0.05em',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    fontFamily: "'Poppins', sans-serif",
    color: 'var(--espresso)',
    marginBottom: '12px',
  },
  subtitle: {
    fontSize: '16px',
    fontFamily: "'Inter', sans-serif",
    color: 'var(--text-secondary)',
    marginBottom: '32px',
    lineHeight: '1.6',
  },
  whySection: {
    background: 'rgba(107, 68, 35, 0.05)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '32px',
  },
  whyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif",
    color: 'var(--espresso)',
    marginBottom: '16px',
  },
  benefits: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  benefit: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '15px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    textAlign: 'left',
  },
  benefitIcon: {
    fontSize: '24px',
    flexShrink: 0,
  },
  installButton: {
    width: '100%',
    background: 'var(--gradient-coffee)',
    color: 'var(--cream)',
    border: 'none',
    borderRadius: '16px',
    padding: '18px',
    fontSize: '18px',
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif",
    cursor: 'pointer',
    marginBottom: '24px',
    boxShadow: 'var(--shadow-md)',
    transition: 'all 0.2s ease',
  },
  instructions: {
    background: 'rgba(107, 68, 35, 0.05)',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'left',
  },
  instructionsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif",
    color: 'var(--espresso)',
    marginBottom: '16px',
    textAlign: 'center',
  },
  step: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '12px',
    fontSize: '15px',
    color: 'var(--text-primary)',
    lineHeight: '1.5',
  },
  stepNumber: {
    background: 'var(--gradient-coffee)',
    color: 'var(--cream)',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    flexShrink: 0,
    marginTop: '2px',
  },
  stepText: {
    flex: 1,
  },
  loadingIcon: {
    fontSize: '72px',
    marginBottom: '24px',
    animation: 'pulse 2s ease-in-out infinite',
  },
  loadingText: {
    fontSize: '18px',
    fontFamily: "'Inter', sans-serif",
    color: 'var(--text-secondary)',
  },
  openAppSection: {
    marginBottom: '24px',
    textAlign: 'center',
  },
  openAppLink: {
    display: 'inline-block',
    background: 'var(--gradient-coffee)',
    color: 'var(--cream)',
    textDecoration: 'none',
    borderRadius: '16px',
    padding: '18px 32px',
    fontSize: '18px',
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif",
    boxShadow: 'var(--shadow-md)',
    transition: 'all 0.2s ease',
    marginBottom: '12px',
  },
  openAppHint: {
    fontSize: '13px',
    fontFamily: "'Inter', sans-serif",
    color: 'var(--text-secondary)',
    marginTop: '12px',
    fontStyle: 'italic',
  }
};

// Add keyframe animations via a style tag
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
  `;
  if (!document.querySelector('style[data-require-installation]')) {
    style.setAttribute('data-require-installation', 'true');
    document.head.appendChild(style);
  }
}

export default RequireInstallation;
