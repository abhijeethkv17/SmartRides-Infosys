import api from "./api";

export const rideService = {
  postRide: async (rideData) => {
    const response = await api.post("/rides", rideData);
    return response.data;
  },

  updateRide: async (id, rideData) => {
    const response = await api.put(`/rides/${id}`, rideData);
    return response.data;
  },

  deleteRide: async (id) => {
    const response = await api.delete(`/rides/${id}`);
    return response.data;
  },

  searchRides: async (source, destination, date = null) => {
    const params = { source, destination };
    if (date) {
      params.date = date;
    }
    const response = await api.get("/rides/search", { params });
    return response.data;
  },

  getDriverRides: async () => {
    const response = await api.get("/rides/my-rides");
    return response.data;
  },

  getAllActiveRides: async () => {
    const response = await api.get("/rides");
    return response.data;
  },

  getRideById: async (id) => {
    const response = await api.get(`/rides/${id}`);
    return response.data;
  },
};
