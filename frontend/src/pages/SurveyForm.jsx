import { useState, useEffect, useRef } from 'react';
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // questionId -> [itemIds]
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState('');
  const [config, setConfig] = useState({ thankYouCountdown: 5, inactivityTimeout: 30 });
  const inactivityTimerRef = useRef(null);
  const [surveyStarted, setSurveyStarted] = useState(false);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(10);

  useEffect(() => {
    loadConfig();
    loadSurvey();
  }, [id]);

  // Inactivity timeout - show warning after 20s, then reset after 10s more
  useEffect(() => {
    // Don't track during thank you, loading, or before survey started
    if (submitted || loading || !surveyStarted) return;

    // If warning is showing, don't track activity (let warning countdown run)
    if (showInactivityWarning) return;

    const resetTimer = () => {
      // Clear any existing timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }

      // After 20 seconds of inactivity, show warning
      inactivityTimerRef.current = setTimeout(() => {
        setShowInactivityWarning(true);
        setWarningCountdown(10);
      }, 20000); // 20 seconds
    };

    // Reset timer on any user interaction
    const handleActivity = () => {
      resetTimer();
    };

    // Track mouse, keyboard, and touch events
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('click', handleActivity);

    // Start the initial timer
    resetTimer();

    return () => {
      // Cleanup timer and event listeners
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [submitted, loading, surveyStarted, showInactivityWarning]);

  // Warning countdown timer
  useEffect(() => {
    if (!showInactivityWarning) return;

    const timer = setInterval(() => {
      setWarningCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Time's up - reset survey but keep submitted answers
          resetSurveyKeepAnswers();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showInactivityWarning]);

  useEffect(() => {
    if (submitted) {
      // Clear inactivity timer when submitted
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
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
  }, [submitted]);

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

      // Handle both old format (flat items) and new format (questions array)
      if (!data.questions || !Array.isArray(data.questions)) {
        // Old format: convert to single question format
        data.questions = [{
          id: 'q1',
          text_en: '',
          text_sv: '',
          selection_mode: 'multiple',
          items: data.items || []
        }];
      }

      setSurvey(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const resetSurvey = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSubmitted(false);
    setCountdown(config.thankYouCountdown);
    setSurveyStarted(false);
    setShowInactivityWarning(false);
    setWarningCountdown(10);
  };

  const resetSurveyKeepAnswers = () => {
    // Reset to initial state but keep answers for backend
    setCurrentQuestionIndex(0);
    setSubmitted(false);
    setSurveyStarted(false);
    setShowInactivityWarning(false);
    setWarningCountdown(10);
    // Note: We don't clear answers - they stay in state for next time
  };

  const getCurrentQuestion = () => {
    if (!survey || !survey.questions) return null;
    return survey.questions[currentQuestionIndex];
  };

  const getCurrentSelections = () => {
    const question = getCurrentQuestion();
    if (!question) return [];
    return answers[question.id] || [];
  };

  const toggleItem = (itemId) => {
    const question = getCurrentQuestion();
    if (!question) return;

    // Start the inactivity timer on first selection
    if (!surveyStarted) {
      setSurveyStarted(true);
    }

    const currentSelections = getCurrentSelections();

    if (question.selection_mode === 'single') {
      // Single select: replace selection
      setAnswers({
        ...answers,
        [question.id]: [itemId]
      });
    } else {
      // Multiple select: toggle selection
      if (currentSelections.includes(itemId)) {
        setAnswers({
          ...answers,
          [question.id]: currentSelections.filter(id => id !== itemId)
        });
      } else {
        setAnswers({
          ...answers,
          [question.id]: [...currentSelections, itemId]
        });
      }
    }
  };

  const handleContinueSurvey = () => {
    // Dismiss the warning modal
    setShowInactivityWarning(false);
    // The useEffect will automatically restart the timer when showInactivityWarning becomes false
  };

  const canGoNext = () => {
    return currentQuestionIndex < survey.questions.length - 1;
  };

  const canGoPrevious = () => {
    return currentQuestionIndex > 0;
  };

  const handleNext = () => {
    const currentSelections = getCurrentSelections();
    if (currentSelections.length === 0) {
      showWarning(t('please_select_option'));
      return;
    }

    if (canGoNext()) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious()) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    const currentSelections = getCurrentSelections();
    if (currentSelections.length === 0) {
      showWarning(t('please_select_option'));
      return;
    }

    // Collect all answers
    const allSelectedItems = Object.values(answers).flat();

    if (allSelectedItems.length === 0) {
      showWarning(t('please_select_option'));
      return;
    }

    setSubmitting(true);
    try {
      await surveyService.submitSurvey(id, allSelectedItems);
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

  const getQuestionText = (question) => {
    if (!question) return '';
    if (i18n.language === 'sv' && question.text_sv) {
      return question.text_sv;
    }
    return question.text_en || '';
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

  const currentQuestion = getCurrentQuestion();
  const currentSelections = getCurrentSelections();
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;

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

        {/* Progress indicator */}
        {survey.questions.length > 1 && (
          <div style={styles.progress}>
            <div style={styles.progressText}>
              {t('question_number')} {currentQuestionIndex + 1} / {survey.questions.length}
            </div>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${((currentQuestionIndex + 1) / survey.questions.length) * 100}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Current Question */}
      {currentQuestion && (
        <div style={styles.questionContainer}>
          {getQuestionText(currentQuestion) && (
            <h2 style={styles.questionText}>{getQuestionText(currentQuestion)}</h2>
          )}

          {currentQuestion.selection_mode === 'single' && (
            <p style={styles.selectionHint}>{t('single_select')}</p>
          )}

          <div style={styles.tileGrid}>
            {currentQuestion.items.map((item) => {
              const isSelected = currentSelections.includes(item.id);
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
        </div>
      )}

      {/* Navigation footer */}
      <div style={styles.stickyFooter}>
        <div style={styles.footerContent}>
          {canGoPrevious() && (
            <button
              onClick={handlePrevious}
              className="btn btn-secondary"
              style={styles.navButton}
            >
              ← {t('previous')}
            </button>
          )}

          <div style={styles.spacer} />

          {canGoNext() ? (
            <button
              onClick={handleNext}
              className="btn btn-primary"
              style={styles.navButton}
              disabled={currentSelections.length === 0}
            >
              {t('next')} →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="btn btn-primary"
              style={styles.submitButton}
              disabled={submitting || currentSelections.length === 0}
            >
              {submitting ? t('loading') : t('submit')}
            </button>
          )}
        </div>
      </div>

      {/* Inactivity Warning Modal */}
      {showInactivityWarning && (
        <div style={styles.warningOverlay}>
          <div style={styles.warningModal}>
            <h2 style={styles.warningTitle}>{t('are_you_still_there')}</h2>
            <p style={styles.warningMessage}>{t('inactivity_warning_message')}</p>
            <div style={styles.warningCountdownContainer}>
              <div style={styles.warningCountdownNumber}>{warningCountdown}</div>
              <p style={styles.warningCountdownText}>{t('seconds')}</p>
            </div>
            <button
              onClick={handleContinueSurvey}
              className="btn btn-primary"
              style={styles.continueButton}
            >
              {t('continue_survey')}
            </button>
          </div>
        </div>
      )}
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
    marginBottom: '16px',
  },
  progress: {
    marginTop: '24px',
  },
  progressText: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    marginBottom: '12px',
    fontWeight: '600',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    background: 'rgba(232, 220, 200, 0.5)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'var(--gradient-coffee)',
    transition: 'width 0.3s ease',
    borderRadius: '4px',
  },
  questionContainer: {
    maxWidth: '1200px',
    margin: '0 auto 24px auto',
  },
  questionText: {
    fontSize: '1.5rem',
    color: 'var(--espresso)',
    marginBottom: '12px',
    textAlign: 'center',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '600',
  },
  selectionHint: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    marginBottom: '24px',
    fontStyle: 'italic',
  },
  tileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
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
    zIndex: 998,
    boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  },
  spacer: {
    flex: 1,
  },
  navButton: {
    fontSize: '18px',
    padding: '14px 32px',
    minWidth: '140px',
  },
  submitButton: {
    fontSize: '20px',
    padding: '16px 48px',
    minWidth: '200px',
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
  },
  warningOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  warningModal: {
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(10px)',
    padding: '48px 40px',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    border: '2px solid var(--accent-warm)',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%',
  },
  warningTitle: {
    fontSize: '2rem',
    color: 'var(--espresso)',
    marginBottom: '16px',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '700',
  },
  warningMessage: {
    fontSize: '18px',
    color: 'var(--text-secondary)',
    marginBottom: '32px',
    lineHeight: '1.6',
  },
  warningCountdownContainer: {
    marginBottom: '32px',
  },
  warningCountdownNumber: {
    fontSize: '96px',
    fontWeight: 'bold',
    color: 'var(--accent-warm)',
    fontFamily: "'Poppins', sans-serif",
    lineHeight: '1',
  },
  warningCountdownText: {
    fontSize: '18px',
    color: 'var(--text-secondary)',
    marginTop: '8px',
  },
  continueButton: {
    fontSize: '20px',
    padding: '16px 48px',
    minWidth: '200px',
  }
};

export default SurveyForm;
