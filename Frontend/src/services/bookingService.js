import api from "./api";

export const bookingService = {
  createBooking: async (bookingData) => {
    const response = await api.post("/rides/book", bookingData);
    return response.data;
  },

  getPassengerBookings: async () => {
    const response = await api.get("/rides/bookings/passenger");
    return response.data;
  },

  getDriverBookings: async () => {
    const response = await api.get("/rides/bookings/driver");
    return response.data;
  },
};
