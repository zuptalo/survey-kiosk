import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminService } from '../services/adminService';
import { convertImageToBase64, validateImage } from '../utils/imageUtils';

function AdminNewSurvey() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState([{ id: Date.now(), text: '', image: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addItem = () => {
    setItems([...items, { id: Date.now(), text: '', image: '' }]);
  };

  const removeItem = (id) => {
    if (items.length === 1) {
      alert('Survey must have at least one item');
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  const updateItemText = (id, text) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, text } : item
    ));
  };

  const handleImageUpload = async (id, file) => {
    if (!file) return;

    try {
      validateImage(file);
      const base64 = await convertImageToBase64(file);
      setItems(items.map(item =>
        item.id === id ? { ...item, image: base64 } : item
      ));
    } catch (err) {
      alert(err.message);
    }
  };

  const removeImage = (id) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, image: '' } : item
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const validItems = items.filter(item => item.text.trim() || item.image);
    if (validItems.length === 0) {
      setError('At least one item with text or image is required');
      return;
    }

    const surveyData = {
      title: title.trim(),
      description: description.trim(),
      items: validItems.map((item, index) => ({
        id: `item_${index + 1}`,
        text: item.text.trim(),
        image: item.image
      }))
    };

    setLoading(true);
    try {
      await adminService.createSurvey(surveyData);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">{t('create_new_survey')}</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label className="form-label">{t('survey_title')} *</label>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('survey_description')}</label>
          <textarea
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={styles.itemsSection}>
          <h3 style={styles.itemsTitle}>{t('items')}</h3>

          {items.map((item, index) => (
            <div key={item.id} style={styles.item} className="card">
              <div style={styles.itemHeader}>
                <h4>Item {index + 1}</h4>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="btn btn-danger"
                    style={styles.removeButton}
                  >
                    {t('remove_item')}
                  </button>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">{t('item_text')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={item.text}
                  onChange={(e) => updateItemText(item.id, e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('item_image')}</label>
                {item.image ? (
                  <div>
                    <img
                      src={item.image}
                      alt="Preview"
                      style={styles.preview}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(item.id)}
                      className="btn btn-secondary"
                      style={{marginTop: '10px'}}
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={(e) => handleImageUpload(item.id, e.target.files[0])}
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
            disabled={loading}
          >
            {loading ? t('loading') : t('save')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="btn btn-secondary"
            disabled={loading}
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
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
    maxWidth: '200px',
    maxHeight: '200px',
    borderRadius: '8px',
    display: 'block',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  }
};

export default AdminNewSurvey;
