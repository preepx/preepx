/**
 * services/questions.js — Questions API calls
 */
import api from './api';

export const questionsService = {
  getAll: (skill, params) => api.get(`/questions/${skill}`, { params }),
  add: (skill, data) => api.post(`/questions/${skill}`, data),
  edit: (skill, id, data) => api.put(`/questions/${skill}/${id}`, data),
  delete: (skill, id) => api.delete(`/questions/${skill}/${id}`),
  bulkUpload: (skill, file, mode = 'replace') => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/questions/${skill}/bulk-upload?mode=${mode}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  export: (skill) => api.get(`/questions/${skill}/export`, { responseType: 'blob' }),
};
