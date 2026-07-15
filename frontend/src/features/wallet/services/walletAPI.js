import API from "../../../utils/api";

export const getWallet = () => API.get("/wallet").then((r) => r.data);

export const purchaseCoins = (payload) =>
  API.post("/wallet/purchase", payload).then((r) => r.data);

export const checkSessionAccess = (sessionType) =>
  API.get("/wallet/check-access", { params: { sessionType } }).then((r) => r.data);
