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

  const { survey, stats } = results;

  const getSurveyTitle = () => {
    if (i18n.language === 'sv' && survey.title_sv) {
      return survey.title_sv;
    }
    return survey.title_en || survey.title || t('untitled_survey');
  };

  const getSurveyDescription = () => {
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

  return (
    <div className="container">
      <LanguageSwitcher />

      <div className="page-header">
        <h1 className="page-title">{getSurveyTitle()}</h1>
        {getSurveyDescription() && <p className="page-subtitle">{getSurveyDescription()}</p>}
      </div>

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
        </div>
      </div>

      <div className="card">
        <h2 style={styles.sectionTitle}>{t('results')}</h2>

        {stats.item_stats.length === 0 ? (
          <p>{t('no_responses_yet')}</p>
        ) : (
          <div style={styles.table}>
            {/* Header */}
            <div style={styles.tableHeader}>
              <div style={styles.tableCell}>{t('item_number')}</div>
              <div style={styles.tableCell}>{t('selection_count')}</div>
              <div style={styles.tableCell}>{t('percentage')}</div>
              <div style={styles.tableCell}>{t('visual')}</div>
            </div>

            {/* Rows */}
            {stats.item_stats.map((stat) => {
              return (
                <div key={stat.item_id} style={styles.tableRow}>
                  <div style={styles.tableCell}>
                    {stat.image && (
                      <img
                        src={`/images/${stat.image}`}
                        alt=""
                        style={styles.thumbnail}
                      />
                    )}
                    <span>{getItemText(stat)}</span>
                  </div>
                  <div style={styles.tableCell}>{stat.count}</div>
                  <div style={styles.tableCell}>{stat.percentage.toFixed(1)}%</div>
                  <div style={styles.tableCell}>
                    <div style={styles.progressBar}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${stat.percentage}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {stats.most_selected && stats.most_selected.length > 0 && (
        <div className="card" style={styles.mostPopular}>
          <h3 style={styles.sectionTitle}>
            {stats.most_selected.length > 1 ? t('most_popular_tied') : t('most_popular')}
          </h3>
          {stats.most_selected.map((item, index) => (
            <div key={item.id || index} style={{
              ...styles.popularItem,
              ...(index > 0 ? { marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(232, 220, 200, 0.6)' } : {})
            }}>
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
                  {item.count} selections ({item.percentage.toFixed(1)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
    marginBottom: '16px',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '600',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 2fr',
    gap: '12px',
    padding: '16px',
    background: 'var(--gradient-warm)',
    borderRadius: '12px',
    fontWeight: '600',
    marginBottom: '12px',
    fontFamily: "'Poppins', sans-serif",
    color: 'var(--espresso)',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 2fr',
    gap: '12px',
    padding: '16px',
    borderBottom: '1px solid rgba(232, 220, 200, 0.4)',
    alignItems: 'center',
    transition: 'background 0.2s ease',
  },
  tableCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--text-primary)',
  },
  thumbnail: {
    width: '80px',
    height: '45px', // 16:9 aspect ratio (80 / 16 * 9 = 45)
    objectFit: 'cover',
    borderRadius: '8px',
    boxShadow: 'var(--shadow-sm)',
  },
  progressBar: {
    width: '100%',
    height: '28px',
    background: 'rgba(232, 220, 200, 0.4)',
    borderRadius: '14px',
    overflow: 'hidden',
    border: '1px solid rgba(232, 220, 200, 0.6)',
  },
  progressFill: {
    height: '100%',
    background: 'var(--gradient-coffee)',
    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.3)',
  },
  mostPopular: {
    background: 'var(--gradient-sunset)',
    border: '2px solid var(--accent-warm)',
    marginTop: '24px',
  },
  popularItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  popularImage: {
    width: '160px',
    height: '90px', // 16:9 aspect ratio
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
