import { useState, useEffect } from 'react';

function ConnectivityMonitor() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('Connection restored');
      setIsOnline(true);

      // Show brief "back online" message
      if (wasOffline) {
        setTimeout(() => {
          setWasOffline(false);
        }, 2000);
      }
    };

    const handleOffline = () => {
      console.log('Connection lost');
      setIsOnline(false);
      setWasOffline(true);
    };

    // Listen to browser's online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Also check connection periodically by pinging the server
    const checkConnection = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch('/api/health', {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-cache'
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          if (!isOnline) {
            handleOnline();
          }
        } else {
          if (isOnline) {
            handleOffline();
          }
        }
      } catch (error) {
        // Network error or timeout
        if (isOnline) {
          handleOffline();
        }
      }
    };

    // Check every 5 seconds when offline, every 30 seconds when online
    const intervalId = setInterval(checkConnection, isOnline ? 30000 : 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [isOnline, wasOffline]);

  // Don't show anything if online and wasn't offline
  if (isOnline && !wasOffline) {
    return null;
  }

  // Show "back online" message briefly
  if (isOnline && wasOffline) {
    return (
      <div style={styles.overlay}>
        <div style={styles.notification}>
          <div style={styles.successIcon}>✓</div>
          <h3 style={styles.title}>Back Online</h3>
          <p style={styles.message}>Connection restored successfully</p>
        </div>
      </div>
    );
  }

  // Show offline blocking overlay
  return (
    <div style={styles.overlay}>
      <div style={styles.notification}>
        <div style={styles.icon}>📡</div>
        <h3 style={styles.title}>No Internet Connection</h3>
        <p style={styles.message}>
          This app requires an active internet connection to function.
          Please check your connection and try again.
        </p>
        <div style={styles.spinner}>
          <div style={styles.dot}></div>
          <div style={styles.dot}></div>
          <div style={styles.dot}></div>
        </div>
        <p style={styles.checking}>Checking connection...</p>
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
    background: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999999,
    padding: '20px',
    animation: 'fadeIn 0.3s ease-out',
  },
  notification: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 247, 242, 0.98) 100%)',
    borderRadius: '24px',
    padding: '48px 32px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    animation: 'slideIn 0.3s ease-out',
  },
  icon: {
    fontSize: '64px',
    marginBottom: '24px',
    animation: 'pulse 2s ease-in-out infinite',
  },
  successIcon: {
    fontSize: '64px',
    marginBottom: '24px',
    color: '#22c55e',
    fontWeight: 'bold',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    fontFamily: "'Poppins', sans-serif",
    color: 'var(--espresso)',
    marginBottom: '16px',
  },
  message: {
    fontSize: '16px',
    fontFamily: "'Inter', sans-serif",
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    marginBottom: '32px',
  },
  spinner: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 'var(--gradient-coffee)',
    animation: 'bounce 1.4s ease-in-out infinite',
  },
  checking: {
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif",
    color: 'var(--text-secondary)',
    fontStyle: 'italic',
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

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.1); opacity: 1; }
    }

    @keyframes bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-10px); }
    }

    ${styles.spinner} div:nth-child(1) {
      animation-delay: 0s;
    }

    ${styles.spinner} div:nth-child(2) {
      animation-delay: 0.2s;
    }

    ${styles.spinner} div:nth-child(3) {
      animation-delay: 0.4s;
    }
  `;
  if (!document.querySelector('style[data-connectivity-monitor]')) {
    style.setAttribute('data-connectivity-monitor', 'true');
    document.head.appendChild(style);
  }
}

export default ConnectivityMonitor;
