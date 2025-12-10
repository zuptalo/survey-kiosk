import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminService } from '../services/adminService';

function AdminResults() {
  const { t } = useTranslation();
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
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const { survey, stats } = results;

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">{survey.title}</h1>
        <p className="page-subtitle">{survey.description}</p>
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
          <p>No responses yet</p>
        ) : (
          <div style={styles.table}>
            {/* Header */}
            <div style={styles.tableHeader}>
              <div style={styles.tableCell}>Item</div>
              <div style={styles.tableCell}>{t('selection_count')}</div>
              <div style={styles.tableCell}>{t('percentage')}</div>
              <div style={styles.tableCell}>Visual</div>
            </div>

            {/* Rows */}
            {stats.item_stats.map((stat) => {
              const item = survey.items.find(i => i.id === stat.item_id);
              return (
                <div key={stat.item_id} style={styles.tableRow}>
                  <div style={styles.tableCell}>
                    {item?.image && (
                      <img
                        src={item.image}
                        alt=""
                        style={styles.thumbnail}
                      />
                    )}
                    <span>{item?.text || 'N/A'}</span>
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

      {stats.most_selected && (
        <div className="card" style={styles.mostPopular}>
          <h3 style={styles.sectionTitle}>{t('most_popular')}</h3>
          <div style={styles.popularItem}>
            {stats.most_selected.image && (
              <img
                src={stats.most_selected.image}
                alt=""
                style={styles.popularImage}
              />
            )}
            <div>
              <div style={styles.popularText}>{stats.most_selected.text}</div>
              <div style={styles.popularStats}>
                {stats.most_selected.count} selections ({stats.most_selected.percentage.toFixed(1)}%)
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={styles.actions}>
        <button onClick={() => navigate('/admin')} className="btn btn-secondary">
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

const styles = {
  statsCard: {
    marginBottom: '24px',
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  statBox: {
    textAlign: 'center',
    padding: '16px',
    background: 'var(--beige)',
    borderRadius: '8px',
  },
  statLabel: {
    fontSize: '14px',
    color: 'var(--text-light)',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'var(--primary-brown)',
  },
  sectionTitle: {
    fontSize: '20px',
    color: 'var(--primary-brown)',
    marginBottom: '16px',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 2fr',
    gap: '12px',
    padding: '12px',
    background: 'var(--beige)',
    borderRadius: '8px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 2fr',
    gap: '12px',
    padding: '12px',
    borderBottom: '1px solid var(--beige)',
    alignItems: 'center',
  },
  tableCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  thumbnail: {
    width: '40px',
    height: '40px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  progressBar: {
    width: '100%',
    height: '24px',
    background: 'var(--beige)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--accent-blue), var(--primary-brown))',
    transition: 'width 0.3s ease',
  },
  mostPopular: {
    background: 'linear-gradient(135deg, #fff9e6 0%, var(--beige) 100%)',
  },
  popularItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  popularImage: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  popularText: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'var(--primary-brown)',
    marginBottom: '8px',
  },
  popularStats: {
    fontSize: '18px',
    color: 'var(--text-light)',
  },
  actions: {
    marginTop: '24px',
  }
};

export default AdminResults;
