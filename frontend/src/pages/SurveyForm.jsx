import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../context/NotificationContext';
import { surveyService } from '../services/surveyService';
import LanguageSwitcher from '../components/LanguageSwitcher';

function SurveyForm() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { showWarning, showError } = useNotification();
  const [survey, setSurvey] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState('');
  const [config, setConfig] = useState({ thankYouCountdown: 5, inactivityTimeout: 30 });
  const [inactivityTimer, setInactivityTimer] = useState(null);

  useEffect(() => {
    loadConfig();
    loadSurvey();
  }, [id]);

  // Inactivity timeout - reset to survey page if inactive
  useEffect(() => {
    if (submitted || loading) return; // Don't track during thank you or loading

    const resetTimer = () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }

      const timer = setTimeout(() => {
        // Reset to initial state
        resetSurvey();
      }, config.inactivityTimeout * 1000);

      setInactivityTimer(timer);
    };

    // Reset timer on any user interaction
    const handleActivity = () => resetTimer();

    // Track mouse, keyboard, and touch events
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('scroll', handleActivity);

    // Start the initial timer
    resetTimer();

    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [submitted, loading, config.inactivityTimeout, selectedItems]);

  useEffect(() => {
    if (submitted) {
      // Clear inactivity timer when submitted
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            resetSurvey();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [submitted, inactivityTimer]);

  const loadConfig = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/config`);
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      console.error('Failed to load config, using defaults:', err);
      // Use defaults if config fails to load
    }
  };

  const loadSurvey = async () => {
    try {
      const data = await surveyService.getSurvey(id);
      setSurvey(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const resetSurvey = () => {
    setSelectedItems([]);
    setSubmitted(false);
    setCountdown(config.thankYouCountdown);
  };

  const toggleItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      showWarning(t('please_select_option'));
      return;
    }

    setSubmitting(true);
    try {
      await surveyService.submitSurvey(id, selectedItems);
      setSubmitted(true);
    } catch (err) {
      showError(`${t('error')}: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getSurveyTitle = () => {
    if (!survey) return '';
    if (i18n.language === 'sv' && survey.title_sv) {
      return survey.title_sv;
    }
    return survey.title_en || survey.title || 'Survey';
  };

  const getSurveyDescription = () => {
    if (!survey) return '';
    if (i18n.language === 'sv' && survey.description_sv) {
      return survey.description_sv;
    }
    return survey.description_en || survey.description || '';
  };

  const getItemText = (item) => {
    if (i18n.language === 'sv' && item.text_sv) {
      return item.text_sv;
    }
    return item.text_en || item.text || '';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/surveys')} className="btn btn-secondary">
          ← {t('back_to_surveys')}
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={styles.thankYouContainer}>
        <div style={styles.thankYouContent}>
          <h1 style={styles.thankYouTitle}>{t('thank_you')}</h1>
          <p style={styles.thankYouMessage}>{t('thank_you_message')}</p>
          <div style={styles.countdown}>
            <p>{t('resetting_in')}</p>
            <div style={styles.countdownNumber}>{countdown}</div>
            <p>{t('seconds')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <LanguageSwitcher />

      {/* Small close button at top left */}
      <button
        onClick={() => navigate('/surveys')}
        style={styles.closeButton}
        title={t('back_to_surveys')}
      >
        ✕
      </button>

      <div style={styles.header}>
        <h1 style={styles.title}>{getSurveyTitle()}</h1>
        {getSurveyDescription() && (
          <p style={styles.description}>{getSurveyDescription()}</p>
        )}
      </div>

      <div style={styles.tileGrid}>
        {survey.items.map((item) => {
          const isSelected = selectedItems.includes(item.id);
          const itemText = getItemText(item);

          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              style={{
                ...styles.tile,
                ...(isSelected ? styles.tileSelected : {})
              }}
            >
              {item.image && (
                <div style={styles.tileImageContainer}>
                  <img
                    src={`/images/${item.image}`}
                    alt={itemText}
                    style={styles.tileImage}
                  />
                </div>
              )}
              {itemText && (
                <div style={styles.tileText}>{itemText}</div>
              )}
              {isSelected && (
                <div style={styles.checkmark}>✓</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky submit button at bottom */}
      <div style={styles.stickyFooter}>
        <button
          onClick={handleSubmit}
          className="btn btn-primary"
          style={styles.submitButton}
          disabled={submitting || selectedItems.length === 0}
        >
          {submitting ? t('loading') : `${t('submit')} (${selectedItems.length})`}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    paddingTop: '20px',
    paddingRight: '20px',
    paddingBottom: '100px', // Space for sticky footer
    paddingLeft: '20px',
  },
  closeButton: {
    position: 'fixed',
    top: '24px',
    left: '24px',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(107, 68, 35, 0.3)',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: 'var(--text-secondary)',
    transition: 'all 0.3s ease',
    zIndex: 999,
    boxShadow: 'var(--shadow-sm)',
  },
  header: {
    textAlign: 'center',
    marginTop: '0',
    marginRight: 'auto',
    marginBottom: '32px',
    marginLeft: 'auto',
    maxWidth: '1200px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    paddingTop: '32px',
    paddingRight: '32px',
    paddingBottom: '32px',
    paddingLeft: '32px',
    borderRadius: '20px',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
  },
  title: {
    fontSize: '2rem', // Matching global .page-title
    color: 'var(--espresso)',
    marginBottom: '12px',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  description: {
    fontSize: '1.125rem', // Matching global .page-subtitle
    color: 'var(--text-secondary)',
    fontFamily: "'Inter', sans-serif",
  },
  tileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto 24px auto',
  },
  tile: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'rgba(232, 220, 200, 0.5)',
    boxShadow: 'var(--shadow-md)',
    position: 'relative',
    minHeight: '180px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileSelected: {
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'var(--medium-roast)',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(232, 220, 200, 0.6) 100%)',
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: 'var(--shadow-xl)',
  },
  tileImageContainer: {
    width: '100%',
    marginBottom: '12px',
    position: 'relative',
    paddingTop: '0',
    paddingRight: '0',
    paddingBottom: '56.25%', // 16:9 aspect ratio
    paddingLeft: '0',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  tileImage: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '12px',
  },
  tileText: {
    fontSize: '18px',
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif",
    color: 'var(--text-primary)',
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'var(--gradient-coffee)',
    color: 'var(--cream)',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    boxShadow: 'var(--shadow-md)',
  },
  stickyFooter: {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderTop: '2px solid rgba(232, 220, 200, 0.5)',
    padding: '20px',
    display: 'flex',
    justifyContent: 'center',
    zIndex: 998,
    boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)',
  },
  submitButton: {
    fontSize: '20px',
    padding: '18px 48px',
    minWidth: '280px',
  },
  thankYouContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  thankYouContent: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '60px 40px',
    borderRadius: '24px',
    boxShadow: 'var(--shadow-xl)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    maxWidth: '500px',
  },
  thankYouTitle: {
    fontSize: '2.5rem',
    color: 'var(--espresso)',
    marginBottom: '16px',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  thankYouMessage: {
    fontSize: '20px',
    color: 'var(--text-secondary)',
    marginBottom: '32px',
  },
  countdown: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  countdownNumber: {
    fontSize: '72px',
    fontWeight: 'bold',
    color: 'var(--accent-warm)',
    fontFamily: "'Poppins', sans-serif",
  }
};

export default SurveyForm;
