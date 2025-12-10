import React, { useState } from "react";
import { adminService } from "../../services/adminService";

const AdminReports = () => {
  const [reportType, setReportType] = useState("COMPREHENSIVE");
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Append time to ensure full day coverage
      const startDateTime = `${startDate}T00:00:00`;
      const endDateTime = `${endDate}T23:59:59`;

      const response = await adminService.generateReport(
        reportType,
        startDateTime,
        endDateTime
      );
      if (response.success) {
        setReportData(response.data);
      }
    } catch (err) {
      alert("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const renderDataGrid = (data) => {
    if (!data) return null;
    return (
      <div className="stats-grid-admin">
        {Object.entries(data).map(([key, value]) => {
          if (typeof value === "object" && value !== null) return null; // Skip nested objects for now
          return (
            <div key={key} className="stat-card-admin">
              <div className="stat-content">
                <p style={{ textTransform: "capitalize" }}>
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </p>
                <h3>
                  {typeof value === "number" &&
                  key.toLowerCase().includes("revenue")
                    ? `₹${value.toFixed(2)}`
                    : value}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1>System Reports</h1>
          <p>Generate detailed reports for analysis</p>
        </div>

        <div className="card mb-6">
          <div className="card-body">
            <form onSubmit={generateReport} className="report-form">
              <div className="form-group">
                <label className="form-label">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="form-select"
                >
                  <option value="COMPREHENSIVE">Comprehensive Overview</option>
                  <option value="REVENUE">Revenue Analysis</option>
                  <option value="RIDES">Ride Statistics</option>
                  <option value="USERS">User Growth</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div
                className="form-group"
                style={{ display: "flex", alignItems: "flex-end" }}
              >
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Generate Report"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {reportData && (
          <div className="report-results">
            <div className="section-header">
              <h2>Report Results</h2>
              <span className="text-sm text-gray-500">
                Generated: {new Date(reportData.generatedAt).toLocaleString()}
              </span>
            </div>

            {reportData.reportType === "COMPREHENSIVE" ? (
              <div className="comprehensive-view">
                <h3>Revenue</h3>
                {renderDataGrid(reportData.data.revenue)}
                <h3 className="mt-6">Rides</h3>
                {renderDataGrid(reportData.data.rides)}
                <h3 className="mt-6">Users</h3>
                {renderDataGrid(reportData.data.users)}
              </div>
            ) : (
              renderDataGrid(reportData.data)
            )}
          </div>
        )}
      </div>
      <style>{`
        .report-form {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #E5E7EB;
        }
        .stats-grid-admin {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .stat-card-admin {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .stat-content h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1F2937;
          margin-top: 0.5rem;
        }
        .mt-6 { margin-top: 1.5rem; }
      `}</style>
    </div>
  );
};

export default AdminReports;
