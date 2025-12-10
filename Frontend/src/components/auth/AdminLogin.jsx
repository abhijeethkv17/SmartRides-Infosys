import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Use the new adminLogin function from context
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Execute login via Context (handles API + State update)
      const response = await adminLogin(formData);

      if (response.success) {
        // Navigate immediately - Context is already updated
        // replace: true prevents back-button returning to login
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(
        err.response?.data?.message ||
          "Invalid email or password. Make sure you're using an admin account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-card">
        <div className="text-center mb-6">
          <div className="admin-badge">🔐 ADMIN ACCESS</div>
          <h2 className="text-2xl font-bold text-dark">Admin Login</h2>
          <p className="text-gray-500 text-sm mt-2">
            Direct access for administrators
          </p>
        </div>

        {error && (
          <div className="alert-error">
            <svg
              className="icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@smartrides.com"
              required
              className="form-input"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter admin password"
              required
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%" }}
          >
            {loading ? "Logging in..." : "Login as Admin"}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Not an admin?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              Regular Login
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .admin-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: white;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 700;
          margin-bottom: 1rem;
          letter-spacing: 0.05em;
          box-shadow: var(--shadow);
        }
        .alert-error {
          background: #FEF2F2;
          color: #991B1B;
          padding: 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border: 1px solid #FECACA;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
