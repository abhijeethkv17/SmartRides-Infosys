import api from "./api";

export const reviewService = {
  /**
   * Submit a review for a booking
   */
  submitReview: async (reviewData) => {
    const response = await api.post("/reviews", reviewData);
    return response.data;
  },

  /**
   * Get reviews for a specific user
   */
  getReviewsForUser: async (userId) => {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data;
  },

  /**
   * Get user's rating summary
   */
  getUserRatingSummary: async (userId) => {
    const response = await api.get(`/reviews/user/${userId}/summary`);
    return response.data;
  },

  /**
   * Check if current user can review a booking
   */
  canReviewBooking: async (bookingId) => {
    const response = await api.get(`/reviews/can-review/${bookingId}`);
    return response.data;
  },

  /**
   * Get pending reviews for current user
   */
  getPendingReviews: async () => {
    const response = await api.get("/reviews/pending");
    return response.data;
  },
};
