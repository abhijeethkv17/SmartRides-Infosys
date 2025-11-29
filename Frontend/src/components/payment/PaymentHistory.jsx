import React, { useState, useEffect } from "react";
import { paymentService } from "../../services/paymentService";
import { useAuth } from "../../context/AuthContext";
import { ROLE } from "../../utils/constants";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      let response;
      if (user.role === ROLE.DRIVER) {
        response = await paymentService.getAllDriverPayments();
      } else {
        response = await paymentService.getPassengerPaymentHistory();
      }

      if (response.success) {
        setPayments(response.data);
      }
    } catch (err) {
      setError("Failed to load payment history");
    } finally {
      setLoading(false);
    }
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

  const getStatusBadge = (status) => {
    const statusClasses = {
      SUCCESS: "status-success",
      PENDING: "status-pending",
      FAILED: "status-failed",
      REFUNDED: "status-refunded",
    };
    return statusClasses[status] || "status-default";
  };

  const getTotalSpent = () => {
    return payments
      .filter((p) => p.status === "SUCCESS")
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getTotalEarnings = () => {
    return payments
      .filter((p) => p.status === "SUCCESS")
      .reduce((sum, p) => sum + p.driverEarnings, 0);
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl mb-1">
            {user.role === ROLE.DRIVER ? "Earnings History" : "Payment History"}
          </h1>
          <p className="text-gray-500 text-sm">
            {user.role === ROLE.DRIVER
              ? "Track your earnings and commission details"
              : "View all your transactions and payment details"}
          </p>
        </div>

        {error && <div className="alert-error mb-4">{error}</div>}

        {/* Summary Stats */}
        <div className="stats-grid mb-8">
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
              <h3>{payments.filter((p) => p.status === "SUCCESS").length}</h3>
              <p>Successful</p>
            </div>
          </div>

          <div className="stat-card">
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
                {user.role === ROLE.DRIVER
                  ? getTotalEarnings().toFixed(0)
                  : getTotalSpent().toFixed(0)}
              </h3>
              <p>
                {user.role === ROLE.DRIVER ? "Total Earned" : "Total Spent"}
              </p>
            </div>
          </div>

          {user.role === ROLE.DRIVER && (
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
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div className="stat-content">
                <h3>
                  ₹
                  {payments
                    .filter((p) => p.status === "SUCCESS")
                    .reduce((sum, p) => sum + p.platformCommission, 0)
                    .toFixed(0)}
                </h3>
                <p>Platform Fee</p>
              </div>
            </div>
          )}
        </div>

        {/* Payment List */}
        {payments.length === 0 ? (
          <div className="empty-state">
            <div className="mb-4 text-4xl">💳</div>
            <h3 className="text-lg font-bold text-gray-700">
              No payment history yet
            </h3>
            <p className="text-gray-500">
              {user.role === ROLE.DRIVER
                ? "Start accepting bookings to see your earnings here"
                : "Book your first ride to see payment history"}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Date</th>
                  <th>Route</th>
                  <th>Amount</th>
                  {user.role === ROLE.DRIVER && <th>Your Earnings</th>}
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <span className="text-xs font-mono">
                        #{payment.id.toString().padStart(6, "0")}
                      </span>
                    </td>
                    <td className="text-sm">
                      {formatDateTime(payment.createdAt)}
                    </td>
                    <td>
                      <div className="text-sm">
                        {payment.booking.ride.source} →{" "}
                        {payment.booking.ride.destination}
                      </div>
                      <div className="text-xs text-gray-400">
                        {payment.booking.seatsBooked} seat(s)
                      </div>
                    </td>
                    <td className="font-semibold">₹{payment.amount}</td>
                    {user.role === ROLE.DRIVER && (
                      <td className="font-semibold text-success">
                        ₹{payment.driverEarnings.toFixed(2)}
                      </td>
                    )}
                    <td>
                      <span
                        className={`status-badge ${getStatusBadge(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
        .stat-card { background: white; padding: 1.5rem; border-radius: var(--radius); box-shadow: var(--shadow); border: 1px solid var(--border); display: flex; align-items: center; gap: 1rem; }
        .stat-icon-wrapper { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .stat-icon-wrapper svg { width: 24px; height: 24px; }
        .stat-content h3 { font-size: 1.875rem; font-weight: 700; color: var(--dark); margin-bottom: 0; }
        .stat-content p { color: var(--text-light); font-size: 0.875rem; font-weight: 500; }
        
        .empty-state { text-align: center; padding: 4rem 2rem; background: white; border-radius: var(--radius); border: 1px dashed var(--border); }
        
        .table-container { overflow-x: auto; background: white; border-radius: var(--radius); box-shadow: var(--shadow); border: 1px solid var(--border); }
        .table { width: 100%; border-collapse: collapse; text-align: left; }
        .table th { background: #f9fafb; padding: 1rem 1.5rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--text-light); letter-spacing: 0.05em; border-bottom: 1px solid var(--border); }
        .table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border); color: var(--text); font-size: 0.95rem; }
        .table tr:last-child td { border-bottom: none; }
        
        .status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
        .status-success { background: #D1FAE5; color: #065F46; }
        .status-pending { background: #FEF3C7; color: #92400E; }
        .status-failed { background: #FEE2E2; color: #991B1B; }
        .status-refunded { background: #E0E7FF; color: #3730A3; }
        
        .text-success { color: #059669; }
        .alert-error { background: #FEF2F2; color: #991B1B; padding: 0.75rem; border-radius: 0.5rem; font-size: 0.875rem; border: 1px solid #FECACA; }
      `}</style>
    </div>
  );
};

export default PaymentHistory;
