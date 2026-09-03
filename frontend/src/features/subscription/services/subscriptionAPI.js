import API from "@/utils/api";

/** Get current subscription status + all available plans */
export const getSubscriptionStatus = () =>
  API.get("/subscription").then((r) => r.data);

/** Lightweight check — returns { subscribed: true/false } */
export const checkSubscription = () =>
  API.get("/subscription/check").then((r) => r.data);

/** Create Razorpay order for a subscription plan */
export const createSubscriptionOrder = (planId) =>
  API.post("/subscription/create-order", { planId }).then((r) => r.data);

/** Verify Razorpay payment and activate subscription */
export const verifySubscriptionPayment = (payload) =>
  API.post("/subscription/verify-payment", payload).then((r) => r.data);
