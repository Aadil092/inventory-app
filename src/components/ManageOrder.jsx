import axios from "axios";
import React, { useEffect, useState } from "react";
import "./ManageOrder.css"

const ManageOrder = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [viewModel, setViewModel] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // const fetchUser = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await axios.get("http://localhost:5000/api/users", {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
  //       },
  //     });
  //     console.log(response.data.users);
  //     setUsers(response.data.users);
  //     setLoading(false);
  //   } catch (error) {
  //     // console.error("Error fetching categories:", error);
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {

  //   fetchUser();
  // }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/orders/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });
      if (response.data.success) {
      setOrders(response.data.data);
    } else {
      setOrders([]);
      alert(response.data.message);
    }
  } catch (error) {
    console.error("Fetch Orders Error:", error);

    setOrders([]);

    alert(
      error.response?.data?.message || "Error fetching orders."
    );
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this User?");
    if (confirmDelete) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        });
        if (response.data.success) {
          alert("User deleted successfully!");
          fetchUser();
        } else {
          // console.error("Error deleting order:", data);
          alert("Error deleting User. Please try again.");
        }
      } catch (error) {
        // console.error("Error deleting order:", error);
        alert("Error deleting order. Please try again.");
      }
    }
  };


  const filteredOrders = orders.filter((order) => {
    return (
      (order.customerId?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.price?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.quantity?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.paymentId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="manage-order">

  {/* Search */}
  <div className="order-search">
    <input
      type="text"
      placeholder="🔍 Search orders by customer, product"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>

  {/* Table */}
  <div className="order-table-card">

    <table className="order-table">

      <thead>
        <tr>
          <th>ID</th>
          <th>Customer</th>
          <th>Product</th>
          <th>Qty</th>
          <th>Amount</th>
          <th>Address</th>
          <th>Payment</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>

        {filteredOrders.length > 0 ? (

          filteredOrders.map((order, index) => (

            <tr key={order._id}>

              {/* ID */}

              <td>{index + 1}</td>

              {/* Customer */}

              <td>
                <div className="customer-info">

                  <div className="customer-avatar">
                    {order.customerId?.name?.charAt(0).toUpperCase()}
                  </div>

                  <div className="customer-name">
                    {order.customerId?.name}
                  </div>

                </div>
              </td>

              {/* Product */}

              <td>{order.productId?.name}</td>

              {/* Quantity */}

              <td>
                <span className="qty-badge">
                  {order.quantity}
                </span>
              </td>

              {/* Price */}

              <td className="price">
                ₹ {order.price}
              </td>

              {/* Address */}

              <td>{order.address}</td>

              {/* Payment */}

              <td>

                <span
                  className={`payment-badge ${
                    order.paymentId === "Cash"
                      ? "payment-cash"
                      : "payment-online"
                  }`}
                >
                  {order.paymentId}
                </span>

              </td>

              {/* Actions */}

              <td>

                <div className="manage-order-action-buttons">

                  <button
                    className="view-btn"
                    onClick={() => {
                      setSelectedIndex(index);
                      setViewModel(true);
                    }}
                  >
                    View
                  </button>

                  {/*

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(order._id)}
                  >
                    Delete
                  </button>

                  */}

                </div>

              </td>

            </tr>

          ))

        ) : (

          <tr>

            <td
              colSpan="8"
              className="no-data"
            >
              No Orders Found
            </td>

          </tr>

        )}

      </tbody>

    </table>

  </div>

  {/* View Order Modal */}

  {viewModel && (

    <div className="order-modal">

      <div className="order-modal-card">

        <div className="order-modal-inner">

          <div className="modal-header">

            <h2>📦 Order Details</h2>

          </div>

          <div className="modal-body">

            <div className="detail-row">
              <span>Customer</span>
              <strong>{orders[selectedIndex].customerId?.name}</strong>
            </div>

            <div className="detail-row">
              <span>Product</span>
              <strong>{orders[selectedIndex].productId?.name}</strong>
            </div>

            <div className="detail-row">
              <span>Quantity</span>
              <strong>{orders[selectedIndex].quantity}</strong>
            </div>

            <div className="detail-row">
              <span>Price</span>
              <strong className="order-price">
                ₹ {orders[selectedIndex].price}
              </strong>
            </div>

            <div className="detail-row">
              <span>Address</span>
              <strong>{orders[selectedIndex].address}</strong>
            </div>

            <div className="detail-row">
              <span>Payment</span>
              <strong className={`payment-badge ${
                    orders[selectedIndex].paymentId === "Cash"
                      ? "payment-cash"
                      : "payment-online"
                  }`}>{orders[selectedIndex].paymentId}</strong>
            </div>
            
            <button
              className="model-close-btn"
              onClick={() => setViewModel(false)}
            >
              Close
            </button>

          </div>

        </div>

      </div>

    </div>

  )}

</div>
  );
};
const thStyle = {
  padding: "16px",
  textAlign: "left",
  fontWeight: "600",
};

const tdStyle = {
  padding: "16px",
  color: "#334155",
};

const detailRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px 0",
  borderBottom: "1px solid #E2E8F0",
  fontSize: "15px",
};

export default ManageOrder;
