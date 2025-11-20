import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { rideService } from "../../services/rideService";

const PostRide = () => {
  const [formData, setFormData] = useState({
    source: "",
    destination: "",
    departureDateTime: "",
    availableSeats: "",
    pricePerKm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...formData,
        departureDateTime: new Date(formData.departureDateTime).toISOString(),
        availableSeats: parseInt(formData.availableSeats),
        pricePerKm: parseFloat(formData.pricePerKm),
      };

      const response = await rideService.postRide(payload);
      if (response.success) {
        alert("Ride posted successfully!");
        navigate("/driver/dashboard");
      } else {
        setError(response.message || "Failed to post ride");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to post ride. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <h2 style={styles.title}>Post a New Ride</h2>
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Source</label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              placeholder="Starting location"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Destination</label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="Destination"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Departure Date & Time</label>
            <input
              type="datetime-local"
              name="departureDateTime"
              value={formData.departureDateTime}
              onChange={handleChange}
              required
              min={new Date().toISOString().slice(0, 16)}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Available Seats</label>
            <input
              type="number"
              name="availableSeats"
              value={formData.availableSeats}
              onChange={handleChange}
              min="1"
              max="20"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Price per Kilometer (₹)</label>
            <input
              type="number"
              name="pricePerKm"
              value={formData.pricePerKm}
              onChange={handleChange}
              min="1"
              step="0.5"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => navigate("/driver/dashboard")}
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={styles.submitButton}
            >
              {loading ? "Posting..." : "Post Ride"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "calc(100vh - 64px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: "20px",
  },
  formWrapper: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "500px",
  },
  title: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#2c3e50",
  },
  error: {
    backgroundColor: "#fee",
    color: "#c00",
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "20px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "5px",
    color: "#555",
    fontWeight: "500",
  },
  input: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
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
    fontSize: "16px",
    cursor: "pointer",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#27ae60",
    color: "white",
    padding: "12px",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default PostRide;
