import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaBox,
  FaCheckCircle,
  FaClock,
  FaFileInvoiceDollar,
  FaPrint,
  FaSearch,
  FaShippingFast,
  FaTimesCircle,
  FaTruck,
  FaBan,
  FaDownload,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaReceipt,
  FaFilePdf,
} from "react-icons/fa";
import "./CustomerOrder.css";

const API_BASE = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("pos-token");
const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const TRACKING_STEPS = [
  { key: "Pending", label: "Order Placed", icon: <FaClock /> },
  { key: "Processing", label: "Processing", icon: <FaBox /> },
  { key: "Shipped", label: "Shipped", icon: <FaShippingFast /> },
  { key: "Delivered", label: "Delivered", icon: <FaCheckCircle /> },
];

const CustomerOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [trackOrder, setTrackOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/orders`, getAuthHeader());
      setOrders(response.data.data || []);
    } catch (error) {
      console.error(error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order? Stock will be restored.")) {
      return;
    }

    setCancellingId(orderId);
    try {
      const response = await axios.put(
        `${API_BASE}/orders/${orderId}/cancel`,
        {},
        getAuthHeader()
      );

      if (response.data.success) {
        alert("Order cancelled successfully!");
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: "Cancelled" } : o))
        );
        if (trackOrder && trackOrder._id === orderId) {
          setTrackOrder((prev) => ({ ...prev, status: "Cancelled" }));
        }
      } else {
        alert(response.data.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Cancel order error:", error);
      alert(error.response?.data?.message || "Failed to cancel order.");
    } finally {
      setCancellingId(null);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const downloadPdfReceipt = async (order) => {
    if (!order || !order._id) return;
    const currentStatus = order.status || "Pending";

    if (currentStatus !== "Delivered") {
      alert("Receipt download is only available after your order has been delivered.");
      return;
    }

    setDownloadingId(order._id);
    try {
      const response = await axios.get(`${API_BASE}/orders/${order._id}/receipt`, {
        ...getAuthHeader(),
        responseType: "blob",
      });

      // Create a Blob from the PDF Stream
      const fileBlob = new Blob([response.data], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(fileBlob);
      const link = document.createElement("a");
      const invCode = `INV-${order._id?.slice(-8).toUpperCase()}`;
      link.href = downloadUrl;
      link.setAttribute("download", `Receipt_${invCode}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("PDF Receipt download error:", error);
      if (error.response?.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errObj = JSON.parse(reader.result);
            alert(errObj.message || "Failed to download receipt.");
          } catch (e) {
            alert("Failed to download PDF receipt. Please try again.");
          }
        };
        reader.readAsText(error.response.data);
      } else {
        alert(error.response?.data?.message || "Failed to download PDF receipt.");
      }
    } finally {
      setDownloadingId(null);
    }
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
      (order.productId?.name || "").toLowerCase().includes(q) ||
      (order.address || "").toLowerCase().includes(q) ||
      (order.paymentId || "").toLowerCase().includes(q) ||
      (order._id || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="customer-order-root">
      {/* ─── Header Info ────────────────────────────────────── */}
      <div className="module-header-row">
        <div>
          <h2 className="module-title">My Purchase Orders</h2>
          <p className="module-subtitle">Track delivery progress, download receipts, and manage active purchases</p>
        </div>

        <div className="order-stats-pill">
          <FaShoppingBag /> {orders.length} Total Purchases
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
      <div className="customer-orders-table-card">
        <div className="table-top-controls">
          <div className="table-search-box">
            <FaSearch className="table-search-icon" />
            <input
              type="text"
              placeholder="Search by product name, address, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="results-count-tag">{filteredOrders.length} Orders</span>
        </div>

        <div className="table-container">
          <table className="cust-orders-data-table">
            <thead>
              <tr>
                <th style={{ width: "110px" }}>Order Ref</th>
                <th>Purchased Product</th>
                <th>Qty</th>
                <th>Total Price</th>
                <th>Payment Mode</th>
                <th>Delivery Status</th>
                <th style={{ textAlign: "right", width: "230px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="empty-state-cell">
                    Loading your orders...
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const currentStatus = order.status || "Pending";
                  const isCancelable =
                    currentStatus === "Pending" || currentStatus === "Processing";

                  return (
                    <tr key={order._id}>
                      <td>
                        <span className="order-ref-pill">
                          INV-{order._id?.slice(-6).toUpperCase()}
                        </span>
                      </td>

                      <td>
                        <strong className="prod-title-text">
                          {order.productId?.name || "Product"}
                        </strong>
                      </td>

                      <td>
                        <span className="qty-pill">{order.quantity} Units</span>
                      </td>

                      <td>
                        <strong className="price-text">
                          ₹{Number(order.price || 0).toLocaleString()}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`payment-pill ${(order.paymentId || "").toLowerCase() === "cash"
                            ? "cash"
                            : "online"
                            }`}
                        >
                          {(order.paymentId || "CASH").toUpperCase()}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-pill ${currentStatus.toLowerCase()}`}
                        >
                          {currentStatus}
                        </span>
                      </td>

                      <td>
                        <div className="table-action-btn-row">
                          <button
                            className="action-btn track-action"
                            onClick={() => setTrackOrder(order)}
                            title="Live Order Tracking"
                          >
                            <FaTruck /> Track
                          </button>

                          {currentStatus === "Delivered" ? (
                            <button
                              className="action-btn download-pdf-action"
                              onClick={() => downloadPdfReceipt(order)}
                              disabled={downloadingId === order._id}
                              title="Download Official PDF Receipt"
                            >
                              <FaDownload /> {downloadingId === order._id ? "Downloading..." : "PDF Receipt"}
                            </button>
                          ) : (
                            <button
                              className="action-btn receipt-pending-action"
                              onClick={() => alert("Receipt download will be available once the order is Delivered.")}
                              title="Receipt available after delivery"
                            >
                              <FaReceipt /> PDF (On Delivery)
                            </button>
                          )}

                          <button
                            className="action-btn invoice-action"
                            onClick={() => setInvoiceOrder(order)}
                            title="View Receipt"
                          >
                            <FaReceipt /> Preview
                          </button>

                          {isCancelable && (
                            <button
                              className="action-btn delete-action"
                              disabled={cancellingId === order._id}
                              onClick={() => handleCancelOrder(order._id)}
                              title="Cancel Order"
                            >
                              <FaBan /> Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state-cell">
                    No purchase orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Live Step Tracking Modal ───────────────────────── */}
      {trackOrder && (
        <div className="order-modal-overlay" onClick={() => setTrackOrder(null)}>
          <div className="track-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-line">
              <div className="modal-heading">
                <FaTruck className="modal-header-icon blue" />
                <h3>Track Delivery · INV-{trackOrder._id?.slice(-6).toUpperCase()}</h3>
              </div>
              <button className="modal-close-x" onClick={() => setTrackOrder(null)}>✕</button>
            </div>

            {/* Stepper */}
            {trackOrder.status === "Cancelled" ? (
              <div className="cancelled-banner-box">
                <FaTimesCircle className="cancelled-icon" />
                <div>
                  <strong>Order Cancelled</strong>
                  <p>This purchase order was cancelled and inventory was returned.</p>
                </div>
              </div>
            ) : (
              <div className="tracking-stepper-row">
                {TRACKING_STEPS.map((step, idx) => {
                  const stepIndex = TRACKING_STEPS.findIndex(
                    (s) => s.key === (trackOrder.status || "Pending")
                  );
                  const isCompleted = idx <= stepIndex;
                  const isCurrent = idx === stepIndex;

                  return (
                    <div
                      key={step.key}
                      className={`stepper-step ${isCompleted ? "completed" : ""
                        } ${isCurrent ? "current" : ""}`}
                    >
                      <div className="step-circle">
                        {step.icon}
                      </div>
                      <span className="step-name">{step.label}</span>
                      {idx < TRACKING_STEPS.length - 1 && (
                        <div
                          className={`step-connector ${idx < stepIndex ? "active" : ""
                            }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="track-summary-box">
              <div className="detail-item">
                <span>Product:</span>
                <strong>{trackOrder.productId?.name || "Product"}</strong>
              </div>
              <div className="detail-item">
                <span>Quantity:</span>
                <strong>{trackOrder.quantity} Units</strong>
              </div>
              <div className="detail-item">
                <span>Amount Paid:</span>
                <strong className="price-highlight">₹{Number(trackOrder.price || 0).toLocaleString()}</strong>
              </div>
              <div className="detail-item full-width">
                <span>Delivery Address:</span>
                <p>{trackOrder.address || "Standard Delivery Destination"}</p>
              </div>
            </div>

            <div className="modal-actions-row">
              {trackOrder.status === "Delivered" && (
                <button
                  className="modal-primary-btn download-pdf-btn"
                  onClick={() => downloadPdfReceipt(trackOrder)}
                  disabled={downloadingId === trackOrder._id}
                >
                  <FaDownload /> {downloadingId === trackOrder._id ? "Downloading..." : "Download PDF Receipt"}
                </button>
              )}
              <button
                className="modal-primary-btn"
                onClick={() => {
                  setInvoiceOrder(trackOrder);
                  setTrackOrder(null);
                }}
              >
                <FaReceipt /> View Printable Receipt
              </button>
              <button className="modal-secondary-btn" onClick={() => setTrackOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Printable / Download Receipt Modal ─────────────── */}
      {invoiceOrder && (
        <div className="order-modal-overlay" onClick={() => setInvoiceOrder(null)}>
          <div className="invoice-modal-card single-page-invoice" onClick={(e) => e.stopPropagation()}>
            <div className="invoice-header-controls no-print">
              <div className="modal-heading">
                <FaReceipt className="modal-header-icon emerald" />
                <h3>Receipt Preview · INV-{invoiceOrder._id?.slice(-8).toUpperCase()}</h3>
              </div>

              <div className="invoice-btn-group">
                {invoiceOrder.status === "Delivered" ? (
                  <button
                    className="download-invoice-btn"
                    onClick={() => downloadPdfReceipt(invoiceOrder)}
                    disabled={downloadingId === invoiceOrder._id}
                    title="Download Official PDF Receipt"
                  >
                    <FaDownload /> {downloadingId === invoiceOrder._id ? "Downloading..." : "Download PDF Receipt"}
                  </button>
                ) : (
                  <span className="receipt-locked-tag" title="Receipt will be available once the order is Delivered">
                    🔒 PDF Available After Delivery
                  </span>
                )}
                <button className="print-modal-btn" onClick={printInvoice}>
                  <FaPrint /> Print
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
                  <span className="invoice-brand-sub">Customer Purchase Receipt</span>
                </div>
                <div className="invoice-meta-right">
                  <h2 className="invoice-tag">BILLING RECEIPT</h2>
                  <div className="meta-text"><strong>Receipt No:</strong> INV-{invoiceOrder._id?.slice(-8).toUpperCase()}</div>
                  <div className="meta-text"><strong>Date:</strong> {invoiceOrder.createdAt ? new Date(invoiceOrder.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</div>
                </div>
              </div>

              <div className="invoice-addresses-grid">
                <div className="address-col">
                  <h4>Delivery Address</h4>
                  <p>{invoiceOrder.address || "Standard Delivery Destination"}</p>
                </div>
                <div className="address-col">
                  <h4>Payment Information</h4>
                  <p><strong>Method:</strong> {(invoiceOrder.paymentId || "CASH").toUpperCase()}</p>
                  <p><strong>Status:</strong> {invoiceOrder.status || "Pending"}</p>
                </div>
              </div>

              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th>Item No</th>
                    <th>Product Title</th>
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
                    <span>Total Paid:</span>
                    <strong>₹{Number(invoiceOrder.price || 0).toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="invoice-doc-footer">
                <p>Thank you for shopping with us!</p>
                <small>Computer generated invoice · Inventory OS</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrder;