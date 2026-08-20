import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaSearch,
  FaEye,
  FaTrash,
  FaCheckCircle,
  FaTruck,
  FaClock,
  FaBoxOpen,
  FaTimesCircle,
  FaPrint,
  FaDownload,
  FaClipboardList,
  FaCreditCard,
  FaMapMarkerAlt,
  FaUser,
  FaReceipt,
} from "react-icons/fa";
import "./ManageOrder.css";

const API_BASE = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("pos-token");
const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const STATUS_CONFIG = {
  Pending: { color: "status-pending", icon: <FaClock /> },
  Processing: { color: "status-processing", icon: <FaBoxOpen /> },
  Shipped: { color: "status-shipped", icon: <FaTruck /> },
  Delivered: { color: "status-delivered", icon: <FaCheckCircle /> },
  Cancelled: { color: "status-cancelled", icon: <FaTimesCircle /> },
};

const ManageOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/orders/all`, getAuthHeader());
      if (response.data.success) {
        setOrders(response.data.data || []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Fetch Orders Error:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const response = await axios.put(
        `${API_BASE}/orders/${orderId}/status`,
        { status: newStatus },
        getAuthHeader()
      );

      if (response.data.success) {
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? { ...ord, status: newStatus } : ord))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
        }
      } else {
        alert(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Status update error:", error);
      alert(error.response?.data?.message || "Error updating order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const response = await axios.delete(`${API_BASE}/orders/${id}`, getAuthHeader());
      if (response.data.success) {
        setOrders((prev) => prev.filter((o) => o._id !== id));
        if (selectedOrder && selectedOrder._id === id) setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Delete order error:", error);
      alert(error.response?.data?.message || "Failed to delete order.");
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const downloadInvoice = (order) => {
    if (!order) return;
    const invCode = `INV-${order._id?.slice(-8).toUpperCase()}`;
    const invoiceHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${invCode}</title>
  <style>
    @page { size: A4 portrait; margin: 8mm 12mm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 20px 25px;
      background: #ffffff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 15px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      color: #2563eb;
      margin: 0;
    }
    .brand-sub {
      color: #64748b;
      font-size: 12px;
      margin-top: 3px;
    }
    .inv-meta {
      text-align: right;
    }
    .inv-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px 0;
    }
    .meta-row {
      font-size: 12px;
      color: #475569;
      margin-bottom: 2px;
    }
    .grid {
      display: flex;
      justify-content: space-between;
      margin: 16px 0;
      gap: 20px;
    }
    .col {
      flex: 1;
      font-size: 12px;
      line-height: 1.4;
    }
    .col h4 {
      margin: 0 0 5px 0;
      font-size: 11px;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th {
      background: #f8fafc;
      text-align: left;
      padding: 8px 12px;
      font-size: 12px;
      color: #334155;
      border-bottom: 2px solid #cbd5e1;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 12px;
      color: #334155;
    }
    .totals-wrap {
      display: flex;
      justify-content: flex-end;
      margin-top: 10px;
    }
    .totals-box {
      width: 240px;
      font-size: 13px;
    }
    .t-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      color: #64748b;
    }
    .t-grand {
      border-top: 2px solid #0f172a;
      padding-top: 6px;
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
    }
    .footer {
      text-align: center;
      margin-top: 25px;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
      color: #94a3b8;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="brand-title">📦 INVENTORY OS</h1>
      <div class="brand-sub">Official Purchase Receipt & Tax Invoice</div>
    </div>
    <div class="inv-meta">
      <h2 class="inv-title">INVOICE</h2>
      <div class="meta-row"><strong>Invoice No:</strong> ${invCode}</div>
      <div class="meta-row"><strong>Date:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</div>
      <div class="meta-row"><strong>Status:</strong> ${order.status || "Pending"}</div>
    </div>
  </div>

  <div class="grid">
    <div class="col">
      <h4>Billed To:</h4>
      <strong>${order.customerId?.name || "Customer"}</strong><br/>
      ${order.customerId?.email || ""}<br/>
      ${order.customerId?.phone || ""}
    </div>
    <div class="col">
      <h4>Delivery Destination:</h4>
      <div>${order.address || "Standard Delivery"}</div>
      <h4 style="margin-top: 8px;">Payment Details:</h4>
      <div><strong>${(order.paymentId || "CASH").toUpperCase()}</strong></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Item Description</th>
        <th>Unit Price</th>
        <th>Quantity</th>
        <th>Total Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td><strong>${order.productId?.name || "Product"}</strong></td>
        <td>₹${Math.round((order.price || 0) / (order.quantity || 1)).toLocaleString()}</td>
        <td>${order.quantity}</td>
        <td>₹${Number(order.price || 0).toLocaleString()}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals-wrap">
    <div class="totals-box">
      <div class="t-row"><span>Subtotal:</span><span>₹${Number(order.price || 0).toLocaleString()}</span></div>
      <div class="t-row"><span>GST / Tax (0%):</span><span>₹0</span></div>
      <div class="t-row t-grand"><span>Grand Total:</span><span>₹${Number(order.price || 0).toLocaleString()}</span></div>
    </div>
  </div>

  <div class="footer">
    <p><strong>Thank you for choosing Inventory OS!</strong></p>
    <small>Computer Generated Tax Invoice · No Signature Required</small>
  </div>
</body>
</html>`;

    const blob = new Blob([invoiceHTML], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice_${invCode}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const counts = {
    All: orders.length,
    Pending: orders.filter((o) => (o.status || "Pending") === "Pending").length,
    Processing: orders.filter((o) => o.status === "Processing").length,
    Shipped: orders.filter((o) => o.status === "Shipped").length,
    Delivered: orders.filter((o) => o.status === "Delivered").length,
    Cancelled: orders.filter((o) => o.status === "Cancelled").length,
  };

  const filteredOrders = orders.filter((order) => {
    const status = order.status || "Pending";
    if (statusFilter !== "All" && status !== statusFilter) return false;

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();

    return (
      (order.customerId?.name || "").toLowerCase().includes(q) ||
      (order.customerId?.email || "").toLowerCase().includes(q) ||
      (order.productId?.name || "").toLowerCase().includes(q) ||
      (order.address || "").toLowerCase().includes(q) ||
      (order.paymentId || "").toLowerCase().includes(q) ||
      (order._id || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="manage-order-root">
      {/* ─── Header Info ────────────────────────────────────── */}
      <div className="module-header-row">
        <div>
          <h2 className="module-title">Order Fulfillment & Management</h2>
          <p className="module-subtitle">Track customer orders, live shipping status, invoices, and payment modes</p>
        </div>

        <div className="order-stats-pill">
          <FaClipboardList /> {orders.length} Total Orders
        </div>
      </div>

      {/* ─── Status Filter Tabs ───────────────────────────── */}
      <div className="status-filter-tabs-row">
        {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((tab) => (
          <button
            key={tab}
            className={`status-tab-btn ${statusFilter === tab ? "active" : ""}`}
            onClick={() => setStatusFilter(tab)}
          >
            <span>{tab}</span>
            <span className="tab-count-badge">{counts[tab] || 0}</span>
          </button>
        ))}
      </div>

      {/* ─── Table Card ────────────────────────────────────── */}
      <div className="order-table-card">
        <div className="table-top-controls">
          <div className="table-search-box">
            <FaSearch className="table-search-icon" />
            <input
              type="text"
              placeholder="Search by customer name, email, product, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="results-count-tag">{filteredOrders.length} Orders</span>
        </div>

        <div className="table-container">
          <table className="order-data-table">
            <thead>
              <tr>
                <th style={{ width: "110px" }}>Order Ref</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th style={{ textAlign: "right", width: "230px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="empty-state-cell">
                    Loading Customer Orders...
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const currentStatus = order.status || "Pending";
                  const statusMeta = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.Pending;

                  return (
                    <tr key={order._id}>
                      <td>
                        <span className="order-ref-pill">
                          INV-{order._id?.slice(-6).toUpperCase()}
                        </span>
                      </td>

                      <td>
                        <div className="customer-avatar-cell">
                          <div className="cust-avatar-badge">
                            {order.customerId?.name?.charAt(0).toUpperCase() || "C"}
                          </div>
                          <div>
                            <strong className="cust-name">
                              {order.customerId?.name || "Guest User"}
                            </strong>
                            <small className="cust-email">
                              {order.customerId?.email || "No email"}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <strong className="prod-title-text">
                          {order.productId?.name || "Product"}
                        </strong>
                      </td>

                      <td>
                        <span className="qty-pill">{order.quantity}</span>
                      </td>

                      <td>
                        <strong className="price-text">
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
                        <select
                          className={`status-dropdown-select ${statusMeta.color}`}
                          value={currentStatus}
                          disabled={updatingId === order._id}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td>
                        <div className="table-action-btn-row">
                          <button
                            className="action-btn view-action"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <FaEye /> View
                          </button>
                          <button
                            className="action-btn invoice-action"
                            onClick={() => setInvoiceOrder(order)}
                          >
                            <FaReceipt /> Invoice
                          </button>
                          <button
                            className="action-btn delete-action"
                            onClick={() => handleDelete(order._id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="empty-state-cell">
                    No orders found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Order Details Modal ────────────────────────────── */}
      {selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-line">
              <div className="modal-heading">
                <FaClipboardList className="modal-header-icon blue" />
                <h3>Order Details · INV-{selectedOrder._id?.slice(-6).toUpperCase()}</h3>
              </div>
              <button className="modal-close-x" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>

            <div className="order-details-grid">
              <div className="detail-item">
                <span>Customer Name:</span>
                <strong>{selectedOrder.customerId?.name || "N/A"}</strong>
              </div>
              <div className="detail-item">
                <span>Email Address:</span>
                <strong>{selectedOrder.customerId?.email || "N/A"}</strong>
              </div>
              <div className="detail-item">
                <span>Product:</span>
                <strong>{selectedOrder.productId?.name || "Product"}</strong>
              </div>
              <div className="detail-item">
                <span>Quantity:</span>
                <strong>{selectedOrder.quantity} Units</strong>
              </div>
              <div className="detail-item">
                <span>Total Amount:</span>
                <strong className="price-highlight">₹{Number(selectedOrder.price || 0).toLocaleString()}</strong>
              </div>
              <div className="detail-item">
                <span>Payment Mode:</span>
                <strong className="payment-highlight">{(selectedOrder.paymentId || "CASH").toUpperCase()}</strong>
              </div>
              <div className="detail-item full-width">
                <span>Shipping Address:</span>
                <p>{selectedOrder.address || "Standard Delivery"}</p>
              </div>
            </div>

            <div className="modal-actions-row">
              <button
                className="modal-primary-btn"
                onClick={() => {
                  setInvoiceOrder(selectedOrder);
                  setSelectedOrder(null);
                }}
              >
                <FaReceipt /> Print / Download Invoice
              </button>
              <button className="modal-secondary-btn" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Single-Page Printable Invoice Modal ────────────── */}
      {invoiceOrder && (
        <div className="order-modal-overlay" onClick={() => setInvoiceOrder(null)}>
          <div className="invoice-modal-card single-page-invoice" onClick={(e) => e.stopPropagation()}>
            <div className="invoice-header-controls no-print">
              <div className="modal-heading">
                <FaReceipt className="modal-header-icon emerald" />
                <h3>Invoice Preview · INV-{invoiceOrder._id?.slice(-8).toUpperCase()}</h3>
              </div>

              <div className="invoice-btn-group">
                <button
                  className="download-invoice-btn"
                  onClick={() => downloadInvoice(invoiceOrder)}
                  title="Direct Download HTML Invoice"
                >
                  <FaDownload /> Download Invoice
                </button>
                <button className="print-modal-btn" onClick={printInvoice}>
                  <FaPrint /> Print Receipt
                </button>
                <button className="modal-close-x" onClick={() => setInvoiceOrder(null)}>
                  ✕
                </button>
              </div>
            </div>

            <div className="printable-invoice-body">
              <div className="invoice-doc-header">
                <div>
                  <h1 className="invoice-brand-title">📦 INVENTORY OS</h1>
                  <span className="invoice-brand-sub">Enterprise Management Platform</span>
                </div>
                <div className="invoice-meta-right">
                  <h2 className="invoice-tag">TAX INVOICE</h2>
                  <div className="meta-text"><strong>Invoice No:</strong> INV-{invoiceOrder._id?.slice(-8).toUpperCase()}</div>
                  <div className="meta-text"><strong>Date:</strong> {invoiceOrder.createdAt ? new Date(invoiceOrder.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</div>
                </div>
              </div>

              <div className="invoice-addresses-grid">
                <div className="address-col">
                  <h4>Billed To</h4>
                  <strong>{invoiceOrder.customerId?.name || "Customer"}</strong>
                  <p>{invoiceOrder.customerId?.email || ""}</p>
                </div>
                <div className="address-col">
                  <h4>Delivery Address</h4>
                  <p>{invoiceOrder.address || "Standard Delivery"}</p>
                  <p><strong>Payment Mode:</strong> {(invoiceOrder.paymentId || "CASH").toUpperCase()}</p>
                </div>
              </div>

              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item Description</th>
                    <th>Rate</th>
                    <th>Qty</th>
                    <th style={{ textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td><strong>{invoiceOrder.productId?.name || "Product"}</strong></td>
                    <td>₹{Math.round((invoiceOrder.price || 0) / (invoiceOrder.quantity || 1)).toLocaleString()}</td>
                    <td>{invoiceOrder.quantity}</td>
                    <td style={{ textAlign: "right" }}>₹{Number(invoiceOrder.price || 0).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div className="invoice-totals-wrapper">
                <div className="invoice-totals-table">
                  <div className="tot-row">
                    <span>Subtotal:</span>
                    <strong>₹{Number(invoiceOrder.price || 0).toLocaleString()}</strong>
                  </div>
                  <div className="tot-row">
                    <span>Taxes:</span>
                    <strong>₹0.00</strong>
                  </div>
                  <div className="tot-row grand-total">
                    <span>Grand Total:</span>
                    <strong>₹{Number(invoiceOrder.price || 0).toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="invoice-doc-footer">
                <p>Thank you for your business!</p>
                <small>Computer generated invoice · Generated by Inventory OS</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrder;
