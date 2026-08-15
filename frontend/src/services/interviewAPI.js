import API from "@/utils/api";

export const fetchInterviewQuestions = async (jobTitle, jobTopic, options = {}) => {
  const res = await API.post("/interview/generate", { jobTitle, jobTopic, ...options });
  return res.data;
};

export const deleteInterview = async (id) => {
  const res = await API.delete(`/interview/${id}`);
  return res.data;
};

export const evaluateAnswer = async (question, userAnswer) => {
  const res = await API.post("/interview/evaluate", { question, userAnswer });
  return res.data;
};

export const getAllInterviews = async () => {
  const res = await API.get("/interview/all");
  return res.data;
};

export const saveInterviewResult = async (data) => {
  const res = await API.post("/interview/save-result", data);
  return res.data;
};

export const getInterviewById = async (id) => {
  const res = await API.get(`/interview/${id}`);
  return res.data;
};
