import { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';

function InstallPrompt() {
  const { appName } = useConfig();
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [platform, setPlatform] = useState('unknown');

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         window.navigator.standalone ||
                         document.referrer.includes('android-app://');

    // Check if user previously dismissed
    const dismissed = localStorage.getItem('installPromptDismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

    // Don't show if installed or recently dismissed
    if (isStandalone || dismissedTime > oneDayAgo) {
      return;
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    const isChrome = /chrome/.test(userAgent);

    if (isIOS && isSafari) {
      setPlatform('ios-safari');
      setShowPrompt(true);
    } else if (isAndroid && isChrome) {
      setPlatform('android-chrome');
      setShowPrompt(true);
    } else if (isChrome) {
      setPlatform('desktop-chrome');
      setShowPrompt(true);
    } else {
      setPlatform('other');
      setShowPrompt(true);
    }

    // Listen for the beforeinstallprompt event (Chrome/Edge)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('installPromptDismissed', Date.now().toString());
    setShowPrompt(false);
  };

  const getInstructions = () => {
    switch (platform) {
      case 'ios-safari':
        return {
          icon: '📱',
          title: `Install ${appName} App`,
          steps: [
            'Tap the Share button',
            'Scroll and tap "Add to Home Screen"',
            'Tap "Add" to install'
          ],
          shareIcon: '⬆️'
        };
      case 'android-chrome':
        return {
          icon: '📱',
          title: `Install ${appName} App`,
          steps: deferredPrompt
            ? ['Tap the "Install" button below']
            : [
                'Tap the menu (⋮)',
                'Tap "Add to Home screen"',
                'Tap "Add" to install'
              ]
        };
      case 'desktop-chrome':
        return {
          icon: '💻',
          title: `Install ${appName} App`,
          steps: deferredPrompt
            ? ['Click the "Install" button below']
            : [
                'Click the install icon in the address bar',
                `Or go to menu → "Install ${appName}"`
              ]
        };
      default:
        return {
          icon: '📱',
          title: `Use ${appName} as an App`,
          steps: [
            'Look for "Add to Home Screen" option',
            'In your browser menu or share options'
          ]
        };
    }
  };

  if (!showPrompt) return null;

  const instructions = getInstructions();

  return (
    <div style={styles.overlay} onClick={handleDismiss}>
      <div style={styles.prompt} onClick={(e) => e.stopPropagation()}>
        <button onClick={handleDismiss} style={styles.closeButton}>✕</button>

        <div style={styles.header}>
          <div style={styles.icon}>{instructions.icon}</div>
          <h3 style={styles.title}>{instructions.title}</h3>
          <p style={styles.subtitle}>Get instant access from your home screen</p>
        </div>

        <div style={styles.benefits}>
          <div style={styles.benefit}>
            <span style={styles.benefitIcon}>⚡</span>
            <span>Faster access</span>
          </div>
          <div style={styles.benefit}>
            <span style={styles.benefitIcon}>📱</span>
            <span>Full-screen mode</span>
          </div>
          <div style={styles.benefit}>
            <span style={styles.benefitIcon}>🎯</span>
            <span>No browser clutter</span>
          </div>
        </div>

        {deferredPrompt ? (
          <button onClick={handleInstallClick} style={styles.installButton}>
            Install Now
          </button>
        ) : (
          <div style={styles.instructions}>
            <p style={styles.instructionsTitle}>How to install:</p>
            {instructions.steps.map((step, index) => (
              <div key={index} style={styles.step}>
                <span style={styles.stepNumber}>{index + 1}</span>
                <span style={styles.stepText}>{step}</span>
                {instructions.shareIcon && index === 0 && (
                  <span style={styles.shareIcon}>{instructions.shareIcon}</span>
                )}
              </div>
            ))}
          </div>
        )}

        <button onClick={handleDismiss} style={styles.dismissButton}>
          Maybe Later
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px',
    animation: 'fadeIn 0.3s ease-out',
  },
  prompt: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 247, 242, 0.98) 100%)',
    borderRadius: '24px 24px 0 0',
    padding: '32px 24px 24px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.15)',
    position: 'relative',
    animation: 'slideUp 0.3s ease-out',
  },
  closeButton: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'rgba(107, 68, 35, 0.1)',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    fontSize: '18px',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--espresso)',
    marginBottom: '8px',
    fontFamily: "'Poppins', sans-serif",
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    fontFamily: "'Inter', sans-serif",
  },
  benefits: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  benefit: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(107, 68, 35, 0.08)',
    padding: '8px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  benefitIcon: {
    fontSize: '16px',
  },
  installButton: {
    width: '100%',
    background: 'var(--gradient-coffee)',
    color: 'var(--cream)',
    border: 'none',
    borderRadius: '16px',
    padding: '16px',
    fontSize: '18px',
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif",
    cursor: 'pointer',
    marginBottom: '12px',
    boxShadow: 'var(--shadow-md)',
    transition: 'all 0.2s ease',
  },
  instructions: {
    background: 'rgba(107, 68, 35, 0.05)',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '16px',
  },
  instructionsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--espresso)',
    marginBottom: '12px',
    fontFamily: "'Poppins', sans-serif",
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
    fontSize: '14px',
    color: 'var(--text-primary)',
  },
  stepNumber: {
    background: 'var(--gradient-coffee)',
    color: 'var(--cream)',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600',
    flexShrink: 0,
  },
  stepText: {
    flex: 1,
  },
  shareIcon: {
    fontSize: '20px',
  },
  dismissButton: {
    width: '100%',
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
    borderRadius: '12px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }
};

// Add keyframe animations via a style tag
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
  `;
  if (!document.querySelector('style[data-install-prompt]')) {
    style.setAttribute('data-install-prompt', 'true');
    document.head.appendChild(style);
  }
}

export default InstallPrompt;
