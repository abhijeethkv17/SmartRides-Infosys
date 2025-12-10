import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: "",
    search: "",
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllUsers(
        filters.role || null,
        null,
        filters.search || null
      );
      if (response.success) {
        setUsers(response.data);
      }
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to toggle this user's block status?"
      )
    ) {
      try {
        const response = await adminService.toggleUserBlock(userId);
        if (response.success) {
          fetchUsers();
          alert("User status updated successfully");
        }
      } catch (err) {
        alert(err.response?.data?.message || "Failed to update user status");
      }
    }
  };

  const handleVerifyDriver = async (userId) => {
    if (window.confirm("Verify this driver?")) {
      try {
        const response = await adminService.verifyDriver(userId);
        if (response.success) {
          fetchUsers();
          alert("Driver verified successfully");
        }
      } catch (err) {
        alert(err.response?.data?.message || "Failed to verify driver");
      }
    }
  };

  const viewUserDetails = async (user) => {
    try {
      const response = await adminService.getUserDetails(user.id);
      if (response.success) {
        setSelectedUser(response.data);
        setShowDetails(true);
      }
    } catch (err) {
      alert("Failed to load user details");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="loading-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>User Management</h1>
            <p>Manage all users, drivers, and passengers</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="card-body">
            <div className="filters-grid">
              <div className="form-group">
                <label className="form-label">Search Users</label>
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Filter by Role</label>
                <select
                  value={filters.role}
                  onChange={(e) =>
                    setFilters({ ...filters, role: e.target.value })
                  }
                  className="form-select"
                >
                  <option value="">All Roles</option>
                  <option value="DRIVER">Drivers</option>
                  <option value="PASSENGER">Passengers</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Contact</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar-sm">{user.name.charAt(0)}</div>
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        user.role === "DRIVER"
                          ? "badge-primary"
                          : "badge-secondary"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>{user.phone}</td>
                  <td>
                    <div className="rating-display">
                      <span className="star">★</span>
                      {user.averageRating > 0
                        ? user.averageRating.toFixed(1)
                        : "N/A"}
                    </div>
                  </td>
                  <td>
                    <div className="status-badges">
                      {user.blocked ? (
                        <span className="badge badge-danger">Blocked</span>
                      ) : (
                        <span className="badge badge-success">Active</span>
                      )}
                      {user.role === "DRIVER" && user.verified && (
                        <span className="badge badge-verified">✓ Verified</span>
                      )}
                    </div>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => viewUserDetails(user)}
                        className="btn-icon"
                        title="View Details"
                      >
                        <svg
                          width="18"
                          height="18"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      {user.role === "DRIVER" && !user.verified && (
                        <button
                          onClick={() => handleVerifyDriver(user.id)}
                          className="btn-icon text-success"
                          title="Verify Driver"
                        >
                          <svg
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleBlock(user.id)}
                        className={`btn-icon ${
                          user.blocked ? "text-success" : "text-danger"
                        }`}
                        title={user.blocked ? "Unblock User" : "Block User"}
                      >
                        <svg
                          width="18"
                          height="18"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d={
                              user.blocked
                                ? "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                                : "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            }
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User Details Modal */}
        {showDetails && selectedUser && (
          <div className="modal-overlay" onClick={() => setShowDetails(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>User Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="close-btn"
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                {/* User Info */}
                <div className="detail-section">
                  <h4>Personal Information</h4>
                  <div className="detail-grid">
                    <div>
                      <label>Name</label>
                      <p>{selectedUser.user.name}</p>
                    </div>
                    <div>
                      <label>Email</label>
                      <p>{selectedUser.user.email}</p>
                    </div>
                    <div>
                      <label>Phone</label>
                      <p>{selectedUser.user.phone}</p>
                    </div>
                    <div>
                      <label>Role</label>
                      <p>{selectedUser.user.role}</p>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="detail-section">
                  <h4>Statistics</h4>
                  <div className="stats-mini-grid">
                    <div className="stat-mini">
                      <span>Rating</span>
                      <strong>
                        {selectedUser.averageRating > 0
                          ? selectedUser.averageRating.toFixed(1)
                          : "N/A"}
                      </strong>
                    </div>
                    <div className="stat-mini">
                      <span>
                        {selectedUser.user.role === "DRIVER"
                          ? "Total Rides"
                          : "Bookings"}
                      </span>
                      <strong>
                        {selectedUser.user.role === "DRIVER"
                          ? selectedUser.totalRides
                          : selectedUser.totalBookings}
                      </strong>
                    </div>
                    <div className="stat-mini">
                      <span>
                        {selectedUser.user.role === "DRIVER"
                          ? "Earnings"
                          : "Spent"}
                      </span>
                      <strong>
                        ₹
                        {selectedUser.user.role === "DRIVER"
                          ? selectedUser.totalEarnings
                          : selectedUser.totalSpent}
                      </strong>
                    </div>
                    <div className="stat-mini">
                      <span>Reviews</span>
                      <strong>{selectedUser.totalReviews}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .page-header {
          margin-bottom: 2rem;
        }
        .page-header h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        .page-header p {
          color: #6B7280;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1rem;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .avatar-sm {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .rating-display {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .rating-display .star {
          color: #F59E0B;
        }

        .status-badges {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .badge-primary {
          background: #DBEAFE;
          color: #1E40AF;
        }
        .badge-secondary {
          background: #D1FAE5;
          color: #065F46;
        }
        .badge-success {
          background: #D1FAE5;
          color: #065F46;
        }
        .badge-danger {
          background: #FEE2E2;
          color: #991B1B;
        }
        .badge-verified {
          background: #E0E7FF;
          color: #4338CA;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }
        .btn-icon {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          transition: transform 0.2s;
          color: #6B7280;
        }
        .btn-icon:hover {
          transform: scale(1.1);
        }
        .text-success {
          color: #10B981;
        }
        .text-danger {
          color: #EF4444;
        }

        .detail-section {
          margin-bottom: 2rem;
        }
        .detail-section h4 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #374151;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .detail-grid label {
          display: block;
          font-size: 0.75rem;
          color: #6B7280;
          margin-bottom: 0.25rem;
          text-transform: uppercase;
          font-weight: 600;
        }
        .detail-grid p {
          font-size: 0.95rem;
          color: #1F2937;
        }

        .stats-mini-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        .stat-mini {
          background: #F9FAFB;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
        }
        .stat-mini span {
          display: block;
          font-size: 0.75rem;
          color: #6B7280;
          margin-bottom: 0.5rem;
        }
        .stat-mini strong {
          display: block;
          font-size: 1.5rem;
          color: #1F2937;
        }

        @media (max-width: 768px) {
          .filters-grid {
            grid-template-columns: 1fr;
          }
          .detail-grid {
            grid-template-columns: 1fr;
          }
          .stats-mini-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
