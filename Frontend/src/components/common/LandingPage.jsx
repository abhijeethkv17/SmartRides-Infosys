import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Share Your Ride,
            <br />
            <span style={styles.heroTitleAccent}>Save The Planet</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Connect with fellow travelers, reduce costs, and make your journey
            more sustainable. Join thousands of users carpooling across the
            country.
          </p>
          <div style={styles.heroButtons}>
            {!user ? (
              <>
                <Link to="/register" style={styles.primaryButton}>
                  Get Started
                </Link>
                <Link to="/login" style={styles.secondaryButton}>
                  Sign In
                </Link>
              </>
            ) : (
              <Link
                to={
                  user.role === "DRIVER"
                    ? "/driver/dashboard"
                    : "/passenger/dashboard"
                }
                style={styles.primaryButton}
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
        <div style={styles.heroImage}>
          <div style={styles.heroImagePlaceholder}>
            <svg
              style={styles.carIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.features}>
        <h2 style={styles.sectionTitle}>Why Choose Smart Ride Sharing?</h2>
        <div style={styles.featureGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>💰</div>
            <h3 style={styles.featureTitle}>Save Money</h3>
            <p style={styles.featureText}>
              Share travel costs and reduce your expenses by up to 70% compared
              to solo driving.
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🌍</div>
            <h3 style={styles.featureTitle}>Eco-Friendly</h3>
            <p style={styles.featureText}>
              Reduce carbon emissions and contribute to a greener planet with
              every shared ride.
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🤝</div>
            <h3 style={styles.featureTitle}>Meet People</h3>
            <p style={styles.featureText}>
              Connect with interesting travelers and make your journey more
              enjoyable.
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>⚡</div>
            <h3 style={styles.featureTitle}>Quick & Easy</h3>
            <p style={styles.featureText}>
              Find rides in seconds with our smart matching system and intuitive
              interface.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={styles.howItWorks}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <div style={styles.stepsContainer}>
          <div style={styles.step}>
            <div style={styles.stepNumber}>1</div>
            <h3 style={styles.stepTitle}>Create Account</h3>
            <p style={styles.stepText}>
              Sign up as a driver or passenger in under a minute
            </p>
          </div>
          <div style={styles.stepArrow}>→</div>
          <div style={styles.step}>
            <div style={styles.stepNumber}>2</div>
            <h3 style={styles.stepTitle}>Post or Search</h3>
            <p style={styles.stepText}>
              Drivers post rides, passengers search for matches
            </p>
          </div>
          <div style={styles.stepArrow}>→</div>
          <div style={styles.step}>
            <div style={styles.stepNumber}>3</div>
            <h3 style={styles.stepTitle}>Book & Travel</h3>
            <p style={styles.stepText}>
              Confirm your ride and enjoy the journey together
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={styles.stats}>
        <div style={styles.statItem}>
          <div style={styles.statNumber}>10,000+</div>
          <div style={styles.statLabel}>Active Users</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statNumber}>50,000+</div>
          <div style={styles.statLabel}>Rides Completed</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statNumber}>₹2M+</div>
          <div style={styles.statLabel}>Money Saved</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statNumber}>500+</div>
          <div style={styles.statLabel}>Cities Covered</div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to Start Your Journey?</h2>
        <p style={styles.ctaText}>
          Join our community today and experience the future of shared mobility
        </p>
        {!user ? (
          <Link to="/register" style={styles.ctaButton}>
            Sign Up Now - It's Free!
          </Link>
        ) : (
          <Link
            to={
              user.role === "DRIVER"
                ? "/driver/post-ride"
                : "/passenger/search-rides"
            }
            style={styles.ctaButton}
          >
            {user.role === "DRIVER" ? "Post a Ride" : "Find a Ride"}
          </Link>
        )}
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerSection}>
            <h3 style={styles.footerTitle}>Smart Ride Sharing</h3>
            <p style={styles.footerText}>
              Making travel affordable, sustainable, and social.
            </p>
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.footerSubtitle}>Quick Links</h4>
            <Link to="/login" style={styles.footerLink}>
              Login
            </Link>
            <Link to="/register" style={styles.footerLink}>
              Register
            </Link>
            {user && (
              <Link
                to={
                  user.role === "DRIVER"
                    ? "/driver/dashboard"
                    : "/passenger/dashboard"
                }
                style={styles.footerLink}
              >
                Dashboard
              </Link>
            )}
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.footerSubtitle}>Contact</h4>
            <p style={styles.footerText}>support@smartridesharing.com</p>
            <p style={styles.footerText}>+91 1234567890</p>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>© 2024 Smart Ride Sharing. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
    overflowX: "hidden",
  },
  hero: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "80px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "600px",
    position: "relative",
  },
  heroContent: {
    maxWidth: "600px",
    zIndex: 1,
  },
  heroTitle: {
    fontSize: "3.5rem",
    fontWeight: "bold",
    marginBottom: "20px",
    lineHeight: 1.2,
  },
  heroTitleAccent: {
    color: "#ffd700",
  },
  heroSubtitle: {
    fontSize: "1.2rem",
    marginBottom: "40px",
    lineHeight: 1.6,
    opacity: 0.95,
  },
  heroButtons: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  primaryButton: {
    backgroundColor: "#ffd700",
    color: "#333",
    padding: "15px 40px",
    borderRadius: "50px",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "1.1rem",
    transition: "transform 0.3s, box-shadow 0.3s",
    display: "inline-block",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    color: "white",
    padding: "15px 40px",
    borderRadius: "50px",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "1.1rem",
    border: "2px solid white",
    transition: "all 0.3s",
    display: "inline-block",
  },
  heroImage: {
    marginLeft: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  heroImagePlaceholder: {
    width: "400px",
    height: "400px",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(10px)",
  },
  carIcon: {
    width: "200px",
    height: "200px",
    color: "white",
  },
  features: {
    padding: "80px 20px",
    backgroundColor: "#f8f9fa",
  },
  sectionTitle: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "60px",
    color: "#333",
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "40px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  featureCard: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "15px",
    textAlign: "center",
    boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
    transition: "transform 0.3s, box-shadow 0.3s",
    cursor: "pointer",
  },
  featureIcon: {
    fontSize: "3rem",
    marginBottom: "20px",
  },
  featureTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#333",
  },
  featureText: {
    color: "#666",
    lineHeight: 1.6,
  },
  howItWorks: {
    padding: "80px 20px",
    backgroundColor: "white",
  },
  stepsContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "1200px",
    margin: "0 auto",
    flexWrap: "wrap",
    gap: "20px",
  },
  step: {
    textAlign: "center",
    flex: "1",
    minWidth: "200px",
  },
  stepNumber: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#667eea",
    color: "white",
    fontSize: "2rem",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    boxShadow: "0 5px 15px rgba(102,126,234,0.4)",
  },
  stepTitle: {
    fontSize: "1.3rem",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#333",
  },
  stepText: {
    color: "#666",
  },
  stepArrow: {
    fontSize: "2rem",
    color: "#667eea",
    fontWeight: "bold",
  },
  stats: {
    padding: "60px 20px",
    backgroundColor: "#667eea",
    color: "white",
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: "40px",
  },
  statItem: {
    textAlign: "center",
  },
  statNumber: {
    fontSize: "3rem",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  statLabel: {
    fontSize: "1.1rem",
    opacity: 0.9,
  },
  cta: {
    padding: "80px 20px",
    backgroundColor: "#f8f9fa",
    textAlign: "center",
  },
  ctaTitle: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#333",
  },
  ctaText: {
    fontSize: "1.2rem",
    color: "#666",
    marginBottom: "40px",
  },
  ctaButton: {
    backgroundColor: "#667eea",
    color: "white",
    padding: "18px 50px",
    borderRadius: "50px",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "1.2rem",
    display: "inline-block",
    boxShadow: "0 5px 20px rgba(102,126,234,0.4)",
    transition: "transform 0.3s, box-shadow 0.3s",
  },
  footer: {
    backgroundColor: "#2c3e50",
    color: "white",
    padding: "60px 20px 20px",
  },
  footerContent: {
    display: "flex",
    justifyContent: "space-around",
    maxWidth: "1200px",
    margin: "0 auto 40px",
    flexWrap: "wrap",
    gap: "40px",
  },
  footerSection: {
    flex: "1",
    minWidth: "200px",
  },
  footerTitle: {
    fontSize: "1.5rem",
    marginBottom: "15px",
  },
  footerSubtitle: {
    fontSize: "1.2rem",
    marginBottom: "15px",
  },
  footerText: {
    color: "#bdc3c7",
    marginBottom: "10px",
    lineHeight: 1.6,
  },
  footerLink: {
    color: "#bdc3c7",
    textDecoration: "none",
    display: "block",
    marginBottom: "10px",
    transition: "color 0.3s",
  },
  footerBottom: {
    textAlign: "center",
    paddingTop: "20px",
    borderTop: "1px solid #34495e",
    color: "#95a5a6",
  },
};

export default LandingPage;
