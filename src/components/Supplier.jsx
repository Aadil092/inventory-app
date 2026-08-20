import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaTruck,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import State from "../components/State";
import City from "../components/City";
import "./Supplier.css";

const API_BASE = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("pos-token");
const headers = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const Supplier = () => {
  const [addEditModel, setAddEditModel] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [formdata, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    address: "",
    stateId: "",
    cityId: "",
  });

  const fetchSupplier = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/supplier`, headers());
      if (response.data.success) {
        setSuppliers(response.data.suppliers || []);
        setStates(response.data.states || []);
        setCities(response.data.cities || []);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplier();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (supplier) => {
    setEditSupplier(supplier._id);
    setFormData({
      name: supplier.name || "",
      email: supplier.email || "",
      number: supplier.number || "",
      address: supplier.address || "",
      stateId: supplier.stateId?._id || supplier.stateId || "",
      cityId: supplier.cityId?._id || supplier.cityId || "",
    });
    setAddEditModel(true);
  };

  const handleCancel = () => {
    setEditSupplier(null);
    setFormData({
      name: "",
      email: "",
      number: "",
      address: "",
      stateId: "",
      cityId: "",
    });
    setAddEditModel(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editSupplier) {
        const response = await axios.put(
          `${API_BASE}/supplier/${editSupplier}`,
          formdata,
          headers()
        );

        if (response.data.success) {
          handleCancel();
          fetchSupplier();
        } else {
          alert("Error updating supplier.");
        }
      } else {
        const response = await axios.post(
          `${API_BASE}/supplier/add`,
          formdata,
          headers()
        );

        if (response.data.success) {
          handleCancel();
          fetchSupplier();
        } else {
          alert("Error adding supplier.");
        }
      }
    } catch (error) {
      console.error("Submit Supplier Error:", error);
      alert("Failed to save supplier.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    try {
      const response = await axios.delete(`${API_BASE}/supplier/${id}`, headers());
      if (response.data.success) {
        fetchSupplier();
      } else {
        alert("Error deleting supplier.");
      }
    } catch (error) {
      console.error("Delete supplier error:", error);
      alert("Failed to delete supplier.");
    }
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.address || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="supplier-module-root">
      {/* ─── Header Row ─────────────────────────────────────── */}
      <div className="module-header-row">
        <div>
          <h2 className="module-title">Supplier Management</h2>
          <p className="module-subtitle">Manage wholesale supply vendors, contact channels, and locations</p>
        </div>

        <div className="supplier-header-btn-group">
          <button
            className="add-supplier-main-btn"
            onClick={() => {
              handleCancel();
              setAddEditModel(true);
            }}
          >
            <FaPlus /> Add Supplier
          </button>
          <State />
          <City />
        </div>
      </div>

      {/* ─── Table Card ─────────────────────────────────────── */}
      <div className="supplier-table-card">
        <div className="table-top-controls">
          <div className="table-search-box">
            <FaSearch className="table-search-icon" />
            <input
              type="text"
              placeholder="Search by supplier name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="results-count-tag">{filteredSuppliers.length} Suppliers</span>
        </div>

        <div className="table-container">
          <table className="supplier-data-table">
            <thead>
              <tr>
                <th style={{ width: "50px" }}>#</th>
                <th>Supplier Details</th>
                <th>Contact Info</th>
                <th>Address</th>
                <th>Region</th>
                <th style={{ textAlign: "right", width: "160px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty-state-cell">
                    Loading Suppliers...
                  </td>
                </tr>
              ) : filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((sup, index) => (
                  <tr key={sup._id}>
                    <td>
                      <span className="row-index-badge">{index + 1}</span>
                    </td>
                    <td>
                      <div className="supplier-avatar-cell">
                        <div className="sup-avatar-badge">
                          {sup.name?.charAt(0).toUpperCase() || "S"}
                        </div>
                        <div>
                          <strong className="sup-name">{sup.name}</strong>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="sup-contact-group">
                        <span className="contact-line">
                          <FaEnvelope className="sub-icon" /> {sup.email || "No email"}
                        </span>
                        <span className="contact-line">
                          <FaPhone className="sub-icon" /> {sup.number || "No phone"}
                        </span>
                      </div>
                    </td>
                    <td className="sup-address-cell">{sup.address || "N/A"}</td>
                    <td>
                      <div className="region-tags-wrap">
                        {sup.stateId?.stateName && (
                          <span className="state-badge-pill">{sup.stateId.stateName}</span>
                        )}
                        {sup.cityId?.name && (
                          <span className="city-badge-pill">{sup.cityId.name}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="table-action-btn-row">
                        <button
                          className="action-btn edit-action"
                          onClick={() => handleEdit(sup)}
                          title="Edit Supplier"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          className="action-btn delete-action"
                          onClick={() => handleDelete(sup._id)}
                          title="Delete Supplier"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state-cell">
                    No suppliers found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Add / Edit Modal ───────────────────────────────── */}
      {addEditModel && (
        <div className="supplier-modal-overlay" onClick={handleCancel}>
          <div className="supplier-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-line">
              <div className="modal-heading">
                <FaTruck className="modal-header-icon blue" />
                <h3>{editSupplier ? "Edit Supplier" : "Add New Supplier"}</h3>
              </div>
              <button className="modal-close-x" onClick={handleCancel}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="supplier-modal-form">
              <div className="modal-form-grid">
                <div className="form-field-group">
                  <label>Supplier / Vendor Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Apex Global Logistics"
                    value={formdata.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="contact@supplier.com"
                    value={formdata.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="number"
                    placeholder="+1 (555) 000-0000"
                    value={formdata.number}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Warehouse 4, Industrial Blvd"
                    value={formdata.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field-group">
                  <label>State / Region</label>
                  <select
                    name="stateId"
                    value={formdata.stateId}
                    onChange={handleChange}
                  >
                    <option value="">Select State</option>
                    {states.map((st) => (
                      <option key={st._id} value={st._id}>
                        {st.stateName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field-group">
                  <label>City</label>
                  <select
                    name="cityId"
                    value={formdata.cityId}
                    onChange={handleChange}
                  >
                    <option value="">Select City</option>
                    {cities
                      .filter((c) => {
                        const sid = c.stateId?._id || c.stateId?.id || c.stateId;
                        return sid === formdata.stateId;
                      })
                      .map((c) => (
                        <option key={c._id || c.id} value={c._id || c.id}>
                          {c.cityName || c.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="modal-primary-btn" disabled={submitting}>
                  {submitting ? "Saving..." : editSupplier ? <><FaCheck /> Save Changes</> : <><FaPlus /> Add Supplier</>}
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

export default Supplier;
