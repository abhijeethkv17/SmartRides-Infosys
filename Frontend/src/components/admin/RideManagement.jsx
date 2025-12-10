import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";

const RideManagement = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });

  useEffect(() => {
    fetchRides();
  }, [filters]);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllRides(
        filters.status || null,
        filters.search || null
      );
      if (response.success) {
        setRides(response.data);
      }
    } catch (err) {
      console.error("Failed to load rides", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async (rideId) => {
    const reason = window.prompt("Please enter a reason for cancellation:");
    if (reason) {
      try {
        const response = await adminService.cancelRide(rideId, reason);
        if (response.success) {
          alert("Ride cancelled successfully");
          fetchRides();
        }
      } catch (err) {
        alert(err.response?.data?.message || "Failed to cancel ride");
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1>Ride Management</h1>
          <p>Monitor and manage all platform rides</p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="card-body">
            <div className="filters-grid">
              <div className="form-group">
                <label className="form-label">Search Route</label>
                <input
                  type="text"
                  placeholder="Search source or destination..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Filter by Status</label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="form-select"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Rides Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Driver</th>
                <th>Route</th>
                <th>Departure</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((ride) => (
                <tr key={ride.id}>
                  <td>#{ride.id}</td>
                  <td>
                    <div className="font-semibold">{ride.driverName}</div>
                  </td>
                  <td>
                    <div className="route-cell">
                      <span className="source">{ride.source}</span>
                      <span className="arrow">→</span>
                      <span className="destination">{ride.destination}</span>
                    </div>
                  </td>
                  <td>{formatDate(ride.departureDateTime)}</td>
                  <td>₹{ride.pricePerSeat}</td>
                  <td>
                    <span
                      className={`badge badge-${ride.status.toLowerCase()}`}
                    >
                      {ride.status}
                    </span>
                  </td>
                  <td>
                    {ride.status === "ACTIVE" && (
                      <button
                        onClick={() => handleCancelRide(ride.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rides.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="text-center p-4">
                    No rides found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        .badge-active { background: #D1FAE5; color: #065F46; }
        .badge-completed { background: #DBEAFE; color: #1E40AF; }
        .badge-cancelled { background: #FEE2E2; color: #991B1B; }
        .route-cell { display: flex; align-items: center; gap: 0.5rem; }
        .arrow { color: #9CA3AF; }
      `}</style>
    </div>
  );
};

export default RideManagement;
