import React, { useEffect, useState } from "react";
import "./City.css"
import axios from "axios";

const City = () => {
  const [showCityModal, setShowCityModal] = useState(false);

  const [states, setStates] = useState([]);

  const [cityData, setCityData] = useState({
    stateId: "",
    name: "",
  });

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/states",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        setStates(response.data.states);
      }
    } catch (error) {
    //   console.log(error);
      alert("Unable to fetch states");
    }
  };

  const handleAddCity = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/cities/add",
        cityData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        alert("City Added Successfully");

        setCityData({
          stateId: "",
          name: "",
        });

        setShowCityModal(false);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      if (error.response) {
    alert(error.response.data.message);
  } else {
      alert("Something went wrong");
    }
  }};

  return (
    <>
      {/* <button
        type="button"
        onClick={() => setShowCityModal(true)}
        style={{
          background: "#4f46e5",
          color: "#fff",
          marginLeft: "10px",
          padding: "12px 20px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "15px",
          fontWeight: "500",
        }}
      >
        Add City
      </button>

      {showCityModal && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <h2 style={{ marginBottom: "20px" }}>Add City</h2>

            <form onSubmit={handleAddCity}>
              <select
                value={cityData.stateId}
                onChange={(e) =>
                  setCityData({
                    ...cityData,
                    stateId: e.target.value,
                  })
                }
                style={inputStyle}
              >
                <option value="">Select State</option>

                {states.map((state) => (
                  <option key={state._id} value={state._id}>
                    {state.stateName}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Enter City Name"
                value={cityData.name}
                onChange={(e) =>
                  setCityData({
                    ...cityData,
                    name: e.target.value,
                  })
                }
                style={inputStyle}
              />

              <div style={{ marginTop: "20px" }}>
                <button
                  type="submit"
                  style={saveButton}
                >
                  Save
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowCityModal(false);

                    setCityData({
                      stateId: "",
                      name: "",
                    });
                  }}
                  style={cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )} */}
      <button
  type="button"
  className="add-city-btn"
  onClick={() => setShowCityModal(true)}
>
  Add City
</button>

{showCityModal && (
  <div className="city-modal">
    <div className="city-modal-card">
      <div className="city-modal-inner">

        <div className="city-modal-header">
          <h2>Add City</h2>

          <button
            className="city-close-icon"
            onClick={() => {
              setShowCityModal(false);

              setCityData({
                stateId: "",
                name: "",
              });
            }}
          >
            ✕
          </button>
        </div>

        <div className="city-modal-body">

          <form onSubmit={handleAddCity}>

            <select
              className="city-input"
              value={cityData.stateId}
              onChange={(e) =>
                setCityData({
                  ...cityData,
                  stateId: e.target.value,
                })
              }
            >
              <option value="">Select State</option>

              {states.map((state) => (
                <option key={state._id} value={state._id}>
                  {state.stateName}
                </option>
              ))}
            </select>

            <input
              type="text"
              className="city-input"
              placeholder="Enter City Name"
              value={cityData.name}
              onChange={(e) =>
                setCityData({
                  ...cityData,
                  name: e.target.value,
                })
              }
            />

            <div className="city-button-group">

              <button
                type="submit"
                className="city-save-btn"
              >
                Save
              </button>

              <button
                type="button"
                className="city-cancel-btn"
                onClick={() => {
                  setShowCityModal(false);

                  setCityData({
                    stateId: "",
                    name: "",
                  });
                }}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>

      </div>
    </div>
  </div>
)}
    </>
  );
};

const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,.4)",
  backdropFilter: "blur(4px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const modalContentStyle = {
  background: "#fff",
  width: "420px",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 10px 25px rgba(0,0,0,.15)",
};

const inputStyle = {
  width: "100%",
  textAlign: "left",
  color: "#000",
  padding: "12px",
  marginBottom: "15px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "15px",
  boxSizing: "border-box",
};

const saveButton = {
  background: "#4f46e5",
  color: "#fff",
  padding: "12px 20px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const cancelButton = {
  background: "#ef4444",
  color: "#fff",
  padding: "12px 20px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  marginLeft: "10px",
};

export default City;