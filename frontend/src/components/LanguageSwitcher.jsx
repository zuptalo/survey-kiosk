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
    bottom: '24px',
    right: '24px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '2px solid var(--medium-roast)',
    borderRadius: '50%',
    width: '64px',
    height: '64px',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-md)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  flag: {
    fontSize: '32px',
  }
};

export default LanguageSwitcher;
