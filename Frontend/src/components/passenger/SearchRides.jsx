import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { rideService } from "../../services/rideService";
import { bookingService } from "../../services/bookingService";
import { distanceService } from "../../services/distanceService";
import { paymentService } from "../../services/paymentService";
import { useAuth } from "../../context/AuthContext";

const SearchRides = () => {
  const [searchParams, setSearchParams] = useState({
    source: "",
    destination: "",
    date: "",
  });
  const [rides, setRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [bookingData, setBookingData] = useState({
    seatsBooked: 1,
    pickupLocation: "",
    dropLocation: "",
    distanceKm: "",
  });
  const [fareEstimate, setFareEstimate] = useState(null);
  const [calculatingFare, setCalculatingFare] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSearchChange = (e) =>
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });

  const handleBookingChange = (e) =>
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // CHANGED: Pass the date string directly (YYYY-MM-DD) for full-day search
      const response = await rideService.searchRides(
        searchParams.source,
        searchParams.destination,
        searchParams.date
      );
      if (response.success) {
        setRides(response.data);
        if (response.data.length === 0)
          setError("No rides found matching your criteria");
      }
    } catch (err) {
      setError("Failed to search rides.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const calculateFare = async () => {
      if (
        selectedRide &&
        bookingData.pickupLocation &&
        bookingData.dropLocation &&
        bookingData.seatsBooked
      ) {
        setCalculatingFare(true);
        try {
          const response = await distanceService.getFareEstimate(
            bookingData.pickupLocation,
            bookingData.dropLocation,
            selectedRide.pricePerKm,
            parseInt(bookingData.seatsBooked)
          );

          if (response.success) {
            setFareEstimate(response.data);
            setBookingData((prev) => ({
              ...prev,
              distanceKm: response.data.distanceKm,
            }));
          }
        } catch (err) {
          console.error("Failed to calculate fare:", err);
          setFareEstimate(null);
        } finally {
          setCalculatingFare(false);
        }
      }
    };

    const timer = setTimeout(calculateFare, 800);
    return () => clearTimeout(timer);
  }, [
    bookingData.pickupLocation,
    bookingData.dropLocation,
    bookingData.seatsBooked,
    selectedRide,
  ]);

  const handleBookRide = async (e) => {
    e.preventDefault();
    setError("");
    setProcessingPayment(true);

    try {
      const payload = {
        rideId: selectedRide.id,
        seatsBooked: parseInt(bookingData.seatsBooked),
        pickupLocation: bookingData.pickupLocation,
        dropLocation: bookingData.dropLocation,
        distanceKm:
          fareEstimate?.distanceKm || parseFloat(bookingData.distanceKm),
      };

      const bookingResponse = await bookingService.createBooking(payload);

      if (!bookingResponse.success) {
        throw new Error(bookingResponse.message || "Failed to create booking");
      }

      const bookingId = bookingResponse.data.id;

      const paymentOrderResponse = await paymentService.createPaymentOrder(
        bookingId
      );

      if (!paymentOrderResponse.success) {
        throw new Error("Failed to create payment order");
      }

      const { orderId, amount, currency, keyId } = paymentOrderResponse.data;

      const razorpayOptions = {
        key: keyId,
        amount: amount * 100,
        currency: currency,
        name: "SmartRides",
        description: `Booking #${bookingId}`,
        order_id: orderId,
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone,
        },
        theme: {
          color: "#2563eb",
        },
      };

      const paymentResponse = await paymentService.initializeRazorpayPayment(
        razorpayOptions
      );

      const verificationData = {
        razorpayOrderId: paymentResponse.razorpay_order_id,
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        razorpaySignature: paymentResponse.razorpay_signature,
      };

      const verificationResponse = await paymentService.verifyPayment(
        verificationData
      );

      if (verificationResponse.success) {
        setProcessingPayment(false);
        setSelectedRide(null);
        navigate("/passenger/dashboard", {
          state: { message: "Ride booked successfully! Payment Confirmed." },
        });
      } else {
        throw new Error(
          verificationResponse.message || "Payment verification failed"
        );
      }
    } catch (err) {
      console.error("Booking/Payment error:", err);
      setProcessingPayment(false);

      if (err.message === "Payment cancelled by user") {
        setError("Payment was cancelled. You can retry booking.");
      } else {
        setError(
          err.message || "Failed to complete booking. Please try again."
        );
      }
    }
  };

  const formatDateTime = (dateTime) => new Date(dateTime).toLocaleString();

  const getMatchBadge = (matchType) => {
    const badges = {
      EXACT: { label: "Perfect Match", color: "#10B981", icon: "✓" },
      ALONG_ROUTE: { label: "On Route", color: "#3B82F6", icon: "⟶" },
      PARTIAL_DETOUR: { label: "Near Route", color: "#F59E0B", icon: "↗" },
    };
    return badges[matchType] || badges.EXACT;
  };

  return (
    <div className="page-container">
      <div className="container">
        <div className="search-header mb-6">
          <h1>Find a Ride</h1>
          <p className="text-gray-500">
            Enter your details to find the perfect ride.
          </p>
        </div>

        {error && <div className="alert-error mb-4">{error}</div>}

        <div className="card mb-6">
          <div className="card-body">
            <form onSubmit={handleSearch} className="search-bar-grid">
              <input
                type="text"
                name="source"
                placeholder="From (City)"
                value={searchParams.source}
                onChange={handleSearchChange}
                required
                className="form-input"
              />
              <input
                type="text"
                name="destination"
                placeholder="To (City)"
                value={searchParams.destination}
                onChange={handleSearchChange}
                required
                className="form-input"
              />
              {/* CHANGED: Input type to 'date' for day-based search */}
              <input
                type="date"
                name="date"
                value={searchParams.date}
                onChange={handleSearchChange}
                className="form-input"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </form>
          </div>
        </div>

        {rides.length > 0 && (
          <div>
            <div className="results-header">
              <h2>Available Rides ({rides.length})</h2>
              <p className="text-sm text-gray-500">
                Sorted by best match • Exact matches first
              </p>
            </div>

            <div className="results-grid">
              {rides.map((ride) => {
                const matchBadge = getMatchBadge(ride.matchType);
                return (
                  <div key={ride.id} className="card ride-card">
                    <div className="card-body">
                      {/* Match Badge */}
                      {ride.matchType && (
                        <div
                          className="match-badge"
                          style={{ backgroundColor: `${matchBadge.color}15` }}
                        >
                          <span
                            className="match-icon"
                            style={{ color: matchBadge.color }}
                          >
                            {matchBadge.icon}
                          </span>
                          <span style={{ color: matchBadge.color }}>
                            {matchBadge.label}
                          </span>
                          {ride.matchScore && (
                            <span
                              className="match-score"
                              style={{ color: matchBadge.color }}
                            >
                              {Math.round(ride.matchScore)}%
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="route-text">
                            {ride.source} <span className="arrow">→</span>{" "}
                            {ride.destination}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {formatDateTime(ride.departureDateTime)}
                          </div>
                        </div>
                        <div className="price-tag">₹{ride.pricePerKm}/km</div>
                      </div>

                      {/* Match Description */}
                      {ride.matchDescription && (
                        <div className="match-description">
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>{ride.matchDescription}</span>
                        </div>
                      )}

                      {ride.extraDistanceKm > 0 && (
                        <div className="extra-distance">
                          +{ride.extraDistanceKm.toFixed(1)} km detour for
                          driver
                        </div>
                      )}

                      <div className="driver-mini-profile mb-4">
                        <div className="avatar-circle">
                          {ride.driver.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">
                            {ride.driver.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {ride.driver.carModel} • {ride.availableSeats} seats
                            left
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedRide(ride);
                          setBookingData({
                            seatsBooked: 1,
                            pickupLocation: ride.suggestedPickup || ride.source,
                            dropLocation:
                              ride.suggestedDrop || ride.destination,
                            distanceKm: "",
                          });
                          setFareEstimate(null);
                        }}
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Booking Modal */}
        {selectedRide && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Confirm Booking & Payment</h3>
                <button
                  onClick={() => {
                    setSelectedRide(null);
                    setFareEstimate(null);
                  }}
                  className="close-btn"
                  disabled={processingPayment}
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleBookRide} className="modal-body">
                <div className="form-group">
                  <label className="form-label">Seats</label>
                  <input
                    type="number"
                    name="seatsBooked"
                    value={bookingData.seatsBooked}
                    onChange={handleBookingChange}
                    min="1"
                    max={selectedRide.availableSeats}
                    required
                    className="form-input"
                    disabled={processingPayment}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pickup Location</label>
                  <input
                    type="text"
                    name="pickupLocation"
                    value={bookingData.pickupLocation}
                    onChange={handleBookingChange}
                    placeholder="Enter your pickup location"
                    required
                    className="form-input"
                    disabled={processingPayment}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Drop Location</label>
                  <input
                    type="text"
                    name="dropLocation"
                    value={bookingData.dropLocation}
                    onChange={handleBookingChange}
                    placeholder="Enter your drop location"
                    required
                    className="form-input"
                    disabled={processingPayment}
                  />
                </div>

                {calculatingFare && (
                  <div className="fare-calculating">
                    <div className="spinner-small"></div>
                    <span>Calculating fare...</span>
                  </div>
                )}

                {fareEstimate && !calculatingFare && (
                  <div className="fare-breakdown-card">
                    <div className="fare-header">💳 Payment Summary</div>
                    <div className="fare-row">
                      <span>Distance:</span>
                      <span className="fare-value">
                        {fareEstimate.distanceKm} km
                      </span>
                    </div>
                    <div className="fare-row">
                      <span>Estimated Time:</span>
                      <span className="fare-value">
                        {fareEstimate.durationMinutes} mins
                      </span>
                    </div>
                    <div className="fare-row">
                      <span>Base Fare:</span>
                      <span className="fare-value">
                        ₹{fareEstimate.baseFare}
                      </span>
                    </div>
                    <div className="fare-row">
                      <span>
                        Distance Fare ({fareEstimate.distanceKm}km @ ₹
                        {fareEstimate.pricePerKm}/km):
                      </span>
                      <span className="fare-value">
                        ₹{fareEstimate.distanceFare.toFixed(2)}
                      </span>
                    </div>
                    <div className="fare-row">
                      <span>Seats:</span>
                      <span className="fare-value">
                        × {fareEstimate.seatsBooked}
                      </span>
                    </div>
                    <div className="fare-row">
                      <span>Booking Fee:</span>
                      <span className="fare-value">
                        ₹{fareEstimate.bookingFee}
                      </span>
                    </div>
                    {fareEstimate.minimumFareApplied && (
                      <div className="fare-note">* Minimum fare applied</div>
                    )}
                    <div className="fare-total">
                      <span>Total Amount to Pay:</span>
                      <span className="fare-amount">
                        ₹{fareEstimate.totalFare}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#6B7280",
                        marginTop: "0.5rem",
                        textAlign: "center",
                      }}
                    >
                      💳 Secure payment via Razorpay
                    </div>
                  </div>
                )}

                {processingPayment && (
                  <div className="payment-processing">
                    <div className="spinner-small"></div>
                    <span>Processing payment...</span>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRide(null);
                      setFareEstimate(null);
                    }}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    disabled={processingPayment}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      calculatingFare ||
                      !fareEstimate ||
                      processingPayment
                    }
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    {processingPayment
                      ? "Processing..."
                      : loading
                      ? "Booking..."
                      : "Proceed to Pay"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .search-bar-grid { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 1rem; align-items: end; }
        .results-header { margin-bottom: 1.5rem; }
        .results-header h2 { font-size: 1.5rem; font-weight: 700; color: var(--dark); margin-bottom: 0.25rem; }
        .results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; }
        
        .ride-card { position: relative; transition: all 0.3s; }
        .ride-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        
        .match-badge { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; margin-bottom: 1rem; }
        .match-icon { font-size: 1rem; }
        .match-score { margin-left: auto; font-size: 0.75rem; opacity: 0.8; }
        
        .match-description { display: flex; align-items: start; gap: 0.5rem; padding: 0.75rem; background: #F3F4F6; border-radius: 8px; font-size: 0.85rem; color: #4B5563; margin-bottom: 0.75rem; line-height: 1.4; }
        .match-description svg { flex-shrink: 0; margin-top: 2px; color: #9CA3AF; }
        
        .extra-distance { font-size: 0.75rem; color: #F59E0B; background: #FEF3C7; padding: 0.5rem; border-radius: 6px; margin-bottom: 0.75rem; text-align: center; font-weight: 600; }
        
        .route-text { font-weight: 700; font-size: 1.1rem; }
        .arrow { color: var(--text-light); margin: 0 0.5rem; }
        .price-tag { background: #EFF6FF; color: var(--primary); font-weight: 700; padding: 0.25rem 0.75rem; border-radius: 6px; }
        .driver-mini-profile { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: var(--bg); border-radius: 8px; }
        .avatar-circle { width: 32px; height: 32px; background: var(--dark); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; }
        
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(2px); }
        .modal-content { background: white; width: 90%; max-width: 550px; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-lg); max-height: 90vh; overflow-y: auto; }
        .modal-header { padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-light); }
        .close-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .modal-body { padding: 1.5rem; }
        
        .fare-calculating, .payment-processing { display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: #F3F4F6; border-radius: 8px; margin: 1rem 0; }
        .spinner-small { width: 20px; height: 20px; border: 2px solid #E5E7EB; border-top: 2px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
        
        .fare-breakdown-card { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 1.25rem; margin: 1rem 0; }
        .fare-header { font-weight: 700; font-size: 1rem; color: var(--dark); margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 2px solid #E5E7EB; }
        .fare-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; font-size: 0.9rem; color: var(--text); }
        .fare-value { font-weight: 600; color: var(--dark); }
        .fare-note { font-size: 0.8rem; color: #F59E0B; margin-top: 0.5rem; font-style: italic; }
        .fare-total { display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; margin-top: 1rem; border-top: 2px solid #E5E7EB; font-weight: 700; font-size: 1.1rem; }
        .fare-amount { color: var(--secondary-dark); font-size: 1.25rem; }
        
        .alert-error { background: #FEF2F2; color: #991B1B; padding: 0.75rem; border-radius: 0.5rem; font-size: 0.875rem; border: 1px solid #FECACA; }
        
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @media (max-width: 768px) { .search-bar-grid { grid-template-columns: 1fr; } .results-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default SearchRides;
