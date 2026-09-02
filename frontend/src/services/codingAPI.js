import API from "@/utils/api";

export const getCodingChallenge = () =>
  API.get("/coding/challenge").then((r) => r.data);

export const startCodingChallenge = (challengeDay) =>
  API.post("/coding/start", { challengeDay }).then((r) => r.data);

export const completeChallengeDay = (day) =>
  API.post("/coding/challenge/complete", { day: parseInt(day, 10) }).then((r) => r.data);

export const getCodingProblem = (problemId) =>
  API.get(`/coding/problems/${problemId}`).then((r) => r.data);

export const evaluateCode = (payload) =>
  API.post("/coding/evaluate", payload).then((r) => r.data);

export const saveCodingResult = (payload) =>
  API.post("/coding/results", payload).then((r) => r.data);
