import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { rideService } from "../../services/rideService";
import { bookingService } from "../../services/bookingService";

const DriverDashboard = () => {
  const [rides, setRides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("rides");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ridesRes, bookingsRes] = await Promise.all([
        rideService.getDriverRides(),
        bookingService.getDriverBookings(),
      ]);

      if (ridesRes.success) setRides(ridesRes.data);
      if (bookingsRes.success) setBookings(bookingsRes.data);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "#27ae60";
      case "COMPLETED":
        return "#3498db";
      case "CANCELLED":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  if (loading)
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading your dashboard...</p>
      </div>
    );

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Driver Dashboard</h1>
          <p style={styles.subtitle}>Manage your rides and bookings</p>
        </div>
        <Link to="/driver/post-ride" style={styles.postButton}>
          + Post New Ride
        </Link>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🚗</div>
          <div>
            <div style={styles.statNumber}>{rides.length}</div>
            <div style={styles.statLabel}>Total Rides Posted</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📅</div>
          <div>
            <div style={styles.statNumber}>
              {rides.filter((r) => r.status === "ACTIVE").length}
            </div>
            <div style={styles.statLabel}>Active Rides</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div>
            <div style={styles.statNumber}>{bookings.length}</div>
            <div style={styles.statLabel}>Bookings Received</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>
          <div>
            <div style={styles.statNumber}>
              ₹
              {bookings.reduce((sum, b) => sum + b.estimatedFare, 0).toFixed(0)}
            </div>
            <div style={styles.statLabel}>Total Earnings</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab("rides")}
          style={{
            ...styles.tab,
            ...(activeTab === "rides" ? styles.activeTab : {}),
          }}
        >
          My Rides ({rides.length})
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          style={{
            ...styles.tab,
            ...(activeTab === "bookings" ? styles.activeTab : {}),
          }}
        >
          Bookings ({bookings.length})
        </button>
      </div>

      {/* Content Section */}
      <div style={styles.content}>
        {activeTab === "rides" ? (
          <div style={styles.section}>
            {rides.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🚗</div>
                <h3 style={styles.emptyTitle}>No rides posted yet</h3>
                <p style={styles.emptyText}>
                  Start by posting your first ride and connect with passengers!
                </p>
                <Link to="/driver/post-ride" style={styles.emptyButton}>
                  Post Your First Ride
                </Link>
              </div>
            ) : (
              <div style={styles.grid}>
                {rides.map((ride) => (
                  <div key={ride.id} style={styles.card}>
                    <div style={styles.cardHeader}>
                      <div>
                        <h3 style={styles.cardTitle}>
                          {ride.source} → {ride.destination}
                        </h3>
                        <p style={styles.cardSubtitle}>
                          {formatDateTime(ride.departureDateTime)}
                        </p>
                      </div>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor: getStatusColor(ride.status),
                        }}
                      >
                        {ride.status}
                      </span>
                    </div>
                    <div style={styles.cardBody}>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Available Seats:</span>
                        <span style={styles.infoValue}>
                          {ride.availableSeats} / {ride.totalSeats}
                        </span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Price:</span>
                        <span style={styles.infoValue}>
                          ₹{ride.pricePerKm}/km
                        </span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Vehicle:</span>
                        <span style={styles.infoValue}>
                          {ride.driver.carModel}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={styles.section}>
            {bookings.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📅</div>
                <h3 style={styles.emptyTitle}>No bookings yet</h3>
                <p style={styles.emptyText}>
                  Your bookings will appear here once passengers book your rides
                </p>
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Passenger</th>
                      <th style={styles.th}>Contact</th>
                      <th style={styles.th}>Route</th>
                      <th style={styles.th}>Pickup</th>
                      <th style={styles.th}>Drop</th>
                      <th style={styles.th}>Seats</th>
                      <th style={styles.th}>Fare</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.passengerInfo}>
                            <div style={styles.passengerAvatar}>
                              {booking.passenger.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{booking.passenger.name}</span>
                          </div>
                        </td>
                        <td style={styles.td}>{booking.passenger.phone}</td>
                        <td style={styles.td}>
                          <strong>{booking.ride.source}</strong> →{" "}
                          <strong>{booking.ride.destination}</strong>
                        </td>
                        <td style={styles.td}>{booking.pickupLocation}</td>
                        <td style={styles.td}>{booking.dropLocation}</td>
                        <td style={styles.td}>
                          <strong>{booking.seatsBooked}</strong>
                        </td>
                        <td style={styles.td}>
                          <strong>₹{booking.estimatedFare}</strong>
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusBadge,
                              backgroundColor: getStatusColor(booking.status),
                            }}
                          >
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
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
  header: {
    maxWidth: "1400px",
    margin: "0 auto 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
  },
  title: {
    fontSize: "2.5rem",
    color: "#2c3e50",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#7f8c8d",
    fontSize: "1.1rem",
  },
  postButton: {
    backgroundColor: "#27ae60",
    color: "white",
    padding: "14px 30px",
    borderRadius: "50px",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "1rem",
    boxShadow: "0 4px 15px rgba(39,174,96,0.3)",
    transition: "all 0.3s",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  },
  error: {
    backgroundColor: "#fee",
    color: "#c00",
    padding: "15px",
    borderRadius: "8px",
    margin: "0 auto 30px",
    maxWidth: "1400px",
    textAlign: "center",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "25px",
    maxWidth: "1400px",
    margin: "0 auto 40px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "15px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    transition: "transform 0.3s, box-shadow 0.3s",
  },
  statIcon: {
    fontSize: "3rem",
  },
  statNumber: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#2c3e50",
  },
  statLabel: {
    color: "#7f8c8d",
    fontSize: "0.95rem",
  },
  tabs: {
    maxWidth: "1400px",
    margin: "0 auto 30px",
    display: "flex",
    gap: "10px",
    borderBottom: "2px solid #e0e0e0",
  },
  tab: {
    backgroundColor: "transparent",
    border: "none",
    padding: "15px 30px",
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#7f8c8d",
    cursor: "pointer",
    borderBottom: "3px solid transparent",
    transition: "all 0.3s",
  },
  activeTab: {
    color: "#667eea",
    borderBottom: "3px solid #667eea",
  },
  content: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  section: {
    backgroundColor: "white",
    borderRadius: "15px",
    padding: "30px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyIcon: {
    fontSize: "5rem",
    marginBottom: "20px",
  },
  emptyTitle: {
    fontSize: "1.8rem",
    color: "#2c3e50",
    marginBottom: "15px",
  },
  emptyText: {
    color: "#7f8c8d",
    fontSize: "1.1rem",
    marginBottom: "30px",
  },
  emptyButton: {
    backgroundColor: "#667eea",
    color: "white",
    padding: "14px 35px",
    borderRadius: "50px",
    textDecoration: "none",
    fontWeight: "bold",
    display: "inline-block",
    boxShadow: "0 4px 15px rgba(102,126,234,0.3)",
    transition: "all 0.3s",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "25px",
  },
  card: {
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
    overflow: "hidden",
    transition: "transform 0.3s, box-shadow 0.3s",
    border: "1px solid #e0e0e0",
  },
  cardHeader: {
    padding: "20px",
    backgroundColor: "white",
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    fontSize: "1.2rem",
    color: "#2c3e50",
    marginBottom: "5px",
  },
  cardSubtitle: {
    color: "#7f8c8d",
    fontSize: "0.9rem",
  },
  badge: {
    color: "white",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "bold",
  },
  cardBody: {
    padding: "20px",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #e0e0e0",
  },
  infoLabel: {
    color: "#7f8c8d",
  },
  infoValue: {
    color: "#2c3e50",
    fontWeight: "600",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    backgroundColor: "#f8f9fa",
    padding: "15px",
    textAlign: "left",
    fontWeight: "600",
    color: "#2c3e50",
    borderBottom: "2px solid #e0e0e0",
  },
  tr: {
    borderBottom: "1px solid #e0e0e0",
    transition: "background-color 0.2s",
  },
  td: {
    padding: "15px",
    color: "#2c3e50",
  },
  passengerInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  passengerAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#667eea",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  statusBadge: {
    color: "white",
    padding: "5px 12px",
    borderRadius: "15px",
    fontSize: "0.85rem",
    fontWeight: "bold",
    display: "inline-block",
  },
};

export default DriverDashboard;
