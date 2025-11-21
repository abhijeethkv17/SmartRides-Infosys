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
    <div className="page-container">
      <div className="form-card" style={{ maxWidth: "600px" }}>
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-bold text-dark">Post a New Ride</h1>
          <p className="text-gray-500 text-sm">
            Share your journey and earn while you drive.
          </p>
        </div>

        {error && <div className="alert-error mb-6">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Route Section */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label className="form-label">From (Source)</label>
              <div className="input-with-icon">
                <span className="input-icon">⦿</span>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  placeholder="City or Area"
                  required
                  className="form-input pl-10"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">To (Destination)</label>
              <div className="input-with-icon">
                <span className="input-icon text-primary">📍</span>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="City or Area"
                  required
                  className="form-input pl-10"
                />
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label">Departure Date & Time</label>
            <input
              type="datetime-local"
              name="departureDateTime"
              value={formData.departureDateTime}
              onChange={handleChange}
              required
              min={new Date().toISOString().slice(0, 16)}
              className="form-input"
            />
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="form-group">
              <label className="form-label">Available Seats</label>
              <div className="input-with-icon">
                {/* FIXED: Added explicit width, height and style color */}
                <svg
                  className="input-icon"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: "#9CA3AF" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <input
                  type="number"
                  name="availableSeats"
                  value={formData.availableSeats}
                  onChange={handleChange}
                  min="1"
                  max="20"
                  placeholder="e.g. 3"
                  required
                  className="form-input pl-10"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Price per Km (₹)</label>
              <div className="input-with-icon">
                <span className="input-icon font-bold text-gray-400">₹</span>
                <input
                  type="number"
                  name="pricePerKm"
                  value={formData.pricePerKm}
                  onChange={handleChange}
                  min="1"
                  step="0.5"
                  placeholder="e.g. 12"
                  required
                  className="form-input pl-10"
                />
              </div>
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
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {loading ? "Posting..." : "Publish Ride"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .grid-cols-2 { display: grid; grid-template-columns: 1fr 1fr; }
        .gap-4 { gap: 1rem; }
        .input-with-icon { position: relative; }
        
        /* Updated .input-icon to handle both text spans and SVGs correctly */
        .input-icon { 
          position: absolute; 
          left: 12px; 
          top: 50%; 
          transform: translateY(-50%); 
          pointer-events: none; 
          z-index: 10;
          width: 20px; 
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9CA3AF;
        }
        
        .text-primary { color: var(--primary) !important; }
        .text-gray-400 { color: #9CA3AF !important; }
        .pl-10 { padding-left: 2.5rem !important; }
        
        @media (max-width: 640px) { .grid-cols-2 { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default PostRide;
