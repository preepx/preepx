import React, { useState } from "react";
import { IndianRupee, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { createOrder, verifyPayment } from "../services/walletAPI";
import { DEFAULT_PACKAGES } from "../constants/walletConfig";
import "./CoinPackages.css";

function CoinPackages({ packages = DEFAULT_PACKAGES, billingEnabled, onPurchaseSuccess }) {
  const [buying, setBuying] = useState(null);
  const [activePack, setActivePack] = useState(packages.find(p => p.popular)?.id || packages[0]?.id);

  const handleBuy = async (pack) => {
    setBuying(pack.id);
    try {
      // 1. Create Order
      const orderData = await createOrder({
        packageId: pack.id
      });

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_THRv3G1OfdhIob", // Fallback for testing
        amount: orderData.amount,
        currency: orderData.currency,
        name: "PreepX AI Interview",
        description: `Purchase ${pack.coins} Coins`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyData = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              packageId: pack.id
            });
            toast.success(verifyData.message);
            onPurchaseSuccess?.(verifyData);
          } catch (error) {
            toast.error(error.response?.data?.message || "Payment verification failed");
          }
        },
        prefill: {
          name: "PreepX User",
          email: "user@example.com",
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        toast.error("Payment failed. Please try again.");
      });
      rzp1.open();

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initiate purchase");
    } finally {
      setBuying(null);
    }
  };

  return (
    <div className="coin-packages">
      <div className="coin-packages-header">
        <h3>Buy Coins</h3>
        <p>₹1 = ~1 coin · AI Interview requires coins</p>
      </div>

      {!billingEnabled && (
        <div className="coin-packages-notice">
          <Sparkles size={16} />
          <span>Billing is currently disabled in test mode. Payments may not process.</span>
        </div>
      )}

      <div className="coin-packages-grid">
        {packages.map((pack) => (
          <div
            key={pack.id}
            className={`coin-pack ${activePack === pack.id ? "popular" : ""}`}
            onClick={() => setActivePack(pack.id)}
            style={{ cursor: 'pointer' }}
          >
            {activePack === pack.id && <span className="coin-pack-tag">{pack.label}</span>}
            <p className="coin-pack-label">{pack.label}</p>
            <p className="coin-pack-coins">{pack.coins} <span>coins</span></p>
            <p className="coin-pack-price">
              <IndianRupee size={14} />
              {pack.rupees}
            </p>
            <button
              className="coin-pack-btn"
              onClick={() => handleBuy(pack)}
              disabled={buying === pack.id}
            >
              {buying === pack.id ? "Processing…" : "Buy Now"}
            </button>
          </div>
        ))}

      </div>
    </div>
  );
}

export default CoinPackages;
