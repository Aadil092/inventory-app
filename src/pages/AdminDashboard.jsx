import React, { useState } from "react";
import {
  FaBox,
  FaCog,
  FaHome,
  FaShoppingCart,
  FaSignOutAlt,
  FaTruck,
  FaTable,
  FaUserCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router";

import "./AdminDashboard.css";

import Categories from "../components/Categories";
import Products from "../components/Products";
import Supplier from "../components/Supplier";
import ManageOrder from "../components/ManageOrder";
import Dashboard from "../components/Dashboard";
import CustomerProfile from "../components/CustomerProfile";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("dashboard");

  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: <FaHome /> },
    { key: "categories", label: "Categories", icon: <FaTable /> },
    { key: "products", label: "Products", icon: <FaBox /> },
    { key: "orders", label: "Manage Orders", icon: <FaShoppingCart /> },
    { key: "supplier", label: "Suppliers", icon: <FaTruck /> },
    { key: "profile", label: "Profile", icon: <FaCog /> },
    { key: "logout", label: "Logout", icon: <FaSignOutAlt /> },
  ];

  const handleMenu = (key) => {
    if (key === "logout") {
      localStorage.removeItem("pos-token");
      navigate("/login");
      return;
    }

    setActivePage(key);
  };

  return (
    <div className="admin-dashboard">

      {/* Sidebar */}

      <aside className="sidebar">

        <div className="sidebar-logo">

          <div className="logo-icon">
            📦
          </div>

          <h2 className="logo-title">INVENTORY</h2>

          <small className="logo-subtitle">Management System</small>

        </div>

        <div className="sidebar-menu">

          {menuItems.map((item) => (
            <div
              key={item.key}
              className={`menu-item ${
                activePage === item.key ? "active" : ""
              }`}
              onClick={() => handleMenu(item.key)}
            >
              <span className="menu-icon">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </div>
          ))}

        </div>

      </aside>

      {/* Main */}

      <div className="main-content">

        {/* Header */}

        {/* <div className="dashboard-header">

          <div>

            <h2 className="dashboard-title">
              Inventory Management System
            </h2>

            <p className="dashboard-subtitle">
              Welcome Administrator
            </p>

          </div>

          <div className="header-profile">

            <FaUserCircle
              size={45}
              className="profile-icon"
            />

            <div>

              <strong>Administrator</strong>

              <p>admin@gmail.com</p>

            </div>

          </div>

        </div> */}

        {/* Dashboard */}

        {activePage === "dashboard" && (
          <>
            <h2 className="page-title">ADMIN DASHBOARD</h2>
              <Dashboard/>

          </>
        )}

        {activePage === "categories" && (
          <>
            <h2 className="page-title">Categories</h2>
            <Categories />
          </>
        )}

        {activePage === "products" && (
          <>
            <h2 className="page-title">Products</h2>
            <Products />
          </>
        )}

        {activePage === "orders" && (
          <>
            <h2 className="page-title">Manage Orders</h2>
            <ManageOrder />
          </>
        )}

        {activePage === "supplier" && (
          <>
            <h2 className="page-title">Supplier Management</h2>
            <Supplier />
          </>
        )}

        {activePage === "profile" && (
        <>
            <h2 className="page-title">Profile</h2>
            <CustomerProfile/>
      </>
        )}

      </div>

    </div>
  );
}