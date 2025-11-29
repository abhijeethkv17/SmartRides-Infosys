import api from "./api";

export const paymentService = {
  /**
   * Create payment order for a booking
   */
  createPaymentOrder: async (bookingId) => {
    const response = await api.post(`/payments/create-order/${bookingId}`);
    return response.data;
  },

  /**
   * Verify payment after Razorpay success
   */
  verifyPayment: async (paymentData) => {
    const response = await api.post("/payments/verify", paymentData);
    return response.data;
  },

  /**
   * Handle payment failure
   */
  handlePaymentFailure: async (razorpayOrderId, reason) => {
    const response = await api.post("/payments/failure", null, {
      params: { razorpayOrderId, reason },
    });
    return response.data;
  },

  /**
   * Get payment details for a booking
   */
  getPaymentByBooking: async (bookingId) => {
    const response = await api.get(`/payments/booking/${bookingId}`);
    return response.data;
  },

  /**
   * Get passenger's payment history
   */
  getPassengerPaymentHistory: async () => {
    const response = await api.get("/payments/passenger/history");
    return response.data;
  },

  /**
   * Get driver's earnings
   */
  getDriverEarnings: async () => {
    const response = await api.get("/payments/driver/earnings");
    return response.data;
  },

  /**
   * Get all driver payments
   */
  getAllDriverPayments: async () => {
    const response = await api.get("/payments/driver/all");
    return response.data;
  },

  /**
   * Get Razorpay key
   */
  getRazorpayKey: async () => {
    const response = await api.get("/payments/razorpay-key");
    return response.data;
  },

  /**
   * Initialize Razorpay payment
   */
  initializeRazorpayPayment: (options) => {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error("Razorpay SDK not loaded"));
        return;
      }

      const rzp = new window.Razorpay({
        ...options,
        handler: function (response) {
          resolve(response);
        },
        modal: {
          ondismiss: function () {
            reject(new Error("Payment cancelled by user"));
          },
        },
      });

      rzp.on("payment.failed", function (response) {
        reject(response.error);
      });

      rzp.open();
    });
  },
};
