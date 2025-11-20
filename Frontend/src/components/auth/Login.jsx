import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { ROLE } from "../../utils/constants";

const Login = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.sendOTP(email);
      if (response.success) {
        setStep(2);
        alert("OTP sent to your email!");
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
        // Use the custom login from context that saves to localStorage
        await login({ email, password }); // This is just to update context
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
    if (step === 2) {
      setStep(1);
      setOtp("");
      setError("");
    } else if (step === 3) {
      setStep(2);
      setPassword("");
      setError("");
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await authService.sendOTP(email);
      if (response.success) {
        alert("OTP resent to your email!");
      }
    } catch (err) {
      setError("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <h2 style={styles.title}>Login</h2>

        {/* Step Indicator */}
        <div style={styles.stepIndicator}>
          <div
            style={{ ...styles.step, ...(step >= 1 ? styles.stepActive : {}) }}
          >
            <span style={styles.stepNumber}>1</span>
            <span style={styles.stepLabel}>Email</span>
          </div>
          <div style={styles.stepLine}></div>
          <div
            style={{ ...styles.step, ...(step >= 2 ? styles.stepActive : {}) }}
          >
            <span style={styles.stepNumber}>2</span>
            <span style={styles.stepLabel}>OTP</span>
          </div>
          <div style={styles.stepLine}></div>
          <div
            style={{ ...styles.step, ...(step >= 3 ? styles.stepActive : {}) }}
          >
            <span style={styles.stepNumber}>3</span>
            <span style={styles.stepLabel}>Password</span>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your registered email"
                style={styles.input}
                autoFocus
              />
            </div>
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleOTPSubmit} style={styles.form}>
            <p style={styles.infoText}>
              We've sent a 6-digit OTP to <strong>{email}</strong>
            </p>
            <div style={styles.formGroup}>
              <label style={styles.label}>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                style={styles.input}
                autoFocus
              />
            </div>
            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={handleBack}
                style={styles.backButton}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                style={styles.button}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading}
              style={styles.linkButton}
            >
              Resend OTP
            </button>
          </form>
        )}

        {/* Step 3: Password */}
        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} style={styles.form}>
            <p style={styles.successText}>✓ OTP Verified Successfully!</p>
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                style={styles.input}
                autoFocus
              />
            </div>
            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={handleBack}
                style={styles.backButton}
              >
                Back
              </button>
              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        )}

        <p style={styles.footer}>
          Don't have an account?{" "}
          <a href="/register" style={styles.link}>
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "calc(100vh - 64px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: "20px",
  },
  formWrapper: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "500px",
  },
  title: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#2c3e50",
  },
  stepIndicator: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    padding: "0 20px",
  },
  step: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    opacity: 0.4,
  },
  stepActive: {
    opacity: 1,
  },
  stepNumber: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#3498db",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    marginBottom: "5px",
  },
  stepLabel: {
    fontSize: "12px",
    color: "#666",
  },
  stepLine: {
    flex: 1,
    height: "2px",
    backgroundColor: "#ddd",
    margin: "0 10px",
    marginBottom: "20px",
  },
  error: {
    backgroundColor: "#fee",
    color: "#c00",
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "20px",
    textAlign: "center",
  },
  successText: {
    color: "#27ae60",
    textAlign: "center",
    marginBottom: "20px",
    fontWeight: "bold",
  },
  infoText: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#666",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "5px",
    color: "#555",
    fontWeight: "500",
  },
  input: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
  },
  button: {
    backgroundColor: "#3498db",
    color: "white",
    padding: "12px",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  backButton: {
    flex: 1,
    backgroundColor: "#95a5a6",
    color: "white",
    padding: "12px",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    cursor: "pointer",
  },
  linkButton: {
    backgroundColor: "transparent",
    color: "#3498db",
    padding: "10px",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: "14px",
  },
  footer: {
    marginTop: "20px",
    textAlign: "center",
    color: "#666",
  },
  link: {
    color: "#3498db",
    textDecoration: "none",
  },
};

export default Login;
