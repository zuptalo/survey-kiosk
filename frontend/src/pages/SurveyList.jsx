import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { surveyService } from '../services/surveyService';
import LanguageSwitcher from '../components/LanguageSwitcher';

function SurveyList() {
  const { t, i18n } = useTranslation();
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
    return survey.title_en || survey.title || 'Untitled Survey';
  };

  const getSurveyDescription = (survey) => {
    if (i18n.language === 'sv' && survey.description_sv) {
      return survey.description_sv;
    }
    return survey.description_en || survey.description || '';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <LanguageSwitcher />

      <div className="page-header">
        <h1 className="page-title">{t('available_surveys')}</h1>
        <p className="page-subtitle">{t('select_survey')}</p>
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
              <h2 style={styles.surveyTitle}>{getSurveyTitle(survey)}</h2>
              {getSurveyDescription(survey) && (
                <p style={styles.surveyDescription}>{getSurveyDescription(survey)}</p>
              )}
              <div style={styles.badge}>
                {survey.items.length} {t('items')}
              </div>
            </Link>
          ))
        )}
      </div>

      <div style={styles.footer}>
        <Link to="/" className="btn btn-secondary">
          ← {t('welcome')}
        </Link>
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '24px',
  },
  surveyCard: {
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    display: 'block',
  },
  surveyTitle: {
    fontSize: '24px',
    color: 'var(--primary-brown)',
    marginBottom: '12px',
  },
  surveyDescription: {
    color: 'var(--text-light)',
    marginBottom: '16px',
  },
  badge: {
    display: 'inline-block',
    background: 'var(--accent-blue)',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
  },
  footer: {
    marginTop: '24px',
  }
};

export default SurveyList;
