import React, { useState } from "react";
import {
  FaBox,
  FaBoxOpen,
  FaCog,
  FaHome,
  FaMoon,
  FaShoppingCart,
  FaSignOutAlt,
  FaSun,
  FaTable,
  FaTruck,
  FaUserShield,
} from "react-icons/fa";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "./AdminDashboard.css";

import Categories from "../components/Categories";
import Products from "../components/Products";
import Supplier from "../components/Supplier";
import ManageOrder from "../components/ManageOrder";
import Dashboard from "../components/Dashboard";
import CustomerProfile from "../components/CustomerProfile";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [activePage, setActivePage] = useState("dashboard");

  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: <FaHome /> },
    { key: "categories", label: "Categories", icon: <FaTable /> },
    { key: "products", label: "Products & Stock", icon: <FaBox /> },
    { key: "orders", label: "Manage Orders", icon: <FaShoppingCart /> },
    { key: "supplier", label: "Suppliers", icon: <FaTruck /> },
    { key: "profile", label: "My Profile", icon: <FaCog /> },
  ];

  const handleMenu = (key) => {
    setActivePage(key);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getPageTitle = () => {
    const item = menuItems.find((m) => m.key === activePage);
    return item ? item.label : "Admin Portal";
  };

  return (
    <div className={`admin-dashboard-layout ${isDark ? "dark-theme" : "light-theme"}`}>
      {/* ─── Sidebar ────────────────────────────────────────── */}
      <aside className="admin-sidebar">
        {/* Brand Header */}
        <div className="sidebar-brand-box">
          <div className="brand-logo-icon">
            <FaBoxOpen />
          </div>
          <div className="brand-text-group">
            <h2 className="brand-name">Inventory Management System</h2>
            <span className="brand-badge admin-badge">Admin Portal</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav-list">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`nav-menu-btn ${activePage === item.key ? "active" : ""}`}
              onClick={() => handleMenu(item.key)}
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
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="user-meta-info">
            <strong className="user-display-name">{user?.name || "Admin User"}</strong>
            <small className="user-email-text">{user?.email || "admin@inventory.local"}</small>
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
      <div className="admin-main-wrapper">
        {/* Top Navbar */}
        <header className="admin-top-navbar">
          <div className="navbar-breadcrumb">
            <span className="breadcrumb-root">Admin Portal</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-active">{getPageTitle()}</span>
          </div>

          <div className="navbar-actions-group">
            {/* Live System Indicator */}
            <div className="live-status-pill">
              <span className="live-pulse-dot"></span>
              <span>System Live</span>
            </div>

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
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <span className="nav-role-tag">Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="admin-page-body">
          {activePage === "dashboard" && <Dashboard />}
          {activePage === "categories" && <Categories />}
          {activePage === "products" && <Products />}
          {activePage === "orders" && <ManageOrder />}
          {activePage === "supplier" && <Supplier />}
          {activePage === "profile" && <CustomerProfile />}
        </main>
      </div>
    </div>
  );
}