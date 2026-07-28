import axios from 'axios';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import './Login.css';

const Login = () => {
  const [hover, setHover] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);


    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      console.log(response.data);

      if (response.data.success) {
        await login(response.data.user, response.data.token);
        if (response.data.user.role === "superadmin") {
          navigate("/superadmin/dashboard");
        } else if (response.data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else if (response.data.user.role === "customer") {
          navigate("/customer/dashboard");
        }

      } else {
        alert(response.data.error);
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="login-page">
      <div className="grid-patten"></div>
      <div className="glass-circle circle1"></div>
      <div className="glass-circle circle2"></div>
      <div className="glass-circle circle3"></div>
      {/* Gradient Border Wrapper */}
      <div className="login-card">
        <form
          onSubmit={handleSubmit}
          className="login-form"
        >
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div
              className="login-logo"
            >
              📦
            </div>

            <h2
              className="login-title"
            >
              Inventory Management
            </h2>

            <p
              className="login-subtitle"
            >
              Welcome back! Please sign in to continue.
            </p>
          </div>

          {error && (
            <div
              className="error-box"
            >
              {error}
            </div>
          )}

          {/* Email */}
          <div className="input-group">
            <label
              className="input-label"
            >
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField("")}
              placeholder="Enter your email"
              required
              className="login-input"
            />
          </div>

          {/* Password */}
          <div className="input-group">
            <label
              className="input-label"
            >
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField("")}
              placeholder="Enter your password"
              required
              className="login-input"
            />
          </div>

          {/* Remember Me */}
          <div
            className="remember-row"
          >
            <label style={{ color: "#475569" }}>
              <input type="checkbox" /> Remember Me
            </label>

            {/* <a
              href="/forgot-password"
              className="forget-link"
            >
              Forgot Password?
            </a> */}
          </div>

          {/* Login Button */}
          <button
            type="submit"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="login-btn"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
