import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { rideService } from "../../services/rideService";
import { bookingService } from "../../services/bookingService";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleBookingChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

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
        if (response.data.length === 0) {
          setError("No rides found matching your criteria");
        }
      }
    } catch (err) {
      setError("Failed to search rides. Please try again.");
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
      setError(
        err.response?.data?.message || "Failed to book ride. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString();
  };

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
    <div style={styles.container}>
      <h1>Search Rides</h1>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.searchSection}>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            name="source"
            placeholder="From (Source)"
            value={searchParams.source}
            onChange={handleSearchChange}
            required
            style={styles.input}
          />
          <input
            type="text"
            name="destination"
            placeholder="To (Destination)"
            value={searchParams.destination}
            onChange={handleSearchChange}
            required
            style={styles.input}
          />
          <input
            type="datetime-local"
            name="date"
            value={searchParams.date}
            onChange={handleSearchChange}
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.searchButton}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      {rides.length > 0 && (
        <div style={styles.resultsSection}>
          <h2>Available Rides</h2>
          <div style={styles.grid}>
            {rides.map((ride) => (
              <div key={ride.id} style={styles.card}>
                <h3>
                  {ride.source} → {ride.destination}
                </h3>
                <p>
                  <strong>Driver:</strong> {ride.driver.name}
                </p>
                <p>
                  <strong>Vehicle:</strong> {ride.driver.carModel} (
                  {ride.driver.licensePlate})
                </p>
                <p>
                  <strong>Departure:</strong>{" "}
                  {formatDateTime(ride.departureDateTime)}
                </p>
                <p>
                  <strong>Available Seats:</strong> {ride.availableSeats}
                </p>
                <p>
                  <strong>Price:</strong> ₹{ride.pricePerKm}/km
                </p>
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
                  style={styles.bookButton}
                >
                  Book This Ride
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedRide && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Book Ride</h2>
            <form onSubmit={handleBookRide} style={styles.bookingForm}>
              <div style={styles.formGroup}>
                <label>Number of Seats</label>
                <input
                  type="number"
                  name="seatsBooked"
                  value={bookingData.seatsBooked}
                  onChange={handleBookingChange}
                  min="1"
                  max={selectedRide.availableSeats}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Pickup Location</label>
                <input
                  type="text"
                  name="pickupLocation"
                  value={bookingData.pickupLocation}
                  onChange={handleBookingChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Drop Location</label>
                <input
                  type="text"
                  name="dropLocation"
                  value={bookingData.dropLocation}
                  onChange={handleBookingChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Distance (km)</label>
                <input
                  type="number"
                  name="distanceKm"
                  value={bookingData.distanceKm}
                  onChange={handleBookingChange}
                  min="1"
                  step="0.1"
                  required
                  style={styles.input}
                />
              </div>
              <p style={styles.fareInfo}>
                <strong>Estimated Fare: ₹{calculateEstimatedFare()}</strong>
              </p>
              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={() => setSelectedRide(null)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={styles.confirmButton}
                >
                  {loading ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
  },
  error: {
    backgroundColor: "#fee",
    color: "#c00",
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "20px",
  },
  searchSection: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "30px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  searchForm: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    alignItems: "end",
  },
  input: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
  },
  searchButton: {
    backgroundColor: "#3498db",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  resultsSection: {
    marginTop: "30px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  bookButton: {
    backgroundColor: "#27ae60",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    width: "100%",
    marginTop: "15px",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  bookingForm: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  fareInfo: {
    textAlign: "center",
    color: "#27ae60",
    fontSize: "18px",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#95a5a6",
    color: "white",
    padding: "12px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#27ae60",
    color: "white",
    padding: "12px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default SearchRides;
