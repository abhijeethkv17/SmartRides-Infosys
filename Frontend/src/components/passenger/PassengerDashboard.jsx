import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { bookingService } from "../../services/bookingService";
import { reviewService } from "../../services/reviewService";
import ReviewModal from "../reviews/ReviewModal";

const PassengerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ""
  );
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Poll for updates every 15 seconds to catch "Ride Completed" status
    const intervalId = setInterval(fetchData, 15000);

    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        window.history.replaceState({}, document.title);
      }, 5000);
      return () => clearTimeout(timer);
    }

    return () => clearInterval(intervalId);
  }, []);

  const fetchData = async () => {
    try {
      // Don't set loading true on background refreshes to avoid UI flickering
      const [bookingsRes, reviewsRes] = await Promise.all([
        bookingService.getPassengerBookings(),
        reviewService.getPendingReviews(),
      ]);

      if (bookingsRes.success) {
        setBookings(bookingsRes.data);
      }
      if (reviewsRes.success) {
        setPendingReviews(reviewsRes.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      if (loading) setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
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

        {/* Pending Reviews Banner */}
        {pendingReviews.length > 0 && (
          <div className="review-banner mb-6 fade-in">
            <div className="review-banner-content">
              <div className="review-banner-icon">⭐</div>
              <div className="review-banner-text">
                <strong>Rate Your Recent Rides</strong>
                <p>
                  You have {pendingReviews.length} completed ride
                  {pendingReviews.length > 1 ? "s" : ""} waiting for your
                  review!
                </p>
              </div>
            </div>
          </div>
        )}

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
              <h3>
                {
                  bookings.filter(
                    (b) => b.status === "CONFIRMED" || b.status === "COMPLETED"
                  ).length
                }
              </h3>
              <p>Active & Past Rides</p>
            </div>
          </div>

          <div
            className="stat-card clickable-card"
            onClick={() => navigate("/payments/history")}
            title="View Transaction History"
          >
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
              <p>Total Spent &rarr;</p>
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
            {bookings.map((booking) => {
              // Check if review is possible: Status COMPLETED and in pending list
              const canReview =
                booking.status === "COMPLETED" &&
                pendingReviews.some((pr) => pr.id === booking.id);

              return (
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

                    {/* Review Button */}
                    {canReview && (
                      <button
                        onClick={() => handleReviewClick(booking)}
                        className="btn-review"
                      >
                        <svg
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        Rate Your Ride
                      </button>
                    )}

                    <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center">
                      Booked on {formatDateTime(booking.bookingTime)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          onClose={() => setShowReviewModal(false)}
          onSubmitSuccess={() => {
            fetchData();
          }}
        />
      )}

      <style>{`
        .empty-state { text-align: center; padding: 4rem 2rem; background: white; border-radius: var(--radius); border: 1px dashed var(--border); }
        .bookings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; }
        .booking-card { border: 1px solid var(--border); transition: all 0.2s; }
        .driver-mini-profile { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #F9FAFB; border-radius: 8px; border: 1px solid #F3F4F6; }
        .avatar-circle { width: 36px; height: 36px; background: var(--dark); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .detail-item { display: flex; flex-direction: column; }
        .detail-item .label { font-size: 0.75rem; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
        .detail-item .value { font-size: 0.95rem; color: var(--dark); font-weight: 500; }
        .bg-gray-50 { background-color: #F9FAFB; }
        .alert-success { background: #ECFDF5; color: #065F46; padding: 1rem; border-radius: var(--radius); border: 1px solid #A7F3D0; }
        .fade-in { animation: fadeIn 0.5s ease-in; }
        .clickable-card { cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
        .clickable-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: var(--primary); }
        
        .review-banner { background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-radius: 12px; padding: 1.5rem; border: 2px solid #FCD34D; }
        .review-banner-content { display: flex; align-items: center; gap: 1rem; }
        .review-banner-icon { font-size: 2rem; }
        .review-banner-text strong { display: block; font-size: 1.1rem; color: #92400E; margin-bottom: 0.25rem; }
        .review-banner-text p { color: #78350F; font-size: 0.9rem; margin: 0; }
        
        .btn-review { width: 100%; padding: 0.75rem; background: linear-gradient(135deg, #FBBF24, #F59E0B); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: transform 0.2s; }
        .btn-review:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4); }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default PassengerDashboard;
