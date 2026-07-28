import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Dashboard.css"
import {
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaTags,
  FaTruck,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaCubes,
  FaClipboardList,
  FaCheckCircle,
  FaChartPie,
  FaLayerGroup,
  FaStore,
  FaHandshake,
  FaDollarSign,
  FaExchangeAlt,
} from "react-icons/fa";
import "./Dashboard.css";

const API_BASE = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("pos-token");
const headers = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

// ─── SVG Circular Progress Component ─────────────────────────
const CircularProgress = ({ percentage, color, label, sublabel, icon }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circular-progress-item">
      <div className="circular-progress-ring">
        <svg viewBox="0 0 120 120">
          <circle className="bg-circle" cx="60" cy="60" r={radius} />
          <circle
            className={`progress-circle ${color}`}
            cx="60"
            cy="60"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="center-text">{Math.round(percentage)}%</div>
      </div>
      <div className="progress-label">{label}</div>
      {sublabel && <div className="progress-sub">{sublabel}</div>}
    </div>
  );
};

// ─── Main Dashboard Component ────────────────────────────────
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    categories: 0,
    suppliers: 0,
    lowStock: 0,
    totalStock: 0,
    cashOrders: 0,
    onlineOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
  });

  // ─── Fetch all data ────────────────────────────────────────
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
const [productsRes, ordersRes, usersRes, categoriesRes, suppliersRes] =
        await Promise.all([
          axios.get(`${API_BASE}/products`, headers()).catch(function() {
            return { data: { products: [], suppliers: [], categories: [] } };
          }),
          axios.get(`${API_BASE}/orders/all`, headers()).catch(function() {
            return { data: { success: true, data: [] } };
          }),
          axios.get(`${API_BASE}/users`, headers()).catch(function() {
            return { data: { users: [] } };
          }),
          axios.get(`${API_BASE}/category`, headers()).catch(function() {
            return { data: { categories: [] } };
          }),
          axios.get(`${API_BASE}/supplier`, headers()).catch(function() {
            return { data: { suppliers: [] } };
          }),
        ]);

      const products = productsRes.data.products || [];
      const orders = ordersRes.data.success ? ordersRes.data.data || [] : [];
      const users = usersRes.data.users || [];
      const categories = categoriesRes.data.categories || [];
      const suppliers = suppliersRes.data.suppliers || [];

      // Compute derived stats
      const lowStockItems = products.filter(
        (p) => p.stock !== undefined && Number(p.stock) < 5
      );
      const totalStock = products.reduce(
        (sum, p) => sum + (Number(p.stock) || 0),
        0
      );
      const cashOrders = orders.filter((o) => o.paymentId === "Cash").length;
      const onlineOrders = orders.filter((o) => o.paymentId !== "Cash").length;
      const totalRevenue = orders.reduce(
        (sum, o) => sum + (Number(o.price) || 0),
        0
      );

      // Recent 5 orders
      const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5);

      setStats({
        products: products.length,
        orders: orders.length,
        users: users.length,
        categories: categories.length,
        suppliers: suppliers.length,
        lowStock: lowStockItems.length,
        totalStock,
        cashOrders,
        onlineOrders,
        totalRevenue,
        recentOrders,
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // ─── Derived percentages ───────────────────────────────────
  const stockHealth =
    stats.totalStock > 0
      ? ((stats.totalStock - stats.lowStock) / stats.totalStock) * 100
      : 0;
  const orderFulfillment =
    stats.orders > 0
      ? ((stats.cashOrders + stats.onlineOrders) / (stats.orders || 1)) * 100
      : 0;
  const supplierActivity =
    stats.suppliers > 0
      ? Math.min(100, (stats.suppliers / (stats.suppliers + 2)) * 100)
      : 0;
  const categoryCoverage =
    stats.categories > 0
      ? Math.min(100, (stats.categories / 10) * 100)
      : 0;

  // ─── Loading State ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="spinner" />
          <span>Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  // ─── Error State ───────────────────────────────────────────
  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error">
          <FaExclamationTriangle />
          <span>{error}</span>
          <button
            onClick={fetchAllData}
            style={{
              marginTop: 15,
              padding: "10px 24px",
              background: "#2563EB",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Stat Card Config ──────────────────────────────────────
  const statCards = [
    {
      label: "Total Products",
      value: stats.products,
      icon: <FaBox />,
      color: "blue",
      trend: `${stats.lowStock} low stock`,
      trendDir: "down",
    },
    {
      label: "Total Orders",
      value: stats.orders,
      icon: <FaShoppingCart />,
      color: "green",
      trend: `₹${stats.totalRevenue.toLocaleString()}`,
      trendDir: "up",
    },
    {
      label: "Total Users",
      value: stats.users,
      icon: <FaUsers />,
      color: "purple",
      trend: "Active accounts",
      trendDir: "up",
    },
    {
      label: "Categories",
      value: stats.categories,
      icon: <FaTags />,
      color: "orange",
      trend: "Product groups",
      trendDir: "up",
    },
    {
      label: "Suppliers",
      value: stats.suppliers,
      icon: <FaTruck />,
      color: "pink",
      trend: "Active partners",
      trendDir: "up",
    },
    {
      label: "Low Stock Items",
      value: stats.lowStock,
      icon: <FaExclamationTriangle />,
      color: "red",
      trend: "Needs attention",
      trendDir: "down",
    },
  ];

  // ─── Architecture Items ────────────────────────────────────
  const architectureItems = [
    { name: "Categories", count: stats.categories, icon: <FaLayerGroup />, color: "blue" },
    { name: "Products", count: stats.products, icon: <FaBox />, color: "green" },
    { name: "Suppliers", count: stats.suppliers, icon: <FaTruck />, color: "purple" },
    { name: "Orders", count: stats.orders, icon: <FaClipboardList />, color: "orange" },
    { name: "Users", count: stats.users, icon: <FaUsers />, color: "pink" },
    { name: "Revenue", count: `₹${stats.totalRevenue.toLocaleString()}`, icon: <FaDollarSign />, color: "teal" },
  ];

  // ─── Bottom Progress Stats ─────────────────────────────────
  const bottomStats = [
    {
      label: "Stock Health",
      value: `${Math.round(stockHealth)}%`,
      percent: Math.round(stockHealth),
      color: "blue",
    },
    {
      label: "Order Fulfillment",
      value: `${Math.round(orderFulfillment)}%`,
      percent: Math.round(orderFulfillment),
      color: "green",
    },
    {
      label: "Supplier Activity",
      value: `${Math.round(supplierActivity)}%`,
      percent: Math.round(supplierActivity),
      color: "purple",
    },
    {
      label: "Category Coverage",
      value: `${Math.round(categoryCoverage)}%`,
      percent: Math.round(categoryCoverage),
      color: "orange",
    },
  ];

  return (
    <div className="dashboard-container">
      {/* ─── Stats Cards ──────────────────────────────────── */}
      <div className="stats-grid">
        {statCards.map((card, idx) => (
          <div className="stat-card" key={idx}>
            <div className={`stat-icon ${card.color}`}>{card.icon}</div>
            <div className="stat-info">
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
              <div className={`stat-trend ${card.trendDir}`}>
                {card.trendDir === "up" ? <FaArrowUp /> : <FaArrowDown />}
                {card.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Dashboard Grid (2 columns) ──────────────────── */}
      <div className="dashboard-grid">
        {/* ─── Circular Progress Section ──────────────────── */}
        <div className="section-card">
          <div className="section-title">
            <FaChartPie /> Performance Overview
          </div>
          <div className="circular-progress-container">
            <CircularProgress
              percentage={stockHealth}
              color="blue"
              label="Stock Health"
              sublabel={`${stats.totalStock} total units`}
            />
            <CircularProgress
              percentage={orderFulfillment}
              color="green"
              label="Order Fulfillment"
              sublabel={`${stats.cashOrders} Cash · ${stats.onlineOrders} Online`}
            />
            <CircularProgress
              percentage={supplierActivity}
              color="purple"
              label="Supplier Activity"
              sublabel={`${stats.suppliers} active`}
            />
            <CircularProgress
              percentage={categoryCoverage}
              color="orange"
              label="Category Coverage"
              sublabel={`${stats.categories} categories`}
            />
          </div>
        </div>

        {/* ─── System Architecture ────────────────────────── */}
        <div className="section-card">
          <div className="section-title">
            <FaCubes /> System Architecture
          </div>
          <div className="architecture-grid">
            {architectureItems.map((item, idx) => (
              <div className="arch-item" key={idx}>
                <div className={`arch-icon ${item.color}`}>{item.icon}</div>
                <div className="arch-name">{item.name}</div>
                <div className="arch-count">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Bottom Stats (Progress Bars) ────────────────── */}
      <div className="bottom-stats-grid">
        {bottomStats.map((stat, idx) => (
          <div className="bottom-stat-item" key={idx}>
            <div className="bottom-stat-header">
              <span className="bottom-label">{stat.label}</span>
              <span className="bottom-value">{stat.value}</span>
            </div>
            <div className="progress-bar-track">
              <div
                className={`progress-bar-fill ${stat.color}`}
                style={{ width: `${stat.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ─── Recent Orders ───────────────────────────────── */}
      {stats.recentOrders.length > 0 && (
        <div
          className="section-card"
          style={{ marginTop: 25 }}
        >
          <div className="section-title">
            <FaClipboardList /> Recent Orders
          </div>
          <div className="recent-orders-list">
            {stats.recentOrders.map((order, idx) => (
              <div className="recent-order-row" key={order._id || idx}>
                <div>
                  <div className="order-customer">
                    {order.customerId?.name || "Unknown"}
                  </div>
                  <div className="order-product">
                    {order.productId?.name || "N/A"} × {order.quantity || 0}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="order-amount">
                    ₹ {Number(order.price || 0).toLocaleString()}
                  </div>
                  <span
                    className={`order-payment ${
                      order.paymentId === "Cash" ? "cash" : "online"
                    }`}
                  >
                    {order.paymentId || "N/A"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

