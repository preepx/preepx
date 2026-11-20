import API from "@/utils/api";

/** Get current subscription status + all available plans */
export const getSubscriptionStatus = () =>
  API.get("/subscription").then((r) => r.data);

/** Lightweight check — returns { subscribed: true/false } */
export const checkSubscription = () =>
  API.get("/subscription/check").then((r) => r.data);

/** Create Razorpay order for a subscription plan (with optional wallet deduction) */
export const createSubscriptionOrder = (planId, useWallet = false) =>
  API.post("/subscription/create-order", { planId, useWallet }).then((r) => r.data);

/** Verify Razorpay payment and activate subscription */
export const verifySubscriptionPayment = (payload) =>
  API.post("/subscription/verify-payment", payload).then((r) => r.data);

/** Direct 100% wallet subscription payment */
export const subscribeWithWallet = (planId) =>
  API.post("/subscription/subscribe-with-wallet", { planId }).then((r) => r.data);

/** Fetch all subscription receipts for the current user */
export const getSubscriptionReceipts = () =>
  API.get("/subscription/receipts").then((r) => r.data);

/** Fetch single receipt by receiptId */
export const getSubscriptionReceiptById = (receiptId) =>
  API.get(`/subscription/receipts/${receiptId}`).then((r) => r.data);
