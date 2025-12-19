import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Home() {
  const { t } = useTranslation();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>{t('welcome')}</h1>

        <div style={styles.buttons}>
          <Link to="/surveys" className="btn btn-primary" style={styles.button}>
            {t('take_survey')}
          </Link>

          <Link to="/admin/login" className="btn btn-secondary" style={styles.button}>
            {t('admin_login')}
          </Link>
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
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '60px 40px',
    borderRadius: '24px',
    boxShadow: 'var(--shadow-xl)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    maxWidth: '500px',
    width: '100%',
  },
  title: {
    fontSize: '2.5rem',
    color: 'var(--espresso)',
    marginBottom: '40px',
    fontWeight: '700',
    fontFamily: "'Poppins', sans-serif",
    letterSpacing: '-0.02em',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  button: {
    fontSize: '20px',
    padding: '16px 32px',
  }
};

export default Home;
