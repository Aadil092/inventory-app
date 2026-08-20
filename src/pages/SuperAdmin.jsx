import React, { useState } from "react";
import {
  FaBox,
  FaCog,
  FaCrown,
  FaHome,
  FaMoon,
  FaShieldAlt,
  FaShoppingCart,
  FaSignOutAlt,
  FaSun,
  FaTable,
  FaTools,
  FaTruck,
  FaUsers,
} from "react-icons/fa";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "./SuperAdmin.css";

import User from "../components/User";
import Products from "../components/Products";
import ManageOrder from "../components/ManageOrder";
import Supplier from "../components/Supplier";
import Categories from "../components/Categories";
import Dashboard from "../components/Dashboard";
import SystemSettings from "../components/SystemSettings";
import CustomerProfile from "../components/CustomerProfile";

export default function SuperAdmin() {
  const [activePage, setActivePage] = useState("dashboard");
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: <FaHome /> },
    { key: "categories", label: "Categories", icon: <FaTable /> },
    { key: "products", label: "Products & Stock", icon: <FaBox /> },
    { key: "orders", label: "Manage Orders", icon: <FaShoppingCart /> },
    { key: "supplier", label: "Suppliers", icon: <FaTruck /> },
    { key: "users", label: "User Management", icon: <FaUsers /> },
    { key: "settings", label: "System Settings", icon: <FaTools /> },
    { key: "profile", label: "Profile", icon: <FaCog /> },
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
    return item ? item.label : "Super Admin Control Center";
  };

  return (
    <div className={`superadmin-dashboard-layout ${isDark ? "dark-theme" : "light-theme"}`}>
      {/* ─── Sidebar ────────────────────────────────────────── */}
      <aside className="superadmin-sidebar">
        {/* Brand Header */}
        <div className="sidebar-brand-box">
          <div className="brand-logo-icon crown-icon">👑</div>
          <div className="brand-text-group">
            <h2 className="brand-name">Inventory Management System</h2>
            <span className="brand-badge crown-badge">Super Admin Portal</span>
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
              {activePage === item.key && <span className="active-dot crown-dot"></span>}
            </button>
          ))}
        </nav>

        {/* Sidebar User Footer */}
        <div className="sidebar-user-footer">
          <div className="user-avatar-circle crown-avatar">
            {user?.name?.charAt(0).toUpperCase() || "S"}
          </div>
          <div className="user-meta-info">
            <strong className="user-display-name">{user?.name || "Super Administrator"}</strong>
            <small className="user-email-text">{user?.email || "superadmin@inventory.local"}</small>
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
      <div className="superadmin-main-wrapper">
        {/* Top Navbar */}
        <header className="superadmin-top-navbar">
          <div className="navbar-breadcrumb">
            <span className="breadcrumb-root">Super Admin</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-active">{getPageTitle()}</span>
          </div>

          <div className="navbar-actions-group">
            {/* Live Root Indicator */}
            <div className="live-status-pill root-status-pill">
              <FaShieldAlt className="shield-icon" />
              <span>Full System Control</span>
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
            <div className="nav-profile-pill crown-pill">
              <div className="nav-avatar crown-avatar-mini">
                <FaCrown />
              </div>
              <span className="nav-role-tag">SuperAdmin</span>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="superadmin-page-body">
          {activePage === "dashboard" && <Dashboard />}
          {activePage === "categories" && <Categories />}
          {activePage === "products" && <Products />}
          {activePage === "orders" && <ManageOrder />}
          {activePage === "supplier" && <Supplier />}
          {activePage === "users" && <User />}
          {activePage === "settings" && <SystemSettings />}
          {activePage === "profile" && <CustomerProfile />}
        </main>
      </div>
    </div>
  );
}
