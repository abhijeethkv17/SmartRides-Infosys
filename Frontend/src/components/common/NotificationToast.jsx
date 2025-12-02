import React, { useEffect } from "react";

const NotificationToast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto dismiss after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast-container">
      <div className="toast-content">
        <div className="toast-icon">🔔</div>
        <div>
          <h4 className="toast-title">{message.type.replace("_", " ")}</h4>
          <p className="toast-body">{message.message}</p>
        </div>
        <button onClick={onClose} className="toast-close">
          ×
        </button>
      </div>
      <style>{`
        .toast-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          animation: slideIn 0.3s ease-out;
        }
        .toast-content {
          background: white;
          border-left: 4px solid #2563eb;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border-radius: 4px;
          padding: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          min-width: 300px;
          max-width: 400px;
        }
        .toast-icon { font-size: 1.2rem; }
        .toast-title { margin: 0 0 4px 0; font-size: 0.9rem; font-weight: 700; color: #1f2937; text-transform: capitalize; }
        .toast-body { margin: 0; font-size: 0.85rem; color: #4b5563; }
        .toast-close {
          background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #9ca3af; margin-left: auto;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;
