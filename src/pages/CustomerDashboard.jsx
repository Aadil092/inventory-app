import React, { useState } from "react";
import {
  FaBox,
  FaBoxOpen,
  FaMoon,
  FaShoppingBasket,
  FaSignOutAlt,
  FaSun,
  FaUserCircle,
  FaUsers,
} from "react-icons/fa";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import CustomerProduct from "../components/CustomerProduct";
import CustomerOrder from "../components/CustomerOrder";
import CustomerProfile from "../components/CustomerProfile";
import "./CustomerDashboard.css";

export default function CustomerDashboard() {
  const [activePage, setActivePage] = useState("products");
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const menuItems = [
    { key: "products", label: "Browse Products", icon: <FaBox /> },
    { key: "order", label: "My Orders", icon: <FaShoppingBasket /> },
    { key: "profile", label: "My Profile", icon: <FaUsers /> },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getPageTitle = () => {
    const item = menuItems.find((m) => m.key === activePage);
    return item ? item.label : "Customer Portal";
  };

  return (
    <div className={`customer-dashboard-layout ${isDark ? "dark-theme" : "light-theme"}`}>
      {/* ─── Sidebar ────────────────────────────────────────── */}
      <aside className="customer-sidebar">
        <div className="sidebar-brand-box">
          <div className="brand-logo-icon">
            <FaBoxOpen />
          </div>
          <div className="brand-text-group">
            <h2 className="brand-name">AI-Powered Inventory Management System</h2>
            <span className="brand-badge customer-badge">Customer Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav-list">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`nav-menu-btn ${activePage === item.key ? "active" : ""}`}
              onClick={() => setActivePage(item.key)}
            >
              <span className="nav-icon-wrapper">{item.icon}</span>
              <span className="nav-label-text">{item.label}</span>
              {activePage === item.key && <span className="active-dot"></span>}
            </button>
          ))}
        </nav>

        {/* Sidebar User Footer */}
        <div className="sidebar-user-footer">
          <div className="user-avatar-circle">
            {user?.name?.charAt(0).toUpperCase() || "C"}
          </div>
          <div className="user-meta-info">
            <strong className="user-display-name">{user?.name || "Customer"}</strong>
            <small className="user-email-text">{user?.email || "customer@mail.com"}</small>
          </div>
          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Sign Out"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </aside>

      {/* ─── Main Content Wrapper ────────────────────────────── */}
      <div className="customer-main-wrapper">
        {/* Top Navbar */}
        <header className="customer-top-navbar">
          <div className="navbar-left-group">
            <div className="navbar-welcome-header">
              <h1 className="navbar-welcome-title">
                Welcome back, <span className="welcome-username">{user?.name || "Customer"}</span>! 👋
              </h1>
            </div>
            <div className="navbar-breadcrumb">
              <span className="breadcrumb-root">Customer Portal</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-active">{getPageTitle()}</span>
            </div>
          </div>

          <div className="navbar-actions-group">
            {/* Dark / Light Theme Toggle */}
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
            >
              {isDark ? (
                <>
                  <FaSun className="theme-icon sun-icon" />
                  <span className="theme-text">Light Mode</span>
                </>
              ) : (
                <>
                  <FaMoon className="theme-icon moon-icon" />
                  <span className="theme-text">Dark Mode</span>
                </>
              )}
            </button>

            {/* Profile Pill */}
            <div className="nav-profile-pill">
              <div className="nav-avatar">
                {user?.name?.charAt(0).toUpperCase() || "C"}
              </div>
              <div className="nav-profile-text">
                <span className="nav-user-name">{user?.name || "Customer"}</span>
                <span className="nav-role-tag">Customer</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="customer-page-body">
          {activePage === "products" && <CustomerProduct />}
          {activePage === "order" && <CustomerOrder />}
          {activePage === "profile" && <CustomerProfile />}
        </main>
      </div>
    </div>
  );
}
