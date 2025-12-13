import api from './api';

export const adminService = {
  // Login
  login: async (password) => {
    const response = await api.post('/admin/login', { password });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/admin/logout');
    return response.data;
  },

  // Check auth status
  checkStatus: async () => {
    const response = await api.get('/admin/status');
    return response.data;
  },

  // Create survey
  createSurvey: async (surveyData) => {
    const response = await api.post('/admin/surveys', surveyData);
    return response.data;
  },

  // Update survey
  updateSurvey: async (id, surveyData) => {
    const response = await api.put(`/admin/surveys/${id}`, surveyData);
    return response.data;
  },

  // Delete survey
  deleteSurvey: async (id) => {
    const response = await api.delete(`/admin/surveys/${id}`);
    return response.data;
  },

  // Duplicate survey
  duplicateSurvey: async (id, titles) => {
    const response = await api.post(`/admin/surveys/${id}/duplicate`, titles);
    return response.data;
  },

  // Reset survey ratings
  resetSurvey: async (id) => {
    const response = await api.post(`/admin/surveys/${id}/reset`);
    return response.data;
  },

  // Get survey results
  getSurveyResults: async (id) => {
    const response = await api.get(`/admin/surveys/${id}/results`);
    return response.data;
  },

  // Export all surveys
  exportSurveys: async () => {
    const response = await api.get('/admin/surveys/export');
    return response.data;
  },

  // Import surveys
  importSurveys: async (importData) => {
    const response = await api.post('/admin/surveys/import', importData);
    return response.data;
  }
};
