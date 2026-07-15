import React from "react";
import { ArrowDownLeft, ArrowUpRight, Gift, RotateCcw } from "lucide-react";
import "./TransactionList.css";

const TYPE_META = {
  purchase: { icon: ArrowDownLeft, label: "Purchase", className: "credit" },
  spend: { icon: ArrowUpRight, label: "Spent", className: "debit" },
  bonus: { icon: Gift, label: "Bonus", className: "credit" },
  refund: { icon: RotateCcw, label: "Refund", className: "credit" },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TransactionList({ transactions = [] }) {
  if (!transactions.length) {
    return (
      <div className="txn-empty">
        <p>No transactions yet</p>
        <span>Your coin purchase & usage history will appear here</span>
      </div>
    );
  }

  return (
    <div className="txn-list">
      {transactions.map((txn) => {
        const meta = TYPE_META[txn.type] || TYPE_META.purchase;
        const Icon = meta.icon;
        const isCredit = txn.coins > 0;

        return (
          <div key={txn._id} className="txn-item">
            <div className={`txn-icon ${meta.className}`}>
              <Icon size={16} />
            </div>
            <div className="txn-details">
              <p className="txn-desc">{txn.description}</p>
              <p className="txn-date">{formatDate(txn.createdAt)}</p>
            </div>
            <div className={`txn-amount ${isCredit ? "credit" : "debit"}`}>
              {isCredit ? "+" : ""}{txn.coins}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TransactionList;
