import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../context/NotificationContext';
import { adminService } from '../services/adminService';
import { validateImage } from '../utils/imageUtils';
import LanguageSwitcher from '../components/LanguageSwitcher';

function AdminNewSurvey() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError, showWarning } = useNotification();
  const [titleEn, setTitleEn] = useState('');
  const [titleSv, setTitleSv] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionSv, setDescriptionSv] = useState('');
  const [questions, setQuestions] = useState([{
    id: `q_${Date.now()}`,
    text_en: '',
    text_sv: '',
    selection_mode: 'multiple',
    items: [{
      id: `item_${Date.now()}`,
      text_en: '',
      text_sv: '',
      imageData: '',
      imageFilename: ''
    }]
  }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addQuestion = () => {
    setQuestions([...questions, {
      id: `q_${Date.now()}`,
      text_en: '',
      text_sv: '',
      selection_mode: 'multiple',
      items: [{
        id: `item_${Date.now()}`,
        text_en: '',
        text_sv: '',
        imageData: '',
        imageFilename: ''
      }]
    }]);
  };

  const removeQuestion = (questionId) => {
    if (questions.length === 1) {
      showWarning('Survey must have at least one question');
      return;
    }
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const updateQuestionText = (questionId, field, value) => {
    setQuestions(questions.map(q =>
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  const updateQuestionSelectionMode = (questionId, mode) => {
    setQuestions(questions.map(q =>
      q.id === questionId ? { ...q, selection_mode: mode } : q
    ));
  };

  const addItem = (questionId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          items: [...q.items, {
            id: `item_${Date.now()}`,
            text_en: '',
            text_sv: '',
            imageData: '',
            imageFilename: ''
          }]
        };
      }
      return q;
    }));
  };

  const removeItem = (questionId, itemId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        if (q.items.length === 1) {
          showWarning(t('survey_must_have_item'));
          return q;
        }
        return {
          ...q,
          items: q.items.filter(item => item.id !== itemId)
        };
      }
      return q;
    }));
  };

  const updateItemText = (questionId, itemId, field, value) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          items: q.items.map(item =>
            item.id === itemId ? { ...item, [field]: value } : item
          )
        };
      }
      return q;
    }));
  };

  const handleImageUpload = async (questionId, itemId, file) => {
    if (!file) return;

    try {
      validateImage(file);

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        const timestamp = Date.now();
        const filename = `${timestamp}_${file.name}`;

        setQuestions(questions.map(q => {
          if (q.id === questionId) {
            return {
              ...q,
              items: q.items.map(item =>
                item.id === itemId ? {
                  ...item,
                  imageData: base64,
                  imageFilename: filename
                } : item
              )
            };
          }
          return q;
        }));
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showError(err.message);
    }
  };

  const removeImage = (questionId, itemId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          items: q.items.map(item =>
            item.id === itemId ? { ...item, imageData: '', imageFilename: '' } : item
          )
        };
      }
      return q;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!titleEn.trim() && !titleSv.trim()) {
      setError(t('at_least_one_title'));
      return;
    }

    // Validate that each question has at least one valid item
    const validatedQuestions = questions.filter(q => {
      const validItems = q.items.filter(item =>
        item.text_en.trim() || item.text_sv.trim() || item.imageData
      );
      return validItems.length > 0;
    });

    if (validatedQuestions.length === 0) {
      setError('At least one question with valid items is required');
      return;
    }

    const surveyData = {
      title_en: titleEn.trim(),
      title_sv: titleSv.trim(),
      description_en: descriptionEn.trim(),
      description_sv: descriptionSv.trim(),
      questions: validatedQuestions.map((question, qIndex) => ({
        id: `q${qIndex + 1}`,
        text_en: question.text_en.trim(),
        text_sv: question.text_sv.trim(),
        selection_mode: question.selection_mode,
        items: question.items
          .filter(item => item.text_en.trim() || item.text_sv.trim() || item.imageData)
          .map((item, iIndex) => ({
            id: `q${qIndex + 1}_item_${iIndex + 1}`,
            text_en: item.text_en.trim(),
            text_sv: item.text_sv.trim(),
            ...(item.imageData && {
              imageData: item.imageData,
              image: item.imageFilename
            })
          }))
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
      <LanguageSwitcher />

      <div className="page-header">
        <h1 className="page-title">{t('create_new_survey')}</h1>
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

        <div style={styles.questionsSection}>
          <h3 style={styles.sectionTitle}>{t('survey_title_section')} - Questions</h3>

          {questions.map((question, qIndex) => (
            <div key={question.id} style={styles.questionCard} className="card">
              <div style={styles.questionHeader}>
                <h4>{t('question_number')} {qIndex + 1}</h4>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    className="btn btn-danger"
                    style={styles.removeButton}
                  >
                    {t('remove_question')}
                  </button>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">{t('question_text_english')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={question.text_en}
                  onChange={(e) => updateQuestionText(question.id, 'text_en', e.target.value)}
                  placeholder={t('english_text')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('question_text_swedish')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={question.text_sv}
                  onChange={(e) => updateQuestionText(question.id, 'text_sv', e.target.value)}
                  placeholder={t('swedish_text')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('selection_mode')}</label>
                <select
                  className="form-select"
                  value={question.selection_mode}
                  onChange={(e) => updateQuestionSelectionMode(question.id, e.target.value)}
                >
                  <option value="multiple">{t('multiple_select')}</option>
                  <option value="single">{t('single_select')}</option>
                </select>
              </div>

              <div style={styles.itemsSection}>
                <h5 style={styles.itemsTitle}>{t('items')}</h5>

                {question.items.map((item, iIndex) => (
                  <div key={item.id} style={styles.item} className="card">
                    <div style={styles.itemHeader}>
                      <h6>{t('item_number')} {iIndex + 1}</h6>
                      {question.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(question.id, item.id)}
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
                        onChange={(e) => updateItemText(question.id, item.id, 'text_en', e.target.value)}
                        placeholder={t('english_text')}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">{t('text_swedish')}</label>
                      <input
                        type="text"
                        className="form-input"
                        value={item.text_sv}
                        onChange={(e) => updateItemText(question.id, item.id, 'text_sv', e.target.value)}
                        placeholder={t('swedish_text')}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">{t('item_image')}</label>
                      {item.imageData ? (
                        <div>
                          <img
                            src={`data:image/png;base64,${item.imageData}`}
                            alt={t('preview')}
                            style={styles.preview}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(question.id, item.id)}
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
                          onChange={(e) => handleImageUpload(question.id, item.id, e.target.files[0])}
                          className="form-input"
                        />
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addItem(question.id)}
                  className="btn btn-secondary"
                  style={{marginTop: '12px'}}
                >
                  + {t('add_item')}
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="btn btn-primary"
            style={{marginTop: '20px'}}
          >
            + {t('add_question')}
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
  questionsSection: {
    marginTop: '24px',
  },
  questionCard: {
    marginBottom: '24px',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 247, 242, 0.95) 100%)',
    padding: '24px',
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  itemsSection: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid var(--beige)',
  },
  itemsTitle: {
    fontSize: '16px',
    color: 'var(--primary-brown)',
    marginBottom: '12px',
  },
  item: {
    marginBottom: '16px',
    background: 'var(--beige)',
    padding: '16px',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
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

export default AdminNewSurvey;
