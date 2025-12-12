import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../services/adminService";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      setError("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Platform overview and management</p>
          </div>
          <div className="header-actions">
            <button onClick={fetchStats} className="btn btn-secondary">
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Top Level: Quick Stats Grid */}
        <div className="stats-grid-admin">
          {/* Users Stats */}
          <div className="stat-card-admin">
            <div className="stat-icon" style={{ background: "#DBEAFE" }}>
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="#2563EB"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
              <div className="stat-detail">
                {stats.totalDrivers} Drivers • {stats.totalPassengers}{" "}
                Passengers
              </div>
            </div>
          </div>

          {/* Rides Stats */}
          <div className="stat-card-admin">
            <div className="stat-icon" style={{ background: "#D1FAE5" }}>
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="#10B981"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.totalRides}</h3>
              <p>Total Rides</p>
              <div className="stat-detail">
                {stats.activeRides} Active • {stats.completedRides} Completed
              </div>
            </div>
          </div>

          {/* Bookings Stats */}
          <div className="stat-card-admin">
            <div className="stat-icon" style={{ background: "#FEF3C7" }}>
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="#F59E0B"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.totalBookings}</h3>
              <p>Total Bookings</p>
              <div className="stat-detail">
                {stats.confirmedBookings} Confirmed • {stats.completedBookings}{" "}
                Completed
              </div>
            </div>
          </div>

          {/* Revenue Stats */}
          <div className="stat-card-admin">
            <div className="stat-icon" style={{ background: "#E0E7FF" }}>
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="#6366F1"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="stat-content">
              <h3>{formatCurrency(stats.totalRevenue)}</h3>
              <p>Total Revenue</p>
              <div className="stat-detail">
                Commission: {formatCurrency(stats.platformCommission)}
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Split Layout */}
        <div className="dashboard-split">
          {/* Left Column: Today's Activity */}
          <div className="activity-section">
            <h2>Today's Activity</h2>
            <div className="activity-grid">
              <div className="activity-card">
                <div className="activity-icon">🚗</div>
                <div className="activity-value">{stats.ridesToday}</div>
                <div className="activity-label">Rides Posted</div>
              </div>
              <div className="activity-card">
                <div className="activity-icon">📋</div>
                <div className="activity-value">{stats.bookingsToday}</div>
                <div className="activity-label">Bookings Made</div>
              </div>
              <div className="activity-card">
                <div className="activity-icon">💰</div>
                <div className="activity-value">
                  {formatCurrency(stats.revenueToday || 0)}
                </div>
                <div className="activity-label">Revenue Generated</div>
              </div>
              <div className="activity-card">
                <div className="activity-icon">👥</div>
                <div className="activity-value">{stats.activeUsersToday}</div>
                <div className="activity-label">Active Users</div>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Actions / Management */}
          <div className="quick-actions">
            <h2>Management</h2>
            <div className="actions-grid">
              <Link to="/admin/users" className="action-card">
                <div className="action-icon" style={{ background: "#DBEAFE" }}>
                  <svg
                    width="32"
                    height="32"
                    fill="none"
                    stroke="#2563EB"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3>User Management</h3>
                <p>Manage users, drivers, and passengers</p>
              </Link>

              <Link to="/admin/rides" className="action-card">
                <div className="action-icon" style={{ background: "#D1FAE5" }}>
                  <svg
                    width="32"
                    height="32"
                    fill="none"
                    stroke="#10B981"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
                <h3>Ride Management</h3>
                <p>Monitor and manage all rides</p>
              </Link>

              <Link to="/admin/bookings" className="action-card">
                <div className="action-icon" style={{ background: "#FEF3C7" }}>
                  <svg
                    width="32"
                    height="32"
                    fill="none"
                    stroke="#F59E0B"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3>Booking Management</h3>
                <p>View and manage all bookings</p>
              </Link>

              <Link to="/admin/payments" className="action-card">
                <div className="action-icon" style={{ background: "#E0E7FF" }}>
                  <svg
                    width="32"
                    height="32"
                    fill="none"
                    stroke="#6366F1"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3>Payment Oversight</h3>
                <p>Track all transactions and revenue</p>
              </Link>

              <Link to="/admin/reports" className="action-card">
                <div className="action-icon" style={{ background: "#FEE2E2" }}>
                  <svg
                    width="32"
                    height="32"
                    fill="none"
                    stroke="#EF4444"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3>Reports & Analytics</h3>
                <p>Generate comprehensive reports</p>
              </Link>

              <Link to="/admin/activity" className="action-card">
                <div className="action-icon" style={{ background: "#FAE8FF" }}>
                  <svg
                    width="32"
                    height="32"
                    fill="none"
                    stroke="#A855F7"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3>Activity Logs</h3>
                <p>View recent platform activity</p>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .admin-header h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        .admin-header p {
          color: #6B7280;
          font-size: 0.95rem;
        }
        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .stats-grid-admin {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card-admin {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          display: flex;
          gap: 1rem;
          transition: transform 0.2s;
        }
        .stat-card-admin:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-content h3 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        .stat-content p {
          color: #6B7280;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }
        .stat-detail {
          font-size: 0.75rem;
          color: #9CA3AF;
        }

        /* NEW: Split Layout for Activity and Actions */
        .dashboard-split {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 2rem;
          align-items: start;
        }

        .activity-section h2, .quick-actions h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .activity-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .activity-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #E5E7EB;
          text-align: center;
        }
        .activity-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        .activity-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1F2937;
          margin-bottom: 0.25rem;
        }
        .activity-label {
          font-size: 0.875rem;
          color: #6B7280;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1.5rem;
        }

        .action-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: all 0.3s;
          cursor: pointer;
          display: block;
          height: 100%;
        }
        .action-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px rgba(0,0,0,0.1);
          border-color: currentColor;
        }

        .action-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .action-card h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #1F2937;
        }
        .action-card p {
          color: #6B7280;
          font-size: 0.875rem;
        }

        @media (max-width: 1024px) {
          .dashboard-split {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .admin-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .stats-grid-admin {
            grid-template-columns: 1fr;
          }
          .activity-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
