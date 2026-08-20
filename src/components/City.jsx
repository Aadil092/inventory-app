import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCity, FaPlus, FaCheck, FaTimes } from "react-icons/fa";
import "./City.css";

const API_BASE = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("pos-token");
const headers = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const City = () => {
  const [showCityModal, setShowCityModal] = useState(false);
  const [states, setStates] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [cityData, setCityData] = useState({
    stateId: "",
    name: "",
  });

  const fetchStates = async () => {
    try {
      const response = await axios.get(`${API_BASE}/states`, headers());
      if (response.data.success) {
        setStates(response.data.states || []);
      }
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  const handleAddCity = async (e) => {
    e.preventDefault();
    if (!cityData.stateId || !cityData.name.trim()) {
      alert("Please select a state and enter a city name.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${API_BASE}/cities/add`,
        cityData,
        headers()
      );

      if (response.data.success) {
        setCityData({ stateId: "", name: "" });
        setShowCityModal(false);
      } else {
        alert(response.data.message || "Failed to add city.");
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || "Error adding city.";
      alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="add-city-trigger-btn"
        onClick={() => {
          fetchStates();
          setShowCityModal(true);
        }}
      >
        <FaCity /> Add City
      </button>

      {showCityModal && (
        <div className="city-modal-overlay" onClick={() => setShowCityModal(false)}>
          <div className="city-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-line">
              <div className="modal-heading">
                <FaCity className="modal-header-icon blue" />
                <h3>Add New City</h3>
              </div>
              <button
                className="modal-close-x"
                onClick={() => {
                  setShowCityModal(false);
                  setCityData({ stateId: "", name: "" });
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCity} className="modal-form-content">
              <div className="form-field-group">
                <label>Select State / Region *</label>
                <select
                  value={cityData.stateId}
                  onChange={(e) =>
                    setCityData({ ...cityData, stateId: e.target.value })
                  }
                  required
                >
                  <option value="">-- Choose State --</option>
                  {states.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.stateName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field-group">
                <label>City Name *</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, Mumbai, Toronto"
                  value={cityData.name}
                  onChange={(e) =>
                    setCityData({ ...cityData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="modal-primary-btn" disabled={submitting}>
                  {submitting ? "Saving..." : <><FaCheck /> Save City</>}
                </button>
                <button
                  type="button"
                  className="modal-secondary-btn"
                  onClick={() => {
                    setShowCityModal(false);
                    setCityData({ stateId: "", name: "" });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default City;