import API from "../utils/api";

export const getAllMcqResults = () => API.get("/mcq").then((r) => r.data);

export const getMcqResultById = (id) => API.get(`/mcq/${id}`).then((r) => r.data);

export const deleteMcqResult = (id) => API.delete(`/mcq/${id}`).then((r) => r.data);

export const getMcqDashboard = async () => {
  const res = await API.get("/users/dashboard");
  const { mcqResults = [], mcqStats = {}, user, stats } = res.data;
  return { mcqResults, mcqStats, user, stats };
};
