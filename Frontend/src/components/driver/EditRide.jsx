import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { rideService } from "../../services/rideService";

const EditRide = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    source: "",
    destination: "",
    departureDateTime: "",
    availableSeats: "",
    pricePerKm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const response = await rideService.getRideById(id);
        if (response.success) {
          const ride = response.data;
          // Format date for datetime-local input (YYYY-MM-DDThh:mm)
          const date = new Date(ride.departureDateTime);
          const pad = (num) => num.toString().padStart(2, "0");
          const formattedDate = `${date.getFullYear()}-${pad(
            date.getMonth() + 1
          )}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
            date.getMinutes()
          )}`;

          setFormData({
            source: ride.source,
            destination: ride.destination,
            departureDateTime: formattedDate,
            availableSeats: ride.availableSeats,
            pricePerKm: ride.pricePerKm,
          });
        } else {
          setError("Could not fetch ride details");
        }
      } catch (err) {
        setError("Failed to load ride");
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        departureDateTime: new Date(formData.departureDateTime).toISOString(),
        availableSeats: parseInt(formData.availableSeats),
        pricePerKm: parseFloat(formData.pricePerKm),
      };

      const response = await rideService.updateRide(id, payload);
      if (response.success) {
        alert("Ride updated successfully!");
        navigate("/driver/dashboard");
      } else {
        setError(response.message || "Failed to update ride");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update ride. Please try again."
      );
    } finally {
      setSubmitting(false);
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
      <div className="form-card" style={{ maxWidth: "600px" }}>
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-bold text-dark">Edit Ride</h1>
          <p className="text-gray-500 text-sm">Update your journey details</p>
        </div>

        {error && <div className="alert-error mb-6">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label className="form-label">From (Source)</label>
              <input
                type="text"
                name="source"
                value={formData.source}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">To (Destination)</label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Departure Date & Time</label>
            <input
              type="datetime-local"
              name="departureDateTime"
              value={formData.departureDateTime}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="form-group">
              <label className="form-label">Available Seats</label>
              <input
                type="number"
                name="availableSeats"
                value={formData.availableSeats}
                onChange={handleChange}
                min="1"
                max="20"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Price per Km (₹)</label>
              <input
                type="number"
                name="pricePerKm"
                value={formData.pricePerKm}
                onChange={handleChange}
                min="1"
                step="0.5"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/driver/dashboard")}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {submitting ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .grid-cols-2 { display: grid; grid-template-columns: 1fr 1fr; }
        .gap-4 { gap: 1rem; }
        @media (max-width: 640px) { .grid-cols-2 { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default EditRide;
