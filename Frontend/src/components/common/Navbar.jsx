import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLE } from "../../utils/constants";
import NotificationBell from "./NotificationBell";

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
  const linkClass = (path) => (isActive(path) ? "nav-link active" : "nav-link");

  // Helper to determine the badge text
  const getRoleBadge = (role) => {
    if (role === ROLE.ADMIN) return "Admin";
    if (role === ROLE.DRIVER) return "Driver";
    return "Passenger";
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="brand-logo">
          <div className="brand-icon">
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="white"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span>SmartRides</span>
        </Link>

        {/* Desktop Menu */}
        <div className="desktop-menu">
          {user ? (
            <>
              <div className="nav-links">
                {/* ADMIN LINKS */}
                {user.role === ROLE.ADMIN && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className={linkClass("/admin/dashboard")}
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      to="/admin/users"
                      className={linkClass("/admin/users")}
                    >
                      Users
                    </Link>
                  </>
                )}

                {/* DRIVER LINKS */}
                {user.role === ROLE.DRIVER && (
                  <>
                    <Link
                      to="/driver/dashboard"
                      className={linkClass("/driver/dashboard")}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/driver/post-ride"
                      className={linkClass("/driver/post-ride")}
                    >
                      Post Ride
                    </Link>
                  </>
                )}

                {/* PASSENGER LINKS */}
                {user.role === ROLE.PASSENGER && (
                  <>
                    <Link
                      to="/passenger/dashboard"
                      className={linkClass("/passenger/dashboard")}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/passenger/search-rides"
                      className={linkClass("/passenger/search-rides")}
                    >
                      Find Ride
                    </Link>
                  </>
                )}

                <Link to="/profile" className={linkClass("/profile")}>
                  Profile
                </Link>
              </div>

              <div className="user-menu">
                <NotificationBell />

                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-badge">{getRoleBadge(user.role)}</span>
                </div>
                <button onClick={handleLogout} className="btn-logout">
                  <svg
                    className="icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              {/* Removed separate Admin Login link since login is now unified */}
              <Link to="/login" className="nav-link">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg
            className="icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <style>{`
        .navbar {
          background-color: white;
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 1000;
          height: 72px;
          display: flex;
          align-items: center;
        }
        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .brand-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--primary);
          letter-spacing: -0.025em;
        }
        .brand-icon {
          background: var(--primary);
          padding: 6px;
          border-radius: 8px;
          display: flex;
        }
        .desktop-menu {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .nav-links {
          display: flex;
          gap: 1.5rem;
        }
        .nav-link {
          font-weight: 500;
          color: var(--text);
          font-size: 0.95rem;
        }
        .nav-link:hover, .nav-link.active {
          color: var(--primary);
        }
        .user-menu {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-left: 1.5rem;
          border-left: 1px solid var(--border);
        }
        .user-info {
          text-align: right;
          line-height: 1.2;
        }
        .user-name {
          display: block;
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--dark);
        }
        .user-badge {
          font-size: 0.75rem;
          color: var(--text-light);
          text-transform: uppercase;
        }
        .btn-logout {
          background: #FEE2E2;
          color: #EF4444;
          border: none;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-logout:hover { background: #FCA5A5; }
        .btn-sm { padding: 0.5rem 1.25rem; font-size: 0.875rem; }
        .auth-buttons { display: flex; gap: 1.5rem; align-items: center; }
        .mobile-toggle { display: none; background: none; border: none; cursor: pointer; color: var(--dark); }
        
        @media (max-width: 768px) {
          .desktop-menu { display: none; }
          .mobile-toggle { display: block; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
