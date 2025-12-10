import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
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

// Admin Components
import AdminDashboard from "./components/admin/AdminDashboard";
import UserManagement from "./components/admin/UserManagement";
import RideManagement from "./components/admin/RideManagement";
import BookingManagement from "./components/admin/BookingManagement";
import PaymentOversight from "./components/admin/PaymentOversight";
import AdminReports from "./components/admin/AdminReports";
import ActivityLogs from "./components/admin/ActivityLogs";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Driver Routes */}
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

              {/* Passenger Routes */}
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

              {/* Common Protected Routes */}
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

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <PrivateRoute role="ADMIN">
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <PrivateRoute role="ADMIN">
                    <UserManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/rides"
                element={
                  <PrivateRoute role="ADMIN">
                    <RideManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/bookings"
                element={
                  <PrivateRoute role="ADMIN">
                    <BookingManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/payments"
                element={
                  <PrivateRoute role="ADMIN">
                    <PaymentOversight />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <PrivateRoute role="ADMIN">
                    <AdminReports />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/activity"
                element={
                  <PrivateRoute role="ADMIN">
                    <ActivityLogs />
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
