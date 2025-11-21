import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-pattern"></div>
        <div className="container hero-content">
          <div className="hero-text">
            <span className="hero-badge">🌱 Sustainable Travel</span>
            <h1>
              Share the Journey,
              <br />
              <span className="text-gradient">Save the Planet.</span>
            </h1>
            <p>
              Connect with verified travelers, reduce your carbon footprint, and
              cut commuting costs. The smartest way to get from A to B in 2025.
            </p>

            <div className="hero-buttons">
              {!user ? (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Start for Free
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg">
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
                  className="btn btn-primary btn-lg"
                >
                  Go to Dashboard
                  <svg
                    className="icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              )}
            </div>
          </div>
          <div className="hero-visual">
            {/* Abstract Visual Card */}
            <div className="visual-card main-card">
              <div className="card-row">
                <div className="circle"></div>
                <div className="line"></div>
                <div className="circle dest"></div>
              </div>
              <div className="card-info">
                <span>Bangalore</span>
                <span className="arrow">→</span>
                <span>Mysore</span>
              </div>
              <div className="card-meta">
                <span>⚡ Instant Booking</span>
                <span>👤 Verified Driver</span>
              </div>
            </div>
            <div className="visual-card float-card">
              <span className="emoji">🎉</span>
              <div>
                <div className="float-title">You saved ₹450</div>
                <div className="float-subtitle">on your last ride</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>10k+</h3>
              <p>Active Users</p>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <h3>50k+</h3>
              <p>Rides Completed</p>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <h3>₹2M+</h3>
              <p>Money Saved</p>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <h3>100%</h3>
              <p>Carbon Offset</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Why Choose Us</span>
            <h2>Everything you need for a smooth ride</h2>
            <p>
              We built SmartRides to make city-to-city travel affordable, safe,
              and convenient for everyone.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon bg-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3>Save on Travel Costs</h3>
              <p>
                Drivers cut fuel costs by up to 100%. Passengers travel for a
                fraction of the price of a bus or train ticket.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon bg-green">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3>Eco-Friendly Travel</h3>
              <p>
                Reduce the number of empty seats on the road. Together, we save
                tons of CO2 emissions every year.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon bg-amber">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3>Trusted Community</h3>
              <p>
                Every member is verified. We check IDs and reviews so you can
                book your ride with complete confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="steps-section">
        <div className="container">
          <div className="section-header text-center">
            <h2>How SmartRides Works</h2>
            <p>Three simple steps to start your journey</p>
          </div>

          <div className="steps-row">
            <div className="step-col">
              <div className="step-number">01</div>
              <h3>Search</h3>
              <p>
                Enter your destination and date to find drivers going your way.
              </p>
            </div>
            <div className="step-line-h"></div>
            <div className="step-col">
              <div className="step-number">02</div>
              <h3>Book</h3>
              <p>
                Choose the perfect ride based on time, price, and driver
                reviews.
              </p>
            </div>
            <div className="step-line-h"></div>
            <div className="step-col">
              <div className="step-number">03</div>
              <h3>Travel</h3>
              <p>
                Meet your driver and fellow travelers. Enjoy the ride and save
                money!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container cta-container">
          <h2>Ready to hit the road?</h2>
          <p>
            Join thousands of people making travel social, affordable, and
            sustainable.
          </p>
          {!user && (
            <Link to="/register" className="btn btn-primary btn-lg shadow-lg">
              Create Free Account
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-col brand-col">
              <div className="brand-logo footer-logo">
                <div className="brand-icon">
                  <svg
                    width="20"
                    height="20"
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
              </div>
              <p>
                The leading carpooling platform connecting drivers and
                passengers for sustainable travel.
              </p>
              <div className="social-icons">
                <a href="#" aria-label="Twitter">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" aria-label="Facebook">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/login">Sign In</Link>
                </li>
                <li>
                  <Link to="/register">Sign Up</Link>
                </li>
                <li>
                  <Link to="/search">Find a Ride</Link>
                </li>
              </ul>
            </div>

            {/* Legal/Company */}
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li>
                  <a href="#">About Us</a>
                </li>
                <li>
                  <a href="#">Careers</a>
                </li>
                <li>
                  <a href="#">Privacy Policy</a>
                </li>
                <li>
                  <a href="#">Terms of Service</a>
                </li>
              </ul>
            </div>

            {/* Contact Us */}
            <div className="footer-col">
              <h4>Contact Us</h4>
              <ul className="contact-list">
                <li>
                  <span className="icon-sm">📧</span> support@smartrides.com
                </li>
                <li>
                  <span className="icon-sm">📞</span> +91 98765 43210
                </li>
                <li>
                  <span className="icon-sm">📍</span> Electronic City,
                  Bangalore, India
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2025 copyright SmartRides. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        .landing-page { width: 100%; overflow-x: hidden; }
        
        /* Hero Styles (Preserved & Adjusted) */
        .hero {
          position: relative;
          padding: 6rem 0;
          background: radial-gradient(circle at top right, #DBEAFE 0%, #F3F4F6 40%);
        }
        .hero-content { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
        .hero-badge { display: inline-block; padding: 0.5rem 1rem; background: #ECFDF5; color: var(--secondary-dark); border-radius: 50px; font-size: 0.875rem; font-weight: 600; margin-bottom: 1.5rem; border: 1px solid #A7F3D0; }
        h1 { font-size: 3.5rem; letter-spacing: -0.03em; margin-bottom: 1.5rem; line-height: 1.1; color: var(--dark); }
        .text-gradient { background: linear-gradient(to right, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero p { font-size: 1.25rem; color: var(--text-light); margin-bottom: 2.5rem; max-width: 540px; line-height: 1.6; }
        .hero-buttons { display: flex; gap: 1rem; }
        .btn-lg { padding: 1rem 2rem; font-size: 1.05rem; }

        /* Visual Card Logic */
        .hero-visual { position: relative; height: 450px; }
        .visual-card { background: white; border-radius: 24px; box-shadow: var(--shadow-lg); position: absolute; border: 1px solid var(--border); }
        .main-card { width: 340px; padding: 2rem; top: 45%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; gap: 1.5rem; z-index: 10; }
        .card-row { display: flex; align-items: center; justify-content: space-between; position: relative; height: 20px; }
        .circle { width: 16px; height: 16px; background: var(--primary); border-radius: 50%; z-index: 2; box-shadow: 0 0 0 4px #DBEAFE; }
        .circle.dest { background: var(--secondary); box-shadow: 0 0 0 4px #D1FAE5; }
        .line { position: absolute; left: 0; right: 0; top: 50%; height: 2px; background: #E5E7EB; border-style: dashed; z-index: 1; }
        .card-info { display: flex; justify-content: space-between; font-weight: 700; color: var(--dark); font-size: 1.1rem; }
        .card-meta { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-light); background: #F9FAFB; padding: 0.75rem; border-radius: 12px; }
        
        .float-card { bottom: 15%; right: 5%; padding: 1rem 1.5rem; display: flex; align-items: center; gap: 1rem; animation: float 4s ease-in-out infinite; z-index: 11; }
        .float-title { font-weight: 700; color: var(--secondary-dark); }
        .float-subtitle { font-size: 0.8rem; color: var(--text-light); }
        .emoji { font-size: 2rem; }

        /* Stats Section */
        .stats-section { background: var(--dark); color: white; padding: 2rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .stats-grid { display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 2rem; }
        .stat-item { text-align: center; }
        .stat-item h3 { font-size: 2.5rem; margin-bottom: 0.25rem; background: linear-gradient(to right, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .stat-item p { color: #94a3b8; font-size: 0.9rem; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; }
        .stat-divider { height: 40px; width: 1px; background: rgba(255,255,255,0.1); display: block; }

        /* Features Section */
        .features-section { padding: 6rem 0; background: white; }
        .section-header { max-width: 700px; margin: 0 auto 4rem; }
        .section-tag { color: var(--primary); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-size: 0.85rem; display: block; margin-bottom: 1rem; }
        .section-header h2 { font-size: 2.5rem; margin-bottom: 1rem; color: var(--dark); }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2.5rem; }
        .feature-card { padding: 2rem; background: #F9FAFB; border-radius: 20px; transition: transform 0.3s; border: 1px solid transparent; }
        .feature-card:hover { transform: translateY(-5px); background: white; border-color: var(--border); box-shadow: var(--shadow-lg); }
        .feature-icon { width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; color: white; }
        .bg-blue { background: var(--primary); }
        .bg-green { background: var(--secondary); }
        .bg-amber { background: var(--accent); }
        .feature-icon svg { width: 30px; height: 30px; }
        .feature-card h3 { font-size: 1.25rem; margin-bottom: 0.75rem; }
        .feature-card p { color: var(--text-light); font-size: 0.95rem; line-height: 1.6; }

        /* Steps Section */
        .steps-section { padding: 6rem 0; background: #F3F4F6; }
        .steps-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 2rem; margin-top: 3rem; }
        .step-col { flex: 1; text-align: center; position: relative; }
        .step-number { width: 50px; height: 50px; background: white; border: 2px solid var(--primary); color: var(--primary); font-weight: 800; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; z-index: 2; position: relative; }
        .step-line-h { flex: 1; height: 2px; background: #D1D5DB; margin-top: 25px; display: block; }
        .step-col h3 { margin-bottom: 0.75rem; font-size: 1.25rem; }
        .step-col p { color: var(--text-light); font-size: 0.9rem; max-width: 250px; margin: 0 auto; }

        /* CTA Section */
        .cta-section { padding: 6rem 0; background: white; }
        .cta-container { background: var(--dark); border-radius: 24px; padding: 4rem 2rem; text-align: center; color: white; position: relative; overflow: hidden; }
        .cta-container::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, var(--primary), var(--secondary)); }
        .cta-container h2 { color: white; font-size: 2.5rem; margin-bottom: 1rem; }
        .cta-container p { color: #94a3b8; margin-bottom: 2.5rem; font-size: 1.1rem; }

        /* Footer */
        .footer { background: #111827; color: #D1D5DB; padding: 5rem 0 1.5rem; font-size: 0.9rem; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 3rem; margin-bottom: 4rem; }
        .footer-logo { margin-bottom: 1.5rem; color: white; font-weight: 700; font-size: 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
        .brand-col p { max-width: 300px; line-height: 1.6; margin-bottom: 1.5rem; color: #9CA3AF; }
        .social-icons { display: flex; gap: 1rem; }
        .social-icons a { width: 36px; height: 36px; background: #1F2937; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s; color: white; }
        .social-icons a:hover { background: var(--primary); transform: translateY(-3px); }
        .social-icons svg { width: 18px; height: 18px; }
        
        .footer h4 { color: white; font-size: 1rem; margin-bottom: 1.5rem; font-weight: 700; letter-spacing: 0.5px; }
        .footer ul { list-style: none; padding: 0; }
        .footer li { margin-bottom: 0.8rem; }
        .footer a { color: #9CA3AF; transition: color 0.2s; }
        .footer a:hover { color: white; }
        .contact-list li { display: flex; items-center; gap: 0.75rem; }
        .icon-sm { font-size: 1.1rem; }

        .footer-bottom { border-top: 1px solid #1F2937; padding-top: 1.5rem; text-align: center; color: #6B7280; font-size: 0.85rem; }

        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

        @media (max-width: 1024px) {
           .hero-content { grid-template-columns: 1fr; text-align: center; }
           .hero p { margin: 0 auto 2.5rem; }
           .hero-buttons { justify-content: center; }
           .hero-visual { display: none; }
           .stats-divider { display: none; }
           .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
           .brand-col { grid-column: span 2; }
        }
        @media (max-width: 768px) {
           .steps-row { flex-direction: column; gap: 2rem; }
           .step-line-h { display: none; }
           .footer-grid { grid-template-columns: 1fr; text-align: center; }
           .brand-col { grid-column: span 1; }
           .brand-col p, .social-icons { margin: 0 auto 1.5rem; justify-content: center; }
           .footer-logo { justify-content: center; }
           .contact-list li { justify-content: center; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
