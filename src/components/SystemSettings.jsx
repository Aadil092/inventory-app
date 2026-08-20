import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  FaCog,
  FaGlobe,
  FaDollarSign,
  FaPercent,
  FaPhone,
  FaEnvelope,
  FaStore,
  FaMapMarkerAlt,
  FaClock,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaSlidersH,
} from "react-icons/fa";
import "./SystemSettings.css";

const API_BASE = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("pos-token");
const headers = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const SystemSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editSetting, setEditSetting] = useState(null);

  const [formData, setFormData] = useState({
    settingKey: "",
    settingValue: "",
    settingType: "text",
    description: "",
    status: "active",
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/settings`, headers());
      if (response.data.success) {
        setSettings(response.data.settings || []);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (setting) => {
    setEditSetting(setting._id);
    setFormData({
      settingKey: setting.settingKey,
      settingValue: setting.settingValue,
      settingType: setting.settingType || "text",
      description: setting.description || "",
      status: setting.status || "active",
    });
    setShowModal(true);
  };

  const handleCancel = () => {
    setEditSetting(null);
    setFormData({
      settingKey: "",
      settingValue: "",
      settingType: "text",
      description: "",
      status: "active",
    });
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editSetting) {
        const response = await axios.put(
          `${API_BASE}/settings/${editSetting}`,
          formData,
          headers()
        );

        if (response.data.success) {
          handleCancel();
          fetchSettings();
        } else {
          alert("Error updating setting.");
        }
      } else {
        const response = await axios.post(
          `${API_BASE}/settings/add`,
          formData,
          headers()
        );

        if (response.data.success) {
          handleCancel();
          fetchSettings();
        } else {
          alert("Error adding setting.");
        }
      }
    } catch (error) {
      console.error("Save setting error:", error);
      alert("Failed to save system setting.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this setting parameter?")) return;
    try {
      const response = await axios.delete(`${API_BASE}/settings/${id}`, headers());
      if (response.data.success) {
        fetchSettings();
      } else {
        alert("Error deleting setting.");
      }
    } catch (error) {
      console.error("Delete setting error:", error);
      alert("Failed to delete setting.");
    }
  };

  const getSettingIcon = (key) => {
    const iconMap = {
      store: <FaStore />,
      email: <FaEnvelope />,
      phone: <FaPhone />,
      currency: <FaDollarSign />,
      tax: <FaPercent />,
      timezone: <FaClock />,
      address: <FaMapMarkerAlt />,
      language: <FaGlobe />,
    };
    for (const [prefix, icon] of Object.entries(iconMap)) {
      if (key?.toLowerCase().includes(prefix)) {
        return icon;
      }
    }
    return <FaSlidersH />;
  };

  const filteredSettings = settings.filter(
    (setting) =>
      (setting.settingKey || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (setting.settingValue || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (setting.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="settings-module-root">
      {/* ─── Header Info ────────────────────────────────────── */}
      <div className="module-header-row">
        <div>
          <h2 className="module-title">System & Global Configuration</h2>
          <p className="module-subtitle">Configure tax rates, store parameters, currency, and operational defaults</p>
        </div>

        <button
          type="button"
          className="add-settings-main-btn"
          onClick={() => {
            handleCancel();
            setShowModal(true);
          }}
        >
          <FaPlus /> Add New Parameter
        </button>
      </div>

      {/* ─── Settings Table Card ────────────────────────────── */}
      <div className="settings-table-card">
        <div className="table-top-controls">
          <div className="table-search-box">
            <FaSearch className="table-search-icon" />
            <input
              type="text"
              placeholder="Search setting key, value, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="results-count-tag">{filteredSettings.length} Parameters</span>
        </div>

        <div className="table-container">
          <table className="settings-data-table">
            <thead>
              <tr>
                <th style={{ width: "50px" }}>#</th>
                <th>Configuration Key</th>
                <th>Active Value</th>
                <th>Type</th>
                <th>Description</th>
                <th>Status</th>
                <th style={{ textAlign: "right", width: "160px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="empty-state-cell">
                    Loading System Configurations...
                  </td>
                </tr>
              ) : filteredSettings.length > 0 ? (
                filteredSettings.map((st, index) => (
                  <tr key={st._id || index}>
                    <td>
                      <span className="row-index-badge">{index + 1}</span>
                    </td>

                    <td>
                      <div className="setting-key-cell">
                        <div className="setting-key-icon">
                          {getSettingIcon(st.settingKey)}
                        </div>
                        <strong className="setting-key-name">
                          {st.settingKey?.replace(/_/g, " ")}
                        </strong>
                      </div>
                    </td>

                    <td>
                      <span className="setting-val-tag">
                        {st.settingValue}
                      </span>
                    </td>

                    <td>
                      <span className="type-pill">
                        {st.settingType || "text"}
                      </span>
                    </td>

                    <td className="setting-desc-text">
                      {st.description || "—"}
                    </td>

                    <td>
                      <span
                        className={`status-pill ${
                          st.status === "active" ? "active" : "inactive"
                        }`}
                      >
                        {st.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <div className="table-action-btn-row">
                        <button
                          className="action-btn edit-action"
                          onClick={() => handleEdit(st)}
                          title="Edit Parameter"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          className="action-btn delete-action"
                          onClick={() => handleDelete(st._id)}
                          title="Delete Parameter"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state-cell">
                    No configuration parameters found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Add / Edit Modal ───────────────────────────────── */}
      {showModal && (
        <div className="settings-modal-overlay" onClick={handleCancel}>
          <div className="settings-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-line">
              <div className="modal-heading">
                <FaCog className="modal-header-icon blue" />
                <h3>{editSetting ? "Edit System Parameter" : "Add System Parameter"}</h3>
              </div>
              <button className="modal-close-x" onClick={handleCancel}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="settings-modal-form">
              <div className="form-field-group">
                <label>Setting Key *</label>
                <input
                  type="text"
                  name="settingKey"
                  placeholder="e.g. tax_rate, default_currency, store_address"
                  value={formData.settingKey}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field-group">
                <label>Setting Value *</label>
                {formData.settingType === "textarea" ? (
                  <textarea
                    rows="3"
                    name="settingValue"
                    placeholder="Enter configuration value"
                    value={formData.settingValue}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <input
                    type={formData.settingType === "number" ? "number" : "text"}
                    name="settingValue"
                    placeholder="Enter value"
                    value={formData.settingValue}
                    onChange={handleChange}
                    required
                  />
                )}
              </div>

              <div className="modal-form-grid">
                <div className="form-field-group">
                  <label>Data Type</label>
                  <select
                    name="settingType"
                    value={formData.settingType}
                    onChange={handleChange}
                  >
                    <option value="text">Text / String</option>
                    <option value="number">Number / Percentage</option>
                    <option value="textarea">Multiline Text</option>
                    <option value="email">Email</option>
                    <option value="url">URL</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-field-group">
                <label>Description (Optional)</label>
                <textarea
                  rows="2"
                  name="description"
                  placeholder="Short note explaining this parameter's effect..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="modal-primary-btn" disabled={submitting}>
                  {submitting ? "Saving..." : editSetting ? <><FaCheck /> Save Parameter</> : <><FaPlus /> Add Parameter</>}
                </button>
                <button type="button" className="modal-secondary-btn" onClick={handleCancel}>
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

export default SystemSettings;
