import api from './api';

export const surveyService = {
  // Get all surveys
  getAllSurveys: async () => {
    const response = await api.get('/surveys');
    return response.data;
  },

  // Get single survey
  getSurvey: async (id) => {
    const response = await api.get(`/surveys/${id}`);
    return response.data;
  },

  // Submit survey response
  submitSurvey: async (id, selectedItems) => {
    const response = await api.post(`/surveys/${id}/submit`, {
      selected_items: selectedItems
    });
    return response.data;
  }
};
