import { useState, useEffect, useCallback } from "react";
import { getWallet } from "@/services/walletAPI";

export function useWallet({ autoFetch = true } = {}) {
  const cachedData = localStorage.getItem('wallet_data');
  const [wallet, setWallet] = useState(cachedData ? JSON.parse(cachedData) : null);
  const [loading, setLoading] = useState(autoFetch && !cachedData);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      if (!localStorage.getItem('wallet_data')) setLoading(true);
      setError(null);
      const data = await getWallet();
      setWallet(data);
      if (data) {
        localStorage.setItem('wallet_data', JSON.stringify(data));
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load wallet");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) refresh();

    const handleUpdate = () => refresh();
    window.addEventListener("walletUpdated", handleUpdate);
    return () => window.removeEventListener("walletUpdated", handleUpdate);
  }, [autoFetch, refresh]);

  return {
    balance: wallet?.balance ?? 0,
    transactions: wallet?.transactions ?? [],
    config: wallet?.config ?? null,
    wallet,
    loading,
    error,
    refresh,
  };
}

