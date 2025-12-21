import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

function AdminSettings() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { theme, setTheme, themes } = useTheme();

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">{t('settings')}</h1>
        <p className="page-subtitle">{t('configure_appearance_language')}</p>
      </div>

      <div className="card" style={styles.settingsCard}>
        {/* Theme Selection */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>{t('theme')}</h2>
          <p style={styles.sectionDescription}>{t('choose_color_scheme')}</p>

          <div style={styles.themeGrid}>
            {Object.entries(themes).map(([key, { name, description }]) => (
              <button
                key={key}
                onClick={() => handleThemeChange(key)}
                style={{
                  ...styles.themeCard,
                  ...(theme === key ? styles.themeCardActive : {})
                }}
              >
                <div style={{
                  ...styles.themePreview,
                  ...(key === 'cafe' ? styles.themePreviewCafe : {}),
                  ...(key === 'green' ? styles.themePreviewGreen : {}),
                  ...(key === 'blue' ? styles.themePreviewBlue : {}),
                  ...(key === 'bright' ? styles.themePreviewBright : {}),
                  ...(key === 'purple' ? styles.themePreviewPurple : {}),
                  ...(key === 'dark' ? styles.themePreviewDark : {})
                }}>
                  <div style={{
                    ...styles.themePreviewCircle1,
                    background: key === 'cafe' ? '#2c1810' :
                                key === 'green' ? '#1a3a1a' :
                                key === 'blue' ? '#0d3b66' :
                                key === 'bright' ? '#1a1a1a' :
                                key === 'purple' ? '#3d1a5f' : '#f5f5f5'
                  }}></div>
                  <div style={{
                    ...styles.themePreviewCircle2,
                    background: key === 'cafe' ? '#6b4423' :
                                key === 'green' ? '#3d7a3d' :
                                key === 'blue' ? '#2878b5' :
                                key === 'bright' ? '#555555' :
                                key === 'purple' ? '#7b3f9f' : '#cccccc'
                  }}></div>
                  <div style={{
                    ...styles.themePreviewCircle3,
                    background: key === 'cafe' ? '#d97757' :
                                key === 'green' ? '#8fbc5a' :
                                key === 'blue' ? '#f77f00' :
                                key === 'bright' ? '#ff6b6b' :
                                key === 'purple' ? '#e91e63' : '#ff8a65'
                  }}></div>
                </div>
                <div style={styles.themeInfo}>
                  <h3 style={styles.themeName}>
                    {name}
                    {theme === key && <span style={styles.activeIndicator}> ✓</span>}
                  </h3>
                  <p style={styles.themeDescription}>{description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Language Selection */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>{t('language')}</h2>
          <p style={styles.sectionDescription}>{t('choose_default_language')}</p>

          <div style={styles.languageSection}>
            <div style={styles.languageLabel}>
              {t('current_language')}: <strong>{i18n.language === 'en' ? 'English' : 'Svenska'}</strong>
            </div>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Back Button */}
        <div style={styles.actions}>
          <button onClick={() => navigate('/admin')} className="btn btn-secondary">
            ← {t('back_to_dashboard')}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  settingsCard: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  section: {
    marginBottom: '48px',
    paddingBottom: '48px',
    borderBottom: '2px solid var(--input-border)',
  },
  sectionTitle: {
    fontSize: '24px',
    color: 'var(--text-primary)',
    marginBottom: '8px',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '600',
  },
  sectionDescription: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    marginBottom: '24px',
    fontFamily: "'Inter', sans-serif",
  },
  themeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  themeCard: {
    background: 'var(--input-bg)',
    border: '2px solid var(--input-border)',
    borderRadius: '16px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'left',
    fontFamily: "'Inter', sans-serif",
  },
  themeCardActive: {
    borderColor: 'var(--medium-roast)',
    boxShadow: '0 0 0 4px rgba(107, 68, 35, 0.1)',
    transform: 'scale(1.02)',
  },
  themePreview: {
    height: '100px',
    borderRadius: '12px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    position: 'relative',
    overflow: 'hidden',
  },
  themePreviewCafe: {
    background: 'linear-gradient(135deg, #faf7f2 0%, #e8dcc8 50%, #c9a882 100%)',
  },
  themePreviewGreen: {
    background: 'linear-gradient(135deg, #f2f9f2 0%, #d4e8d4 50%, #a3c9a3 100%)',
  },
  themePreviewBlue: {
    background: 'linear-gradient(135deg, #f2f9fc 0%, #d0e8f5 50%, #95c8e8 100%)',
  },
  themePreviewBright: {
    background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 50%, #f0f0f0 100%)',
  },
  themePreviewPurple: {
    background: 'linear-gradient(135deg, #f8f3fc 0%, #e8d4f5 50%, #c99ae0 100%)',
  },
  themePreviewDark: {
    background: 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 50%, #3a3a3a 100%)',
  },
  themePreviewCircle1: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    opacity: 0.6,
  },
  themePreviewCircle2: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    opacity: 0.7,
  },
  themePreviewCircle3: {
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    opacity: 0.8,
  },
  themeInfo: {
    textAlign: 'center',
  },
  themeName: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '4px',
    fontFamily: "'Poppins', sans-serif",
  },
  themeDescription: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    fontFamily: "'Inter', sans-serif",
  },
  activeIndicator: {
    color: 'var(--success)',
    fontSize: '20px',
  },
  languageSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    background: 'var(--input-bg)',
    padding: '20px',
    borderRadius: '12px',
    border: '2px solid var(--input-border)',
  },
  languageLabel: {
    fontSize: '16px',
    color: 'var(--text-primary)',
    fontFamily: "'Inter', sans-serif",
  },
  actions: {
    marginTop: '32px',
    display: 'flex',
    justifyContent: 'center',
  }
};

export default AdminSettings;
