import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaMapMarkedAlt,
  FaPlus,
  FaSearch,
  FaTrash,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import "./State.css";

const API_BASE = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("pos-token");
const headers = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const State = () => {
  const [showStateModal, setShowStateModal] = useState(false);
  const [stateName, setStateName] = useState("");
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/states`, headers());
      if (response.data.success) {
        setStates(response.data.states || []);
      }
    } catch (error) {
      console.error("Error fetching states:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  const handleAddState = async (e) => {
    e.preventDefault();
    if (!stateName.trim()) return;

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${API_BASE}/states/add`,
        { stateName: stateName.trim() },
        headers()
      );
      if (response.data.success) {
        setShowStateModal(false);
        setStateName("");
        fetchStates();
      } else {
        alert(response.data.message || "Failed to add state.");
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || "Error adding state.";
      alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteState = async (id) => {
    if (!window.confirm("Are you sure you want to delete this state?")) return;
    try {
      const response = await axios.delete(`${API_BASE}/states/${id}`, headers());
      if (response.data.success) {
        fetchStates();
      }
    } catch (error) {
      console.error("Delete state error:", error);
    }
  };

  const filteredStates = states.filter((s) =>
    (s.stateName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="state-module-root">
      <div className="module-header-row">
        <div>
          <h2 className="module-title">State / Region Management</h2>
          <p className="module-subtitle">Manage geographical delivery zones and regional states</p>
        </div>

        <button
          type="button"
          className="add-state-main-btn"
          onClick={() => setShowStateModal(true)}
        >
          <FaPlus /> Add New State
        </button>
      </div>

      {/* State List Card */}
      <div className="state-card-container">
        <div className="table-top-controls">
          <div className="table-search-box">
            <FaSearch className="table-search-icon" />
            <input
              type="text"
              placeholder="Search states/regions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="results-count-tag">{filteredStates.length} States</span>
        </div>

        <div className="state-tags-grid">
          {loading ? (
            <div className="empty-state-cell">Loading States...</div>
          ) : filteredStates.length > 0 ? (
            filteredStates.map((st, index) => (
              <div className="state-pill-item" key={st._id || index}>
                <div className="state-pill-left">
                  <FaMapMarkedAlt className="state-pin-icon" />
                  <span className="state-pill-name">{st.stateName}</span>
                </div>
                <button
                  className="state-delete-btn"
                  onClick={() => handleDeleteState(st._id)}
                  title="Remove State"
                >
                  <FaTrash />
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state-cell">No states found. Click "+ Add New State" to create one.</div>
          )}
        </div>
      </div>

      {/* Add State Modal */}
      {showStateModal && (
        <div className="state-modal-overlay" onClick={() => setShowStateModal(false)}>
          <div className="state-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-line">
              <div className="modal-heading">
                <FaMapMarkedAlt className="modal-header-icon blue" />
                <h3>Add New State</h3>
              </div>
              <button className="modal-close-x" onClick={() => setShowStateModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddState} className="modal-form-content">
              <div className="form-field-group">
                <label>State / Province Name</label>
                <input
                  type="text"
                  placeholder="e.g. California, Maharashtra, Ontario"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="modal-primary-btn" disabled={submitting}>
                  {submitting ? "Saving..." : <><FaCheck /> Save State</>}
                </button>
                <button
                  type="button"
                  className="modal-secondary-btn"
                  onClick={() => setShowStateModal(false)}
                >
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

export default State;
