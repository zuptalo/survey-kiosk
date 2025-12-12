import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../context/NotificationContext';
import { surveyService } from '../services/surveyService';
import { adminService } from '../services/adminService';
import { validateImage } from '../utils/imageUtils';
import LanguageSwitcher from '../components/LanguageSwitcher';

function AdminEditSurvey() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { showError, showWarning } = useNotification();
  const [titleEn, setTitleEn] = useState('');
  const [titleSv, setTitleSv] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionSv, setDescriptionSv] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSurvey();
  }, [id]);

  const loadSurvey = async () => {
    try {
      const survey = await surveyService.getSurvey(id);
      setTitleEn(survey.title_en || '');
      setTitleSv(survey.title_sv || '');
      setDescriptionEn(survey.description_en || '');
      setDescriptionSv(survey.description_sv || '');
      setItems(survey.items.map(item => ({
        ...item,
        tempId: Date.now() + Math.random(),
        text_en: item.text_en || item.text || '',  // Fallback for old data
        text_sv: item.text_sv || '',
        imageData: '',
        imageFilename: item.image || ''
      })));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, {
      id: '',
      tempId: Date.now(),
      text_en: '',
      text_sv: '',
      imageData: '',
      imageFilename: ''
    }]);
  };

  const removeItem = (tempId) => {
    if (items.length === 1) {
      showWarning(t('survey_must_have_item'));
      return;
    }
    setItems(items.filter(item => item.tempId !== tempId));
  };

  const updateItemText = (tempId, field, value) => {
    setItems(items.map(item =>
      item.tempId === tempId ? { ...item, [field]: value } : item
    ));
  };

  const handleImageUpload = async (tempId, file) => {
    if (!file) return;

    try {
      validateImage(file);

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
        const timestamp = Date.now();
        const filename = `${timestamp}_${file.name}`;

        setItems(items.map(item =>
          item.tempId === tempId ? {
            ...item,
            imageData: base64,
            imageFilename: filename
          } : item
        ));
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showError(err.message);
    }
  };

  const removeImage = (tempId) => {
    setItems(items.map(item =>
      item.tempId === tempId ? { ...item, imageData: '', imageFilename: '' } : item
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!titleEn.trim() && !titleSv.trim()) {
      setError(t('at_least_one_title'));
      return;
    }

    const validItems = items.filter(item =>
      item.text_en.trim() || item.text_sv.trim() || item.imageData || item.imageFilename
    );

    if (validItems.length === 0) {
      setError(t('at_least_one_item'));
      return;
    }

    const surveyData = {
      title_en: titleEn.trim(),
      title_sv: titleSv.trim(),
      description_en: descriptionEn.trim(),
      description_sv: descriptionSv.trim(),
      items: validItems.map((item, index) => ({
        id: item.id || `item_${index + 1}`,
        text_en: item.text_en.trim(),
        text_sv: item.text_sv.trim(),
        ...(item.imageData ? {
          imageData: item.imageData,
          image: item.imageFilename
        } : item.imageFilename ? {
          image: item.imageFilename
        } : {})
      }))
    };

    setSaving(true);
    try {
      await adminService.updateSurvey(id, surveyData);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setSaving(false);
    }
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
        <h1 className="page-title">{t('edit_survey')}</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="card">
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>{t('survey_title_section')}</h3>

          <div className="form-group">
            <label className="form-label">{t('title_english')} {t('required_field')}</label>
            <input
              type="text"
              className="form-input"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder={t('english_title')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('title_swedish')}</label>
            <input
              type="text"
              className="form-input"
              value={titleSv}
              onChange={(e) => setTitleSv(e.target.value)}
              placeholder={t('swedish_title')}
            />
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>{t('description_section')}</h3>

          <div className="form-group">
            <label className="form-label">{t('description_english')}</label>
            <textarea
              className="form-textarea"
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              placeholder={t('english_description')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('description_swedish')}</label>
            <textarea
              className="form-textarea"
              value={descriptionSv}
              onChange={(e) => setDescriptionSv(e.target.value)}
              placeholder={t('swedish_description')}
            />
          </div>
        </div>

        <div style={styles.itemsSection}>
          <h3 style={styles.itemsTitle}>{t('items')}</h3>

          {items.map((item, index) => (
            <div key={item.tempId} style={styles.item} className="card">
              <div style={styles.itemHeader}>
                <h4>{t('item_number')} {index + 1}</h4>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.tempId)}
                    className="btn btn-danger"
                    style={styles.removeButton}
                  >
                    {t('remove_item')}
                  </button>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">{t('text_english')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={item.text_en}
                  onChange={(e) => updateItemText(item.tempId, 'text_en', e.target.value)}
                  placeholder={t('english_text')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('text_swedish')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={item.text_sv}
                  onChange={(e) => updateItemText(item.tempId, 'text_sv', e.target.value)}
                  placeholder={t('swedish_text')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('item_image')}</label>
                {item.imageData || item.imageFilename ? (
                  <div>
                    <img
                      src={
                        item.imageData
                          ? `data:image/png;base64,${item.imageData}`
                          : `/images/${item.imageFilename}`
                      }
                      alt={t('preview')}
                      style={styles.preview}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(item.tempId)}
                      className="btn btn-secondary"
                      style={{marginTop: '10px'}}
                    >
                      {t('remove_image')}
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) => handleImageUpload(item.tempId, e.target.files[0])}
                    className="form-input"
                  />
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="btn btn-secondary"
          >
            + {t('add_item')}
          </button>
        </div>

        <div style={styles.actions}>
          <button
            type="submit"
            className="btn btn-success"
            disabled={saving}
          >
            {saving ? t('loading') : t('save')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="btn btn-secondary"
            disabled={saving}
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  section: {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '2px solid var(--beige)',
  },
  sectionTitle: {
    fontSize: '18px',
    color: 'var(--primary-brown)',
    marginBottom: '16px',
    fontWeight: '600',
  },
  itemsSection: {
    marginTop: '24px',
  },
  itemsTitle: {
    fontSize: '20px',
    color: 'var(--primary-brown)',
    marginBottom: '16px',
  },
  item: {
    marginBottom: '20px',
    background: 'var(--beige)',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  removeButton: {
    padding: '6px 12px',
    fontSize: '14px',
  },
  preview: {
    width: '100%',
    maxWidth: '400px',
    aspectRatio: '16 / 9',
    objectFit: 'cover',
    borderRadius: '12px',
    display: 'block',
    boxShadow: 'var(--shadow-sm)',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  }
};

export default AdminEditSurvey;
