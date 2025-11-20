import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { bookingService } from "../../services/bookingService";

const PassengerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingService.getPassengerBookings();
      if (response.success) {
        setBookings(response.data);
      }
    } catch (err) {
      setError("Failed to load bookings");
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
      case "CONFIRMED":
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
        <p style={styles.loadingText}>Loading your bookings...</p>
      </div>
    );

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Passenger Dashboard</h1>
          <p style={styles.subtitle}>View and manage your ride bookings</p>
        </div>
        <Link to="/passenger/search-rides" style={styles.searchButton}>
          🔍 Search Rides
        </Link>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🎫</div>
          <div>
            <div style={styles.statNumber}>{bookings.length}</div>
            <div style={styles.statLabel}>Total Bookings</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div>
            <div style={styles.statNumber}>
              {bookings.filter((b) => b.status === "CONFIRMED").length}
            </div>
            <div style={styles.statLabel}>Confirmed Rides</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>
          <div>
            <div style={styles.statNumber}>
              ₹
              {bookings.reduce((sum, b) => sum + b.estimatedFare, 0).toFixed(0)}
            </div>
            <div style={styles.statLabel}>Total Spent</div>
          </div>
        </div>
      </div>

      {/* Bookings Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>My Bookings</h2>
        {bookings.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🎫</div>
            <h3 style={styles.emptyTitle}>No bookings yet</h3>
            <p style={styles.emptyText}>
              Start your journey by searching and booking available rides
            </p>
            <Link to="/passenger/search-rides" style={styles.emptyButton}>
              Search for Rides
            </Link>
          </div>
        ) : (
          <div style={styles.bookingsGrid}>
            {bookings.map((booking) => (
              <div key={booking.id} style={styles.bookingCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.routeInfo}>
                    <h3 style={styles.route}>
                      {booking.ride.source} → {booking.ride.destination}
                    </h3>
                    <p style={styles.dateTime}>
                      📅 {formatDateTime(booking.ride.departureDateTime)}
                    </p>
                  </div>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(booking.status),
                    }}
                  >
                    {booking.status}
                  </span>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.driverSection}>
                    <div style={styles.driverAvatar}>
                      {booking.ride.driver.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.driverInfo}>
                      <div style={styles.driverName}>
                        {booking.ride.driver.name}
                      </div>
                      <div style={styles.vehicleInfo}>
                        🚗 {booking.ride.driver.carModel}
                      </div>
                    </div>
                  </div>

                  <div style={styles.detailsGrid}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>📍 Pickup</span>
                      <span style={styles.detailValue}>
                        {booking.pickupLocation}
                      </span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>📍 Drop</span>
                      <span style={styles.detailValue}>
                        {booking.dropLocation}
                      </span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>👥 Seats Booked</span>
                      <span style={styles.detailValue}>
                        {booking.seatsBooked}
                      </span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>💰 Fare</span>
                      <span style={styles.fareValue}>
                        ₹{booking.estimatedFare}
                      </span>
                    </div>
                  </div>

                  <div style={styles.bookingFooter}>
                    <span style={styles.bookingTime}>
                      Booked on {formatDateTime(booking.bookingTime)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
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
  searchButton: {
    backgroundColor: "#3498db",
    color: "white",
    padding: "14px 30px",
    borderRadius: "50px",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "1rem",
    boxShadow: "0 4px 15px rgba(52,152,219,0.3)",
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
  section: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  sectionTitle: {
    fontSize: "1.8rem",
    color: "#2c3e50",
    marginBottom: "25px",
  },
  emptyState: {
    backgroundColor: "white",
    borderRadius: "15px",
    padding: "80px 40px",
    textAlign: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
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
    lineHeight: 1.6,
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
  bookingsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "25px",
  },
  bookingCard: {
    backgroundColor: "white",
    borderRadius: "15px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    transition: "transform 0.3s, box-shadow 0.3s",
  },
  cardHeader: {
    padding: "20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  routeInfo: {
    flex: 1,
  },
  route: {
    fontSize: "1.3rem",
    marginBottom: "8px",
    fontWeight: "bold",
  },
  dateTime: {
    opacity: 0.95,
    fontSize: "0.95rem",
  },
  statusBadge: {
    color: "white",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  cardBody: {
    padding: "25px",
  },
  driverSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "10px",
  },
  driverAvatar: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    backgroundColor: "#667eea",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: "5px",
  },
  vehicleInfo: {
    color: "#7f8c8d",
    fontSize: "0.95rem",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px",
    marginBottom: "20px",
  },
  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  detailLabel: {
    color: "#7f8c8d",
    fontSize: "0.9rem",
  },
  detailValue: {
    color: "#2c3e50",
    fontWeight: "600",
  },
  fareValue: {
    color: "#27ae60",
    fontWeight: "bold",
    fontSize: "1.2rem",
  },
  bookingFooter: {
    paddingTop: "15px",
    borderTop: "1px solid #e0e0e0",
  },
  bookingTime: {
    color: "#95a5a6",
    fontSize: "0.85rem",
  },
};

export default PassengerDashboard;
