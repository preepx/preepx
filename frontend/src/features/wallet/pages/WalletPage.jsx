import React from "react";
import { Coins, Mic, Zap, Shield, TrendingUp } from "lucide-react";
import { useWallet } from "../hooks/useWallet";
import CoinPackages from "../components/CoinPackages";
import TransactionList from "../components/TransactionList";
import { WALLET_PRICING } from "../constants/walletConfig";
import "./WalletPage.css";

function WalletPage() {
  const { balance, transactions, config, loading, refresh } = useWallet();

  if (loading && !config) {
    return <div className="page-loading">Loading wallet…</div>;
  }

  const billingEnabled = config?.billingEnabled;

  return (
    <div className="wallet-page">
      <div className="page-header">
        <h1>Wallet</h1>
        <p>Manage your coins for interviews & objective exams</p>
      </div>

      <div className="wallet-balance-card">
        <div className="wallet-balance-left">
          <div className="wallet-balance-icon">
            <span style={{ fontSize: '28px', lineHeight: 1 }}>🪙</span>
          </div>
          <div>
            <p className="wallet-balance-label">Available Balance</p>
            <p className="wallet-balance-value">
              {balance} <span>coins</span>
            </p>
          </div>
        </div>
        {!billingEnabled && (
          <div className="wallet-free-badge">
            <Shield size={14} />
            All Free
          </div>
        )}
      </div>

      {!billingEnabled && (
        <div className="wallet-free-banner">
          <Shield size={18} />
          <div>
            <strong>Now its Free!</strong>
            <p>Interviews aur objective exams bilkul free hain. Coin system ready hai — jab billing on hogi tab coins use honge.</p>
          </div>
        </div>
      )}

      <div className="wallet-pricing-grid">
        <div className="wallet-pricing-item">
          <Mic size={20} />
          <div>
            <p className="wp-label">Mock Interview</p>
            <p className="wp-cost">{WALLET_PRICING.INTERVIEW} coins</p>
          </div>
        </div>
        <div className="wallet-pricing-item">
          <Zap size={20} />
          <div>
            <p className="wp-label">Objective Exam</p>
            <p className="wp-cost">
              <span className="nav-free-badge" style={{ position: 'static' }}>Free</span>
            </p>
          </div>
        </div>
        <div className="wallet-pricing-item">
          <TrendingUp size={20} />
          <div>
            <p className="wp-label">Conversion Rate</p>
            <p className="wp-cost">₹1 = 1 coin</p>
          </div>
        </div>
      </div>

      <CoinPackages
        packages={config?.packages}
        billingEnabled={config?.billingEnabled}
        onPurchaseSuccess={() => refresh()}
      />

      <div className="wallet-txn-section">
        <h3>Transaction History</h3>
        <TransactionList transactions={transactions} />
      </div>
    </div>
  );
}

export default WalletPage;
