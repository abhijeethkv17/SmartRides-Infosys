import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <h2 style={styles.title}>Register</h2>
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.input}
            >
              <option value={ROLE.PASSENGER}>Passenger</option>
              <option value={ROLE.DRIVER}>Driver</option>
            </select>
          </div>

          {formData.role === ROLE.DRIVER && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Car Model</label>
                <input
                  type="text"
                  name="carModel"
                  value={formData.carModel}
                  onChange={handleChange}
                  required={formData.role === ROLE.DRIVER}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>License Plate</label>
                <input
                  type="text"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  required={formData.role === ROLE.DRIVER}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Vehicle Capacity</label>
                <input
                  type="number"
                  name="vehicleCapacity"
                  value={formData.vehicleCapacity}
                  onChange={handleChange}
                  min="1"
                  max="20"
                  required={formData.role === ROLE.DRIVER}
                  style={styles.input}
                />
              </div>
            </>
          )}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <a href="/login" style={styles.link}>
            Login here
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
  error: {
    backgroundColor: "#fee",
    color: "#c00",
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "20px",
    textAlign: "center",
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

export default Register;
