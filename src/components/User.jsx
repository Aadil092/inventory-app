import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaShieldAlt,
  FaUserTag,
  FaMapMarkerAlt,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaTimes,
  FaCheck,
  FaCrown,
  FaShoppingBag,
} from "react-icons/fa";
import "./User.css";

const API_BASE = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("pos-token");
const headers = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const User = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editUserId, setEditUserId] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formdata, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "customer",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/users`, headers());
      if (response.data.success || response.data.users) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (user) => {
    setEditUserId(user._id);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      address: user.address || "",
      role: user.role || "customer",
    });
  };

  const handleCancel = () => {
    setEditUserId(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      address: "",
      role: "customer",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formdata.name.trim() || !formdata.email.trim()) {
      alert("Please fill in required name and email fields.");
      return;
    }

    setSubmitting(true);
    try {
      if (editUserId) {
        const response = await axios.put(
          `${API_BASE}/users/${editUserId}`,
          formdata,
          headers()
        );

        if (response.data.success) {
          handleCancel();
          fetchUsers();
        } else {
          alert("Error updating user.");
        }
      } else {
        const response = await axios.post(
          `${API_BASE}/users/add`,
          formdata,
          headers()
        );

        if (response.data.success) {
          handleCancel();
          fetchUsers();
        } else {
          alert("Error adding user.");
        }
      }
    } catch (error) {
      console.error("Submit User Error:", error);
      alert("Failed to save user account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user account?")) return;
    try {
      const response = await axios.delete(`${API_BASE}/users/${id}`, headers());
      if (response.data.success) {
        fetchUsers();
      } else {
        alert("Error deleting user.");
      }
    } catch (error) {
      console.error("Delete user error:", error);
      alert("Failed to delete user.");
    }
  };

  const handleSaveStatus = async () => {
    if (!selectedUser) return;
    try {
      const response = await axios.put(
        `${API_BASE}/users/${selectedUser._id}`,
        { status: selectedUser.status },
        headers()
      );
      if (response.data.success) {
        fetchUsers();
        setViewModal(false);
      }
    } catch (error) {
      console.error("Update status error:", error);
      alert("Failed to update user status.");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.role || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.address || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-module-root">
      {/* ─── Header Info ────────────────────────────────────── */}
      <div className="module-header-row">
        <div>
          <h2 className="module-title">User Accounts & RBAC</h2>
          <p className="module-subtitle">Manage superadmin, admin, and customer roles and access privileges</p>
        </div>

        <div className="user-stats-pill">
          <FaShieldAlt /> {users.length} Registered Accounts
        </div>
      </div>

      <div className="user-grid-layout">
        {/* ─── Left Form Card ───────────────────────────────── */}
        <div className="user-form-card">
          <div className="form-header-box">
            <div className="form-header-icon">
              <FaUser />
            </div>
            <div>
              <h3>{editUserId ? "Edit User Account" : "Add New User"}</h3>
              <p>{editUserId ? "Modify credentials & access role" : "Create a new administrator or customer"}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="user-form-body">
            <div className="form-field-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formdata.name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                required
              />
            </div>

            <div className="form-field-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formdata.email}
                onChange={handleChange}
                placeholder="user@example.com"
                required
              />
            </div>

            <div className="form-field-group">
              <label>{editUserId ? "New Password (Optional)" : "Password *"}</label>
              <input
                type="password"
                name="password"
                value={formdata.password}
                onChange={handleChange}
                placeholder={editUserId ? "Leave blank to keep current password" : "••••••••"}
                required={!editUserId}
              />
            </div>

            <div className="form-field-group">
              <label>System Role *</label>
              <select name="role" value={formdata.role} onChange={handleChange} required>
                <option value="customer">Customer (Order & Shop)</option>
                <option value="admin">Admin (Manage Stock & Orders)</option>
                <option value="superadmin">SuperAdmin (Full Root Access)</option>
              </select>
            </div>

            <div className="form-field-group">
              <label>Address</label>
              <textarea
                rows="2"
                name="address"
                value={formdata.address}
                onChange={handleChange}
                placeholder="Delivery / billing address..."
              />
            </div>

            <div className="form-actions-group">
              <button type="submit" className="user-submit-btn" disabled={submitting}>
                {submitting ? "Saving..." : editUserId ? <><FaCheck /> Update User</> : <><FaPlus /> Add User</>}
              </button>

              {editUserId && (
                <button type="button" className="user-cancel-btn" onClick={handleCancel}>
                  <FaTimes /> Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ─── Right Table Card ──────────────────────────────── */}
        <div className="user-table-card">
          <div className="table-top-controls">
            <div className="table-search-box">
              <FaSearch className="table-search-icon" />
              <input
                type="text"
                placeholder="Search by name, email, role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="results-count-tag">{filteredUsers.length} Users</span>
          </div>

          <div className="table-container">
            <table className="user-data-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>#</th>
                  <th>User Profile</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right", width: "170px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="empty-state-cell">
                      Loading Users...
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((u, index) => {
                    const role = (u.role || "customer").toLowerCase();
                    const isSuper = role === "superadmin";
                    const isAdmin = role === "admin";

                    return (
                      <tr key={u._id}>
                        <td>
                          <span className="row-index-badge">{index + 1}</span>
                        </td>
                        <td>
                          <div className="user-avatar-cell">
                            <div className={`user-avatar-badge ${role}`}>
                              {isSuper ? <FaCrown /> : u.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div>
                              <strong className="user-name">{u.name?.charAt(0).toUpperCase() + u.name?.slice(1)}</strong>

                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`role-pill ${role}`}>
                            {isSuper ? " SuperAdmin" : isAdmin ? " Admin" : " Customer"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`user-status-pill ${(u.status || "Active").toLowerCase()
                              }`}
                          >
                            {u.status || "Active"}
                          </span>
                        </td>
                        <td>
                          {isSuper ? (
                            <div className="table-action-btn-row">
                              <span className="protected-pill" title="Superadmin account cannot be modified or deleted">
                                🔒 Protected
                              </span>
                            </div>
                          ) : (
                            <div className="table-action-btn-row">
                              <button
                                className="action-btn view-action"
                                onClick={() => {
                                  setSelectedUser(u);
                                  setViewModal(true);
                                }}
                                title="View User Details"
                              >
                                <FaEye />
                              </button>
                              <button
                                className="action-btn edit-action"
                                onClick={() => handleEdit(u)}
                                title="Edit User"
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="action-btn delete-action"
                                onClick={() => handleDelete(u._id)}
                                title="Delete User"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-state-cell">
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── View / Manage User Modal ───────────────────────── */}
      {viewModal && selectedUser && (
        <div className="user-modal-overlay" onClick={() => setViewModal(false)}>
          <div className="user-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-line">
              <div className="modal-heading">
                <FaUser className="modal-header-icon blue" />
                <h3>User Profile Details</h3>
              </div>
              <button className="modal-close-x" onClick={() => setViewModal(false)}>✕</button>
            </div>

            <div className="user-modal-profile-header">
              <div className={`modal-user-avatar ${(selectedUser.role || "customer").toLowerCase()}`}>
                {selectedUser.role === "superadmin" ? (
                  <FaCrown />
                ) : (
                  selectedUser.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <h4>{selectedUser.name}</h4>
              <span className={`role-pill ${(selectedUser.role || "customer").toLowerCase()}`}>
                {selectedUser.role}
              </span>
            </div>

            <div className="user-detail-list">
              <div className="u-detail-row">
                <span>Email Address:</span>
                <strong>{selectedUser.email}</strong>
              </div>
              <div className="u-detail-row">
                <span>Delivery Address:</span>
                <strong>{selectedUser.address || "None specified"}</strong>
              </div>
              <div className="u-detail-row">
                <span>Account Status:</span>
                <select
                  className="user-status-select"
                  value={selectedUser.status || "Active"}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, status: e.target.value })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Deactive">Deactive</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            </div>

            <div className="modal-actions-row">
              <button type="button" className="modal-primary-btn" onClick={handleSaveStatus}>
                Save Status
              </button>
              <button type="button" className="modal-secondary-btn" onClick={() => setViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;
