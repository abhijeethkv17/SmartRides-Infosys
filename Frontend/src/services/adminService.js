import api from "./api";

export const adminService = {
  // Dashboard Statistics
  getDashboardStats: async () => {
    const response = await api.get("/admin/dashboard/stats");
    return response.data;
  },

  // User Management
  getAllUsers: async (role = null, status = null, search = null) => {
    const params = {};
    if (role) params.role = role;
    if (status) params.status = status;
    if (search) params.search = search;
    const response = await api.get("/admin/users", { params });
    return response.data;
  },

  getUserDetails: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  toggleUserBlock: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/toggle-block`);
    return response.data;
  },

  verifyDriver: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/verify-driver`);
    return response.data;
  },

  // Ride Management
  getAllRides: async (status = null, search = null) => {
    const params = {};
    if (status) params.status = status;
    if (search) params.search = search;
    const response = await api.get("/admin/rides", { params });
    return response.data;
  },

  cancelRide: async (rideId, reason) => {
    const response = await api.put(`/admin/rides/${rideId}/cancel`, null, {
      params: { reason },
    });
    return response.data;
  },

  // Booking Management
  getAllBookings: async (status = null) => {
    const params = {};
    if (status) params.status = status;
    const response = await api.get("/admin/bookings", { params });
    return response.data;
  },

  // Payment Management
  getAllPayments: async (status = null) => {
    const params = {};
    if (status) params.status = status;
    const response = await api.get("/admin/payments", { params });
    return response.data;
  },

  // Analytics
  getAnalytics: async (startDate, endDate) => {
    const response = await api.get("/admin/analytics", {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Reports
  generateReport: async (reportType, startDate, endDate) => {
    const response = await api.get("/admin/reports/generate", {
      params: { reportType, startDate, endDate },
    });
    return response.data;
  },

  // Activity Logs
  getActivityLogs: async (page = 0, size = 50) => {
    const response = await api.get("/admin/activity-logs", {
      params: { page, size },
    });
    return response.data;
  },
};
