import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLE } from "../../utils/constants";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: ROLE.PASSENGER,
    carModel: "",
    licensePlate: "",
    vehicleCapacity: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      };

      if (formData.role === ROLE.DRIVER) {
        if (
          !formData.carModel ||
          !formData.licensePlate ||
          !formData.vehicleCapacity
        ) {
          setError("Please provide vehicle details for driver registration");
          setLoading(false);
          return;
        }
        payload.carModel = formData.carModel;
        payload.licensePlate = formData.licensePlate;
        payload.vehicleCapacity = parseInt(formData.vehicleCapacity);
      }

      const response = await register(payload);
      if (response.success) {
        navigate(
          formData.role === ROLE.DRIVER
            ? "/driver/dashboard"
            : "/passenger/dashboard"
        );
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-card" style={{ maxWidth: "550px" }}>
        <div className="mb-6 border-b border-gray-100 pb-4 text-center">
          <h1 className="text-2xl font-bold text-dark">Create an Account</h1>
          <p className="text-gray-500 text-sm mt-1">
            Join our community of sustainable travelers
          </p>
        </div>

        {error && (
          <div className="alert-error mb-6">
            <svg
              className="icon w-5 h-5"
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
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Toggle */}
          <div className="form-group">
            <label className="form-label">I want to join as a...</label>
            <div className="role-toggle">
              <button
                type="button"
                className={`role-btn ${
                  formData.role === ROLE.PASSENGER ? "active" : ""
                }`}
                onClick={() => handleRoleSelect(ROLE.PASSENGER)}
              >
                <span className="text-xl"></span> Passenger
              </button>
              <button
                type="button"
                className={`role-btn ${
                  formData.role === ROLE.DRIVER ? "active" : ""
                }`}
                onClick={() => handleRoleSelect(ROLE.DRIVER)}
              >
                <span className="text-xl"></span> Driver
              </button>
            </div>
          </div>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-with-icon">
              <svg
                className="input-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="form-input pl-10"
              />
            </div>
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-with-icon">
                <svg
                  className="input-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  className="form-input pl-10"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <div className="input-with-icon">
                <svg
                  className="input-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  required
                  className="form-input pl-10"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <svg
                className="input-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="form-input pl-10"
              />
            </div>
          </div>

          {/* Driver Specific Fields */}
          {formData.role === ROLE.DRIVER && (
            <div className="driver-fields mt-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wide">
                Vehicle Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Car Model</label>
                  <div className="input-with-icon">
                    <svg
                      className="input-icon"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                    <input
                      type="text"
                      name="carModel"
                      value={formData.carModel}
                      onChange={handleChange}
                      placeholder="Swift Dzire"
                      required
                      className="form-input pl-10"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">License Plate</label>
                  <div className="input-with-icon">
                    <svg
                      className="input-icon"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                      />
                    </svg>
                    <input
                      type="text"
                      name="licensePlate"
                      value={formData.licensePlate}
                      onChange={handleChange}
                      placeholder="KA-01-AB-1234"
                      required
                      className="form-input pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Vehicle Capacity</label>
                <div className="input-with-icon">
                  <svg
                    className="input-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <input
                    type="number"
                    name="vehicleCapacity"
                    value={formData.vehicleCapacity}
                    onChange={handleChange}
                    min="1"
                    max="20"
                    placeholder="Total seats available"
                    required
                    className="form-input pl-10"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full mt-6"
            style={{ width: "100%" }}
          >
            {loading ? "Creating Account..." : "Register Now"}
          </button>

          <div className="text-center mt-6 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-semibold hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>

      <style>{`
        .grid-cols-2 { display: grid; grid-template-columns: 1fr 1fr; }
        .gap-4 { gap: 1rem; }
        .input-with-icon { position: relative; }
        .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 20px; height: 20px; color: #9CA3AF; pointer-events: none; }
        .pl-10 { padding-left: 2.5rem !important; }
        
        .role-toggle { display: flex; gap: 10px; background: #F3F4F6; padding: 5px; border-radius: 10px; margin-bottom: 1rem; }
        .role-btn { flex: 1; border: none; background: transparent; padding: 10px; border-radius: 8px; font-weight: 600; color: var(--text-light); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .role-btn:hover { color: var(--dark); }
        .role-btn.active { background: white; color: var(--primary); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        
        .driver-fields { animation: slideDown 0.3s ease-out; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        
        @media (max-width: 640px) { .grid-cols-2 { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default Register;
