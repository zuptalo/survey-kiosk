import { useTranslation } from 'react-i18next';

function LanguageSwitcher({ style, compact = false }) {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'sv' : 'en';
    i18n.changeLanguage(newLang);
  };

  const buttonStyle = compact ? styles.compactButton : styles.button;

  return (
    <button
      onClick={toggleLanguage}
      style={{ ...buttonStyle, ...style }}
      title={i18n.language === 'en' ? 'Switch to Swedish' : 'Byt till engelska'}
    >
      <span style={compact ? styles.compactFlag : styles.flag}>
        {i18n.language === 'en' ? '🇸🇪' : '🇬🇧'}
      </span>
    </button>
  );
}

const styles = {
  button: {
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
  compactButton: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '2px solid var(--medium-roast)',
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  flag: {
    fontSize: '32px',
  },
  compactFlag: {
    fontSize: '24px',
  }
};

export default LanguageSwitcher;
