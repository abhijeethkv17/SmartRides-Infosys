import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";

const PaymentOversight = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllPayments(statusFilter || null);
      if (response.success) {
        setPayments(response.data);
      }
    } catch (err) {
      console.error("Failed to load payments", err);
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
          <h1>Payment Oversight</h1>
          <p>Track transactions and revenue</p>
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
                <option value="">All Transactions</option>
                <option value="SUCCESS">Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Payer</th>
                <th>Amount</th>
                <th>Commission</th>
                <th>Method</th>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>#{payment.id}</td>
                  <td>{payment.passenger?.name || "N/A"}</td>
                  <td className="font-semibold">₹{payment.amount}</td>
                  <td className="text-gray-500">
                    ₹{payment.platformCommission?.toFixed(2)}
                  </td>
                  <td>{payment.paymentMethod}</td>
                  <td>
                    <span className="text-xs font-mono">
                      {payment.razorpayPaymentId || "-"}
                    </span>
                  </td>
                  <td>{formatDate(payment.createdAt)}</td>
                  <td>
                    <span
                      className={`badge badge-${payment.status.toLowerCase()}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        .badge-success { background: #D1FAE5; color: #065F46; }
        .badge-pending { background: #FEF3C7; color: #92400E; }
        .badge-failed { background: #FEE2E2; color: #991B1B; }
        .badge-refunded { background: #F3F4F6; color: #374151; }
      `}</style>
    </div>
  );
};

export default PaymentOversight;
