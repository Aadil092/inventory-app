import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaCog, FaGlobe, FaDollarSign, FaPercent, FaPhone, FaEnvelope, FaStore, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import "./SystemSettings.css";

const SystemSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const filteredSettings = settings.filter(
    (setting) =>
      setting.settingKey?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.settingValue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/settings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });
      if (response.data.success) {
        setSettings(response.data.settings || []);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      // console.error("Error fetching settings:", error);
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

    if (editSetting) {
      try {
        const response = await axios.put(
          `http://localhost:5000/api/settings/${editSetting}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
          }
        );

        if (response.data.success) {
          alert("Setting Updated Successfully");
          setEditSetting(null);
          setFormData({
            settingKey: "",
            settingValue: "",
            settingType: "text",
            description: "",
            status: "active",
          });
          setShowModal(false);
          fetchSettings();
        } else {
          alert("Error updating setting. Please try again.");
        }
      } catch (error) {
        // console.error("Error updating setting:", error);
        alert("Error updating setting. Please try again.");
      }
    } else {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/settings/add",
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
          }
        );

        if (response.data.success) {
          alert("Setting Added Successfully");
          setFormData({
            settingKey: "",
            settingValue: "",
            settingType: "text",
            description: "",
            status: "active",
          });
          setShowModal(false);
          fetchSettings();
        } else {
          alert("Error adding setting. Please try again.");
        }
      } catch (error) {
        // console.error("Error adding setting:", error);
        alert("Error adding setting. Please try again.");
      }
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this setting?");
    if (confirmDelete) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/settings/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        });
        if (response.data.success) {
          alert("Setting deleted successfully!");
          fetchSettings();
        } else {
          alert("Error deleting setting. Please try again.");
        }
      } catch (error) {
        // console.error("Error deleting setting:", error);
        alert("Error deleting setting. Please try again.");
      }
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
    return <FaCog />;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="settings-container">
      {/* Top Toolbar */}
      <div className="settings-toolbar">
        <input
          type="text"
          placeholder="Search settings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="settings-search"
        />

        <button
          className="add-settings-btn"
          onClick={() => setShowModal(true)}
        >
          Add Setting
        </button>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="settings-modal-overlay">
          <div className="settings-modal">
            <button
              className="modal-close-btn"
              onClick={handleCancel}
            >
              ✕
            </button>

            <h2 className="modal-title">
              {editSetting ? "Edit Setting" : "Add Setting"}
            </h2>

            <form
              className="settings-form"
              onSubmit={handleSubmit}
            >
              <label className="form-label">Setting Key</label>
              <input
                className="settings-form-input"
                type="text"
                name="settingKey"
                placeholder="e.g. store_name, tax_rate, currency"
                value={formData.settingKey}
                onChange={handleChange}
                required
              />

              <label className="form-label">Setting Value</label>
              {formData.settingType === "textarea" ? (
                <textarea
                  className="settings-form-textarea"
                  name="settingValue"
                  placeholder="Enter setting value"
                  value={formData.settingValue}
                  onChange={handleChange}
                  required
                />
              ) : (
                <input
                  className="settings-form-input"
                  type={formData.settingType === "number" ? "number" : "text"}
                  name="settingValue"
                  placeholder="Enter setting value"
                  value={formData.settingValue}
                  onChange={handleChange}
                  required
                />
              )}

              <label className="form-label">Setting Type</label>
              <select
                className="settings-form-select"
                name="settingType"
                value={formData.settingType}
                onChange={handleChange}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="textarea">Textarea</option>
                <option value="email">Email</option>
                <option value="url">URL</option>
              </select>

              <label className="form-label">Description</label>
              <textarea
                className="settings-form-textarea"
                name="description"
                placeholder="Brief description of this setting"
                value={formData.description}
                onChange={handleChange}
              />

              <label className="form-label">Status</label>
              <select
                className="settings-form-select"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <div className="settings-button-group">
                <button
                  className="save-btn"
                  type="submit"
                >
                  {editSetting ? "Save Changes" : "Add Setting"}
                </button>

                <button
                  className="cancel-btn"
                  type="button"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Table */}
      <div className="settings-table-card">
        <table className="settings-table">
          <thead>
            <tr>
              <th>Setting Key</th>
              <th>Value</th>
              <th>Type</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSettings.length > 0 ? (
              filteredSettings.map((setting, index) => (
                <tr key={setting._id || index}>
                  <td>
                    <div className="setting-info">
                      <div className="setting-key-icon">
                        {getSettingIcon(setting.settingKey)}
                      </div>
                      <div className="setting-key">
                        {setting.settingKey?.replace(/_/g, " ")}
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="setting-value">
                      {setting.settingValue}
                    </div>
                  </td>

                  <td>
                    <span className="type-badge">
                      {setting.settingType || "text"}
                    </span>
                  </td>

                  <td className="setting-value-text">
                    {setting.description || "—"}
                  </td>

                  <td>
                    <span className={`status-badge ${setting.status === "active" ? "status-active" : "status-inactive"}`}>
                      {setting.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <div className="settings-actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(setting)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(setting._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="settings-empty">
                  No Settings Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemSettings;

