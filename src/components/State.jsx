import axios from "axios";
import React, { useState } from "react";
import "./State.css"

const State = () => {
  const [showStateModal, setShowStateModal] = useState(false);
  const [stateName, setStateName] = useState("");
  const [states, setStates] = useState([]);

  const handleAddState = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/states/add",
        { stateName : stateName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );
      if (response.data.success) {
      alert(response.data.message); // "State added successfully"
      setStateName(""); // Optional: clear the input field
    } else {
      alert(response.data.message);
    }
    } catch (error) {
  if (error.response) {
    alert(error.response.data.message);
  } else {
    alert("Server not responding.");
  }}};
  return (
    <>
     
<button
  type="button"
  className="add-state-btn"
  onClick={() => setShowStateModal(true)}
>
  Add State
</button>

{showStateModal && (
  <div className="state-modal">
    <div className="state-modal-card">

      <div className="state-modal-inner">

        <div className="state-header">
          <h2>Add State</h2>

          <button
            className="state-close"
            onClick={() => {
              setShowStateModal(false);
              setStateName("");
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleAddState} className="state-form">

          <div className="state-input-group">
            <label>State Name</label>

            <input
              type="text"
              placeholder="Enter State Name"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
            />
          </div>

          <div className="state-btn-group">

            <button
              type="submit"
              className="state-save-btn"
            >
              Save
            </button>

            <button
              type="button"
              className="state-cancel-btn"
              onClick={() => {
                setShowStateModal(false);
                setStateName("");
              }}
            >
              Cancel
            </button>

          </div>

        </form>

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
  zIndex: 1000,
};

const modalContentStyle = {
  background: "#fff",
  width: "400px",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 10px 25px rgba(0,0,0,.15)",
};

export default State;

