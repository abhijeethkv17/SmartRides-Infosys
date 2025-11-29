import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { bookingService } from "../../services/bookingService";

const PassengerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ""
  );

  useEffect(() => {
    fetchBookings();

    // Clear message from state after 5 seconds
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        // Clear history state to prevent message from showing on refresh
        window.history.replaceState({}, document.title);
      }, 5000);
      return () => clearTimeout(timer);
    }
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

  const getBadgeClass = (status) => {
    switch (status) {
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl mb-1">My Journeys</h1>
            <p className="text-gray-500 text-sm">
              Track your upcoming and past rides.
            </p>
          </div>
          <Link to="/passenger/search-rides" className="btn btn-primary">
            <svg
              className="icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Find a Ride
          </Link>
        </div>

        {/* Success Message Banner */}
        {successMessage && (
          <div className="alert-success mb-6 fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎉</span>
              <div>
                <strong className="block font-bold">Booking Confirmed!</strong>
                <span>{successMessage}</span>
              </div>
            </div>
          </div>
        )}

        {error && <div className="alert-error mb-4">{error}</div>}

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{ color: "#F59E0B", background: "#FEF3C7" }}
            >
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
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
            </div>
            <div className="stat-content">
              <h3>{bookings.length}</h3>
              <p>Total Bookings</p>
            </div>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{ color: "#10B981", background: "#D1FAE5" }}
            >
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="stat-content">
              <h3>{bookings.filter((b) => b.status === "CONFIRMED").length}</h3>
              <p>Confirmed Rides</p>
            </div>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{ color: "#2563EB", background: "#DBEAFE" }}
            >
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
              <p>Total Spent</p>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <h2 className="text-xl font-bold mb-4 text-gray-700">
          Recent Activity
        </h2>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <div className="mb-4 text-4xl">🧳</div>
            <h3 className="text-lg font-bold text-gray-700">No bookings yet</h3>
            <p className="text-gray-500 mb-4">
              Ready to travel? Find a ride and start your journey.
            </p>
            <Link to="/passenger/search-rides" className="btn btn-secondary">
              Search Available Rides
            </Link>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map((booking) => (
              <div key={booking.id} className="card booking-card">
                {/* Route Header */}
                <div className="card-header bg-gray-50">
                  <div>
                    <div className="flex items-center gap-2 text-lg font-bold text-dark">
                      {booking.ride.source}{" "}
                      <span className="text-gray-400 text-sm">→</span>{" "}
                      {booking.ride.destination}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <svg
                        className="icon w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {formatDateTime(booking.ride.departureDateTime)}
                    </div>
                  </div>
                  <span className={getBadgeClass(booking.status)}>
                    {booking.status}
                  </span>
                </div>

                <div className="card-body">
                  {/* Driver Info */}
                  <div className="driver-mini-profile mb-4">
                    <div className="avatar-circle">
                      {booking.ride.driver.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">
                        {booking.ride.driver.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.ride.driver.carModel} •{" "}
                        {booking.ride.driver.licensePlate}
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="label">Pickup</span>
                      <span className="value">{booking.pickupLocation}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Drop</span>
                      <span className="value">{booking.dropLocation}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Seats</span>
                      <span className="value">{booking.seatsBooked}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Fare</span>
                      <span className="value text-primary font-bold">
                        ₹{booking.estimatedFare}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center">
                    Booked on {formatDateTime(booking.bookingTime)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .empty-state { text-align: center; padding: 4rem 2rem; background: white; border-radius: var(--radius); border: 1px dashed var(--border); }
        .bookings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; }
        .booking-card { border: 1px solid var(--border); transition: all 0.2s; }
        .driver-mini-profile { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #F9FAFB; border-radius: 8px; border: 1px solid #F3F4F6; }
        .avatar-circle { width: 36px; height: 36px; background: var(--dark); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .detail-item { display: flex; flex-direction: column; }
        .detail-item .label { font-size: 0.75rem; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
        .detail-item .value { font-size: 0.95rem; color: var(--dark); font-weight: 500; }
        .bg-gray-50 { background-color: #F9FAFB; }
        .alert-success { background: #ECFDF5; color: #065F46; padding: 1rem; border-radius: var(--radius); border: 1px solid #A7F3D0; }
        .fade-in { animation: fadeIn 0.5s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default PassengerDashboard;
