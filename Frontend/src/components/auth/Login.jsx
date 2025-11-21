import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { ROLE } from "../../utils/constants";

const Login = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // ... Logic remains identical to original file ...
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await authService.sendOTP(email);
      if (response.success) {
        setStep(2);
      } else {
        setError(response.message || "Failed to send OTP");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "User not found or failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await authService.verifyOTP(email, otp);
      if (response.success) {
        setStep(3);
      } else {
        setError(response.message || "Invalid OTP");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await authService.completeLogin(email, otp, password);
      if (response.success) {
        await login({ email, password });
        navigate(
          response.data.role === ROLE.DRIVER
            ? "/driver/dashboard"
            : "/passenger/dashboard"
        );
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Password is incorrect! Please try again!"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setError("");
    if (step === 2) {
      setStep(1);
      setOtp("");
    } else if (step === 3) {
      setStep(2);
      setPassword("");
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setLoading(true);
    try {
      await authService.sendOTP(email);
      alert("OTP resent to your email!");
    } catch (err) {
      setError("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-dark">Welcome Back</h2>
          <p className="text-gray-500 text-sm mt-2">
            Secure login to your account
          </p>
        </div>

        {/* Progress Steps */}
        <div className="steps-container">
          <div className={`step-dot ${step >= 1 ? "active" : ""}`}>1</div>
          <div className={`step-line ${step >= 2 ? "active" : ""}`}></div>
          <div className={`step-dot ${step >= 2 ? "active" : ""}`}>2</div>
          <div className={`step-line ${step >= 3 ? "active" : ""}`}></div>
          <div className={`step-dot ${step >= 3 ? "active" : ""}`}>3</div>
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

        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              {loading ? "Sending..." : "Continue"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOTPSubmit}>
            <div className="text-center mb-4 text-sm text-gray-600">
              Code sent to <strong>{email}</strong>
            </div>
            <div className="form-group">
              <label className="form-label">Enter Verification Code</label>
              <input
                type="text"
                className="form-input text-center"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                maxLength="6"
                required
                autoFocus
                style={{ letterSpacing: "0.5em", fontSize: "1.25rem" }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Verify
              </button>
            </div>
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-primary text-sm mt-4 text-center w-full hover:underline"
            >
              Resend Code
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="alert-success mb-4">
              <span className="text-sm">✨ Email verified successfully</span>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Login
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .steps-container { display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; }
        .step-dot { width: 32px; height: 32px; border-radius: 50%; background: var(--bg); color: var(--text-light); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; border: 2px solid var(--border); z-index: 1; transition: all 0.3s; }
        .step-dot.active { background: var(--primary); color: white; border-color: var(--primary); }
        .step-line { flex: 1; height: 2px; background: var(--border); max-width: 40px; margin: 0 4px; transition: all 0.3s; }
        .step-line.active { background: var(--primary); }
        .alert-error { background: #FEF2F2; color: #991B1B; padding: 0.75rem; border-radius: 0.5rem; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; border: 1px solid #FECACA; }
        .alert-success { background: #ECFDF5; color: #065F46; padding: 0.5rem; border-radius: 0.5rem; text-align: center; border: 1px solid #A7F3D0; }
      `}</style>
    </div>
  );
};

export default Login;
