import api from "./api";

export const authService = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    if (response.data.success && response.data.data) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.success && response.data.data) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data));
    }
    return response.data;
  },

  sendOTP: async (email) => {
    const response = await api.post("/auth/send-otp", { email });
    return response.data;
  },

  verifyOTP: async (email, otp) => {
    const response = await api.post("/auth/verify-otp", { email, otp });
    return response.data;
  },

  completeLogin: async (email, otp, password) => {
    const response = await api.post("/auth/complete-login", {
      email,
      otp,
      password,
    });
    if (response.data.success && response.data.data) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return localStorage.getItem("token") !== null;
  },

  getUserProfile: async () => {
    const response = await api.get("/user/profile");
    return response.data;
  },
};
