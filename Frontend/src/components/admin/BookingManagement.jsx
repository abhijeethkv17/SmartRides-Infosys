import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllBookings(statusFilter || null);
      if (response.success) {
        setBookings(response.data);
      }
    } catch (err) {
      console.error("Failed to load bookings", err);
    } finally {
      setLoading(false);
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
          <h1>Booking Management</h1>
          <p>View and track all passenger bookings</p>
        </div>

        <div className="card mb-6">
          <div className="card-body">
            <div className="form-group" style={{ maxWidth: "300px" }}>
              <label className="form-label">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
              >
                <option value="">All Bookings</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Passenger</th>
                <th>Ride Route</th>
                <th>Seats</th>
                <th>Amount</th>
                <th>Booking Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>
                    <div className="font-semibold">{booking.passengerName}</div>
                    <div className="text-sm text-gray-500">
                      {booking.passengerPhone}
                    </div>
                  </td>
                  <td>
                    {booking.source} → {booking.destination}
                  </td>
                  <td>{booking.seatsBooked}</td>
                  <td>₹{booking.totalAmount}</td>
                  <td>{formatDate(booking.bookingTime)}</td>
                  <td>
                    <span
                      className={`badge badge-${booking.status.toLowerCase()}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="text-center p-4">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        .badge-confirmed { background: #D1FAE5; color: #065F46; }
        .badge-completed { background: #DBEAFE; color: #1E40AF; }
        .badge-cancelled { background: #FEE2E2; color: #991B1B; }
      `}</style>
    </div>
  );
};

export default BookingManagement;
