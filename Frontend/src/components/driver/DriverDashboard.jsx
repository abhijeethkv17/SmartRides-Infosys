import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { rideService } from "../../services/rideService";
import { bookingService } from "../../services/bookingService";

const DriverDashboard = () => {
  const [rides, setRides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("rides");
  const navigate = useNavigate();

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

  const handleDeleteRide = async (rideId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this ride? This action cannot be undone."
      )
    ) {
      try {
        const response = await rideService.deleteRide(rideId);
        if (response.success) {
          setRides(rides.filter((ride) => ride.id !== rideId));
          alert("Ride deleted successfully");
        } else {
          alert(response.message || "Failed to delete ride");
        }
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete ride");
      }
    }
  };

  const handleCompleteRide = async (rideId) => {
    if (window.confirm("Mark this ride as completed?")) {
      try {
        const response = await rideService.completeRide(rideId);
        if (response.success) {
          // Update the ride status in the local state
          setRides(
            rides.map((ride) =>
              ride.id === rideId ? { ...ride, status: "COMPLETED" } : ride
            )
          );
          alert("Ride marked as completed!");
        } else {
          alert(response.message || "Failed to complete ride");
        }
      } catch (err) {
        alert(err.response?.data?.message || "Failed to complete ride");
      }
    }
  };

  const handleCancelRide = async (rideId) => {
    if (
      window.confirm(
        "Are you sure you want to cancel this ride? Passengers will be notified."
      )
    ) {
      try {
        const response = await rideService.cancelRide(rideId);
        if (response.success) {
          setRides(
            rides.map((ride) =>
              ride.id === rideId ? { ...ride, status: "CANCELLED" } : ride
            )
          );
          alert("Ride cancelled successfully");
        } else {
          alert(response.message || "Failed to cancel ride");
        }
      } catch (err) {
        alert(err.response?.data?.message || "Failed to cancel ride");
      }
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case "ACTIVE":
        return "badge badge-active";
      case "CONFIRMED":
        return "badge badge-confirmed";
      case "COMPLETED":
        return "badge badge-completed";
      case "CANCELLED":
        return "badge badge-cancelled";
      default:
        return "badge";
    }
  };

  const isRideInPast = (departureDateTime) => {
    return new Date(departureDateTime) < new Date();
  };

  if (loading)
    return (
      <div className="loading-wrapper">
        <div className="spinner"></div>
      </div>
    );

  return (
    <div className="page-container">
      <div className="container">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl mb-1">Driver Dashboard</h1>
            <p className="text-gray-500 text-sm">
              Welcome back, here is your overview.
            </p>
          </div>
          <Link to="/driver/post-ride" className="btn btn-primary">
            <svg
              className="icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Post New Ride
          </Link>
        </div>

        {error && <div className="alert-error mb-4">{error}</div>}

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"
                />
              </svg>
            </div>
            <div className="stat-content">
              <h3>{rides.length}</h3>
              <p>Total Rides</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="stat-content">
              <h3>{rides.filter((r) => r.status === "ACTIVE").length}</h3>
              <p>Active Rides</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="stat-content">
              <h3>{bookings.length}</h3>
              <p>Bookings</p>
            </div>
          </div>

          {/* UPDATED: Made Earnings card clickable to view Transaction History */}
          <div
            className="stat-card clickable-card"
            onClick={() => navigate("/payments/history")}
            title="View Transaction History"
          >
            <div
              className="stat-icon-wrapper"
              style={{ color: "var(--secondary)" }}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="stat-content">
              <h3>
                ₹
                {bookings
                  .reduce((sum, b) => sum + b.estimatedFare, 0)
                  .toFixed(0)}
              </h3>
              <p>Earnings &rarr;</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            onClick={() => setActiveTab("rides")}
            className={`tab-btn ${activeTab === "rides" ? "active" : ""}`}
          >
            My Rides
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`tab-btn ${activeTab === "bookings" ? "active" : ""}`}
          >
            Bookings
          </button>
        </div>

        {/* Content */}
        <div className="mt-4">
          {activeTab === "rides" ? (
            rides.length === 0 ? (
              <div className="empty-state">
                <p>No rides posted yet.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Route</th>
                      <th>Departure</th>
                      <th>Stats</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rides.map((ride) => (
                      <tr key={ride.id}>
                        <td>
                          <div className="font-semibold">{ride.source}</div>
                          <div className="text-sm text-gray-400">
                            to {ride.destination}
                          </div>
                        </td>
                        <td>{formatDateTime(ride.departureDateTime)}</td>
                        <td>
                          {ride.availableSeats} / {ride.totalSeats} seats
                        </td>
                        <td className="font-semibold">₹{ride.pricePerKm}/km</td>
                        <td>
                          <span className={getBadgeClass(ride.status)}>
                            {ride.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div className="flex gap-2 justify-end">
                            {ride.status === "ACTIVE" && (
                              <>
                                {/* Show Complete button if ride time has passed */}
                                {isRideInPast(ride.departureDateTime) && (
                                  <button
                                    onClick={() => handleCompleteRide(ride.id)}
                                    className="btn-icon text-success"
                                    title="Mark as Completed"
                                  >
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
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    navigate(`/driver/edit-ride/${ride.id}`)
                                  }
                                  className="btn-icon text-primary"
                                  title="Edit Ride"
                                >
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
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleCancelRide(ride.id)}
                                  className="btn-icon text-warning"
                                  title="Cancel Ride"
                                >
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
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteRide(ride.id)}
                              className="btn-icon text-danger"
                              title="Delete Ride"
                            >
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
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
            )
          ) : bookings.length === 0 ? (
            <div className="empty-state">
              <p>No bookings received yet.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Passenger</th>
                    <th>Route</th>
                    <th>Seats</th>
                    <th>Total Fare</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <div className="font-semibold">
                          {booking.passenger.name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {booking.passenger.phone}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          {booking.ride.source} → {booking.ride.destination}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDateTime(booking.ride.departureDateTime)}
                        </div>
                      </td>
                      <td>{booking.seatsBooked}</td>
                      <td className="text-success font-bold">
                        ₹{booking.estimatedFare}
                      </td>
                      <td>
                        <span className={getBadgeClass(booking.status)}>
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
      </div>
      <style>{`
        .tabs { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 1.5rem; }
        .tab-btn { padding: 1rem 2rem; background: none; border: none; border-bottom: 2px solid transparent; color: var(--text-light); font-weight: 600; cursor: pointer; }
        .tab-btn:hover { color: var(--primary); }
        .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }
        .empty-state { text-align: center; padding: 4rem; color: var(--text-light); background: white; border-radius: var(--radius); border: 1px dashed var(--border); }
        .text-success { color: var(--secondary-dark); }
        .text-warning { color: #F59E0B; }
        .btn-icon { background: none; border: none; cursor: pointer; padding: 0.25rem; transition: transform 0.2s; }
        .btn-icon:hover { transform: scale(1.1); }
        .text-danger { color: #EF4444; }
        .clickable-card { cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
        .clickable-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: var(--primary); }
      `}</style>
    </div>
  );
};

export default DriverDashboard;
