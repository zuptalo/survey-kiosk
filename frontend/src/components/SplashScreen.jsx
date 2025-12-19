import { useEffect, useState } from 'react';
import { useConfig } from '../context/ConfigContext';

function SplashScreen({ onComplete }) {
  const { appName } = useConfig();
  const [versionInfo, setVersionInfo] = useState(null);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Fetch version info
    fetch('/version.json')
      .then(res => res.json())
      .then(data => setVersionInfo(data))
      .catch(() => setVersionInfo({ version: 'dev', buildDate: new Date().toISOString() }));

    // Start fade out after 1.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1500);

    // Complete splash after 2 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const formatVersion = (version) => {
    if (version === 'dev') return 'Development';

    // If version is in the format "react-YYYYMMDD-N", display as-is with v prefix
    if (version.startsWith('react-')) {
      // Extract the date and build number: react-20231219-1 -> v20231219.1
      const parts = version.replace('react-', '').split('-');
      if (parts.length === 2) {
        return `v${parts[0]}.${parts[1]}`;
      }
      return version;
    }

    // Fallback for other formats
    return version;
  };

  return (
    <div style={{
      ...styles.container,
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.5s ease-out'
    }}>
      <div style={styles.content}>
        {/* Logo/Icon */}
        <div style={styles.iconContainer}>
          <div style={styles.coffeeIcon}>☕</div>
        </div>

        {/* App Name */}
        <h1 style={styles.appName}>{appName}</h1>
        <h2 style={styles.appSubtitle}>Survey Kiosk</h2>

        {/* Version */}
        {versionInfo && (
          <div style={styles.versionContainer}>
            <span style={styles.versionText}>
              {formatVersion(versionInfo.version)}
            </span>
          </div>
        )}

        {/* Loading indicator */}
        <div style={styles.loadingContainer}>
          <div style={styles.loadingDot}></div>
          <div style={styles.loadingDot}></div>
          <div style={styles.loadingDot}></div>
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
    zIndex: 9999,
  },
  content: {
    textAlign: 'center',
    color: 'var(--cream)',
  },
  iconContainer: {
    marginBottom: '32px',
  },
  coffeeIcon: {
    fontSize: '96px',
    animation: 'pulse 2s ease-in-out infinite',
  },
  appName: {
    fontSize: '3rem',
    fontWeight: '700',
    fontFamily: "'Poppins', sans-serif",
    marginBottom: '8px',
    color: 'var(--cream)',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    letterSpacing: '-0.02em',
  },
  appSubtitle: {
    fontSize: '1.5rem',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    marginBottom: '32px',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: '0.05em',
  },
  versionContainer: {
    marginBottom: '24px',
  },
  versionText: {
    display: 'inline-block',
    background: 'rgba(255, 255, 255, 0.2)',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '600',
    color: 'var(--cream)',
    backdropFilter: 'blur(10px)',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '32px',
  },
  loadingDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: 'var(--cream)',
    animation: 'bounce 1.4s ease-in-out infinite',
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

    @keyframes bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-12px); }
    }

    ${styles.loadingContainer} div:nth-child(1) {
      animation-delay: 0s;
    }

    ${styles.loadingContainer} div:nth-child(2) {
      animation-delay: 0.2s;
    }

    ${styles.loadingContainer} div:nth-child(3) {
      animation-delay: 0.4s;
    }
  `;
  document.head.appendChild(style);
}

export default SplashScreen;
