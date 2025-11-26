import api from "./api";

export const distanceService = {
  /**
   * Calculate distance between two locations
   */
  calculateDistance: async (origin, destination) => {
    const response = await api.get("/distance/calculate", {
      params: { origin, destination },
    });
    return response.data;
  },

  /**
   * Get distance and duration details
   */
  getDistanceDetails: async (origin, destination) => {
    const response = await api.get("/distance/details", {
      params: { origin, destination },
    });
    return response.data;
  },

  /**
   * Get fare estimate with breakdown
   */
  getFareEstimate: async (origin, destination, pricePerKm, seatsBooked = 1) => {
    const response = await api.get("/distance/fare-estimate", {
      params: { origin, destination, pricePerKm, seatsBooked },
    });
    return response.data;
  },
};
