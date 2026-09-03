import API from "@/utils/api";

const BASE = "/recruiter/hiring";

export const getOnboarding = () => API.get(`${BASE}/onboarding`).then((r) => r.data.data);

export const completeRecruiterProfile = (data) =>
  API.post(`${BASE}/complete-profile`, data).then((r) => r.data.data);
export const updateRecruiterProfile = (data) => API.put(`${BASE}/profile`, data).then((r) => r.data.data);
export const updateCompanyProfile = (data) => API.put(`${BASE}/company`, data).then((r) => r.data.data);
export const submitVerification = () => API.post(`${BASE}/onboarding/verification`).then((r) => r.data.data);
export const completeOnboarding = (planSlug) => API.post(`${BASE}/onboarding/complete`, { planSlug }).then((r) => r.data.data);

export const getRecruiterDashboard = () => API.get(`${BASE}/dashboard`).then((r) => r.data.data);
export const getAnalytics = () => API.get(`${BASE}/analytics`).then((r) => r.data.data);
export const getJobs = (params) => API.get(`${BASE}/jobs`, { params }).then((r) => r.data.data);
export const getJob = (jobId) => API.get(`${BASE}/jobs/${jobId}`).then((r) => r.data.data);
export const createJob = (data) => API.post(`${BASE}/jobs`, data).then((r) => r.data.data);
export const generateJobDetails = (prompt) => API.post(`${BASE}/jobs/generate-details`, { prompt }).then((r) => r.data.data);
export const updateJob = (jobId, data) => API.put(`${BASE}/jobs/${jobId}`, data).then((r) => r.data.data);
export const publishJob = (jobId) => API.post(`${BASE}/jobs/${jobId}/publish`).then((r) => r.data.data);
export const changeJobStatus = (jobId, status) => API.patch(`${BASE}/jobs/${jobId}/status`, { status }).then((r) => r.data.data);
export const deleteJob = (jobId) => API.delete(`${BASE}/jobs/${jobId}`).then((r) => r.data);
export const runAutoMatch = (jobId) => API.post(`${BASE}/jobs/${jobId}/match`).then((r) => r.data.data);
export const getApplications = (jobId) => API.get(`${BASE}/jobs/${jobId}/applications`).then((r) => r.data.data);
export const getPipeline = (jobId) => API.get(`${BASE}/jobs/${jobId}/pipeline`).then((r) => r.data.data);
export const discoverCandidates = (params) => API.get(`${BASE}/candidates`, { params }).then((r) => r.data.data);
export const getCandidateProfile = (applicationId) => API.get(`${BASE}/candidates/${applicationId}`).then((r) => r.data.data);
export const getShortlisted = () => API.get(`${BASE}/shortlisted`).then((r) => r.data.data);
export const sendAssessment = (jobId, applicationId, body = {}) =>
  API.post(`${BASE}/jobs/${jobId}/applications/${applicationId}/send-assessment`, body).then((r) => r.data);
export const generateQuestions = (jobId) => API.post(`${BASE}/jobs/${jobId}/generate-questions`).then((r) => r.data.data);
export const generateInterviewQuestions = (jobId, body = {}) => API.post(`${BASE}/jobs/${jobId}/generate-interview-questions`, body).then((r) => r.data.data);
export const sendAIInterview = (jobId, applicationId, body = {}) => API.post(`${BASE}/jobs/${jobId}/applications/${applicationId}/send-ai-interview`, body).then((r) => r.data);
export const getAIInterviewReport = (applicationId) => API.get(`${BASE}/applications/${applicationId}/ai-interview-report`).then((r) => r.data.data);
export const bulkCandidateAction = (body) => API.post(`${BASE}/applications/bulk-action`, body).then((r) => r.data.data);
export const updateAssessmentConfig = (jobId, assessmentConfig) => API.put(`${BASE}/jobs/${jobId}/assessment-config`, { assessmentConfig }).then((r) => r.data.data);

export const shortlistCandidate = (applicationId, feedback = "") =>
  API.post(`${BASE}/applications/${applicationId}/shortlist`, { feedback }).then((r) => r.data);
export const rejectCandidate = (applicationId, feedback = "") =>
  API.post(`${BASE}/applications/${applicationId}/reject`, { feedback }).then((r) => r.data);
export const movePipeline = (applicationId, status, note = "") =>
  API.patch(`${BASE}/applications/${applicationId}/pipeline`, { status, note }).then((r) => r.data.data);
export const getAssessmentResult = (assessmentId) => API.get(`${BASE}/assessments/${assessmentId}/result`).then((r) => r.data.data);
export const getInterviews = () => API.get(`${BASE}/interviews`).then((r) => r.data.data);
export const scheduleInterview = (data) => API.post(`${BASE}/interviews`, data).then((r) => r.data.data);
export const getBilling = () => API.get(`${BASE}/billing`).then((r) => r.data.data);

export const getRecruiterNotifications = () => API.get("/recruiter/notifications").then((r) => r.data.data);
export const markRecruiterNotificationRead = (notifId) => API.put(`/recruiter/notifications/${notifId}/read`).then((r) => r.data.data);
export const markAllRecruiterNotificationsRead = () => API.put("/recruiter/notifications/read-all").then((r) => r.data.data);
export const selectPlan = (planSlug) => API.post(`${BASE}/billing/select-plan`, { planSlug }).then((r) => r.data.data);

