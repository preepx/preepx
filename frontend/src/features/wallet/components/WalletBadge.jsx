import React from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";
import { useSubscription } from "@/features/subscription";
import { ShieldCheck, IndianRupee } from "lucide-react";
import '@/styles/WalletBadge.css';

function WalletBadge() {
  const { balance, loading: walletLoading } = useWallet();
  const { subscribed, planName, loading: subLoading } = useSubscription();
  const loading = walletLoading || subLoading;

  if (subscribed) {
    return (
      <Link to="/wallet" className="wallet-badge" title="Manage Subscription" style={{ borderColor: "#10b981", background: "rgba(16, 185, 129, 0.1)" }}>
        <ShieldCheck size={14} color="#10b981" />
        <span className="wallet-badge-label" style={{ color: "#10b981" }}>Pro</span>
        <span className="wallet-badge-balance" style={{ color: "#10b981" }}>
          {loading ? "…" : planName}
        </span>
      </Link>
    );
  }

  return (
    <Link to="/wallet" className="wallet-badge" title="View wallet">
      <div style={{
        background: 'linear-gradient(135deg, #10b981, #059669)',
        borderRadius: '50%',
        width: '18px',
        height: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 5px rgba(16, 185, 129, 0.4)'
      }}>
        <IndianRupee size={11} color="#fff" strokeWidth={3} />
      </div>
      <span className="wallet-badge-label">Wallet</span>
      <span className="wallet-badge-balance">
        {loading ? "…" : balance}
      </span>
    </Link>
  );
}


export default WalletBadge;
