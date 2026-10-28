import React, { useEffect, useState, useRef } from 'react';
import { X, Bell, Trash2 } from 'lucide-react';
import API from "@/utils/api";

export const DUMMY_NOTIFICATIONS = [];

export const getNotifIcon = (notif) => {
  if (!notif) return '🔔';
  if (notif.icon && notif.icon.length <= 4) return notif.icon;
  const t = ((notif.type || '') + ' ' + (notif.title || '')).toLowerCase();
  if (t.includes('interview') || t.includes('voice')) return '🎙️';
  if (t.includes('resume') || t.includes('ats')) return '📄';
  if (t.includes('code') || t.includes('challenge')) return '💻';
  if (t.includes('exam') || t.includes('assessment')) return '📝';
  if (t.includes('reward') || t.includes('coin') || t.includes('xp') || t.includes('wallet') || t.includes('balance') || t.includes('cashback')) return '💰';
  if (t.includes('job') || t.includes('recruiter') || t.includes('application') || t.includes('shortlist')) return '🎉';
  if (t.includes('badge') || t.includes('streak') || t.includes('milestone')) return '🏆';
  return '🔔';
};

export const getNotifIconBg = (notif) => {
  if (!notif) return '#EFF6FF';
  if (notif.iconBg) return notif.iconBg;
  const t = ((notif.type || '') + ' ' + (notif.title || '')).toLowerCase();
  if (t.includes('interview') || t.includes('voice')) return '#EAF2FE';
  if (t.includes('resume') || t.includes('ats')) return '#F0FDF4';
  if (t.includes('code') || t.includes('challenge')) return '#FEF2F2';
  if (t.includes('exam') || t.includes('assessment')) return '#FAF5FF';
  if (t.includes('reward') || t.includes('coin') || t.includes('xp') || t.includes('wallet') || t.includes('balance') || t.includes('cashback')) return '#FEF4D6';
  if (t.includes('job') || t.includes('recruiter') || t.includes('application') || t.includes('shortlist')) return '#ECFDF5';
  if (t.includes('badge') || t.includes('streak') || t.includes('milestone')) return '#FFF7ED';
  return '#EFF6FF';
};

