import { useEffect } from 'react';

function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
          border: 'var(--success)',
          icon: 'var(--success)',
          text: '#2d5a2d'
        };
      case 'error':
        return {
          background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
          border: 'var(--danger)',
          icon: 'var(--danger)',
          text: '#8b2c2c'
        };
      case 'warning':
        return {
          background: 'linear-gradient(135deg, #fff9e6 0%, #ffe9b3 100%)',
          border: 'var(--warning)',
          icon: 'var(--warning)',
          text: '#856404'
        };
      default:
        return {
          background: 'var(--gradient-warm)',
          border: 'var(--accent-cool)',
          icon: 'var(--accent-cool)',
          text: 'var(--text-primary)'
        };
    }
  };

  const colors = getColors();

  return (
    <div style={{
      ...styles.toast,
      background: colors.background,
      borderLeft: `5px solid ${colors.border}`,
      color: colors.text
    }}>
      <div style={{
        ...styles.icon,
        color: colors.icon
      }}>
        {getIcon()}
      </div>
      <div style={styles.message}>{message}</div>
      <button
        onClick={onClose}
        style={styles.closeButton}
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}

const styles = {
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '18px 24px',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-lg)',
    minWidth: '320px',
    maxWidth: '500px',
    animation: 'slideIn 0.3s ease-out',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
  },
  icon: {
    fontSize: '24px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  message: {
    flex: 1,
    fontSize: '16px',
    lineHeight: '1.5',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '500',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '22px',
    cursor: 'pointer',
    padding: '4px 8px',
    color: 'inherit',
    opacity: 0.7,
    transition: 'opacity 0.2s ease',
    flexShrink: 0,
    borderRadius: '6px',
  }
};

export default Toast;
