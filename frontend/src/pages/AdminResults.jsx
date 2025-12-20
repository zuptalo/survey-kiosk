import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminService } from '../services/adminService';
import LanguageSwitcher from '../components/LanguageSwitcher';

function AdminResults() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResults();
  }, [id]);

  const loadResults = async () => {
    try {
      const data = await adminService.getSurveyResults(id);
      setResults(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getSurveyTitle = () => {
    if (!results?.survey) return t('untitled_survey');
    const { survey } = results;
    if (i18n.language === 'sv' && survey.title_sv) {
      return survey.title_sv;
    }
    return survey.title_en || survey.title || t('untitled_survey');
  };

  const getSurveyDescription = () => {
    if (!results?.survey) return '';
    const { survey } = results;
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

  const groupStatsByQuestion = () => {
    if (!results?.survey || !results?.stats) return [];

    const { survey, stats } = results;

    // Check if survey has questions array (new format)
    if (survey.questions && Array.isArray(survey.questions)) {
      // Group stats by question
      return survey.questions.map((question) => {
        const questionStats = stats.item_stats.filter(stat => {
          // Match items belonging to this question
          return question.items.some(item => item.id === stat.item_id);
        });

        // Find most selected for this question
        const maxCount = Math.max(...questionStats.map(s => s.count), 0);
        const mostSelected = maxCount > 0
          ? questionStats.filter(s => s.count === maxCount)
          : [];

        return {
          question,
          stats: questionStats,
          mostSelected
        };
      });
    } else {
      // Old format: single question with flat items
      return [{
        question: {
          id: 'q1',
          text_en: '',
          text_sv: '',
          selection_mode: 'multiple'
        },
        stats: stats.item_stats,
        mostSelected: stats.most_selected || []
      }];
    }
  };

  const renderQuestionResults = (questionData, questionIndex) => {
    const { question, stats: questionStats, mostSelected } = questionData;
    const hasQuestionText = getQuestionText(question);
    const isMultiQuestion = groupStatsByQuestion().length > 1;

    return (
      <div key={question.id} style={styles.questionSection}>
        {isMultiQuestion && (
          <div style={styles.questionHeader}>
            <h2 style={styles.questionTitle}>
              {t('question_number')} {questionIndex + 1}
              {hasQuestionText && `: ${getQuestionText(question)}`}
            </h2>
            <div style={styles.selectionModeBadge}>
              {question.selection_mode === 'single' ? t('single_select') : t('multiple_select')}
            </div>
          </div>
        )}

        {questionStats.length === 0 ? (
          <p style={styles.noResponses}>{t('no_responses_yet')}</p>
        ) : (
          <>
            <div style={styles.resultsGrid}>
              {questionStats.map((stat) => {
                return (
                  <div key={stat.item_id} style={styles.resultCard}>
                    {/* Item info with optional image */}
                    <div style={styles.cardHeader}>
                      {stat.image && (
                        <img
                          src={`/images/${stat.image}`}
                          alt=""
                          style={styles.cardThumbnail}
                        />
                      )}
                      <div style={styles.cardTitle}>{getItemText(stat)}</div>
                    </div>

                    {/* Statistics */}
                    <div style={styles.cardStats}>
                      <div style={styles.statItem}>
                        <div style={styles.cardStatLabel}>{t('selection_count')}</div>
                        <div style={styles.cardStatValue}>{stat.count}</div>
                      </div>
                      <div style={styles.statItem}>
                        <div style={styles.cardStatLabel}>{t('percentage')}</div>
                        <div style={styles.cardStatValue}>{stat.percentage.toFixed(1)}%</div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={styles.cardProgressBar}>
                      <div
                        style={{
                          ...styles.cardProgressFill,
                          width: `${stat.percentage}%`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {mostSelected && mostSelected.length > 0 && (
              <div style={styles.mostPopular}>
                <h3 style={styles.popularTitle}>
                  {mostSelected.length > 1 ? t('most_popular_tied') : t('most_popular')}
                </h3>
                <div style={styles.popularGrid}>
                  {mostSelected.map((item, index) => (
                    <div key={item.id || index} style={styles.popularItem}>
                      {item.image && (
                        <img
                          src={`/images/${item.image}`}
                          alt=""
                          style={styles.popularImage}
                        />
                      )}
                      <div>
                        <div style={styles.popularText}>{getItemText(item)}</div>
                        <div style={styles.popularStats}>
                          {item.count} {t('selections')} ({item.percentage.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
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
        <button onClick={() => navigate('/admin')} className="btn btn-secondary">
          ← {t('back_to_dashboard')}
        </button>
      </div>
    );
  }

  const { stats } = results;
  const questionGroups = groupStatsByQuestion();

  return (
    <div className="container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">{getSurveyTitle()}</h1>
          {getSurveyDescription() && <p className="page-subtitle">{getSurveyDescription()}</p>}
        </div>
        <LanguageSwitcher compact />
      </div>

      {/* Overall statistics */}
      <div className="card" style={styles.statsCard}>
        <div style={styles.statGrid}>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>{t('total_responses')}</div>
            <div style={styles.statValue}>{stats.total_responses}</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>{t('average_selections')}</div>
            <div style={styles.statValue}>{stats.avg_selections.toFixed(1)}</div>
          </div>
          {questionGroups.length > 1 && (
            <div style={styles.statBox}>
              <div style={styles.statLabel}>{t('total_questions')}</div>
              <div style={styles.statValue}>{questionGroups.length}</div>
            </div>
          )}
        </div>
      </div>

      {/* Results by question */}
      <div className="card">
        <h2 style={styles.sectionTitle}>{t('results')}</h2>
        {questionGroups.map((questionData, index) => renderQuestionResults(questionData, index))}
      </div>

      <div style={styles.actions}>
        <button onClick={() => navigate('/admin')} className="btn btn-secondary">
          ← {t('back_to_dashboard')}
        </button>
      </div>
    </div>
  );
}

const styles = {
  statsCard: {
    marginBottom: '24px',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 247, 242, 0.95) 100%)',
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  statBox: {
    textAlign: 'center',
    padding: '20px',
    background: 'var(--gradient-warm)',
    borderRadius: '12px',
    border: '1px solid rgba(232, 220, 200, 0.5)',
    boxShadow: 'var(--shadow-sm)',
  },
  statLabel: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '8px',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '500',
  },
  statValue: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: 'var(--espresso)',
    fontFamily: "'Poppins', sans-serif",
  },
  sectionTitle: {
    fontSize: '20px',
    color: 'var(--espresso)',
    marginBottom: '24px',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '600',
  },
  questionSection: {
    marginBottom: '40px',
    paddingBottom: '40px',
    borderBottom: '2px solid rgba(232, 220, 200, 0.3)',
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  questionTitle: {
    fontSize: '20px',
    color: 'var(--espresso)',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '600',
    margin: 0,
  },
  selectionModeBadge: {
    padding: '6px 16px',
    background: 'var(--gradient-warm)',
    borderRadius: '20px',
    fontSize: '14px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
    border: '1px solid rgba(232, 220, 200, 0.5)',
  },
  noResponses: {
    color: 'var(--text-secondary)',
    fontStyle: 'italic',
    padding: '20px',
    textAlign: 'center',
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '24px',
  },
  resultCard: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 247, 242, 0.95) 100%)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid rgba(232, 220, 200, 0.5)',
    boxShadow: 'var(--shadow-md)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  cardHeader: {
    marginBottom: '16px',
  },
  cardThumbnail: {
    width: '100%',
    aspectRatio: '16 / 9',
    objectFit: 'cover',
    borderRadius: '12px',
    marginBottom: '12px',
    boxShadow: 'var(--shadow-sm)',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--espresso)',
    fontFamily: "'Poppins', sans-serif",
    marginBottom: '12px',
    lineHeight: '1.4',
  },
  cardStats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '16px',
  },
  statItem: {
    background: 'rgba(107, 68, 35, 0.05)',
    borderRadius: '12px',
    padding: '12px',
    textAlign: 'center',
  },
  cardStatLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginBottom: '4px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  cardStatValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--espresso)',
    fontFamily: "'Poppins', sans-serif",
  },
  cardProgressBar: {
    width: '100%',
    height: '32px',
    background: 'rgba(232, 220, 200, 0.4)',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(232, 220, 200, 0.6)',
  },
  cardProgressFill: {
    height: '100%',
    background: 'var(--gradient-coffee)',
    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '8px',
    minWidth: '40px',
  },
  mostPopular: {
    background: 'var(--gradient-sunset)',
    border: '2px solid var(--accent-warm)',
    padding: '24px',
    borderRadius: '16px',
    marginTop: '20px',
  },
  popularTitle: {
    fontSize: '18px',
    color: 'var(--espresso)',
    marginBottom: '20px',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '600',
  },
  popularGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  popularItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 247, 242, 0.95) 100%)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid rgba(232, 220, 200, 0.5)',
    boxShadow: 'var(--shadow-md)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  popularImage: {
    width: '100%',
    maxWidth: '300px',
    aspectRatio: '16 / 9',
    objectFit: 'cover',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-md)',
  },
  popularText: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'var(--espresso)',
    marginBottom: '8px',
    fontFamily: "'Poppins', sans-serif",
  },
  popularStats: {
    fontSize: '18px',
    color: 'var(--text-secondary)',
    fontFamily: "'Inter', sans-serif",
  },
  actions: {
    marginTop: '24px',
  }
};

export default AdminResults;
