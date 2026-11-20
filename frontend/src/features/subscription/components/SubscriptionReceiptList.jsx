import React, { useState } from "react";
import {
  FileText,
  CheckCircle,
  Clock,
  Sparkles,
  Eye,
  Download,
  IndianRupee,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import Pagination from "@/components/Pagination";

function formatDate(dateVal) {
  if (!dateVal) return "N/A";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function SubscriptionReceiptList({
  receipts = [],
  loading = false,
  onViewReceipt,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  if (loading) {
    return (
      <div className="txn-empty" style={{ padding: "40px 20px" }}>
        <p>Loading subscription receipts...</p>
      </div>
    );
  }

  if (!receipts.length) {
    return (
      <div className="txn-empty" style={{ padding: "40px 20px" }}>
        <FileText size={36} color="#94a3b8" style={{ marginBottom: "10px" }} />
        <p>No subscription receipts yet</p>
        <span>
          When you purchase any Pro Plan, your official tax/payment receipt will appear here for instant download or viewing.
        </span>
      </div>
    );
  }

  const paginatedReceipts = receipts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="txn-list-wrapper">
      <div className="txn-list">
        {paginatedReceipts.map((receipt) => {
          const originalPrice =
            Number(receipt.originalPrice || receipt.totalAmount) || 0;
          const walletUsed = Number(receipt.walletUsed) || 0;
          const onlinePaid = Number(receipt.onlineAmountPaid) || 0;
          const isQueued = Boolean(receipt.isQueued);

          return (
            <div
              key={receipt._id || receipt.receiptId}
              className="txn-item"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              {/* Left Info */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  minWidth: "240px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: isQueued ? "#fef3c7" : "#eff6ff",
                    color: isQueued ? "#d97706" : "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FileText size={20} />
                </div>
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "2px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: "var(--text)",
                      }}
                    >
                      {receipt.planName}
                    </p>
                    {isQueued ? (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          background: "#fef3c7",
                          color: "#b45309",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        Queued
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          background: "#dcfce7",
                          color: "#15803d",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        Paid
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      fontFamily: "monospace",
                    }}
                  >
                    {receipt.receiptId} • {formatDate(receipt.purchaseDate || receipt.createdAt)}
                  </p>
                </div>
              </div>

              {/* Middle Breakdown */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                }}
              >
                <span>
                  Plan Value:{" "}
                  <strong style={{ color: "var(--text)" }}>₹{originalPrice}</strong>
                </span>
                {walletUsed > 0 && (
                  <span style={{ color: "#16a34a" }}>
                    (Wallet: -₹{walletUsed})
                  </span>
                )}
                {onlinePaid > 0 && (
                  <span style={{ color: "#2563eb" }}>
                    (Online: ₹{onlinePaid})
                  </span>
                )}
              </div>

              {/* Right Action Button */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => onViewReceipt?.(receipt)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "var(--surface)",
                    color: "#2563eb",
                    border: "1px solid #bfdbfe",
                    padding: "6px 14px",
                    borderRadius: "6px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#eff6ff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--surface)";
                  }}
                >
                  <Eye size={14} />
                  <span>View Receipt</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={receipts.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
