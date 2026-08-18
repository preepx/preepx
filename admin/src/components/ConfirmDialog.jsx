/**
 * components/ConfirmDialog.jsx — Reusable destructive action confirmation modal
 */
export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-surface-1 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-slide-up">
        {/* Icon */}
        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-red-400">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h3 className="text-base font-semibold text-zinc-100 mb-1">{title}</h3>
        <p className="text-sm text-zinc-400 mb-6">{message}</p>

        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading} className="btn btn-secondary flex-1">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="btn btn-danger flex-1">
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