const getTimeDisplay = (notif) => {
  if (notif.time) return notif.time;
  if (!notif.createdAt) return 'Just now';
  const seconds = Math.floor((new Date() - new Date(notif.createdAt)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
};

const isRecentTime = (timeStr) => {
  if (!timeStr) return false;
  const s = timeStr.toLowerCase();
  return s.includes('just now') || s.includes('hour') || s.includes('min') || s.includes('sec');
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

  const timeText = getTimeDisplay(notif);
  const recent = isRecentTime(timeText);
  const isUnread = !notif.read;
  const unreadBg = '#EEF4FF'; // Visible soft faded blue highlight for unread
  const readBg = '#ffffff';
  const unreadHover = '#E0ECFE';
  const readHover = '#F8FAFC';

  return (
    <div
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        transform: `translateX(${translateX}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease, background-color 0.2s ease',
        opacity: Math.abs(translateX) > 60 ? 0 : 1,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '15px 23px 15px 17px',
        borderBottom: isUnread ? '1px solid #E2EDFE' : '1px solid #F1F5F9',
        backgroundColor: isUnread ? unreadBg : readBg,
        transitionProperty: 'background-color, transform, opacity',
        userSelect: 'none',
        boxSizing: 'border-box',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        if (!isDragging) e.currentTarget.style.backgroundColor = isUnread ? unreadHover : readHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isUnread ? unreadBg : readBg;
        handleMouseUp();
      }}
    >
      {/* Unread dot indicator */}
      <div
        style={{
          width: '6px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {!notif.read ? (
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#2563EB',
              display: 'block',
            }}
          />
        ) : (
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              display: 'block',
            }}
          />
        )}
      </div>

      {/* Icon circle */}
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          backgroundColor: getNotifIconBg(notif),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          flexShrink: 0,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {getNotifIcon(notif)}
      </div>

      {/* Middle content & Time */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
          paddingTop: '1px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <h4
            className="m-0 text-[13.5px] max-[480px]:text-[11px] font-semibold text-[#0F172A] leading-[1.3] font-[Inter,sans-serif]"
          >
            {notif.title}
          </h4>
          <span
            className={`text-[11.5px] max-[480px]:text-[9px] whitespace-nowrap shrink-0 ${recent ? "text-[#2563EB] font-semibold" : "text-[#64748B] font-normal"
              } pt-[1px]`}
          >
            {timeText}
          </span>
        </div>
        <p className="mt-[3px] mb-0 text-[12px] max-[480px]:text-[10px] text-[#475569] leading-[1.4]">
          {notif.message}
        </p>
        {notif.extra && (
          <span className="mt-[2px] block text-[11.5px] max-[480px]:text-[9px] text-[#64748B]">
            {notif.extra}
          </span>
        )}
      </div>
    </div>
  );
};

// Polished Skeleton Loader for initial state while notifications arrive
const NotificationSkeleton = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      padding: '15px 23px 15px 17px',
      borderBottom: '1px solid #F1F5F9',
      boxSizing: 'border-box',
      width: '100%',
      backgroundColor: '#ffffff',
    }}
  >
    <div style={{ width: '6px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#E2E8F0', animation: 'skeletonPulse 1.4s ease-in-out infinite' }} />
    </div>

    <div
      style={{
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        backgroundColor: '#F1F5F9',
        flexShrink: 0,
        animation: 'skeletonPulse 1.4s ease-in-out infinite',
      }}
    />

    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, paddingTop: '3px', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: '130px', height: '12px', borderRadius: '4px', backgroundColor: '#F1F5F9', animation: 'skeletonPulse 1.4s ease-in-out infinite' }} />
        <div style={{ width: '50px', height: '10px', borderRadius: '4px', backgroundColor: '#F1F5F9', animation: 'skeletonPulse 1.4s ease-in-out infinite' }} />
      </div>
      <div style={{ width: '80%', height: '11px', borderRadius: '4px', backgroundColor: '#F1F5F9', animation: 'skeletonPulse 1.4s ease-in-out infinite' }} />
      <div style={{ width: '40%', height: '10px', borderRadius: '4px', backgroundColor: '#F1F5F9', animation: 'skeletonPulse 1.4s ease-in-out infinite' }} />
    </div>
  </div>
);

const PAGE_SIZE = 8;

const NotificationModal = ({ isOpen, onClose, notifs = [], setNotifs }) => {
  // Items list: strictly real notifications
  const [items, setItems] = useState(() => (Array.isArray(notifs) ? notifs : []));

  // Initial loading state while fetching real notifications
  const [initialLoading, setInitialLoading] = useState(false);

  // Lazy loading indicator state
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const listRef = useRef(null);

  // Sync if real notifs are passed from parent
  useEffect(() => {
    if (Array.isArray(notifs)) {
      setItems(notifs);
    }
  }, [notifs]);

  // When modal opens, fetch latest real notifications from API
  useEffect(() => {
    if (isOpen) {
      setInitialLoading(true);
      setIsLoadingMore(false);
      API.get("/users/notifications")
        .then((res) => {
          if (Array.isArray(res.data)) {
            const list = [...res.data].reverse();
            setItems(list);
            if (setNotifs) setNotifs(list);
          } else if (Array.isArray(notifs)) {
            setItems(notifs);
          }
        })
        .catch(() => {
          if (Array.isArray(notifs)) {
            setItems(notifs);
          }
        })
        .finally(() => {
          setInitialLoading(false);
        });
    }
  }, [isOpen]);

  const unreadCount = items.filter(n => !n.read).length;

  const handleRead = async (id) => {
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (setNotifs && Array.isArray(notifs)) {
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
    try {
      await API.put(`/users/notifications/${id}/read`).catch(() => { });
    } catch (err) { }
  };

  const handleDelete = async (id) => {
    setItems(prev => prev.filter(n => n.id !== id));
    if (setNotifs && Array.isArray(notifs)) {
      setNotifs(prev => prev.filter(n => n.id !== id));
    }
    try {
      await API.delete(`/users/notifications/${id}`).catch(() => { });
    } catch (err) { }
  };

  const handleClearAll = async () => {
    setItems([]);
    setIsLoadingMore(false);
    if (setNotifs) {
      setNotifs([]);
    }
    try {
      await API.delete(`/users/notifications`).catch(() => { });
    } catch (err) { }
  };

  const handleScroll = () => {
    // Real notifications are loaded from the backend
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.classList.add('notification-modal-open');
      window.dispatchEvent(new CustomEvent('notification-modal-toggle', { detail: { open: true } }));
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.classList.remove('notification-modal-open');
      window.dispatchEvent(new CustomEvent('notification-modal-toggle', { detail: { open: false } }));
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.classList.remove('notification-modal-open');
      window.dispatchEvent(new CustomEvent('notification-modal-toggle', { detail: { open: false } }));
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5px',
      }}
      onClick={onClose}
    >
      <div
        className="relative box-border flex h-[575px] max-h-[84vh] w-[475px] max-w-[92vw] flex-col overflow-hidden rounded-lg bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] max-[480px]:h-[80vh] max-[480px]:max-w-[96vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '13px 18px 11px 18px',
            borderBottom: '1px solid rgb(228 228 228)',
            backgroundColor: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              {/* <Bell size={18} color="#2563EB" strokeWidth={2.2} /> */}<Bell size={24} color="var(--text)" />
              {/* Sound waves ticks on top right */}
              {/* <svg
                width="8"
                height="8"
                viewBox="0 0 10 10"
                fill="none"
                style={{ position: 'absolute', top: '5px', right: '6px' }}
              >
                <path d="M2 1C4 2 5 4 5 7" stroke="#2563EB" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M6 2C7.5 3 8.5 5 8.5 7" stroke="#2563EB" strokeWidth="1.6" strokeLinecap="round" />
              </svg> */}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '16.5px',
                    fontWeight: 650,
                    color: '#0F172A',
                    letterSpacing: '-0.2px',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Notifications
                </h3>
                {!initialLoading && unreadCount > 0 && (
                  <span
                    style={{
                      backgroundColor: '#E1EDFE',
                      color: '#2563EB',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '1px 7px',
                      borderRadius: '9999px',
                    }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="mt-[1px] text-[11.5px] font-normal text-[#64748B] max-[480px]:text-[9px]">
                Stay updated with your latest activity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              color: '#64748B',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F1F5F9';
              e.currentTarget.style.color = '#0F172A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#64748B';
            }}
            aria-label="Close notifications"
          >
            <X size={17} />
          </button>
        </div>

        {/* Subheader: Top right Clear All button */}
        {!initialLoading && items.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              padding: '7px 18px 5px 18px',
              backgroundColor: '#ffffff',
            }}
          >
            <button
              onClick={handleClearAll}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 9px',
                borderRadius: '6px',
                backgroundColor: 'rgb(235, 235, 235)',
                color: '#000000',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(222, 222, 222)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(235, 235, 235)'}
              title="Clear all notifications"
            >
              <Trash2 size={12} color="#000000" />
              <span>Clear all</span>
            </button>
          </div>
        )}

        {/* Global style to completely HIDE the scrollbar across all browsers and animations */}
        <style>
          {`
            .hide-notif-scrollbar::-webkit-scrollbar {
              display: none !important;
              width: 0px !important;
              height: 0px !important;
            }
            .hide-notif-scrollbar {
              -ms-overflow-style: none !important;
              scrollbar-width: none !important;
            }
            @keyframes notifSpinner {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes skeletonPulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.38; }
            }
          `}
        </style>

        {/* Notifications List - NO visible scrollbar, loading states for all incoming notifications */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="hide-notif-scrollbar"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            backgroundColor: '#ffffff',
            paddingBottom: '16px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {initialLoading ? (
            /* Initial Loading State: Skeletons shown until notifications arrive */
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  backgroundColor: '#F8FAFC',
                  borderBottom: '1px solid #F1F5F9',
                }}
              >
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid #CBD5E1',
                    borderTopColor: '#2563EB',
                    borderRadius: '50%',
                    animation: 'notifSpinner 0.65s linear infinite',
                  }}
                />
                <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 500 }}>
                  Fetching your notifications...
                </span>
              </div>
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
            </div>
          ) : items.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {items.map(notif => (
                <NotificationItem
                  key={notif.id}
                  notif={notif}
                  onRead={handleRead}
                  onDelete={handleDelete}
                />
              ))}

              {/* Infinite scroll loading indicator */}
              {isLoadingMore && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '18px 28px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      border: '2.5px solid #E2E8F0',
                      borderTopColor: '#2563EB',
                      borderRadius: '50%',
                      animation: 'notifSpinner 0.65s linear infinite',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '13px',
                      color: '#64748B',
                      fontWeight: 500,
                    }}
                  >
                    Loading more notifications...
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                minHeight: '340px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#64748B',
                textAlign: 'center',
                padding: '50px 28px',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94A3B8',
                  marginBottom: '14px',
                }}
              >
                <Bell size={26} color="#94A3B8" />
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#0F172A',
                }}
              >
                No new notifications
              </p>
              <span
                style={{
                  marginTop: '4px',
                  fontSize: '13px',
                  color: '#64748B',
                }}
              >
                You're all caught up!
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
