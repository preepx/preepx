import API from "@/utils/api";

export const getMyAssessments = () => API.get("/assessments").then((r) => r.data.data);

export const getAssessment = (id) => API.get(`/assessments/${id}`).then((r) => r.data.data);

export const startAssessment = (id) => API.post(`/assessments/${id}/start`).then((r) => r.data.data);

export const submitMcq = (id, answers) =>
  API.post(`/assessments/${id}/submit-mcq`, { answers }).then((r) => r.data.data);

export const submitCoding = (id, questionIndex, data) =>
  API.post(`/assessments/${id}/submit-coding`, { questionIndex, ...data }).then((r) => r.data.data);

export const completeAssessment = (id) =>
  API.post(`/assessments/${id}/complete`).then((r) => r.data.data);
