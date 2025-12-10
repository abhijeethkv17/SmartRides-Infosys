import React, { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Failed to parse user data", error);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const userData = await authService.login(credentials);
    if (userData.token) {
      setUser(userData);
    }
    return userData;
  };

  // NEW: Handle the OTP+Password login flow via Context
  const completeLogin = async (email, otp, password) => {
    try {
      const userData = await authService.completeLogin(email, otp, password);
      // Check if we got a valid user object with a token
      if (userData && userData.token) {
        setUser(userData);
        return { success: true, data: userData };
      }
      return { success: false, message: "Login failed" };
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    const userDataResponse = await authService.register(userData);
    if (userDataResponse.token) {
      setUser(userDataResponse);
    }
    return userDataResponse;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        completeLogin, // Expose this function
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
