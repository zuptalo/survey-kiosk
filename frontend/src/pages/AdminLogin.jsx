import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

function AdminLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(password);

    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error || t('login_failed'));
      setPassword('');
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <LanguageSwitcher />

      <div style={styles.content}>
        <h1 style={styles.title}>{t('admin_login')}</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              {t('password')}
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.button}
            disabled={loading}
          >
            {loading ? t('loading') : t('login')}
          </button>
        </form>

        <div style={styles.footer}>
          <button
            onClick={() => navigate('/')}
            className="btn btn-secondary"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  content: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '48px',
    borderRadius: '20px',
    boxShadow: 'var(--shadow-xl)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    maxWidth: '420px',
    width: '100%',
  },
  title: {
    fontSize: '2rem',
    color: 'var(--espresso)',
    marginBottom: '28px',
    textAlign: 'center',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  form: {
    marginBottom: '24px',
  },
  button: {
    width: '100%',
  },
  footer: {
    textAlign: 'center',
  }
};

export default AdminLogin;
