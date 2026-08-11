import React, { useEffect, useState, useRef } from 'react';
import { X, Bell } from 'lucide-react';

const NotificationItem = ({ notif, onRead, onDelete }) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startXRef.current;
    setTranslateX(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (Math.abs(translateX) > 100) {
      onDelete(notif.id);
    } else {
      setTranslateX(0);
    }
  };

  const handleMouseDown = (e) => {
    startXRef.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const diff = e.clientX - startXRef.current;
    setTranslateX(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (Math.abs(translateX) > 100) {
      onDelete(notif.id);
    } else {
      setTranslateX(0);
    }
  };

  return (
    <div
      onClick={() => onRead(notif.id)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        transform: `translateX(${translateX}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease',
        opacity: notif.read ? 0.5 : 1,
        cursor: 'pointer'
      }}
      className="flex gap-4 p-4 rounded-lg bg-black/5 dark:bg-white/5 border border-[var(--border)] relative"
    >
      <div className="text-2xl select-none">{notif.icon}</div>
      <div className="flex flex-col flex-1 min-w-0 select-none">
        <div className="flex justify-between items-start gap-2">
          <span className="font-semibold text-[15px] text-[var(--text)] truncate">{notif.title}</span>
          <span className="text-[11px] text-[var(--text-muted)] whitespace-nowrap flex-shrink-0 mt-0.5" style={{ marginRight: '16px' }}>{notif.time}</span>
        </div>
        <span className="text-[13px] text-[var(--text-muted)] mt-2 leading-relaxed break-words">{notif.message}</span>
      </div>
    </div>
  );
};

const NotificationModal = ({ isOpen, onClose, notifs, setNotifs }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleRead = (id) => {
    setNotifs(notifs.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDelete = (id) => {
    setNotifs(notifs.filter(n => n.id !== id));
  };
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
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
        <div className="flex justify-between items-center mb-8 border-b border-[var(--border)]" style={{ paddingBottom: '20px', paddingTop: '8px' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center text-[var(--text)]">
              <Bell size={24} />
            </div>
            <h3 className="m-0 text-[var(--text)] text-xl font-bold tracking-tight">Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer p-2 flex rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            style={{ marginRight: '8px' }}
            aria-label="Close notifications"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
          {notifs.length > 0 ? (
            <div className="flex flex-col gap-3">
              {notifs.map(notif => (
                <NotificationItem
                  key={notif.id}
                  notif={notif}
                  onRead={handleRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex justify-center items-center text-[var(--text-muted)] text-center py-8">
              No new notifications
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
