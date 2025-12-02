import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext"; // Import
import Navbar from "./components/common/Navbar";
import PrivateRoute from "./components/common/PrivateRoute";
import LandingPage from "./components/common/LandingPage";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import DriverDashboard from "./components/driver/DriverDashboard";
import PostRide from "./components/driver/PostRide";
import EditRide from "./components/driver/EditRide";
import PassengerDashboard from "./components/passenger/PassengerDashboard";
import SearchRides from "./components/passenger/SearchRides";
import UserProfile from "./components/profile/UserProfile";
import PaymentHistory from "./components/payment/PaymentHistory";
import { ROLE } from "./utils/constants";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        {" "}
        {/* Wrap NotificationProvider inside AuthProvider */}
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/driver/dashboard"
                element={
                  <PrivateRoute role={ROLE.DRIVER}>
                    <DriverDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/driver/post-ride"
                element={
                  <PrivateRoute role={ROLE.DRIVER}>
                    <PostRide />
                  </PrivateRoute>
                }
              />
              <Route
                path="/driver/edit-ride/:id"
                element={
                  <PrivateRoute role={ROLE.DRIVER}>
                    <EditRide />
                  </PrivateRoute>
                }
              />
              <Route
                path="/passenger/dashboard"
                element={
                  <PrivateRoute role={ROLE.PASSENGER}>
                    <PassengerDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/passenger/search-rides"
                element={
                  <PrivateRoute role={ROLE.PASSENGER}>
                    <SearchRides />
                  </PrivateRoute>
                }
              />

              <Route
                path="/payments/history"
                element={
                  <PrivateRoute>
                    <PaymentHistory />
                  </PrivateRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <UserProfile />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
