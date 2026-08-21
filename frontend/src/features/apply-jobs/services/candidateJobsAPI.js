import API from "@/utils/api";

const BASE = "/jobs";

export const getPublishedJobs = (params) =>
  API.get(BASE, { params }).then((r) => r.data.data);

export const getMatchedJobs = () =>
  API.get(`${BASE}/matched`).then((r) => r.data.data);

export const getPublishedJob = (jobId) =>
  API.get(`${BASE}/${jobId}`).then((r) => r.data.data);

export const applyToJob = (jobId) =>
  API.post(`${BASE}/${jobId}/apply`).then((r) => r.data);

export const getMyApplications = () =>
  API.get(`${BASE}/applications/me`).then((r) => r.data.data);

export const getApplicationStats = () =>
  API.get(`${BASE}/applications/stats`).then((r) => r.data.data);
