import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
  FaDollarSign,
  FaSyncAlt,
  FaMoneyBillWave,
  FaCreditCard,
  FaBoxes,
} from "react-icons/fa";
import "./Dashboard.css";

const API_BASE = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("pos-token");
const headers = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

// ─── SVG Circular Progress Component ─────────────────────────
const CircularProgress = ({ percentage, color, label, sublabel }) => {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const safePercent = Math.min(100, Math.max(0, percentage || 0));
  const offset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="circular-progress-item">
      <div className="circular-progress-ring">
        <svg viewBox="0 0 110 110">
          <circle className="bg-circle" cx="55" cy="55" r={radius} />
          <circle
            className={`progress-circle ${color}`}
            cx="55"
            cy="55"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="center-text">{Math.round(safePercent)}%</div>
      </div>
      <div className="progress-label">{label}</div>
      {sublabel && <div className="progress-sub">{sublabel}</div>}
    </div>
  );
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    categories: 0,
    suppliers: 0,
    lowStock: 0,
    lowStockItems: [],
    totalStock: 0,
    cashOrders: 0,
    onlineOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
  });

  // ─── Fetch all data ────────────────────────────────────────
  const fetchAllData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [productsRes, ordersRes, usersRes, categoriesRes, suppliersRes] =
        await Promise.all([
          axios.get(`${API_BASE}/products`, headers()).catch(() => ({
            data: { products: [], suppliers: [], categories: [] },
          })),
          axios.get(`${API_BASE}/orders/all`, headers()).catch(() => ({
            data: { success: true, data: [] },
          })),
          axios.get(`${API_BASE}/users`, headers()).catch(() => ({
            data: { users: [] },
          })),
          axios.get(`${API_BASE}/category`, headers()).catch(() => ({
            data: { categories: [] },
          })),
          axios.get(`${API_BASE}/supplier`, headers()).catch(() => ({
            data: { suppliers: [] },
          })),
        ]);

      const products = productsRes.data.products || [];
      const orders = ordersRes.data.success ? ordersRes.data.data || [] : [];
      const users = usersRes.data.users || [];
      const categories = categoriesRes.data.categories || [];
      const suppliers = suppliersRes.data.suppliers || [];

      // Compute derived stats
      const lowStockList = products.filter(
        (p) => p.stock !== undefined && Number(p.stock) < 5
      );
      const totalStock = products.reduce(
        (sum, p) => sum + (Number(p.stock) || 0),
        0
      );
      const cashOrders = orders.filter(
        (o) => (o.paymentId || "").toLowerCase() === "cash"
      ).length;
      const onlineOrders = orders.filter(
        (o) => (o.paymentId || "").toLowerCase() !== "cash"
      ).length;
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
        lowStock: lowStockList.length,
        lowStockItems: lowStockList.slice(0, 4),
        totalStock,
        cashOrders,
        onlineOrders,
        totalRevenue,
        recentOrders,
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data. Please check network connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => fetchAllData(false), 30000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // ─── Derived percentages ───────────────────────────────────
  const stockHealth =
    stats.totalStock > 0
      ? Math.max(0, ((stats.totalStock - stats.lowStock) / stats.totalStock) * 100)
      : 100;
  const orderFulfillment =
    stats.orders > 0
      ? ((stats.cashOrders + stats.onlineOrders) / stats.orders) * 100
      : 100;
  const supplierActivity =
    stats.suppliers > 0 ? Math.min(100, stats.suppliers * 20) : 0;
  const categoryCoverage =
    stats.categories > 0 ? Math.min(100, stats.categories * 15) : 0;

  if (loading && !refreshing) {
    return (
      <div className="dash-loading-wrapper">
        <div className="dash-spinner" />
        <span>Loading Real-Time Analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash-error-wrapper">
        <FaExclamationTriangle className="dash-err-icon" />
        <p>{error}</p>
        <button className="dash-retry-btn" onClick={() => fetchAllData(true)}>
          <FaSyncAlt /> Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      {/* ─── Header & Quick Control ─────────────────────────── */}
      <div className="dash-header-row">
        <div>
          <h2 className="dash-title">Operations & Analytics</h2>
          <p className="dash-subtitle">
            Real-time overview of inventory stock, customer orders, and revenue
          </p>
        </div>
        <div className="dash-header-actions">
          <div className="sync-badge">
            <span className="sync-dot"></span> Auto-Sync: 30s
          </div>
          <button
            className={`refresh-action-btn ${refreshing ? "spinning" : ""}`}
            onClick={() => fetchAllData(true)}
            title="Refresh Data"
          >
            <FaSyncAlt /> {refreshing ? "Syncing..." : "Sync Now"}
          </button>
        </div>
      </div>

      {/* ─── 6 Key KPI Cards ───────────────────────────────── */}
      <div className="kpi-cards-grid">
        {/* Total Revenue */}
        <div className="kpi-card revenue-card">
          <div className="kpi-card-top">
            <div className="kpi-icon-wrap emerald">
              <FaDollarSign />
            </div>
            <span className="kpi-trend up">
              <FaArrowUp /> Active
            </span>
          </div>
          <div className="kpi-value">₹{Number(stats.totalRevenue).toLocaleString()}</div>
          <div className="kpi-label">Gross Revenue</div>
        </div>

        {/* Total Orders */}
        <div className="kpi-card">
          <div className="kpi-card-top">
            <div className="kpi-icon-wrap blue">
              <FaShoppingCart />
            </div>
            <span className="kpi-trend up">
              <FaArrowUp /> {stats.orders} Total
            </span>
          </div>
          <div className="kpi-value">{stats.orders}</div>
          <div className="kpi-label">Total Orders Placed</div>
        </div>

        {/* Total Products */}
        <div className="kpi-card">
          <div className="kpi-card-top">
            <div className="kpi-icon-wrap indigo">
              <FaBox />
            </div>
            <span className="kpi-trend neutral">
              {stats.totalStock} Units
            </span>
          </div>
          <div className="kpi-value">{stats.products}</div>
          <div className="kpi-label">Active Products</div>
        </div>

        {/* Low Stock Alert */}
        <div className={`kpi-card ${stats.lowStock > 0 ? "warning-card" : ""}`}>
          <div className="kpi-card-top">
            <div className="kpi-icon-wrap rose">
              <FaExclamationTriangle />
            </div>
            <span className={`kpi-trend ${stats.lowStock > 0 ? "down" : "up"}`}>
              {stats.lowStock > 0 ? "Attention" : "Optimal"}
            </span>
          </div>
          <div className="kpi-value">{stats.lowStock}</div>
          <div className="kpi-label">Low Stock Alerts (&lt; 5)</div>
        </div>

        {/* Users */}
        <div className="kpi-card">
          <div className="kpi-card-top">
            <div className="kpi-icon-wrap purple">
              <FaUsers />
            </div>
            <span className="kpi-trend up">
              <FaArrowUp /> Accounts
            </span>
          </div>
          <div className="kpi-value">{stats.users}</div>
          <div className="kpi-label">Registered Users</div>
        </div>

        {/* Suppliers & Categories */}
        <div className="kpi-card">
          <div className="kpi-card-top">
            <div className="kpi-icon-wrap amber">
              <FaTruck />
            </div>
            <span className="kpi-trend neutral">
              {stats.categories} Groups
            </span>
          </div>
          <div className="kpi-value">{stats.suppliers}</div>
          <div className="kpi-label">Active Suppliers</div>
        </div>
      </div>

      {/* ─── Main Two-Column Analytics Section ──────────────── */}
      <div className="analytics-dual-grid">
        {/* Performance Gauges Card */}
        <div className="analytics-card">
          <div className="card-header-line">
            <div className="card-heading">
              <FaChartPie className="card-header-icon blue" />
              <h3>System Health & Performance</h3>
            </div>
          </div>

          <div className="circular-gauges-row">
            <CircularProgress
              percentage={stockHealth}
              color="emerald"
              label="Stock Health"
              sublabel={`${stats.totalStock} total units`}
            />
            <CircularProgress
              percentage={orderFulfillment}
              color="blue"
              label="Order Rate"
              sublabel={`${stats.orders} transactions`}
            />
            <CircularProgress
              percentage={supplierActivity}
              color="purple"
              label="Supplier Reach"
              sublabel={`${stats.suppliers} active partners`}
            />
            <CircularProgress
              percentage={categoryCoverage}
              color="amber"
              label="Catalog Spread"
              sublabel={`${stats.categories} categories`}
            />
          </div>

          {/* Progress Bars Breakdown */}
          <div className="linear-progress-list">
            <div className="linear-item">
              <div className="linear-header">
                <span>Cash on Delivery Orders</span>
                <strong>{stats.cashOrders} orders ({stats.orders ? Math.round((stats.cashOrders / stats.orders) * 100) : 0}%)</strong>
              </div>
              <div className="linear-track">
                <div
                  className="linear-fill green"
                  style={{ width: `${stats.orders ? (stats.cashOrders / stats.orders) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="linear-item">
              <div className="linear-header">
                <span>Online / Prepaid Orders</span>
                <strong>{stats.onlineOrders} orders ({stats.orders ? Math.round((stats.onlineOrders / stats.orders) * 100) : 0}%)</strong>
              </div>
              <div className="linear-track">
                <div
                  className="linear-fill blue"
                  style={{ width: `${stats.orders ? (stats.onlineOrders / stats.orders) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* System Overview & Low Stock Alert Card */}
        <div className="analytics-card">
          <div className="card-header-line">
            <div className="card-heading">
              <FaCubes className="card-header-icon purple" />
              <h3>Infrastructure Overview</h3>
            </div>
          </div>

          <div className="infra-stats-grid">
            <div className="infra-stat-pill">
              <FaLayerGroup className="infra-icon blue" />
              <div>
                <span className="infra-count">{stats.categories}</span>
                <small className="infra-name">Categories</small>
              </div>
            </div>
            <div className="infra-stat-pill">
              <FaBoxes className="infra-icon green" />
              <div>
                <span className="infra-count">{stats.products}</span>
                <small className="infra-name">Products</small>
              </div>
            </div>
            <div className="infra-stat-pill">
              <FaTruck className="infra-icon amber" />
              <div>
                <span className="infra-count">{stats.suppliers}</span>
                <small className="infra-name">Suppliers</small>
              </div>
            </div>
            <div className="infra-stat-pill">
              <FaUsers className="infra-icon purple" />
              <div>
                <span className="infra-count">{stats.users}</span>
                <small className="infra-name">Accounts</small>
              </div>
            </div>
          </div>

          {/* Low Stock Highlight Alert Box */}
          <div className="low-stock-alert-box">
            <div className="alert-box-header">
              <FaExclamationTriangle className="alert-box-icon" />
              <strong>Critical Inventory Warning</strong>
            </div>
            {stats.lowStockItems.length > 0 ? (
              <ul className="low-stock-mini-list">
                {stats.lowStockItems.map((item) => (
                  <li key={item._id} className="low-stock-item-row">
                    <span className="low-item-name">{item.name}</span>
                    <span className="low-item-stock-tag">
                      {item.stock} in stock
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-low-stock-text">
                ✅ All inventory levels are above the safety threshold.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Recent Transactions Card ──────────────────────── */}
      {stats.recentOrders.length > 0 && (
        <div className="recent-orders-card">
          <div className="card-header-line">
            <div className="card-heading">
              <FaClipboardList className="card-header-icon emerald" />
              <h3>Recent Order Transactions</h3>
            </div>
            <span className="recent-order-count-badge">
              Latest {stats.recentOrders.length} Orders
            </span>
          </div>

          <div className="orders-table-wrapper">
            <table className="recent-orders-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order, idx) => (
                  <tr key={order._id || idx}>
                    <td>
                      <span className="order-ref-code">
                        INV-{order._id?.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <strong>{order.customerId?.name || "Customer"}</strong>
                    </td>
                    <td>{order.productId?.name || "Product"}</td>
                    <td>
                      <span className="order-qty-pill">{order.quantity}</span>
                    </td>
                    <td>
                      <strong className="order-price-text">
                        ₹{Number(order.price || 0).toLocaleString()}
                      </strong>
                    </td>
                    <td>
                      <span
                        className={`payment-pill ${
                          (order.paymentId || "").toLowerCase() === "cash"
                            ? "cash"
                            : "online"
                        }`}
                      >
                        {(order.paymentId || "CASH").toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          (order.status || "Pending").toLowerCase()
                        }`}
                      >
                        {order.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
