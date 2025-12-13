import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { surveyService } from '../services/surveyService';
import { adminService } from '../services/adminService';
import Modal from '../components/Modal';
import LanguageSwitcher from '../components/LanguageSwitcher';

function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showConfirm, showSuccess, showError } = useNotification();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duplicateModal, setDuplicateModal] = useState({ isOpen: false, surveyId: null });
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newTitleSv, setNewTitleSv] = useState('');
  const [importing, setImporting] = useState(false);

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
    const confirmed = await showConfirm({
      title: t('confirm_delete'),
      message: `"${displayTitle}"`,
      confirmText: t('delete_survey'),
      cancelText: t('cancel'),
      confirmStyle: 'danger'
    });

    if (!confirmed) return;

    try {
      await adminService.deleteSurvey(id);
      await loadSurveys();
      showSuccess(t('survey_deleted'));
    } catch (err) {
      showError(`${t('error')}: ${err.message}`);
    }
  };

  const openDuplicateModal = (surveyId) => {
    setDuplicateModal({ isOpen: true, surveyId });
    setNewTitleEn('');
    setNewTitleSv('');
  };

  const closeDuplicateModal = () => {
    setDuplicateModal({ isOpen: false, surveyId: null });
    setNewTitleEn('');
    setNewTitleSv('');
  };

  const handleDuplicateSubmit = async () => {
    if (!newTitleEn.trim() && !newTitleSv.trim()) {
      showError(t('please_enter_title'));
      return;
    }

    try {
      await adminService.duplicateSurvey(duplicateModal.surveyId, {
        new_title_en: newTitleEn.trim(),
        new_title_sv: newTitleSv.trim()
      });
      closeDuplicateModal();
      await loadSurveys();
      showSuccess(t('survey_duplicated'));
    } catch (err) {
      showError(`${t('error')}: ${err.message}`);
    }
  };

  const handleReset = async (id, title) => {
    const displayTitle = title || 'this survey';
    const confirmed = await showConfirm({
      title: t('confirm_reset'),
      message: `"${displayTitle}"\n\n${t('reset_warning')}`,
      confirmText: t('reset_ratings'),
      cancelText: t('cancel'),
      confirmStyle: 'danger'
    });

    if (!confirmed) return;

    try {
      await adminService.resetSurvey(id);
      showSuccess(t('ratings_reset'));
    } catch (err) {
      showError(`${t('error')}: ${err.message}`);
    }
  };

  const handleExport = async () => {
    try {
      const data = await adminService.exportSurveys();

      // Create a downloadable JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `surveys-backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccess(t('surveys_exported'));
    } catch (err) {
      showError(`${t('error')}: ${err.message}`);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      const result = await adminService.importSurveys(importData);
      await loadSurveys();

      showSuccess(`${t('surveys_imported')}: ${result.imported_count} surveys`);
    } catch (err) {
      showError(`${t('import_failed')}: ${err.message}`);
    } finally {
      setImporting(false);
      // Reset file input
      event.target.value = '';
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

      <div className="page-header" style={styles.header}>
        <div>
          <h1 className="page-title">{t('admin_dashboard')}</h1>
          <p className="page-subtitle">{surveys.length} {t('surveys_count')}</p>
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

        <div style={styles.importExportButtons}>
          <button onClick={handleExport} className="btn btn-secondary">
            ⬇ {t('export_surveys')}
          </button>

          <label className="btn btn-secondary" style={{ cursor: 'pointer', margin: 0 }}>
            ⬆ {importing ? t('importing') : t('import_surveys')}
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={importing}
              style={{ display: 'none' }}
            />
          </label>
        </div>
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
                {survey.questions ? (
                  <>
                    <span>{survey.questions.length} {survey.questions.length === 1 ? 'question' : 'questions'}</span>
                    <span style={{ marginLeft: '12px' }}>
                      {survey.questions.reduce((total, q) => total + (q.items?.length || 0), 0)} items
                    </span>
                  </>
                ) : (
                  <span>{survey.items?.length || 0} items</span>
                )}
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
          <label className="form-label">{t('new_title_english')} *</label>
          <input
            type="text"
            className="form-input"
            value={newTitleEn}
            onChange={(e) => setNewTitleEn(e.target.value)}
            placeholder={t('enter_new_english_title')}
            autoFocus
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t('new_title_swedish')}</label>
          <input
            type="text"
            className="form-input"
            value={newTitleSv}
            onChange={(e) => setNewTitleSv(e.target.value)}
            placeholder={t('enter_new_swedish_title')}
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
    textAlign: 'left', // Override center alignment for dashboard
  },
  actions: {
    marginBottom: '28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  importExportButtons: {
    display: 'flex',
    gap: '12px',
  },
  surveyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  surveyCard: {
    position: 'relative',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 247, 242, 0.95) 100%)',
  },
  surveyTitle: {
    fontSize: '24px',
    color: 'var(--espresso)',
    marginBottom: '10px',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '600',
  },
  surveyDescription: {
    color: 'var(--text-secondary)',
    marginBottom: '12px',
    lineHeight: '1.5',
  },
  info: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    marginBottom: '18px',
    fontFamily: "'Inter', sans-serif",
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  smallButton: {
    padding: '10px 18px',
    fontSize: '14px',
  }
};

export default AdminDashboard;
