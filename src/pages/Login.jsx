import axios from "axios";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import {
  FaBoxOpen,
  FaBoxes,
  FaCheckCircle,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaTruck,
  FaUser,
  FaUserShield,
} from "react-icons/fa";
import "./Login.css";

const API_BASE = "http://localhost:5000/api";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        // Customer Registration
        const response = await axios.post(`${API_BASE}/auth/register`, {
          name,
          email,
          password,
          address,
        });

        if (response.data.success) {
          alert("🎉 Registration successful! Welcome to Inventory App.");
          await login(response.data.user, response.data.token);
          navigate("/customer/dashboard");
        } else {
          setError(response.data.message || "Registration failed");
        }
      } else {
        // Login Flow
        const response = await axios.post(`${API_BASE}/auth/login`, {
          email,
          password,
        });

        if (response.data.success) {
          await login(response.data.user, response.data.token);
          const role = response.data.user.role;
          if (role === "superadmin") {
            navigate("/superadmin/dashboard");
          } else if (role === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/customer/dashboard");
          }
        } else {
          setError(response.data.message || "Login failed");
        }
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Network error. Please make sure the backend server is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inventory-login-wrapper">
      <div className="login-bg-decor decor-top"></div>
      <div className="login-bg-decor decor-bottom"></div>
      <div className="login-grid-overlay"></div>

      <div className="login-container">
        {/* ─── Left Hero / Inventory Highlights ───────────────────── */}
        <div className="login-hero-panel">
          <div className="hero-badge">
            <FaBoxOpen className="badge-icon" /> Next-Gen Inventory OS
          </div>

          <h1 className="hero-heading">
            Streamline Stock, Orders & Warehousing in <span className="highlight-text">Real-Time</span>
          </h1>

          <p className="hero-subtext">
            Enterprise cloud inventory management platform with automated order lifecycle,
            instant billing invoices, low-stock tracking, and granular multi-tier role access.
          </p>

          {/* Feature Highlight Cards */}
          <div className="hero-feature-cards">
            <div className="feature-item-card">
              <div className="feature-icon-bubble blue">
                <FaBoxes />
              </div>
              <div>
                <h4>Live Stock Control</h4>
                <p>Real-time inventory levels with instant stock restoration on order cancellations.</p>
              </div>
            </div>

            <div className="feature-item-card">
              <div className="feature-icon-bubble green">
                <FaTruck />
              </div>
              <div>
                <h4>Smart Order Tracking</h4>
                <p>Interactive package timeline stepper with single-page print and direct download invoices.</p>
              </div>
            </div>

            <div className="feature-item-card">
              <div className="feature-icon-bubble purple">
                <FaUserShield />
              </div>
              <div>
                <h4>Role-Based Access (RBAC)</h4>
                <p>Tailored portals for Superadmin (System & Settings), Admin (Catalog & Orders), and Customers.</p>
              </div>
            </div>
          </div>

          {/* Metric Stats Footer */}
          <div className="hero-metrics-row">
            <div className="metric-box">
              <h3>100%</h3>
              <span>Stock Accuracy</span>
            </div>
            <div className="metric-box">
              <h3>3 Portals</h3>
              <span>Multi-Role RBAC</span>
            </div>
            <div className="metric-box">
              <h3>Real-Time</h3>
              <span>Order Tracking</span>
            </div>
          </div>
        </div>

        {/* ─── Right Auth Form Panel ───────────────────────────── */}
        <div className="login-card-panel">
          <div className="login-card-inner">
            {/* Header / Brand */}
            <div className="form-brand-header">
              <div className="brand-badge-icon">
                <FaBoxOpen />
              </div>
              <h2 className="form-brand-title">
                {isRegister ? "Inventory Management System  Create Customer Account" : "Inventory Managment System"}
              </h2>
              <p className="form-brand-subtitle">
                {isRegister
                  ? "Register to browse catalogs, add to cart, and track orders."
                  : "Enter your credentials to access your dashboard."}
              </p>
            </div>


            {/* Error Message Box */}
            {error && (
              <div className="auth-error-alert">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form-fields">
              {/* Full Name (Register Only) */}
              {isRegister && (
                <div className="auth-field-group">
                  <label>Full Name</label>
                  <div className="input-with-icon">
                    <FaUser className="field-icon" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="auth-field-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <FaEnvelope className="field-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-field-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <FaLock className="field-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isRegister ? "Create a strong password" : "Enter your password"}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Delivery Address (Register Only) */}
              {isRegister && (
                <div className="auth-field-group">
                  <label>Delivery Address (Optional)</label>
                  <div className="input-with-icon">
                    <FaMapMarkerAlt className="field-icon" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, City, Zip Code"
                    />
                  </div>
                </div>
              )}

              {/* Remember Me & Security Tag */}
              {!isRegister && (
                <div className="auth-options-row">
                  <label className="remember-checkbox">
                    <input type="checkbox" defaultChecked />
                    <span>Remember me</span>
                  </label>

                </div>
              )}

              {/* Submit Button */}
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <span className="btn-loading-content">
                    <span className="spinner-dot"></span> Processing...
                  </span>
                ) : isRegister ? (
                  "Create Customer Account"
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Bottom Switch Link */}
            <div className="auth-footer-prompt">
              {isRegister ? (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => {
                      setIsRegister(false);
                      setError(null);
                    }}
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <p>
                  New customer?{" "}
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => {
                      setIsRegister(true);
                      setError(null);
                    }}
                  >
                    Create Account
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
