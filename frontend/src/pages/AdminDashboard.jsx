import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { surveyService } from '../services/surveyService';
import { adminService } from '../services/adminService';
import Modal from '../components/Modal';

function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duplicateModal, setDuplicateModal] = useState({ isOpen: false, surveyId: null });
  const [newTitle, setNewTitle] = useState('');

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

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleDelete = async (id, title) => {
    const displayTitle = title || 'this survey';
    if (!window.confirm(`${t('confirm_delete')}\n\n"${displayTitle}"`)) {
      return;
    }

    try {
      await adminService.deleteSurvey(id);
      await loadSurveys();
    } catch (err) {
      alert(`${t('error')}: ${err.message}`);
    }
  };

  const openDuplicateModal = (surveyId) => {
    setDuplicateModal({ isOpen: true, surveyId });
    setNewTitle('');
  };

  const closeDuplicateModal = () => {
    setDuplicateModal({ isOpen: false, surveyId: null });
    setNewTitle('');
  };

  const handleDuplicateSubmit = async () => {
    if (!newTitle.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      await adminService.duplicateSurvey(duplicateModal.surveyId, newTitle.trim());
      closeDuplicateModal();
      await loadSurveys();
    } catch (err) {
      alert(`${t('error')}: ${err.message}`);
    }
  };

  const handleReset = async (id, title) => {
    const displayTitle = title || 'this survey';
    if (!window.confirm(`${t('confirm_reset')}\n\n"${displayTitle}"`)) {
      return;
    }

    try {
      await adminService.resetSurvey(id);
      alert(t('ratings_reset'));
    } catch (err) {
      alert(`${t('error')}: ${err.message}`);
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
      <div className="page-header" style={styles.header}>
        <div>
          <h1 className="page-title">{t('admin_dashboard')}</h1>
          <p className="page-subtitle">{surveys.length} surveys</p>
        </div>
        <button onClick={handleLogout} className="btn btn-danger">
          {t('logout')}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {t('error')}: {error}
        </div>
      )}

      <div style={styles.actions}>
        <Link to="/admin/survey/new" className="btn btn-success">
          + {t('create_new_survey')}
        </Link>
      </div>

      <div style={styles.surveyList}>
        {surveys.length === 0 ? (
          <div className="card">
            <p>{t('no_surveys')}</p>
          </div>
        ) : (
          surveys.map((survey) => (
            <div key={survey.id} className="card" style={styles.surveyCard}>
              <h2 style={styles.surveyTitle}>{getSurveyTitle(survey)}</h2>
              {getSurveyDescription(survey) && (
                <p style={styles.surveyDescription}>{getSurveyDescription(survey)}</p>
              )}
              <div style={styles.info}>
                <span>{survey.items.length} items</span>
              </div>

              <div style={styles.buttonGroup}>
                <Link
                  to={`/admin/survey/${survey.id}/results`}
                  className="btn btn-primary"
                  style={styles.smallButton}
                >
                  {t('view_results')}
                </Link>
                <Link
                  to={`/admin/survey/${survey.id}/edit`}
                  className="btn btn-secondary"
                  style={styles.smallButton}
                >
                  {t('edit_survey')}
                </Link>
                <button
                  onClick={() => openDuplicateModal(survey.id)}
                  className="btn btn-secondary"
                  style={styles.smallButton}
                >
                  {t('duplicate_survey')}
                </button>
                <button
                  onClick={() => handleReset(survey.id, getSurveyTitle(survey))}
                  className="btn btn-secondary"
                  style={styles.smallButton}
                >
                  {t('reset_ratings')}
                </button>
                <button
                  onClick={() => handleDelete(survey.id, getSurveyTitle(survey))}
                  className="btn btn-danger"
                  style={styles.smallButton}
                >
                  {t('delete_survey')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={duplicateModal.isOpen}
        onClose={closeDuplicateModal}
        title={t('duplicate_survey')}
        actions={
          <>
            <button onClick={closeDuplicateModal} className="btn btn-secondary">
              {t('cancel')}
            </button>
            <button onClick={handleDuplicateSubmit} className="btn btn-primary">
              {t('confirm')}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">
            {t('confirm_duplicate')}
          </label>
          <input
            type="text"
            className="form-input"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter new survey title"
            autoFocus
          />
        </div>
      </Modal>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    marginBottom: '24px',
  },
  surveyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  surveyCard: {
    position: 'relative',
  },
  surveyTitle: {
    fontSize: '24px',
    color: 'var(--primary-brown)',
    marginBottom: '8px',
  },
  surveyDescription: {
    color: 'var(--text-light)',
    marginBottom: '12px',
  },
  info: {
    color: 'var(--text-light)',
    fontSize: '14px',
    marginBottom: '16px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  smallButton: {
    padding: '8px 16px',
    fontSize: '14px',
  }
};

export default AdminDashboard;
