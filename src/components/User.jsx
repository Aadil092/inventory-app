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
  FaBan,
  FaCheckCircle,
  FaPauseCircle,
  FaFilter,
  FaUserCheck,
  FaUserSlash,
  FaUserLock,
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
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editUserId, setEditUserId] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [alertNotice, setAlertNotice] = useState(null);

  const [formdata, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "customer",
    status: "Active",
  });

  const showAlert = (message, type = "success") => {
    setAlertNotice({ message, type });
    setTimeout(() => {
      setAlertNotice(null);
    }, 4000);
  };

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
      status: user.status || "Active",
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
      status: "Active",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formdata.name.trim() || !formdata.email.trim()) {
      showAlert("Please fill in required name and email fields.", "error");
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
          showAlert("User account updated successfully!", "success");
          handleCancel();
          fetchUsers();
        } else {
          showAlert(response.data.message || "Error updating user.", "error");
        }
      } else {
        const response = await axios.post(
          `${API_BASE}/users/add`,
          formdata,
          headers()
        );

        if (response.data.success) {
          showAlert("New user created successfully!", "success");
          handleCancel();
          fetchUsers();
        } else {
          showAlert(response.data.message || "Error adding user.", "error");
        }
      }
    } catch (error) {
      console.error("Submit User Error:", error);
      const msg = error.response?.data?.message || "Failed to save user account.";
      showAlert(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user account permanently?")) return;
    try {
      const response = await axios.delete(`${API_BASE}/users/${id}`, headers());
      if (response.data.success) {
        showAlert("User deleted successfully.", "success");
        fetchUsers();
      } else {
        showAlert("Error deleting user.", "error");
      }
    } catch (error) {
      console.error("Delete user error:", error);
      showAlert("Failed to delete user.", "error");
    }
  };

  // Direct quick status change from table or modal
  const handleQuickStatusChange = async (userId, newStatus, userName = "User") => {
    setStatusUpdatingId(userId);
    try {
      const response = await axios.put(
        `${API_BASE}/users/${userId}`,
        { status: newStatus },
        headers()
      );

      if (response.data.success) {
        showAlert(
          `User "${userName}" status updated to ${newStatus}.`,
          newStatus === "Active" ? "success" : newStatus === "Blocked" ? "error" : "warning"
        );
        fetchUsers();
        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser({ ...selectedUser, status: newStatus });
        }
      } else {
        showAlert(response.data.message || "Failed to update status", "error");
      }
    } catch (error) {
      console.error("Update status error:", error);
      showAlert(error.response?.data?.message || "Failed to update user status.", "error");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleSaveStatusModal = async () => {
    if (!selectedUser) return;
    await handleQuickStatusChange(selectedUser._id, selectedUser.status || "Active", selectedUser.name);
    setViewModal(false);
  };

  // Stats calculation
  const totalCount = users.length;
  const activeCount = users.filter((u) => (u.status || "Active").toLowerCase() === "active").length;
  const deactiveCount = users.filter((u) => (u.status || "").toLowerCase() === "deactive" || (u.status || "").toLowerCase() === "inactive").length;
  const blockedCount = users.filter((u) => (u.status || "").toLowerCase() === "blocked").length;

  const filteredUsers = users.filter((user) => {
    const nameMatch = (user.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatch = (user.role || "").toLowerCase().includes(searchTerm.toLowerCase());
    const addressMatch = (user.address || "").toLowerCase().includes(searchTerm.toLowerCase());
    const searchPassed = nameMatch || emailMatch || roleMatch || addressMatch;

    if (!searchPassed) return false;

    const uStatus = (user.status || "Active").toLowerCase();
    if (statusFilter === "active") return uStatus === "active";
    if (statusFilter === "deactive") return uStatus === "deactive" || uStatus === "inactive";
    if (statusFilter === "blocked") return uStatus === "blocked";
    return true;
  });

  return (
    <div className="user-module-root">
      {/* ─── Notification Alert Banner ───────────────────────── */}
      {alertNotice && (
        <div className={`user-alert-banner ${alertNotice.type}`}>
          <div className="alert-content">
            {alertNotice.type === "success" && <FaCheckCircle className="alert-icon" />}
            {alertNotice.type === "error" && <FaBan className="alert-icon" />}
            {alertNotice.type === "warning" && <FaPauseCircle className="alert-icon" />}
            <span>{alertNotice.message}</span>
          </div>
          <button className="alert-dismiss-btn" onClick={() => setAlertNotice(null)}>✕</button>
        </div>
      )}

      {/* ─── Header Info ────────────────────────────────────── */}
      <div className="module-header-row">
        <div>
          <h2 className="module-title">User Accounts & Access Control</h2>
          <p className="module-subtitle">Manage superadmin, admin, and customer roles, permissions, and account activation/blocking</p>
        </div>

        <div className="user-header-stats-row">
          <div className="status-stat-pill all">
            <FaShieldAlt /> {totalCount} Total
          </div>
          <div className="status-stat-pill active">
            <span className="pill-dot active"></span> {activeCount} Active
          </div>
          <div className="status-stat-pill deactive">
            <span className="pill-dot deactive"></span> {deactiveCount} Deactive
          </div>
          <div className="status-stat-pill blocked">
            <span className="pill-dot blocked"></span> {blockedCount} Blocked
          </div>
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

            <div className="form-field-row">
              <div className="form-field-group">
                <label>System Role *</label>
                <select name="role" value={formdata.role} onChange={handleChange} required>
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">SuperAdmin</option>
                </select>
              </div>

              <div className="form-field-group">
                <label>Account Status</label>
                <select
                  name="status"
                  value={formdata.status}
                  onChange={handleChange}
                  disabled={formdata.role === "superadmin"}
                >
                  <option value="Active">Active</option>
                  <option value="Deactive">Deactive</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
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
            {/* Search Input */}
            <div className="table-search-box">
              <FaSearch className="table-search-icon" />
              <input
                type="text"
                placeholder="Search by name, email, role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="status-filter-tabs">
              <button
                type="button"
                className={`filter-tab-btn ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                All <span className="tab-badge">{totalCount}</span>
              </button>
              <button
                type="button"
                className={`filter-tab-btn active-tab ${statusFilter === "active" ? "active" : ""}`}
                onClick={() => setStatusFilter("active")}
              >
                Active <span className="tab-badge active">{activeCount}</span>
              </button>
              <button
                type="button"
                className={`filter-tab-btn deactive-tab ${statusFilter === "deactive" ? "active" : ""}`}
                onClick={() => setStatusFilter("deactive")}
              >
                Deactive <span className="tab-badge deactive">{deactiveCount}</span>
              </button>
              <button
                type="button"
                className={`filter-tab-btn blocked-tab ${statusFilter === "blocked" ? "active" : ""}`}
                onClick={() => setStatusFilter("blocked")}
              >
                Blocked <span className="tab-badge blocked">{blockedCount}</span>
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="user-data-table">
              <thead>
                <tr>
                  <th style={{ width: "45px" }}>#</th>
                  <th>User Profile</th>
                  <th>Role</th>
                  <th>Account Status</th>
                  <th style={{ textAlign: "right", width: "190px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="empty-state-cell">
                      <div className="table-loading-spinner"></div>
                      <span>Loading User Accounts...</span>
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((u, index) => {
                    const role = (u.role || "customer").toLowerCase();
                    const isSuper = role === "superadmin";
                    const isAdmin = role === "admin";
                    const uStatus = (u.status || "Active").toLowerCase();
                    const isUpdating = statusUpdatingId === u._id;

                    return (
                      <tr key={u._id} className={uStatus === "blocked" ? "row-blocked" : uStatus === "deactive" ? "row-deactive" : ""}>
                        <td>
                          <span className="row-index-badge">{index + 1}</span>
                        </td>
                        <td>
                          <div className="user-avatar-cell">
                            <div className={`user-avatar-badge ${role}`}>
                              {isSuper ? <FaCrown /> : u.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="user-info-text">
                              <strong className="user-name">
                                {u.name ? u.name.charAt(0).toUpperCase() + u.name.slice(1) : "User"}
                              </strong>
                              <span className="user-email-sub">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`role-pill ${role}`}>
                            {isSuper ? "👑 SuperAdmin" : isAdmin ? "🛡️ Admin" : "🛍️ Customer"}
                          </span>
                        </td>
                        <td>
                          {isSuper ? (
                            <span className="user-status-badge active" title="Superadmin is always active">
                              <FaCheckCircle className="badge-dot-icon" /> Active
                            </span>
                          ) : (
                            <div className="table-status-selector-wrap">
                              <select
                                className={`user-inline-status-select ${uStatus}`}
                                value={u.status || "Active"}
                                disabled={isUpdating}
                                onChange={(e) =>
                                  handleQuickStatusChange(u._id, e.target.value, u.name)
                                }
                                title="Click to change user status directly"
                              >
                                <option value="Active">🟢 Active</option>
                                <option value="Deactive">🟡 Deactive</option>
                                <option value="Blocked">🔴 Blocked</option>
                              </select>
                            </div>
                          )}
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
                                title="View User Details & Status"
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
                      No users found matching your search and filter criteria.
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
                <h3>User Profile & Account Status</h3>
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
                {selectedUser.role === "superadmin" ? (
                  <span className="user-status-badge active">
                    <FaCheckCircle /> Active (Protected)
                  </span>
                ) : (
                  <select
                    className={`user-status-select ${(selectedUser.status || "Active").toLowerCase()}`}
                    value={selectedUser.status || "Active"}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, status: e.target.value })
                    }
                  >
                    <option value="Active">🟢 Active (Full Access)</option>
                    <option value="Deactive">🟡 Deactive (Login Disabled)</option>
                    <option value="Blocked">🔴 Blocked (Access Banned)</option>
                  </select>
                )}
              </div>

              {/* Status Explanation Card */}
              {selectedUser.role !== "superadmin" && (
                <div className={`status-explainer-box ${(selectedUser.status || "Active").toLowerCase()}`}>
                  {(selectedUser.status || "Active").toLowerCase() === "active" && (
                    <p>✅ <strong>Active:</strong> User can log in normally and access customer or admin features.</p>
                  )}
                  {((selectedUser.status || "").toLowerCase() === "deactive" || (selectedUser.status || "").toLowerCase() === "inactive") && (
                    <p>⚠️ <strong>Deactivated:</strong> User login will be stopped with a notification message to contact the administrator.</p>
                  )}
                  {(selectedUser.status || "").toLowerCase() === "blocked" && (
                    <p>🚫 <strong>Blocked:</strong> User account is completely locked. Login attempts will show an account blocked message.</p>
                  )}
                </div>
              )}
            </div>

            <div className="modal-actions-row">
              {selectedUser.role !== "superadmin" && (
                <button type="button" className="modal-primary-btn" onClick={handleSaveStatusModal}>
                  <FaCheck /> Save Status
                </button>
              )}
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

