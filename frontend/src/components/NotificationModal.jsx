import React, { useEffect } from 'react';
import { X, Bell } from 'lucide-react';

const NotificationModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex justify-center items-center"
    >
      <div 
        className="bg-[var(--surface)] p-6 rounded-xl w-[400px] max-w-[90%] min-h-[400px] max-h-[80vh] overflow-y-auto shadow-[var(--shadow-lg)] border border-[var(--border)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <img src="/icons/notification.png" alt="Notifications" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
            </div>
            <h3 className="m-0 text-[var(--text)] text-xl font-bold tracking-tight">Notifications</h3>
          </div>
          <button 
            onClick={onClose} 
            className="bg-transparent border-none text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer p-2 flex rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Close notifications"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 flex justify-center items-center text-[var(--text-muted)] text-center py-8">
          No new notifications
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
