import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

function Home() {
  const { t } = useTranslation();

  return (
    <div style={styles.container}>
      <LanguageSwitcher />

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
    background: 'var(--cream)',
    padding: '60px 40px',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    maxWidth: '500px',
    width: '100%',
  },
  title: {
    fontSize: '48px',
    color: 'var(--primary-brown)',
    marginBottom: '40px',
    fontWeight: '700',
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
