import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLE } from "../../utils/constants";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to="/" style={styles.brand}>
          <span style={styles.brandIcon}>🚗</span>
          Smart Ride Sharing
        </Link>

        {/* Desktop Menu */}
        <div style={styles.desktopMenu}>
          {user ? (
            <>
              <div style={styles.userInfo}>
                <div style={styles.avatar}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={styles.userName}>{user.name}</span>
                <span style={styles.userRole}>{user.role}</span>
              </div>
              {user.role === ROLE.DRIVER ? (
                <>
                  <Link
                    to="/driver/dashboard"
                    style={{
                      ...styles.link,
                      ...(isActive("/driver/dashboard")
                        ? styles.activeLink
                        : {}),
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/driver/post-ride"
                    style={{
                      ...styles.link,
                      ...(isActive("/driver/post-ride")
                        ? styles.activeLink
                        : {}),
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Post Ride
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/passenger/dashboard"
                    style={{
                      ...styles.link,
                      ...(isActive("/passenger/dashboard")
                        ? styles.activeLink
                        : {}),
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/passenger/search-rides"
                    style={{
                      ...styles.link,
                      ...(isActive("/passenger/search-rides")
                        ? styles.activeLink
                        : {}),
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Search Rides
                  </Link>
                </>
              )}
              <Link
                to="/profile"
                style={{
                  ...styles.link,
                  ...(isActive("/profile") ? styles.activeLink : {}),
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button onClick={handleLogout} style={styles.logoutButton}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/"
                style={{
                  ...styles.link,
                  ...(isActive("/") ? styles.activeLink : {}),
                }}
              >
                Home
              </Link>
              <Link to="/login" style={styles.loginLink}>
                Login
              </Link>
              <Link to="/register" style={styles.registerButton}>
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          style={styles.mobileMenuButton}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={styles.mobileMenu}>
          {user ? (
            <>
              <div style={styles.mobileUserInfo}>
                <div style={styles.avatar}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={styles.mobileUserName}>{user.name}</div>
                  <div style={styles.mobileUserRole}>{user.role}</div>
                </div>
              </div>
              {user.role === ROLE.DRIVER ? (
                <>
                  <Link
                    to="/driver/dashboard"
                    style={styles.mobileLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/driver/post-ride"
                    style={styles.mobileLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Post Ride
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/passenger/dashboard"
                    style={styles.mobileLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/passenger/search-rides"
                    style={styles.mobileLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Search Rides
                  </Link>
                </>
              )}
              <Link
                to="/profile"
                style={styles.mobileLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button onClick={handleLogout} style={styles.mobileLogoutButton}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/"
                style={styles.mobileLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/login"
                style={styles.mobileLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={styles.mobileLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: "#2c3e50",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: "70px",
  },
  brand: {
    color: "white",
    fontSize: "1.5rem",
    fontWeight: "bold",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  brandIcon: {
    fontSize: "1.8rem",
  },
  desktopMenu: {
    display: "flex",
    alignItems: "center",
    gap: "25px",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 16px",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: "50px",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#667eea",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "1.2rem",
  },
  userName: {
    color: "white",
    fontWeight: "600",
  },
  userRole: {
    color: "#ffd700",
    fontSize: "0.85rem",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  link: {
    color: "white",
    textDecoration: "none",
    padding: "8px 16px",
    borderRadius: "5px",
    transition: "all 0.3s",
    fontWeight: "500",
  },
  activeLink: {
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "#ffd700",
  },
  loginLink: {
    color: "white",
    textDecoration: "none",
    padding: "8px 20px",
    borderRadius: "5px",
    transition: "all 0.3s",
    fontWeight: "500",
    border: "2px solid transparent",
  },
  registerButton: {
    backgroundColor: "#667eea",
    color: "white",
    textDecoration: "none",
    padding: "10px 25px",
    borderRadius: "50px",
    fontWeight: "bold",
    transition: "all 0.3s",
    boxShadow: "0 4px 15px rgba(102,126,234,0.4)",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    padding: "10px 25px",
    borderRadius: "50px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.3s",
    boxShadow: "0 4px 15px rgba(231,76,60,0.4)",
  },
  mobileMenuButton: {
    display: "none",
    backgroundColor: "transparent",
    border: "none",
    color: "white",
    fontSize: "1.8rem",
    cursor: "pointer",
    padding: "5px",
  },
  mobileMenu: {
    display: "none",
    flexDirection: "column",
    backgroundColor: "#34495e",
    padding: "20px",
    gap: "10px",
  },
  mobileUserInfo: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: "10px",
    marginBottom: "10px",
  },
  mobileUserName: {
    color: "white",
    fontWeight: "bold",
    fontSize: "1.1rem",
  },
  mobileUserRole: {
    color: "#ffd700",
    fontSize: "0.9rem",
    textTransform: "uppercase",
  },
  mobileLink: {
    color: "white",
    textDecoration: "none",
    padding: "12px 15px",
    borderRadius: "5px",
    transition: "background-color 0.3s",
    fontWeight: "500",
  },
  mobileLogoutButton: {
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "10px",
  },
  "@media (max-width: 768px)": {
    desktopMenu: {
      display: "none",
    },
    mobileMenuButton: {
      display: "block",
    },
    mobileMenu: {
      display: "flex",
    },
  },
};

export default Navbar;
