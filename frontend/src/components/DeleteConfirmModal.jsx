import React, { useEffect } from "react";
import { Trash2, X, Loader2 } from "lucide-react";
import "@/styles/DeleteConfirmModal.css";

export default function DeleteConfirmModal({
  isOpen,
  title = "Delete Confirmation",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName = null,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="dcm-overlay"
      onClick={() => {
        if (!loading) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="dcm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="dcm-close-btn"
          onClick={() => {
            if (!loading) onClose();
          }}
          disabled={loading}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="dcm-icon-box">
          <Trash2 size={24} className="dcm-trash-icon" />
        </div>

        <div className="dcm-content">
          <h3 className="dcm-title">{title}</h3>
          <p className="dcm-desc">{description}</p>
          {itemName && (
            <div className="dcm-item-badge">
              <span className="dcm-item-text">{itemName}</span>
            </div>
          )}
        </div>

        <div className="dcm-actions">
          <button
            type="button"
            className="dcm-cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="dcm-confirm-btn"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={15} className="dcm-spinner" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={15} />
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

