import { useState, useEffect, useCallback } from "react";
import { getWallet } from "../services/walletAPI";

export function useWallet({ autoFetch = true } = {}) {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWallet();
      setWallet(data);
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
