/**
 * services/mcqQuestions.js — MCQ Questions API calls
 */
import api from './api';

export const mcqQuestionsService = {
  getAll: (skill, params) => api.get(`/mcq-questions/${skill}`, { params }),
  add: (skill, data) => api.post(`/mcq-questions/${skill}`, data),
  edit: (skill, id, data) => api.put(`/mcq-questions/${skill}/${id}`, data),
  delete: (skill, id) => api.delete(`/mcq-questions/${skill}/${id}`),
  bulkUpload: (skill, file, mode = 'replace') => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/mcq-questions/${skill}/bulk-upload?mode=${mode}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  export: (skill) => api.get(`/mcq-questions/${skill}/export`, { responseType: 'blob' }),
  getSkills: () => api.get('/mcq-questions/skills/list'),
};
