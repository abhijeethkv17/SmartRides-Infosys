import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await adminService.getActivityLogs(0, 50);
      if (response.success) {
        setLogs(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1>Activity Logs</h1>
          <p>Recent system events and actions</p>
        </div>

        <div className="card">
          <div className="list-group">
            {logs.map((log, index) => (
              <div key={index} className="log-item">
                <div className="log-icon">
                  {log.type.includes("RIDE") ? "🚗" : "📝"}
                </div>
                <div className="log-content">
                  <div className="log-header">
                    <span className="log-type">
                      {log.type.replace(/_/g, " ")}
                    </span>
                    <span className="log-time">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="log-details">
                    <strong>{log.user}</strong> - {log.details}
                  </p>
                </div>
              </div>
            ))}
            {logs.length === 0 && !loading && (
              <div className="p-4 text-center text-gray-500">
                No recent activity found.
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .log-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid #E5E7EB;
        }
        .log-item:last-child { border-bottom: none; }
        .log-icon {
          width: 40px;
          height: 40px;
          background: #F3F4F6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }
        .log-content { flex: 1; }
        .log-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.25rem;
        }
        .log-type {
          font-weight: 600;
          font-size: 0.875rem;
          color: #374151;
        }
        .log-time {
          font-size: 0.75rem;
          color: #9CA3AF;
        }
        .log-details {
          font-size: 0.95rem;
          color: #4B5563;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default ActivityLogs;
