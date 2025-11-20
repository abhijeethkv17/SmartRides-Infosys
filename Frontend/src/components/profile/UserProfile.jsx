import React, { useState, useEffect } from "react";
import { authService } from "../../services/authService";
import { ROLE } from "../../utils/constants";

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
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading profile...</p>
      </div>
    );

  if (error)
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
      </div>
    );

  return (
    <div style={styles.container}>
      <div style={styles.profileWrapper}>
        {/* Profile Header */}
        <div style={styles.profileHeader}>
          <div style={styles.avatarLarge}>
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div style={styles.headerInfo}>
            <h1 style={styles.name}>{profile.name}</h1>
            <div style={styles.roleBadge}>
              {profile.role === ROLE.DRIVER ? "🚗 Driver" : "👤 Passenger"}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div style={styles.profileContent}>
          {/* Personal Information Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Personal Information</h2>
              <span style={styles.cardIcon}>👤</span>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.infoRow}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Full Name</span>
                  <span style={styles.infoValue}>{profile.name}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Role</span>
                  <span style={styles.infoValue}>
                    {profile.role === ROLE.DRIVER ? "Driver" : "Passenger"}
                  </span>
                </div>
              </div>
              <div style={styles.infoRow}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Email Address</span>
                  <span style={styles.infoValue}>{profile.email}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Phone Number</span>
                  <span style={styles.infoValue}>{profile.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information Card (for Drivers) */}
          {profile.role === ROLE.DRIVER && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Vehicle Information</h2>
                <span style={styles.cardIcon}>🚗</span>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.infoRow}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Car Model</span>
                    <span style={styles.infoValue}>{profile.carModel}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>License Plate</span>
                    <span style={styles.infoValue}>{profile.licensePlate}</span>
                  </div>
                </div>
                <div style={styles.infoRow}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Vehicle Capacity</span>
                    <span style={styles.infoValue}>
                      {profile.vehicleCapacity} seats
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Details Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Account Details</h2>
              <span style={styles.cardIcon}>📊</span>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.infoRow}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Member Since</span>
                  <span style={styles.infoValue}>
                    {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Last Updated</span>
                  <span style={styles.infoValue}>
                    {new Date(profile.updatedAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <div style={styles.infoRow}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Account ID</span>
                  <span style={styles.infoValue}>#{profile.id}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Account Status</span>
                  <span style={styles.statusActive}>Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={styles.actionsCard}>
            <h3 style={styles.actionsTitle}>Quick Actions</h3>
            <div style={styles.actionsGrid}>
              {profile.role === ROLE.DRIVER ? (
                <>
                  <a href="/driver/dashboard" style={styles.actionButton}>
                    <span style={styles.actionIcon}>📊</span>
                    <span>View Dashboard</span>
                  </a>
                  <a href="/driver/post-ride" style={styles.actionButton}>
                    <span style={styles.actionIcon}>➕</span>
                    <span>Post New Ride</span>
                  </a>
                </>
              ) : (
                <>
                  <a href="/passenger/dashboard" style={styles.actionButton}>
                    <span style={styles.actionIcon}>📊</span>
                    <span>View Dashboard</span>
                  </a>
                  <a href="/passenger/search-rides" style={styles.actionButton}>
                    <span style={styles.actionIcon}>🔍</span>
                    <span>Search Rides</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "calc(100vh - 70px)",
    backgroundColor: "#f8f9fa",
    padding: "40px 20px",
  },
  loadingContainer: {
    minHeight: "calc(100vh - 70px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "20px",
    color: "#666",
    fontSize: "1.1rem",
  },
  error: {
    backgroundColor: "#fee",
    color: "#c00",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    maxWidth: "600px",
    margin: "50px auto",
  },
  profileWrapper: {
    maxWidth: "1000px",
    margin: "0 auto",
  },
  profileHeader: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "20px",
    padding: "40px",
    display: "flex",
    alignItems: "center",
    gap: "30px",
    marginBottom: "30px",
    boxShadow: "0 10px 30px rgba(102,126,234,0.3)",
  },
  avatarLarge: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    backgroundColor: "white",
    color: "#667eea",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "3rem",
    fontWeight: "bold",
    boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    color: "white",
    fontSize: "2.5rem",
    marginBottom: "10px",
  },
  roleBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "white",
    padding: "10px 20px",
    borderRadius: "30px",
    display: "inline-block",
    fontSize: "1.1rem",
    fontWeight: "600",
    backdropFilter: "blur(10px)",
  },
  profileContent: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "15px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  cardHeader: {
    padding: "25px 30px",
    borderBottom: "2px solid #f0f0f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: "1.5rem",
    color: "#2c3e50",
    margin: 0,
  },
  cardIcon: {
    fontSize: "1.8rem",
  },
  cardBody: {
    padding: "30px",
  },
  infoRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "25px",
    marginBottom: "20px",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  infoLabel: {
    color: "#7f8c8d",
    fontSize: "0.9rem",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  infoValue: {
    color: "#2c3e50",
    fontSize: "1.1rem",
    fontWeight: "600",
  },
  statusActive: {
    color: "#27ae60",
    fontSize: "1.1rem",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  actionsCard: {
    backgroundColor: "white",
    borderRadius: "15px",
    padding: "30px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  actionsTitle: {
    fontSize: "1.3rem",
    color: "#2c3e50",
    marginBottom: "20px",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
  },
  actionButton: {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "10px",
    textDecoration: "none",
    color: "#2c3e50",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    fontWeight: "600",
    transition: "all 0.3s",
    border: "2px solid transparent",
  },
  actionIcon: {
    fontSize: "1.5rem",
  },
};

export default UserProfile;
