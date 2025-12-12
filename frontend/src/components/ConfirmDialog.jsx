function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', confirmStyle = 'danger' }) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  return (
    <div style={styles.overlay} onClick={handleBackdropClick}>
      <div style={styles.dialog}>
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
        </div>

        <div style={styles.body}>
          <p style={styles.message}>{message}</p>
        </div>

        <div style={styles.footer}>
          <button
            onClick={handleCancel}
            className="btn btn-secondary"
            style={styles.button}
            autoFocus
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`btn ${confirmStyle === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            style={styles.button}
          >
            {confirmText}
          </button>
        </div>
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
    backgroundColor: 'rgba(44, 24, 16, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    animation: 'fadeIn 0.2s ease-out',
  },
  dialog: {
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    boxShadow: 'var(--shadow-xl)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    maxWidth: '500px',
    width: '90%',
    animation: 'scaleIn 0.3s ease-out',
  },
  header: {
    padding: '28px 28px 20px 28px',
    borderBottom: '2px solid rgba(232, 220, 200, 0.5)',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    color: 'var(--espresso)',
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif",
  },
  body: {
    padding: '28px',
  },
  message: {
    margin: 0,
    fontSize: '16px',
    color: 'var(--text-primary)',
    lineHeight: '1.6',
    whiteSpace: 'pre-line',
    fontFamily: "'Inter', sans-serif",
  },
  footer: {
    padding: '20px 28px 28px 28px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  button: {
    minWidth: '110px',
  }
};

export default ConfirmDialog;
