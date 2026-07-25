import React from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";
import "./WalletBadge.css";

function WalletBadge() {
  const { balance, loading } = useWallet();

  return (
    <Link to="/wallet" className="wallet-badge" title="View wallet">
      <span style={{ fontSize: '14px', lineHeight: 1 }}>🪙</span>
      <span className="wallet-badge-label">Wallet</span>
      <span className="wallet-badge-balance">
        {loading ? "…" : balance}
      </span>
      <span className="wallet-badge-unit">coins</span>
    </Link>
  );
}

export default WalletBadge;
