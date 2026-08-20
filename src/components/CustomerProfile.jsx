import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaLock,
  FaKey,
  FaShieldAlt,
  FaCheck,
  FaSave,
  FaTimes,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import "./CustomerProfile.css";

const API_BASE = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("pos-token");
const headers = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const CustomerProfile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Verify password modal for profile update
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Update password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/users/profile`, headers());
      if (response.data.success) {
        setUser({
          name: response.data.user.name || "",
          email: response.data.user.email || "",
          address: response.data.user.address || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setCurrentPassword("");
    setShowVerifyModal(true);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setMessage({ type: "error", text: "Please enter your current password." });
      return;
    }
    setVerifyLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE}/users/profile`,
        {
          name: user.name,
          email: user.email,
          address: user.address,
          currentPassword,
        },
        headers()
      );
      if (response.data.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setShowVerifyModal(false);
        setCurrentPassword("");
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to update profile";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setVerifyLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setMessage({ type: "error", text: "Please fill in all password fields." });
      return;
    }
    setPasswordLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE}/users/profile/password`,
        { oldPassword, newPassword },
        headers()
      );
      if (response.data.success) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setShowPasswordModal(false);
        setOldPassword("");
        setNewPassword("");
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to change password";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading-state">
        <div className="profile-spinner"></div>
        <span>Loading Profile Details...</span>
      </div>
    );
  }

  return (
    <div className="profile-module-root">
      <div className="module-header-row">
        <div>
          <h2 className="module-title">Account & Security</h2>
          <p className="module-subtitle">Manage personal information, contact address, and authentication</p>
        </div>
      </div>

      {message.text && (
        <div className={`profile-alert-box ${message.type}`}>
          <span>{message.type === "success" ? "✅" : "⚠️"}</span>
          <span>{message.text}</span>
          <button className="alert-close" onClick={() => setMessage({ type: "", text: "" })}>✕</button>
        </div>
      )}

      <div className="profile-dual-cards">
        {/* ─── Profile Details Card ─────────────────────────── */}
        <div className="profile-card-item">
          <div className="profile-card-header">
            <div className="profile-header-avatar">
              <FaUser />
            </div>
            <div>
              <h3>Personal Details</h3>
              <p>Update your public username, email, and billing address</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="profile-form-grid">
            <div className="profile-field-group">
              <label>Full Name</label>
              <div className="profile-input-wrapper">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
            </div>

            <div className="profile-field-group">
              <label>Email Address</label>
              <div className="profile-input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div className="profile-field-group">
              <label>Delivery / Billing Address</label>
              <div className="profile-input-wrapper">
                <FaMapMarkerAlt className="input-icon" />
                <textarea
                  rows="3"
                  value={user.address}
                  onChange={(e) => setUser({ ...user, address: e.target.value })}
                  placeholder="Street address, City, Postal Code"
                />
              </div>
            </div>

            <button type="submit" className="profile-submit-btn">
              <FaSave /> Save Profile Changes
            </button>
          </form>
        </div>

        {/* ─── Security & Password Card ─────────────────────── */}
        <div className="profile-card-item">
          <div className="profile-card-header">
            <div className="profile-header-avatar amber">
              <FaShieldAlt />
            </div>
            <div>
              <h3>Security & Password</h3>
              <p>Protect your account with a strong and secure password</p>
            </div>
          </div>

          <div className="security-card-content">
            <div className="security-notice-box">
              <FaLock className="lock-icon" />
              <div>
                <strong>Keep Your Password Secure</strong>
                <p>Change your password periodically to ensure your inventory and order data remain safe.</p>
              </div>
            </div>

            <button
              type="button"
              className="open-password-modal-btn"
              onClick={() => {
                setMessage({ type: "", text: "" });
                setOldPassword("");
                setNewPassword("");
                setShowPasswordModal(true);
              }}
            >
              <FaKey /> Update Password
            </button>
          </div>
        </div>
      </div>

      {/* ─── Verify Password Modal ───────────────────────────── */}
      {showVerifyModal && (
        <div className="profile-modal-overlay" onClick={() => setShowVerifyModal(false)}>
          <div className="profile-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-line">
              <div className="modal-heading">
                <FaShieldAlt className="modal-header-icon blue" />
                <h3>Verify Password</h3>
              </div>
              <button className="modal-close-x" onClick={() => setShowVerifyModal(false)}>✕</button>
            </div>

            <p className="modal-instruction-text">
              Please enter your current account password to confirm and save your profile changes.
            </p>

            <form onSubmit={handleVerifySubmit} className="modal-form-content">
              <div className="profile-field-group">
                <label>Current Password</label>
                <div className="profile-input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="modal-primary-btn" disabled={verifyLoading}>
                  {verifyLoading ? "Verifying..." : "Confirm & Save"}
                </button>
                <button type="button" className="modal-secondary-btn" onClick={() => setShowVerifyModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Change Password Modal ──────────────────────────── */}
      {showPasswordModal && (
        <div className="profile-modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="profile-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-line">
              <div className="modal-heading">
                <FaKey className="modal-header-icon amber" />
                <h3>Change Password</h3>
              </div>
              <button className="modal-close-x" onClick={() => setShowPasswordModal(false)}>✕</button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="modal-form-content">
              <div className="profile-field-group">
                <label>Old Password</label>
                <div className="profile-input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type={showOldPass ? "text" : "password"}
                    placeholder="Enter current password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className="pass-peek-btn"
                    onClick={() => setShowOldPass(!showOldPass)}
                    tabIndex="-1"
                  >
                    {showOldPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="profile-field-group">
                <label>New Password</label>
                <div className="profile-input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type={showNewPass ? "text" : "password"}
                    placeholder="Create a strong new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="pass-peek-btn"
                    onClick={() => setShowNewPass(!showNewPass)}
                    tabIndex="-1"
                  >
                    {showNewPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="modal-primary-btn" disabled={passwordLoading}>
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
                <button type="button" className="modal-secondary-btn" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;
