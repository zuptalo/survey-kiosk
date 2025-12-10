import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'sv' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      style={styles.button}
      title={i18n.language === 'en' ? 'Switch to Swedish' : 'Byt till engelska'}
    >
      <span style={styles.flag}>
        {i18n.language === 'en' ? '🇸🇪' : '🇬🇧'}
      </span>
    </button>
  );
}

const styles = {
  button: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: 'var(--cream)',
    border: '2px solid var(--primary-brown)',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  flag: {
    fontSize: '30px',
  }
};

export default LanguageSwitcher;
