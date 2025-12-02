import React, { useState, useRef, useEffect } from "react";
import { useNotification } from "../../context/NotificationContext";

const NotificationBell = () => {
  const { notifications, unreadCount, markAllAsRead, clearNotifications } =
    useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    if (!isOpen) {
      markAllAsRead();
    }
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button className="bell-btn" onClick={toggleDropdown}>
        <svg
          className="icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <span>Notifications</span>
            {notifications.length > 0 && (
              <button onClick={clearNotifications} className="clear-btn">
                Clear All
              </button>
            )}
          </div>
          <div className="dropdown-body">
            {notifications.length === 0 ? (
              <div className="empty-notif">No notifications</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notif-item ${!notif.read ? "unread" : ""}`}
                >
                  <div className="notif-title">
                    {notif.type?.replace("_", " ") || "Notification"}
                  </div>
                  <div className="notif-message">{notif.message}</div>
                  <div className="notif-time">
                    {notif.timestamp
                      ? new Date(notif.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Just now"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        .notification-bell-container { position: relative; margin-right: 0.5rem; }
        .bell-btn { background: none; border: none; cursor: pointer; position: relative; color: var(--text); padding: 8px; border-radius: 50%; transition: background 0.2s; display: flex; align-items: center; }
        .bell-btn:hover { background: #F3F4F6; color: var(--primary); }
        .bell-btn .icon { width: 24px; height: 24px; }
        .badge-count { position: absolute; top: 4px; right: 4px; background: #EF4444; color: white; font-size: 0.65rem; width: 16px; height: 16px; display: flex; items-center; justify-content: center; border-radius: 50%; font-weight: 700; border: 2px solid white; }
        
        .notification-dropdown { position: absolute; top: 120%; right: -60px; width: 320px; background: white; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 2000; overflow: hidden; animation: slideDown 0.2s ease-out; }
        .dropdown-header { padding: 1rem; border-bottom: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center; font-weight: 700; background: #F9FAFB; color: var(--dark); }
        .clear-btn { background: none; border: none; color: var(--primary); font-size: 0.8rem; cursor: pointer; font-weight: 600; }
        .dropdown-body { max-height: 300px; overflow-y: auto; }
        .empty-notif { padding: 2rem; text-align: center; color: #9CA3AF; font-size: 0.9rem; }
        
        .notif-item { padding: 1rem; border-bottom: 1px solid #F3F4F6; transition: background 0.2s; text-align: left; }
        .notif-item:last-child { border-bottom: none; }
        .notif-item:hover { background: #F9FAFB; }
        .notif-item.unread { background: #EFF6FF; border-left: 3px solid var(--primary); }
        .notif-title { font-size: 0.85rem; font-weight: 700; color: var(--dark); text-transform: capitalize; margin-bottom: 0.25rem; }
        .notif-message { font-size: 0.85rem; color: var(--text); line-height: 1.4; }
        .notif-time { font-size: 0.7rem; color: #9CA3AF; margin-top: 0.5rem; text-align: right; }

        @media (max-width: 768px) {
            .notification-dropdown { right: -100px; width: 300px; }
        }

        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default NotificationBell;
