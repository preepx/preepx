import React, { useState } from "react";
import { IndianRupee, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { purchaseCoins } from "../services/walletAPI";
import { DEFAULT_PACKAGES } from "../constants/walletConfig";
import "./CoinPackages.css";

function CoinPackages({ packages = DEFAULT_PACKAGES, mockPurchaseAllowed, onPurchaseSuccess }) {
  const [buying, setBuying] = useState(null);

  const handleBuy = async (pack) => {
    if (!mockPurchaseAllowed) {
      toast.info("**Payment gateway is coming soon! For now, all interviews are free.**");
      return;
    }

    setBuying(pack.id);
    try {
      const result = await purchaseCoins({ packageId: pack.id });
      toast.success(result.message);
      onPurchaseSuccess?.(result);
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === "PAYMENT_NOT_READY") {
        toast.info("Payment gateway jald integrate hoga. Abhi sab free hai!");
      } else {
        toast.error(err.response?.data?.message || "Purchase failed");
      }
    } finally {
      setBuying(null);
    }
  };

  return (
    <div className="coin-packages">
      <div className="coin-packages-header">
        <h3>Buy Coins</h3>
        <p>₹1 = 1 coin · Interview: 2 coins · Objective Exam: 1 coin</p>
      </div>

      {!mockPurchaseAllowed && (
        <div className="coin-packages-notice">
          <Sparkles size={16} />
          <span>Payment coming soon — all interviews & exams are <strong>free</strong> right now!</span>
        </div>
      )}

      <div className="coin-packages-grid">
        {packages.map((pack) => (
          <div key={pack.id} className={`coin-pack ${pack.popular ? "popular" : ""}`}>
            {pack.popular && <span className="coin-pack-tag">Popular</span>}
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
              {buying === pack.id ? "Processing…" : mockPurchaseAllowed ? "Buy Now" : "Coming Soon"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CoinPackages;
