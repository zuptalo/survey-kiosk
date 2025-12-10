import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { surveyService } from '../services/surveyService';
import LanguageSwitcher from '../components/LanguageSwitcher';

function SurveyForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSurvey();
  }, [id]);

  useEffect(() => {
    if (submitted) {
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
  }, [submitted]);

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
    setCountdown(10);
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
      alert('Please select at least one option');
      return;
    }

    setSubmitting(true);
    try {
      await surveyService.submitSurvey(id, selectedItems);
      setSubmitted(true);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
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
          ← Back to Surveys
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

      <div style={styles.header}>
        <h1 style={styles.title}>{survey.title}</h1>
        {survey.description && (
          <p style={styles.description}>{survey.description}</p>
        )}
      </div>

      <div style={styles.tileGrid}>
        {survey.items.map((item) => {
          const isSelected = selectedItems.includes(item.id);
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
                    src={item.image}
                    alt={item.text}
                    style={styles.tileImage}
                  />
                </div>
              )}
              {item.text && (
                <div style={styles.tileText}>{item.text}</div>
              )}
              {isSelected && (
                <div style={styles.checkmark}>✓</div>
              )}
            </div>
          );
        })}
      </div>

      <div style={styles.footer}>
        <button
          onClick={() => navigate('/surveys')}
          className="btn btn-secondary"
          style={styles.button}
        >
          ← Back
        </button>
        <button
          onClick={handleSubmit}
          className="btn btn-primary"
          style={styles.button}
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
    padding: '20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
    background: 'var(--cream)',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  title: {
    fontSize: '32px',
    color: 'var(--primary-brown)',
    marginBottom: '12px',
  },
  description: {
    fontSize: '18px',
    color: 'var(--text-light)',
  },
  tileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    maxWidth: '1200px',
    margin: '0 auto 24px auto',
  },
  tile: {
    background: 'var(--cream)',
    borderRadius: '12px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '3px solid transparent',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    minHeight: '150px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileSelected: {
    borderColor: 'var(--primary-brown)',
    background: 'var(--beige)',
    transform: 'scale(1.05)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
  },
  tileImageContainer: {
    width: '100%',
    marginBottom: '12px',
  },
  tileImage: {
    width: '100%',
    height: 'auto',
    maxHeight: '150px',
    objectFit: 'contain',
    borderRadius: '8px',
  },
  tileText: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-dark)',
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'var(--primary-brown)',
    color: 'white',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  button: {
    fontSize: '18px',
    padding: '16px 32px',
  },
  thankYouContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  thankYouContent: {
    background: 'var(--cream)',
    padding: '60px 40px',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
    maxWidth: '500px',
  },
  thankYouTitle: {
    fontSize: '48px',
    color: 'var(--primary-brown)',
    marginBottom: '16px',
  },
  thankYouMessage: {
    fontSize: '20px',
    color: 'var(--text-light)',
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
    color: 'var(--accent-blue)',
  }
};

export default SurveyForm;
