import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { rideService } from "../../services/rideService";
import { bookingService } from "../../services/bookingService";
import { distanceService } from "../../services/distanceService";

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
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSearchChange = (e) =>
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });

  const handleBookingChange = (e) =>
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const dateTime = searchParams.date
        ? new Date(searchParams.date).toISOString()
        : null;
      const response = await rideService.searchRides(
        searchParams.source,
        searchParams.destination,
        dateTime
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

  // Calculate fare when pickup/drop locations or seats change
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
            // Update distance in booking data
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

    // Debounce the calculation
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
    setLoading(true);
    try {
      const payload = {
        rideId: selectedRide.id,
        seatsBooked: parseInt(bookingData.seatsBooked),
        pickupLocation: bookingData.pickupLocation,
        dropLocation: bookingData.dropLocation,
        distanceKm:
          fareEstimate?.distanceKm || parseFloat(bookingData.distanceKm),
      };
      const response = await bookingService.createBooking(payload);
      if (response.success) {
        alert("Ride booked successfully!");
        navigate("/passenger/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book ride.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => new Date(dateTime).toLocaleString();

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
              <input
                type="datetime-local"
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
          <div className="results-grid">
            {rides.map((ride) => (
              <div key={ride.id} className="card">
                <div className="card-body">
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
                        pickupLocation: ride.source,
                        dropLocation: ride.destination,
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
            ))}
          </div>
        )}

        {/* Booking Modal */}
        {selectedRide && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Confirm Booking</h3>
                <button
                  onClick={() => {
                    setSelectedRide(null);
                    setFareEstimate(null);
                  }}
                  className="close-btn"
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
                  />
                </div>

                {/* Fare Breakdown Display */}
                {calculatingFare && (
                  <div className="fare-calculating">
                    <div className="spinner-small"></div>
                    <span>Calculating fare...</span>
                  </div>
                )}

                {fareEstimate && !calculatingFare && (
                  <div className="fare-breakdown-card">
                    <div className="fare-header">Fare Breakdown</div>
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
                      <span>Total Fare:</span>
                      <span className="fare-amount">
                        ₹{fareEstimate.totalFare}
                      </span>
                    </div>
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
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || calculatingFare || !fareEstimate}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    {loading ? "Booking..." : "Confirm"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .search-bar-grid { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 1rem; align-items: end; }
        .results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .route-text { font-weight: 700; font-size: 1.1rem; }
        .arrow { color: var(--text-light); margin: 0 0.5rem; }
        .price-tag { background: #EFF6FF; color: var(--primary); font-weight: 700; padding: 0.25rem 0.75rem; border-radius: 6px; }
        .driver-mini-profile { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: var(--bg); border-radius: 8px; }
        .avatar-circle { width: 32px; height: 32px; background: var(--dark); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; }
        
        /* Modal */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(2px); }
        .modal-content { background: white; width: 90%; max-width: 550px; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-lg); max-height: 90vh; overflow-y: auto; }
        .modal-header { padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-light); }
        .modal-body { padding: 1.5rem; }
        
        /* Fare Breakdown */
        .fare-calculating { display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: #F3F4F6; border-radius: 8px; margin: 1rem 0; }
        .spinner-small { width: 20px; height: 20px; border: 2px solid #E5E7EB; border-top: 2px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
        
        .fare-breakdown-card { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 1.25rem; margin: 1rem 0; }
        .fare-header { font-weight: 700; font-size: 1rem; color: var(--dark); margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 2px solid #E5E7EB; }
        .fare-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; font-size: 0.9rem; color: var(--text); }
        .fare-value { font-weight: 600; color: var(--dark); }
        .fare-note { font-size: 0.8rem; color: #F59E0B; margin-top: 0.5rem; font-style: italic; }
        .fare-total { display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; margin-top: 1rem; border-top: 2px solid #E5E7EB; font-weight: 700; font-size: 1.1rem; }
        .fare-amount { color: var(--secondary-dark); font-size: 1.25rem; }
        
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @media (max-width: 768px) { .search-bar-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default SearchRides;
