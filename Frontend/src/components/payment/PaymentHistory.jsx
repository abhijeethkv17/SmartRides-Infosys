import React, { useState, useEffect } from "react";
import { paymentService } from "../../services/paymentService";
import { useAuth } from "../../context/AuthContext";
import { ROLE } from "../../utils/constants";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Get real user from Auth Context
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      // Call the actual backend API instead of mock service
      const response =
        user.role === ROLE.DRIVER
          ? await paymentService.getAllDriverPayments()
          : await paymentService.getPassengerPaymentHistory();

      if (response.success) {
        setPayments(response.data);
      }
    } catch (err) {
      console.error("Failed to load payments:", err);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const downloadReceipt = (payment) => {
    const receiptContent = generateReceiptText(payment);
    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Receipt_${payment.id}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReceiptText = (payment) => {
    return `
═══════════════════════════════════════════════════
                SMARTRIDES - OFFICIAL RECEIPT
═══════════════════════════════════════════════════

Receipt ID: #${payment.id.toString().padStart(6, "0")}
Transaction Date: ${formatDateTime(payment.createdAt)}
Status: ${payment.status}

───────────────────────────────────────────────────
RIDE DETAILS
───────────────────────────────────────────────────
Booking ID: #${payment.booking.id}
Route: ${payment.booking.ride.source} → ${payment.booking.ride.destination}
Pickup: ${payment.booking.pickupLocation}
Drop: ${payment.booking.dropLocation}
Seats: ${payment.booking.seatsBooked}

───────────────────────────────────────────────────
PAYMENT DETAILS
───────────────────────────────────────────────────
Total Amount: ${formatCurrency(payment.amount)}
${
  user.role === ROLE.DRIVER
    ? `
Platform Fee (10%): ${formatCurrency(payment.platformCommission)}
Your Earnings: ${formatCurrency(payment.driverEarnings)}
`
    : ""
}
Payment Method: Razorpay
Payment ID: ${payment.razorpayPaymentId || "N/A"}
Order ID: ${payment.razorpayOrderId || "N/A"}

───────────────────────────────────────────────────
Thank you for using SmartRides!
For support, contact: support@smartrides.com
═══════════════════════════════════════════════════
    `.trim();
  };

  const getTotalStats = () => {
    const successful = payments.filter((p) => p.status === "SUCCESS");
    const totalAmount = successful.reduce((sum, p) => sum + p.amount, 0);
    const totalEarnings =
      user.role === ROLE.DRIVER
        ? successful.reduce((sum, p) => sum + p.driverEarnings, 0)
        : 0;
    const totalCommission =
      user.role === ROLE.DRIVER
        ? successful.reduce((sum, p) => sum + p.platformCommission, 0)
        : 0;

    return {
      successful: successful.length,
      totalAmount,
      totalEarnings,
      totalCommission,
    };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <div
        className="loading-wrapper"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div
      className="page-container"
      style={{
        padding: "2rem",
        maxWidth: "1400px",
        margin: "0 auto",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.875rem",
            fontWeight: "700",
            color: "#1F2937",
            marginBottom: "0.5rem",
          }}
        >
          {user.role === ROLE.DRIVER ? "Earnings History" : "Payment History"}
        </h1>
        <p style={{ color: "#6B7280", fontSize: "0.875rem" }}>
          View all your transactions and download receipts
        </p>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #E5E7EB",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#D1FAE5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#10B981",
              }}
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontSize: "1.875rem",
                  fontWeight: "700",
                  color: "#1F2937",
                }}
              >
                {stats.successful}
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#6B7280",
                  fontWeight: "500",
                }}
              >
                Successful
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #E5E7EB",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#DBEAFE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2563EB",
              }}
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontSize: "1.875rem",
                  fontWeight: "700",
                  color: "#1F2937",
                }}
              >
                {formatCurrency(
                  user.role === ROLE.DRIVER
                    ? stats.totalEarnings
                    : stats.totalAmount
                )}
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#6B7280",
                  fontWeight: "500",
                }}
              >
                {user.role === ROLE.DRIVER ? "Total Earned" : "Total Spent"}
              </div>
            </div>
          </div>
        </div>

        {user.role === ROLE.DRIVER && (
          <div
            style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #E5E7EB",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "#FEF3C7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#F59E0B",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "1.875rem",
                    fontWeight: "700",
                    color: "#1F2937",
                  }}
                >
                  {formatCurrency(stats.totalCommission)}
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "#6B7280",
                    fontWeight: "500",
                  }}
                >
                  Platform Fee
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transactions List */}
      {payments.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem",
            background: "white",
            borderRadius: "12px",
            border: "1px dashed #E5E7EB",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💳</div>
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: "700",
              color: "#374151",
              marginBottom: "0.5rem",
            }}
          >
            No transactions yet
          </h3>
          <p style={{ color: "#6B7280" }}>
            {user.role === ROLE.DRIVER
              ? "Start accepting bookings to see your earnings here"
              : "Book your first ride to see payment history"}
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #E5E7EB",
            overflow: "hidden",
          }}
        >
          {payments.map((payment, index) => (
            <div
              key={payment.id}
              style={{
                padding: "1.5rem",
                borderBottom:
                  index < payments.length - 1 ? "1px solid #F3F4F6" : "none",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#F9FAFB")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              onClick={() => {
                setSelectedPayment(payment);
                setShowReceipt(true);
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                {/* Left Section */}
                <div style={{ flex: "1", minWidth: "250px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontFamily: "monospace",
                        color: "#6B7280",
                        fontWeight: "600",
                      }}
                    >
                      #{payment.id.toString().padStart(6, "0")}
                    </span>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        background:
                          payment.status === "SUCCESS"
                            ? "#D1FAE5"
                            : payment.status === "PENDING"
                            ? "#FEF3C7"
                            : "#FEE2E2",
                        color:
                          payment.status === "SUCCESS"
                            ? "#065F46"
                            : payment.status === "PENDING"
                            ? "#92400E"
                            : "#991B1B",
                      }}
                    >
                      {payment.status}
                    </span>
                  </div>
                  <div
                    style={{
                      fontWeight: "600",
                      color: "#1F2937",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {payment.booking.ride.source} →{" "}
                    {payment.booking.ride.destination}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#6B7280" }}>
                    {payment.booking.seatsBooked} seat(s) •{" "}
                    {formatDateTime(payment.createdAt)}
                  </div>
                </div>

                {/* Right Section */}
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      color: "#1F2937",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {formatCurrency(payment.amount)}
                  </div>
                  {user.role === ROLE.DRIVER && (
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "#059669",
                        fontWeight: "600",
                      }}
                    >
                      You earned: {formatCurrency(payment.driverEarnings)}
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadReceipt(payment);
                    }}
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.5rem 1rem",
                      background: "#2563EB",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Receipt
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && selectedPayment && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={() => setShowReceipt(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Receipt Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #2563EB, #1E40AF)",
                padding: "2rem",
                color: "white",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      marginBottom: "0.5rem",
                    }}
                  >
                    SmartRides
                  </h2>
                  <p style={{ opacity: 0.9 }}>Official Receipt</p>
                </div>
                <button
                  onClick={() => setShowReceipt(false)}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    color: "white",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Receipt Body */}
            <div style={{ padding: "2rem" }}>
              {/* Receipt ID and Status */}
              <div
                style={{
                  marginBottom: "2rem",
                  paddingBottom: "2rem",
                  borderBottom: "2px solid #F3F4F6",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#6B7280",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Receipt ID
                    </div>
                    <div style={{ fontSize: "1.25rem", fontWeight: "700" }}>
                      #{selectedPayment.id.toString().padStart(6, "0")}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "6px",
                      background:
                        selectedPayment.status === "SUCCESS"
                          ? "#D1FAE5"
                          : "#FEF3C7",
                      color:
                        selectedPayment.status === "SUCCESS"
                          ? "#065F46"
                          : "#92400E",
                      fontWeight: "700",
                    }}
                  >
                    {selectedPayment.status}
                  </div>
                </div>
                <div style={{ fontSize: "0.875rem", color: "#6B7280" }}>
                  {formatDateTime(selectedPayment.createdAt)}
                </div>
              </div>

              {/* Ride Details */}
              <div style={{ marginBottom: "2rem" }}>
                <h3
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "700",
                    color: "#6B7280",
                    textTransform: "uppercase",
                    marginBottom: "1rem",
                  }}
                >
                  Ride Details
                </h3>
                <div
                  style={{
                    background: "#F9FAFB",
                    padding: "1rem",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                  }}
                >
                  <div style={{ marginBottom: "0.75rem" }}>
                    <span style={{ color: "#6B7280" }}>Booking ID:</span>
                    <span style={{ fontWeight: "600", marginLeft: "0.5rem" }}>
                      #{selectedPayment.booking.id}
                    </span>
                  </div>
                  <div style={{ marginBottom: "0.75rem" }}>
                    <span style={{ color: "#6B7280" }}>Route:</span>
                    <span style={{ fontWeight: "600", marginLeft: "0.5rem" }}>
                      {selectedPayment.booking.ride.source} →{" "}
                      {selectedPayment.booking.ride.destination}
                    </span>
                  </div>
                  <div style={{ marginBottom: "0.75rem" }}>
                    <span style={{ color: "#6B7280" }}>Pickup:</span>
                    <span style={{ marginLeft: "0.5rem" }}>
                      {selectedPayment.booking.pickupLocation}
                    </span>
                  </div>
                  <div style={{ marginBottom: "0.75rem" }}>
                    <span style={{ color: "#6B7280" }}>Drop:</span>
                    <span style={{ marginLeft: "0.5rem" }}>
                      {selectedPayment.booking.dropLocation}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#6B7280" }}>Seats:</span>
                    <span style={{ fontWeight: "600", marginLeft: "0.5rem" }}>
                      {selectedPayment.booking.seatsBooked}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div style={{ marginBottom: "2rem" }}>
                <h3
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "700",
                    color: "#6B7280",
                    textTransform: "uppercase",
                    marginBottom: "1rem",
                  }}
                >
                  Payment Details
                </h3>
                <div
                  style={{
                    background: "#F9FAFB",
                    padding: "1rem",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.75rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    <span style={{ color: "#6B7280" }}>Total Amount</span>
                    <span style={{ fontWeight: "600" }}>
                      {formatCurrency(selectedPayment.amount)}
                    </span>
                  </div>
                  {user.role === ROLE.DRIVER && (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.75rem",
                          fontSize: "0.875rem",
                        }}
                      >
                        <span style={{ color: "#6B7280" }}>
                          Platform Fee (10%)
                        </span>
                        <span style={{ color: "#EF4444" }}>
                          - {formatCurrency(selectedPayment.platformCommission)}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          paddingTop: "0.75rem",
                          borderTop: "1px solid #E5E7EB",
                          fontSize: "1rem",
                        }}
                      >
                        <span style={{ fontWeight: "700" }}>Your Earnings</span>
                        <span style={{ fontWeight: "700", color: "#10B981" }}>
                          {formatCurrency(selectedPayment.driverEarnings)}
                        </span>
                      </div>
                    </>
                  )}
                  <div
                    style={{
                      marginTop: "1rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid #E5E7EB",
                      fontSize: "0.75rem",
                      color: "#6B7280",
                    }}
                  >
                    <div style={{ marginBottom: "0.25rem" }}>
                      Payment Method: Razorpay
                    </div>
                    <div style={{ marginBottom: "0.25rem" }}>
                      Payment ID: {selectedPayment.razorpayPaymentId}
                    </div>
                    <div>Order ID: {selectedPayment.razorpayOrderId}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={() => downloadReceipt(selectedPayment)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: "#2563EB",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download Receipt
                </button>
              </div>

              {/* Footer */}
              <div
                style={{
                  marginTop: "2rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #F3F4F6",
                  textAlign: "center",
                  fontSize: "0.75rem",
                  color: "#6B7280",
                }}
              >
                Thank you for using SmartRides!
                <br />
                For support: support@smartrides.com
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #E5E7EB;
          border-top: 3px solid #2563EB;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentHistory;
