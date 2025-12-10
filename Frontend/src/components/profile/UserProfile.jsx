import React, { useState, useEffect } from "react";
import { authService } from "../../services/authService";
import { ROLE } from "../../utils/constants";
import { Link } from "react-router-dom";

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authService.getUserProfile();
      if (response.success) {
        setProfile(response.data);
      }
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="loading-wrapper">
        <div className="spinner"></div>
      </div>
    );

  if (error)
    return (
      <div className="page-container">
        <div className="alert-error">{error}</div>
      </div>
    );

  // Helper for role display text
  const getRoleLabel = (role) => {
    if (role === ROLE.ADMIN) return "Administrator";
    if (role === ROLE.DRIVER) return "Driver Account";
    return "Passenger Account";
  };

  // Helper for role badge class
  const getRoleClass = (role) => {
    if (role === ROLE.ADMIN) return "role-admin";
    if (role === ROLE.DRIVER) return "role-driver";
    return "role-passenger";
  };

  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: "900px" }}>
        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div className="header-bg"></div>
          <div className="header-content">
            <div className="profile-avatar">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-title">
              <h1>{profile.name}</h1>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className={`role-badge ${getRoleClass(profile.role)}`}>
                  {getRoleLabel(profile.role)}
                </span>

                {/* Rating Badge (Driver Only) */}
                {profile.role === ROLE.DRIVER && (
                  <span className="rating-badge">
                    <span className="star">★</span>
                    {profile.averageRating
                      ? profile.averageRating.toFixed(1)
                      : "New"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-grid">
          {/* Personal Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <svg
                  className="icon text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Personal Information
              </h3>
            </div>
            <div className="card-body info-list">
              <div className="info-item">
                <span className="label">Email Address</span>
                <span className="value">{profile.email}</span>
              </div>
              <div className="info-item">
                <span className="label">Phone Number</span>
                <span className="value">{profile.phone}</span>
              </div>
              <div className="info-item">
                <span className="label">Member Since</span>
                <span className="value">
                  {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle Info (Driver Only) */}
          {profile.role === ROLE.DRIVER && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <svg
                    className="icon text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  Vehicle Details
                </h3>
              </div>
              <div className="card-body info-list">
                <div className="info-item">
                  <span className="label">Car Model</span>
                  <span className="value">{profile.carModel}</span>
                </div>
                <div className="info-item">
                  <span className="label">License Plate</span>
                  <span className="value">{profile.licensePlate}</span>
                </div>
                <div className="info-item">
                  <span className="label">Capacity</span>
                  <span className="value">{profile.vehicleCapacity} Seats</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <svg
                  className="icon text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Quick Actions
              </h3>
            </div>
            <div className="card-body action-list">
              {profile.role === ROLE.ADMIN && (
                <>
                  <Link to="/admin/dashboard" className="action-btn">
                    <span>📊 Admin Dashboard</span>
                    <span className="arrow">→</span>
                  </Link>
                  <Link to="/admin/users" className="action-btn">
                    <span>👥 Manage Users</span>
                    <span className="arrow">→</span>
                  </Link>
                </>
              )}

              {profile.role === ROLE.DRIVER && (
                <>
                  <Link to="/driver/dashboard" className="action-btn">
                    <span>📊 View Dashboard</span>
                    <span className="arrow">→</span>
                  </Link>
                  <Link to="/driver/post-ride" className="action-btn">
                    <span>➕ Post a New Ride</span>
                    <span className="arrow">→</span>
                  </Link>
                </>
              )}

              {profile.role === ROLE.PASSENGER && (
                <>
                  <Link to="/passenger/dashboard" className="action-btn">
                    <span>📊 View Dashboard</span>
                    <span className="arrow">→</span>
                  </Link>
                  <Link to="/passenger/search-rides" className="action-btn">
                    <span>🔍 Search for Rides</span>
                    <span className="arrow">→</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .profile-header-card { background: white; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); margin-bottom: 2rem; border: 1px solid var(--border); }
        .header-bg { height: 120px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); }
        
        .header-content { 
          padding: 0 2rem 2rem; 
          position: relative; 
          display: flex; 
          align-items: flex-end; 
          gap: 1.5rem; 
          margin-top: -40px; 
        }
        
        .profile-avatar { width: 100px; height: 100px; background: white; border: 4px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 800; color: var(--primary); box-shadow: var(--shadow); flex-shrink: 0; }
        
        .profile-title { padding-top: 1rem; }
        .profile-title h1 { margin-bottom: 0.25rem; font-size: 1.75rem; line-height: 1.2; }
        
        .role-badge { font-size: 0.85rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 50px; display: inline-block; }
        .role-driver { background: #DBEAFE; color: #1E40AF; }
        .role-passenger { background: #D1FAE5; color: #065F46; }
        .role-admin { background: #FEE2E2; color: #991B1B; }
        
        .rating-badge { display: inline-flex; align-items: center; gap: 0.25rem; background: #FEF3C7; color: #D97706; font-weight: 700; padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.85rem; }
        .rating-badge .star { font-size: 1rem; }

        .profile-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
        .info-list { display: flex; flex-direction: column; }
        
        .info-item { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F3F4F6; padding: 1rem 0; gap: 1rem; }
        .info-item:last-child { border-bottom: none; }
        .info-item .label { color: #6B7280; font-size: 0.9rem; }
        .info-item .value { color: var(--dark); font-weight: 500; text-align: right; }
        
        .action-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .action-btn { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #F9FAFB; border-radius: 8px; font-weight: 500; color: var(--dark); border: 1px solid transparent; transition: all 0.2s; }
        .action-btn:hover { background: white; border-color: var(--primary); color: var(--primary); box-shadow: var(--shadow-sm); }
        .action-btn .arrow { color: #D1D5DB; }
        .action-btn:hover .arrow { color: var(--primary); }

        @media (max-width: 640px) { 
          .header-content { flex-direction: column; align-items: center; text-align: center; margin-top: -50px; }
          .profile-title { padding-top: 0.5rem; }
        }
      `}</style>
    </div>
  );
};

export default UserProfile;
