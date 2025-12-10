import api from "./api";

export const authService = {
  // Login with Email & Password (for direct access if needed)
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.success && response.data.data) {
      localStorage.setItem("user", JSON.stringify(response.data.data));
      localStorage.setItem("token", response.data.data.token);
      return response.data.data;
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    if (response.data.success && response.data.data) {
      localStorage.setItem("user", JSON.stringify(response.data.data));
      localStorage.setItem("token", response.data.data.token);
      return response.data.data;
    }
    return response.data;
  },

  // Step 1: Send OTP
  sendOTP: async (email) => {
    const response = await api.post("/auth/send-otp", { email });
    return response.data;
  },

  // Step 2: Verify OTP
  verifyOTP: async (email, otp) => {
    const response = await api.post("/auth/verify-otp", { email, otp });
    return response.data;
  },

  // Step 3: Complete Login (OTP + Password)
  completeLogin: async (email, otp, password) => {
    const response = await api.post("/auth/complete-login", {
      email,
      otp,
      password,
    });

    if (response.data.success && response.data.data) {
      localStorage.setItem("user", JSON.stringify(response.data.data));
      localStorage.setItem("token", response.data.data.token);
      return response.data.data;
    }
    return response.data;
  },

  // ADDED: Method to fetch user profile
  getUserProfile: async () => {
    const response = await api.get("/user/profile");
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem("user"));
  },
};
