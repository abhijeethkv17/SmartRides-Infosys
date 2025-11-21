import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { rideService } from "../../services/rideService";
import { bookingService } from "../../services/bookingService";

const SearchRides = () => {
  // ... State and logic remains identical ...
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
        distanceKm: parseFloat(bookingData.distanceKm),
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
  const calculateEstimatedFare = () => {
    if (selectedRide && bookingData.distanceKm && bookingData.seatsBooked) {
      return (
        parseFloat(bookingData.distanceKm) *
        selectedRide.pricePerKm *
        parseInt(bookingData.seatsBooked)
      ).toFixed(2);
    }
    return 0;
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
                  onClick={() => setSelectedRide(null)}
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
                  <label className="form-label">Pickup</label>
                  <input
                    type="text"
                    name="pickupLocation"
                    value={bookingData.pickupLocation}
                    onChange={handleBookingChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Drop</label>
                  <input
                    type="text"
                    name="dropLocation"
                    value={bookingData.dropLocation}
                    onChange={handleBookingChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Distance (km)</label>
                  <input
                    type="number"
                    name="distanceKm"
                    value={bookingData.distanceKm}
                    onChange={handleBookingChange}
                    min="1"
                    step="0.1"
                    required
                    className="form-input"
                  />
                </div>

                <div className="fare-summary">
                  <span>Total Fare:</span>
                  <span className="fare-amount">
                    ₹{calculateEstimatedFare()}
                  </span>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedRide(null)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
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
        .modal-content { background: white; width: 90%; max-width: 500px; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-lg); }
        .modal-header { padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-light); }
        .modal-body { padding: 1.5rem; }
        .fare-summary { display: flex; justify-content: space-between; align-items: center; font-weight: 700; font-size: 1.1rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--border); }
        .fare-amount { color: var(--secondary-dark); }
        
        @media (max-width: 768px) { .search-bar-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default SearchRides;
