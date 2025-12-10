import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "var(--primary)",
        }}
      >
        Loading...
      </div>
    );
  }

  // Debugging: Check why redirect is happening
  if (!user) {
    console.log("PrivateRoute: No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    console.log(
      `PrivateRoute: Role mismatch. Required: ${role}, Found: ${user.role}`
    );
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
