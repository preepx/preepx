import React, { useState } from "react";
import { Coins, Mic, Zap, Shield, TrendingUp, Plus, X } from "lucide-react";
import notify from "@/utils/notify";
import { createOrder, verifyPayment } from "@/services/walletAPI";
import { useWallet } from "@/hooks/useWallet";
import CoinPackages from "@/components/ui/CoinPackages";
import TransactionList from "@/components/ui/TransactionList";
import { WALLET_PRICING } from "@/constants/walletConfig";
import '@/styles/WalletPage.css';

import Loader from "@/components/Loader";

function WalletPage() {
  const { balance, transactions, config, loading, refresh } = useWallet();
  const [showAddModal, setShowAddModal] = useState(false);
  const [customAmount, setCustomAmount] = useState(1);
  const [buying, setBuying] = useState(false);

  if (loading && !config) {
    return <Loader />;
  }

  const billingEnabled = config?.billingEnabled;

  const handleCustomBuy = async () => {
    if (customAmount < 1) {
      notify.error("Minimum amount is ₹1");
      return;
    }
    setBuying(true);
    try {
      const orderData = await createOrder({
        packageId: "custom",
        customAmount: Number(customAmount)
      });

      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_TIldjHmH0HwMPb",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "PreepX AI Interview",
        description: `Purchase ${Number(customAmount)} Coins`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            const verifyData = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              packageId: "custom",
              customAmount: Number(customAmount)
            });
            notify.success(verifyData.message);
            setShowAddModal(false);
            refresh();
          } catch (error) {
            notify.error(error.response?.data?.message || "Payment verification failed");
          }
        },
        prefill: {
          name: user.fullName || "PreepX User",
          email: user.email || "user@example.com",
          contact: user.phone || "",
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function () {
        notify.error("Payment failed. Please try again.");
      });
      rzp1.open();

    } catch (err) {
      notify.error(err.response?.data?.message || "Failed to initiate purchase");
    } finally {
      setBuying(false);
    }
  };

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
        {billingEnabled && (
          <button className="wallet-add-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Coins
          </button>
        )}
        {!billingEnabled && (
          <div className="wallet-free-badge">
            <Shield size={14} />
            All Free
          </div>
        )}
      </div>



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
            <p className="wp-cost">{WALLET_PRICING.OBJECTIVE_EXAM} coins</p>
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

      {/* Add Coins Modal */}
      {showAddModal && (
        <div className="wallet-modal-overlay" onClick={() => !buying && setShowAddModal(false)}>
          <div className="wallet-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="wallet-modal-close" onClick={() => setShowAddModal(false)} disabled={buying}>
              <X size={20} />
            </button>
            <div className="wallet-modal-header">
              <h3>Add Coins to Wallet</h3>
              <p>1 Rupee = 1 Coin</p>
            </div>

            <div className="wallet-modal-body">
              <label>Enter Amount (₹)</label>
              <div className="wallet-input-wrapper">
                <span className="wallet-currency-symbol">₹</span>
                <input
                  type="number"
                  min="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  disabled={buying}
                  className="wallet-amount-input"
                  autoFocus
                />
              </div>

              {customAmount < 1 ? (
                <div className="wallet-coins-error">
                  ⚠️ Minimum amount to add is ₹1
                </div>
              ) : (
                <div className="wallet-coins-preview">
                  <span style={{ fontSize: '20px' }}>🪙</span>
                  <span>You will get <strong>{customAmount} coins</strong></span>
                </div>
              )}
            </div>

            <button
              className="wallet-checkout-btn"
              onClick={handleCustomBuy}
              disabled={buying || customAmount < 1}
            >
              {buying ? "Processing..." : `Pay ₹${customAmount || 0}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WalletPage;
