import axios from 'axios';
import React, { useEffect, useState } from 'react'
import "./CustomerProfile.css"

const CustomerProfile = () => {
   const [user, setUser] = useState({
       name: "",
       email: "",
       address: "",
       password: "",
});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Verify password modal for profile update
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Update password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

   const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/users/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });
       
      if(response.data.success) {
        setUser({
          name: response.data.user.name,
          email: response.data.user.email,
          address: response.data.user.address,
          password: "",
        });
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Handle profile form submit - open verify modal
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setCurrentPassword("");
    setShowVerifyModal(true);
  };

  // Handle verify password and update profile
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setMessage({ type: "error", text: "Please enter your current password" });
      return;
    }
    setVerifyLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const response = await axios.put(
        "http://localhost:5000/api/users/profile",
        {
          name: user.name,
          email: user.email,
          address: user.address,
          currentPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );
      if (response.data.success) {
        setMessage({ type: "success", text: response.data.message });
        setShowVerifyModal(false);
        setCurrentPassword("");
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || "Error updating profile";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setVerifyLoading(false);
    }
  };

  // Handle password update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setMessage({ type: "error", text: "Please fill in both password fields" });
      return;
    }
    setPasswordLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const response = await axios.put(
        "http://localhost:5000/api/users/profile/password",
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );
      if (response.data.success) {
        setMessage({ type: "success", text: response.data.message });
        setShowPasswordModal(false);
        setOldPassword("");
        setNewPassword("");
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || "Error updating password";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
//      <div
//         style={{
//           width: "30%",
//           background: "#fff",
//           borderRadius: "16px",
//           padding: "25px",
//           boxShadow: "0 10px 30px rgba(0,0,0,.08)",
//           border: "1px solid #E2E8F0",
//         }}
//       >
//         <div
//           style={{
//             width: "100%",
//             maxWidth: "480px",
//             background: "#FFFFFF",
//             borderRadius: "18px",
//             overflow: "hidden",
//             boxShadow: "0 15px 40px rgba(15,23,42,.12)",
//             border: "1px solid #E2E8F0",
//             fontFamily: "'Poppins', sans-serif",
//           }}
//         >
//           {/* Header */}
//           <div
//             style={{
//               background: "linear-gradient(135deg,#2563EB,#3B82F6)",
//               padding: "25px",
//               textAlign: "center",
//               color: "#fff",
//             }}
//           >
//             <div
//               style={{
//                 width: "65px",
//                 height: "65px",
//                 borderRadius: "50%",
//                 background: "rgba(255,255,255,.18)",
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 margin: "0 auto 15px",
//                 fontSize: "30px",
//               }}
//             >
//               👤
//             </div>

//             <h2
//               style={{
//                 margin: 0,
//                 fontSize: "26px",
//                 fontWeight: "700",
//               }}
//             >
//               Edit Profile
//             </h2>

//             <p
//               style={{
//                 marginTop: "8px",
//                 opacity: ".9",
//                 fontSize: "14px",
//               }}
//             >
//               Manage your profile information
//             </p>
//           </div>

//           {/* Success/Error Message */}
//           {message.text && (
//             <div style={{ padding: "0 20px", marginTop: "15px" }}>
//               <div style={message.type === "success" ? successMsg : errorMsg}>
//                 {message.text}
//               </div>
//             </div>
//           )}

//           {/* Form */}
//           <form onSubmit={handleProfileSubmit} style={{ marginBottom: "20px", padding: "0 20px" }}>
//               <input
//                 type="text"
//                 name="name"
//                 value={user.name}   
//                 onChange={(e) => setUser({...user, name: e.target.value})} 
//                 placeholder="Name"
//                 style={inputStyle}
//               />
//               <input
//                 type="text"
//                 name="email"
//                 value={user.email}
//                 onChange={(e) => setUser({...user, email: e.target.value})}
//                 placeholder="Email"
//                 style={inputStyle}
//               />
//               <input
//                 type="text"
//                 name="number"
//                 value={user.address}
//                 onChange={(e) => setUser({...user, address: e.target.value})}
//                 placeholder="Address"
//                 style={inputStyle}
//               />

//               <button
//                 type="submit"
//                 style={{
//                   flex: 1,
//                   width: "100%",
//                   background: "linear-gradient(135deg,#2563EB,#3B82F6)",
//                   color: "#fff",
//                   border: "none",
//                   padding: "14px",
//                   borderRadius: "12px",
//                   cursor: "pointer",
//                   fontWeight: "600",
//                   fontSize: "15px",
//                   transition: ".3s",
//                   boxShadow: "0 8px 20px rgba(37,99,235,.25)",
//                 }}
//                 onMouseOver={(e) =>
//                 (e.target.style.transform = "translateY(-2px)")
//                 }
//                 onMouseOut={(e) =>
//                 (e.target.style.transform = "translateY(0)")
//                 }
//               >
//                Edit Profile
//               </button>
//             </form>

//             {/* Update Password Button */}
//             <div style={{ padding: "0 20px 20px" }}>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setMessage({ type: "", text: "" });
//                   setOldPassword("");
//                   setNewPassword("");
//                   setShowPasswordModal(true);
//                 }}
//                 style={{
//                   width: "100%",
//                   background: "transparent",
//                   color: "#2563EB",
//                   border: "2px solid #2563EB",
//                   padding: "14px",
//                   borderRadius: "12px",
//                   cursor: "pointer",
//                   fontWeight: "600",
//                   fontSize: "15px",
//                   transition: ".3s",
//                 }}
//                 onMouseOver={(e) => {
//                   e.target.style.background = "#2563EB";
//                   e.target.style.color = "#fff";
//                 }}
//                 onMouseOut={(e) => {
//                   e.target.style.background = "transparent";
//                   e.target.style.color = "#2563EB";
//                 }}
//               >
//                 Update Password
//               </button>
//             </div>

//       </div>

//       {/* Verify Password Modal */}
//       {showVerifyModal && (
//         <div style={modalOverlay} onClick={() => setShowVerifyModal(false)}>
//           <div style={modalBox} onClick={(e) => e.stopPropagation()}>
//             <button style={closeBtn} onClick={() => setShowVerifyModal(false)}>✕</button>
//             <h3 style={modalTitle}>Verify Password</h3>
//             <p style={{ color: "#64748B", marginBottom: "15px", fontSize: "14px" }}>
//               Please enter your current password to save profile changes.
//             </p>
//             <form onSubmit={handleVerifySubmit}>
//               <input
//                 type="password"
//                 placeholder="Current Password"
//                 value={currentPassword}
//                 onChange={(e) => setCurrentPassword(e.target.value)}
//                 style={modalInput}
//                 autoFocus
//               />
//               <button type="submit" style={modalBtn} disabled={verifyLoading}>
//                 {verifyLoading ? "Verifying..." : "Confirm & Save"}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Update Password Modal */}
//       {showPasswordModal && (
//         <div style={modalOverlay} onClick={() => setShowPasswordModal(false)}>
//           <div style={modalBox} onClick={(e) => e.stopPropagation()}>
//             <button style={closeBtn} onClick={() => setShowPasswordModal(false)}>✕</button>
//             <h3 style={modalTitle}>Update Password</h3>
//             <form onSubmit={handlePasswordSubmit}>
//               <input
//                 type="password"
//                 placeholder="Old Password"
//                 value={oldPassword}
//                 onChange={(e) => setOldPassword(e.target.value)}
//                 style={modalInput}
//                 autoFocus
//               />
//               <input
//                 type="password"
//                 placeholder="New Password"
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//                 style={modalInput}
//               />
//               <button type="submit" style={modalBtn} disabled={passwordLoading}>
//                 {passwordLoading ? "Updating..." : "Update Password"}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
// </div>
<div className="profile-wrapper">

    <div className="profile-card">

        {/* Header */}

        <div className="profile-header">

            <div className="profile-avatar">
                👤
            </div>

            <h2>Edit Profile</h2>

            <p>
                Manage your profile information
            </p>

        </div>

        {/* Success / Error */}

        {message.text && (

            <div className="profile-message">

                <div
                    className={
                        message.type === "success"
                            ? "success-message"
                            : "error-message"
                    }
                >
                    {message.text}
                </div>

            </div>

        )}

        {/* Form */}

        <form
            className="profile-form"
            onSubmit={handleProfileSubmit}
        >

            <input
                className="profile-input"
                type="text"
                name="name"
                value={user.name}
                onChange={(e) =>
                    setUser({
                        ...user,
                        name: e.target.value,
                    })
                }
                placeholder="Name"
            />

            <input
                className="profile-input"
                type="text"
                name="email"
                value={user.email}
                onChange={(e) =>
                    setUser({
                        ...user,
                        email: e.target.value,
                    })
                }
                placeholder="Email"
            />

            <input
                className="profile-input"
                type="text"
                name="address"
                value={user.address}
                onChange={(e) =>
                    setUser({
                        ...user,
                        address: e.target.value,
                    })
                }
                placeholder="Address"
            />

            <button
                type="submit"
                className="profile-save-btn"
            >
                Edit Profile
            </button>

        </form>

        {/* Update Password */}

        <div className="password-section">

            <button
                type="button"
                className="password-btn"
                onClick={() => {
                    setMessage({ type: "", text: "" });
                    setOldPassword("");
                    setNewPassword("");
                    setShowPasswordModal(true);
                }}
            >
                Update Password
            </button>

        </div>

    </div>

    {/* Verify Password Modal */}

    {showVerifyModal && (

        <div
            className="modal-overlay"
            onClick={() => setShowVerifyModal(false)}
        >

            <div
                className="modal-box"
                onClick={(e) => e.stopPropagation()}
            >

                <button
                    className="close-btn"
                    onClick={() => setShowVerifyModal(false)}
                >
                    ✕
                </button>

                <h3 className="modal-title">
                    Verify Password
                </h3>

                <p className="modal-description">
                    Please enter your current password to save profile changes.
                </p>

                <form onSubmit={handleVerifySubmit}>

                    <input
                        className="modal-input"
                        type="password"
                        placeholder="Current Password"
                        value={currentPassword}
                        onChange={(e) =>
                            setCurrentPassword(e.target.value)
                        }
                        autoFocus
                    />

                    <button
                        type="submit"
                        className="modal-btn"
                        disabled={verifyLoading}
                    >
                        {verifyLoading
                            ? "Verifying..."
                            : "Confirm & Save"}
                    </button>

                </form>

            </div>

        </div>

    )}

    {/* Update Password Modal */}

    {showPasswordModal && (

        <div
            className="modal-overlay"
            onClick={() => setShowPasswordModal(false)}
        >

            <div
                className="modal-box"
                onClick={(e) => e.stopPropagation()}
            >

                <button
                    className="close-btn"
                    onClick={() => setShowPasswordModal(false)}
                >
                    ✕
                </button>

                <h3 className="modal-title">
                    Update Password
                </h3>

                <form onSubmit={handlePasswordSubmit}>

                    <input
                        className="modal-input"
                        type="password"
                        placeholder="Old Password"
                        value={oldPassword}
                        onChange={(e) =>
                            setOldPassword(e.target.value)
                        }
                        autoFocus
                    />

                    <input
                        className="modal-input"
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) =>
                            setNewPassword(e.target.value)
                        }
                    />

                    <button
                        type="submit"
                        className="modal-btn"
                        disabled={passwordLoading}
                    >
                        {passwordLoading
                            ? "Updating..."
                            : "Update Password"}
                    </button>

                </form>

            </div>

        </div>

    )}

</div>
  )
}

export default CustomerProfile

