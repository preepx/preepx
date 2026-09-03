import { useState, useEffect, useCallback } from "react";
import { getSubscriptionStatus } from "../services/subscriptionAPI";

export function useSubscription({ autoFetch = true } = {}) {
  const cached = localStorage.getItem("subscription_data");
  const [data, setData] = useState(cached ? JSON.parse(cached) : null);
  const [loading, setLoading] = useState(autoFetch && !cached);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      if (!localStorage.getItem("subscription_data")) setLoading(true);
      setError(null);
      const res = await getSubscriptionStatus();
      setData(res);
      localStorage.setItem("subscription_data", JSON.stringify(res));
      return res;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load subscription");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) refresh();

    const handleUpdate = () => {
      localStorage.removeItem("subscription_data");
      refresh();
    };
    window.addEventListener("subscriptionUpdated", handleUpdate);
    return () => window.removeEventListener("subscriptionUpdated", handleUpdate);
  }, [autoFetch, refresh]);

  const sub = data;

  return {
    subscribed: sub?.status === "active",
    status: sub?.status || "none",
    planId: sub?.planId || null,
    planName: sub?.planName || null,
    expiresAt: sub?.expiresAt || null,
    daysLeft: sub?.daysLeft || 0,
    plans: sub?.plans || [],
    rawData: data,
    loading,
    error,
    refresh,
  };
}
