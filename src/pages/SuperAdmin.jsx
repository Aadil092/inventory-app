import React, { useState } from "react";
import "./SuperAdmin.css";
import { FaBox, FaHome, FaShoppingCart, FaSignOutAlt, FaTable, FaTools, FaTruck, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router";
import User from "../components/User";
import Products from "../components/Products";
import ManageOrder from "../components/ManageOrder";
import Supplier from "../components/Supplier";
import Categories from "../components/Categories";
import Dashboard from "../components/Dashboard";
import SystemSettings from "../components/SystemSettings";


export default function SuperAdmin() {
  const [activePage, setActivePage] = useState("dashboard");
  const navigate = useNavigate();


 

  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: <FaHome /> },
    { key: "categories", label: "Manage Category", icon: <FaTable /> },
    { key: "products", label: "Manage Products", icon: <FaBox /> },
    { key: "orders", label: "Manage Orders", icon: <FaShoppingCart /> },
    { key: "supplier", label: "Manage Suppliers", icon: <FaTruck /> },
    { key: "users", label: " Manage Users", icon: <FaUser /> },
    // { key: "settings", label: "Settings", icon: <FaTools /> },
    { key: "logout", label: " Logout", icon: <FaSignOutAlt /> },
  ];
  return (
    <div className="superadmin-container">
      <aside className="sidebar">
        <div
          className="logo-section"
        >
          <div
            className="logo-circle"
          >
            👑
          </div>

          <h2 className="logo-title">
            Super Admin
          </h2>

          <small className="logo-subtitle">Inventory Management</small>
        </div>
    <ul className="menu">
  {menuItems.map((item) => (
    <li
      key={item.key}
      className={`menu-item ${activePage === item.key ? "active" : ""}`}
      onClick={() => {
        if (item.key === "logout") {
          localStorage.removeItem("pos-token");
          navigate("/login");
        } else {
          setActivePage(item.key);
        }
      }}
    >
      <span className="menu-icon">
        {item.icon}
      </span>

      <span className="menu-text">
        {item.label}
      </span>
    </li>
  ))}
</ul>
      </aside>

      <main className="main-content">
        {activePage === "dashboard" && (
          <>
            <h2 className="page-title">SUPER ADMIN DASHBOARD</h2>
            <Dashboard/>
          </>
        )}
        {activePage === "categories" && (
          <>
            <h2  className="page-title">Categories</h2>
            <Categories />
          </>
        )}
        {activePage === "products" && (
          <>
            <h2  className="page-title">Manage Product</h2>
            <Products />
          </>
        )}
        {activePage === "orders" && (
          <>
            <h2  className="page-title">Orders</h2>
            <ManageOrder />
          </>
        )}
        {activePage === "supplier" && (
          <>
            <h2  className="page-title">Supplier Managment</h2>
            <Supplier />
          </>
        )}
        {activePage === "users" && (
          <>
            <h2  className="page-title">Users Managment</h2>
            <div><User /></div>
          </>
        )}
        {/* {activePage === "settings" && (
          <>
            <h2  className="page-title">System Settings</h2>
            <SystemSettings />
          </>
        )} */}
        {activePage === "logout" && (
          <>
            
          </>
        )}

      </main>
    </div>
  );
}
