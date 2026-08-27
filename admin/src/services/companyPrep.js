import api from './api';

export const companyPrepService = {
  getAllQuestions: async (companySlug) => {
    const url = companySlug ? `/company-prep?company=${companySlug}` : '/company-prep';
    const res = await api.get(url);
    return res.data;
  },

  getQuestionById: async (id) => {
    const res = await api.get(`/company-prep/${id}`);
    return res.data;
  },

  createQuestion: async (data) => {
    const res = await api.post('/company-prep', data);
    return res.data;
  },

  updateQuestion: async (id, data) => {
    const res = await api.put(`/company-prep/${id}`, data);
    return res.data;
  },

  deleteQuestion: async (id) => {
    const res = await api.delete(`/company-prep/${id}`);
    return res.data;
  }
};
