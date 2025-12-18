import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { surveyService } from '../services/surveyService';
import LanguageSwitcher from '../components/LanguageSwitcher';

function SurveyList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const data = await surveyService.getAllSurveys();
      setSurveys(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSurveyTitle = (survey) => {
    if (i18n.language === 'sv' && survey.title_sv) {
      return survey.title_sv;
    }
    return survey.title_en || survey.title || t('untitled_survey');
  };

  const getSurveyDescription = (survey) => {
    if (i18n.language === 'sv' && survey.description_sv) {
      return survey.description_sv;
    }
    return survey.description_en || survey.description || '';
  };

  const getItemCount = (survey) => {
    if (survey.questions && Array.isArray(survey.questions)) {
      // Multi-question format: count all items across all questions
      return survey.questions.reduce((total, q) => total + (q.items?.length || 0), 0);
    }
    // Old format: flat items array
    return survey.items?.length || 0;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <LanguageSwitcher />

      {/* Small close button at top left */}
      <button
        onClick={() => navigate('/')}
        style={styles.closeButton}
        title={t('back_to_welcome')}
      >
        ✕
      </button>

      <div style={styles.header}>
        <h1 style={styles.title}>{t('available_surveys')}</h1>
        <p style={styles.description}>{t('select_survey')}</p>
      </div>

      {error && (
        <div className="error-message">
          {t('error')}: {error}
        </div>
      )}

      <div style={styles.grid}>
        {surveys.length === 0 ? (
          <div className="card">
            <p>{t('no_surveys')}</p>
          </div>
        ) : (
          surveys.map((survey) => (
            <Link
              key={survey.id}
              to={`/survey/${survey.id}`}
              className="card"
              style={styles.surveyCard}
            >
              {/* Hero Image Thumbnail */}
              {survey.hero_image && (
                <div style={styles.heroThumbnailContainer}>
                  <img
                    src={`/images/${survey.hero_image}`}
                    alt={getSurveyTitle(survey)}
                    style={styles.heroThumbnail}
                  />
                </div>
              )}

              <h2 style={styles.surveyTitle}>{getSurveyTitle(survey)}</h2>
              {getSurveyDescription(survey) && (
                <p style={styles.surveyDescription}>{getSurveyDescription(survey)}</p>
              )}
              <div style={styles.badge}>
                {getItemCount(survey)} {t('items')}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    paddingTop: '20px',
    paddingRight: '20px',
    paddingBottom: '20px',
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
    fontSize: '2rem',
    color: 'var(--espresso)',
    marginBottom: '12px',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  description: {
    fontSize: '1.125rem',
    color: 'var(--text-secondary)',
    fontFamily: "'Inter', sans-serif",
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
    maxWidth: '1200px',
    marginTop: '0',
    marginRight: 'auto',
    marginBottom: '28px',
    marginLeft: 'auto',
  },
  surveyCard: {
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    display: 'block',
    position: 'relative',
    overflow: 'hidden',
  },
  surveyTitle: {
    fontSize: '24px',
    color: 'var(--espresso)',
    marginBottom: '12px',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '600',
  },
  surveyDescription: {
    color: 'var(--text-secondary)',
    marginBottom: '16px',
    lineHeight: '1.5',
  },
  badge: {
    display: 'inline-block',
    background: 'var(--gradient-coffee)',
    color: 'var(--cream)',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif",
    boxShadow: 'var(--shadow-sm)',
  },
  heroThumbnailContainer: {
    width: '100%',
    marginBottom: '16px',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-md)',
  },
  heroThumbnail: {
    width: '100%',
    height: 'auto',
    display: 'block',
    borderRadius: '12px',
  }
};

export default SurveyList;
