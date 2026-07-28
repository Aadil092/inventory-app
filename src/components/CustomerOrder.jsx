import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CustomerOrder.css"

const CustomerOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    setLoading(true);

    try {
      const response = await axios.get("http://localhost:5000/api/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });

      console.log(response.data);

      setOrders(response.data.data || []);
    } catch (error) {
      // console.error(error);
      setOrders([]);
      alert("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/orders/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        alert("Order deleted successfully.");
        fetchOrders();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete order.");
    }
  };

  const q = searchTerm.trim().toLowerCase();

  const filteredOrders = orders.filter((order) => {
    if (!q) return true;

    return (
      order.productId?.name?.toLowerCase().includes(q) ||
      // order.customerId?.name?.toLowerCase().includes(q) ||
      order.price?.toString().includes(q) ||
      order.quantity?.toString().includes(q) ||
      order.address?.toLowerCase().includes(q) ||
      order.paymentId?.toString().toLowerCase().includes(q)
    );
  });

  return (
<div className="customer-orders-page">

  <h2 className="orders-title">
    Customer Orders
  </h2>

  {/* Search */}

  <div className="orders-search-box">
    <input
      type="text"
      className="orders-search-input"
      placeholder="Search Order..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>

  {/* Table */}

  <div className="customer-orders-table-card">

    <table className="customer-orders-table">

      <thead>
        <tr>
          <th>ID</th>
          <th>Product</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Address</th>
          <th>Payment</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>

        {loading ? (
          <tr>
            <td colSpan="7" className="empty-order">
              Loading Orders...
            </td>
          </tr>
        ) : filteredOrders.length === 0 ? (
          <tr>
            <td colSpan="7" className="empty-order">
              No Orders Found
            </td>
          </tr>
        ) : (
          filteredOrders.map((order, index) => (

            <tr key={order._id}>

              <td>
                <div className="order-id-circle">
                  {index + 1}
                </div>
              </td>

              <td className="order-product">
                {order.productId?.name || "-"}
              </td>

              <td>
                <span className="qty-badge">
                  {order.quantity}
                </span>
              </td>

              <td className="order-price">
                ₹{order.price}
              </td>

              <td className="order-address">
                {order.address}
              </td>

              <td>
                <span
                  className={`payment-badge ${
                    order.paymentId === "online"
                      ? "payment-online"
                      : "payment-cash"
                  }`}
                >
                  {order.paymentId || "Cash"}
                </span>
              </td>

              <td className="order-action-buttons">
                <button
                  className="delete-order-btn"
                  onClick={() => handleDelete(order._id)}
                >
                  Delete
                </button>
              </td>

            </tr>

          ))
        )}

      </tbody>

    </table>

  </div>

</div>
  );
};


export default CustomerOrder;