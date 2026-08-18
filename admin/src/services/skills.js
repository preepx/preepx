/**
 * services/skills.js — Skills API calls
 */
import api from './api';

export const skillsService = {
  getAll: () => api.get('/skills'),
  create: (data) => api.post('/skills', data),
  rename: (skill, data) => api.put(`/skills/${skill}`, data),
  delete: (skill) => api.delete(`/skills/${skill}`),
};
