import React, { useEffect, useState, useRef } from 'react';
import { X, Bell } from 'lucide-react';
import API from "@/utils/api";

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Just now';
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) {
    const days = Math.floor(interval);
    return days === 1 ? "1 day ago" : days + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    const hours = Math.floor(interval);
    return hours === 1 ? "1 hour ago" : hours + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    const minutes = Math.floor(interval);
    return minutes === 1 ? "1 min ago" : minutes + " mins ago";
  }
  return "Just now";
};

const NotificationItem = ({ notif, onRead, onDelete }) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const draggedRef = useRef(false);

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
    draggedRef.current = false;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startXRef.current;
    setTranslateX(diff);
    if (Math.abs(diff) > 10) draggedRef.current = true;
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (Math.abs(translateX) > 60) {
      onDelete(notif.id);
    } else {
      setTranslateX(0);
    }
  };

  const handleMouseDown = (e) => {
    startXRef.current = e.clientX;
    setIsDragging(true);
    draggedRef.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const diff = e.clientX - startXRef.current;
    setTranslateX(diff);
    if (Math.abs(diff) > 10) draggedRef.current = true;
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (Math.abs(translateX) > 60) {
      onDelete(notif.id);
    } else {
      setTranslateX(0);
    }
  };

  const handleClick = (e) => {
    if (draggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onRead(notif.id);
  };

  return (
    <div
      onClick={handleClick}
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
        opacity: Math.abs(translateX) > 60 ? 0 : (notif.read ? 0.75 : 1),
        cursor: 'pointer',
        paddingLeft: '8px'
      }}
      className={`flex gap-4 pr-4 py-4 relative select-none ${notif.read ? 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5' : 'bg-blue-50/50 dark:bg-blue-500/10'}`}
    >
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-2xl select-none">
        {notif.icon}
      </div>
      <div className="flex flex-col flex-1 min-w-0 select-none justify-center pt-0.5">
        <div className="text-[14px] text-[var(--text)] leading-snug break-words pr-2">
          <span className="font-bold mr-1">{notif.title}</span>
          <span className="text-[var(--text-muted)]">{notif.message}</span>
        </div>
        <span className="text-[12px] text-blue-500 font-medium mt-1.5">
          {formatTimeAgo(notif.createdAt || notif.timestamp || notif.time)}
        </span>
      </div>
    </div>
  );
};

const NotificationModal = ({ isOpen, onClose, notifs, setNotifs }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleRead = async (id) => {
    try {
      setNotifs(notifs.map(n => n.id === id ? { ...n, read: true } : n));
      await API.put(`/users/notifications/${id}/read`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      setNotifs(notifs.filter(n => n.id !== id));
      await API.delete(`/users/notifications/${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    try {
      setNotifs([]);
      await API.delete(`/users/notifications`);
    } catch (err) {
      console.error(err);
    }
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
        className="bg-[var(--surface)] p-6 rounded-xl w-[400px] max-w-[90%] min-h-[400px] max-h-[80vh] shadow-[var(--shadow-lg)] border border-[var(--border)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8 border-b border-[var(--border)]" style={{ paddingBottom: '20px', paddingTop: '8px' }}>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center text-[var(--text)]" style={{ marginLeft: '12px' }}>
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
        <style>
          {`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}
        </style>
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden hide-scrollbar">
          {notifs.length > 0 ? (
            <div className="flex flex-col gap-2" style={{ paddingTop: '16px' }}>

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
