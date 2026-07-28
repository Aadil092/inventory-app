import axios from 'axios';
import React, { useEffect, useState } from 'react'
import "./User.css"

const User = () => {
const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editUserId, setEditUserId] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formdata, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "",
  });

  const filtereUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.address?.toLowerCase().includes(searchTerm.toLowerCase())

  );
  const Info = ({ label, value }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: "1px solid #E5E7EB",
      }}
    >
      <strong>{label}</strong>

      <span>{value}</span>
    </div>
  );
  const handlerChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });
      
      setUsers(response.data.users);
      setLoading(false);
    } catch (error) {
      // console.error("Error fetching categories:", error);
      setLoading(false);
    }
  };

  useEffect(() => {

    fetchUser();
  }, []);

   const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this User?");
    if (confirmDelete) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        });
        if (response.data.success) {
          alert("User deleted successfully!");
          fetchUser();
        } else {
          // console.error("Error deleting category:", data);
          alert("Error deleting user. Please try again.");
        }
      } catch (error) {
        // console.error("Error deleting category:", error);
        alert("Error deleting user. Please try again.");
      }
    }
  };
const handelEdit = (user) => {
    setEditUserId(user._id);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: user.password || "",
      address: user.address || "",
      role: user.role || "",
    });
  }

 const handleCancel = () => {
      setEditUserId(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      address: "",
      role: "",
    });


 }
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editUserId) {
      const response = await axios.put(`http://localhost:5000/api/users/${editUserId}`,
        formdata,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );
      if (response.data.success) {
        alert("User updated Successfully");
        fetchUser();
        setFormData({
          name: "",
          email: "",
          password: "",
          address: "",
          role: "",
        });
        setEditUserId(null);
      } else {
        alert("Error updating user. please try again.");
      }
    } else {
      const response = await axios.post("http://localhost:5000/api/users/add",
        formdata,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        alert("User added Successfully");
        fetchUser();
        setFormData({
          name: "",
          email: "",
          password: "",
          address: "",
          role: "",
        });
      } else {
        alert("Error adding users. please try again.");
      }
    }
  }
  return (

    // <div
    //   style={{
    //     display: "flex",
    //     gap: "20px",
    //     width: "100%",
    //     alignItems: "flex-start",
    //   }}
    // >
    //   {/* Left Side - Form */}
    //   <div
    //     style={{
    //       width: "32%",
    //       background: "#fff",
    //       borderRadius: "16px",
    //       padding: "25px",
    //       boxShadow: "0 10px 30px rgba(0,0,0,.08)",
    //       border: "1px solid #E2E8F0",
    //     }}
    //   >
    //     <div
    //       style={{
    //         width: "100%",
    //         maxWidth: "480px",
    //         background: "#FFFFFF",
    //         borderRadius: "18px",
    //         overflow: "hidden",
    //         boxShadow: "0 15px 40px rgba(15,23,42,.12)",
    //         border: "1px solid #E2E8F0",
    //         fontFamily: "'Poppins', sans-serif",
    //       }}
    //     >
    //       {/* Header */}
    //       <div
    //         style={{
    //           background: "linear-gradient(135deg,#2563EB,#3B82F6)",
    //           padding: "25px",
    //           textAlign: "center",
    //           color: "#fff",
    //         }}
    //       >
    //         <div
    //           style={{
    //             width: "65px",
    //             height: "65px",
    //             borderRadius: "50%",
    //             background: "rgba(255,255,255,.18)",
    //             display: "flex",
    //             justifyContent: "center",
    //             alignItems: "center",
    //             margin: "0 auto 15px",
    //             fontSize: "30px",
    //           }}
    //         >
    //           👤
    //         </div>

    //         <h2
    //           style={{
    //             margin: 0,
    //             fontSize: "26px",
    //             fontWeight: "700",
    //           }}
    //         >
    //           {editUserId ? "Update User" : "Create User"}
    //         </h2>

    //         <p
    //           style={{
    //             marginTop: "8px",
    //             opacity: ".9",
    //             fontSize: "14px",
    //           }}
    //         >
    //           Manage users in your inventory system
    //         </p>
    //       </div>

    //       {/* Form */}
    //       <form
    //         onSubmit={handleSubmit}
    //         style={{
    //           padding: "30px",
    //         }}
    //       >
    //         {[
    //           {
    //             key: "name",
    //             icon: "👤",
    //             placeholder: "Full Name",
    //           },
    //           {
    //             key: "email",
    //             icon: "📧",
    //             placeholder: "Email Address",
    //           },
    //           {
    //             key: "password",
    //             icon: "🔒",
    //             placeholder: "Password",
    //           },
    //           {
    //             key: "address",
    //             icon: "📍",
    //             placeholder: "Address",
    //           },
    //         ].map((field) => (
    //           <div
    //             key={field.key}
    //             style={{
    //               position: "relative",
    //               marginBottom: "18px",
    //             }}
    //           >
    //             <span
    //               style={{
    //                 position: "absolute",
    //                 left: "15px",
    //                 top: "50%",
    //                 transform: "translateY(-50%)",
    //                 fontSize: "18px",
    //               }}
    //             >
    //               {field.icon}
    //             </span>

    //             <input
    //               type={field.key === "password" ? "password" : "text"}
    //               name={field.key}
    //               value={formdata[field.key]}
    //               onChange={handlerChange}
    //               placeholder={field.placeholder}
    //               style={{
    //                 width: "100%",
    //                 boxSizing: "border-box",
    //                 padding: "14px 18px 14px 48px",
    //                 border: "1px solid #CBD5E1",
    //                 borderRadius: "12px",
    //                 fontSize: "15px",
    //                 background: "#F8FAFC",
    //                 outline: "none",
    //                 transition: ".3s",
    //               }}
    //               onFocus={(e) => {
    //                 e.target.style.border = "1px solid #2563EB";
    //                 e.target.style.background = "#fff";
    //                 e.target.style.boxShadow =
    //                   "0 0 0 4px rgba(37,99,235,.12)";
    //               }}
    //               onBlur={(e) => {
    //                 e.target.style.border = "1px solid #CBD5E1";
    //                 e.target.style.background = "#F8FAFC";
    //                 e.target.style.boxShadow = "none";
    //               }}
    //             />
    //           </div>
    //         ))}

    //         {/* Role */}
    //         <select
    //           name="role"
    //           value={formdata.role}
    //           onChange={(e) =>
    //             setFormData({
    //               ...formdata,
    //               role: e.target.value,
    //             })
    //           }
    //           style={{
    //             width: "100%",
    //             padding: "14px",
    //             border: "1px solid #CBD5E1",
    //             borderRadius: "12px",
    //             background: "#F8FAFC",
    //             marginBottom: "25px",
    //             fontSize: "15px",
    //             outline: "none",
    //           }}
    //         >
    //           <option value="">Select Role</option>
    //           <option value="admin">Admin</option>
    //           <option value="warehouseStaff">Warehouse Staff</option>
    //           <option value="customer">Customer</option>
    //         </select>

    //         {/* Buttons */}

    //         <div
    //           style={{
    //             display: "flex",
    //             gap: "12px",
    //           }}
    //         >
    //           <button
    //             type="submit"
    //             style={{
    //               flex: 1,
    //               background: "linear-gradient(135deg,#2563EB,#3B82F6)",
    //               color: "#fff",
    //               border: "none",
    //               padding: "14px",
    //               borderRadius: "12px",
    //               cursor: "pointer",
    //               fontWeight: "600",
    //               fontSize: "15px",
    //               transition: ".3s",
    //               boxShadow: "0 8px 20px rgba(37,99,235,.25)",
    //             }}
    //             onMouseOver={(e) =>
    //             (e.target.style.transform = "translateY(-2px)")
    //             }
    //             onMouseOut={(e) =>
    //             (e.target.style.transform = "translateY(0)")
    //             }
    //           >
    //             {editUserId ? "✓ Update User" : "+ Create User"}
    //           </button>

    //           {editUserId && (
    //             <button
    //               type="button"
    //              onClick={handleCancel}
    //               style={{
    //                 flex: 1,
    //                 background: "#EF4444",
    //                 color: "#fff",
    //                 border: "none",
    //                 padding: "14px",
    //                 borderRadius: "12px",
    //                 cursor: "pointer",
    //                 fontWeight: "600",
    //                 fontSize: "15px",
    //                 transition: ".3s",
    //               }}
    //             >
    //               Cancel
    //             </button>
    //           )}
    //         </div>
    //       </form>
    //     </div>
    //   </div>

    //   {/* Right Side - Table */}
    //   <div
    //     style={{
    //       flex: 1,
    //       background: "#fff",
    //       borderRadius: "16px",
    //       padding: "20px",
    //       boxShadow: "0 10px 30px rgba(0,0,0,.08)",
    //       border: "1px solid #E2E8F0",
    //       overflowX: "auto",
    //     }}
    //   >
    //     {/* Search */}
    //     <input
    //       type="text"
    //       placeholder="🔍 Search Users..."
    //       value={searchTerm}
    //       onChange={(e) => setSearchTerm(e.target.value)}
    //       style={{
    //         width: "100%",
    //         padding: "14px",
    //         marginBottom: "20px",
    //         border: "1px solid #CBD5E1",
    //         borderRadius: "10px",
    //         fontSize: "15px",
    //         outline: "none",
    //         boxSizing: "border-box",
    //       }}
    //     />

    //     {/* Table */}
    //     <div
    //       style={{
    //         flex: 1,
    //         overflow: "auto",
    //       }}
    //     >
    //       <table
    //         style={{
    //           width: "100%",
    //           borderCollapse: "collapse",

    //         }}
    //       >
    //         <thead>
    //           <tr style={{
    //             background: "linear-gradient(90deg,#2563EB,#3B82F6)",
    //             color: "#fff"
    //           }}>
    //             <th style={thStyle}>ID</th>
    //             <th style={thStyle}>User</th>

    //             <th style={thStyle}>Role</th>

    //             <th style={thStyle}>Actions</th>
    //           </tr>
    //         </thead>
    //         <tbody>
    //           {filtereUsers.map((user, index) => (

    //             <tr
    //               key={user._id}
    //               style={{
    //                 borderBottom: "1px solid #E2E8F0",
    //                 transition: ".3s"
    //               }}
    //               onMouseEnter={(e) => e.currentTarget.style.background = "#F8FAFC"}
    //               onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
    //             >

    //               <td style={tdStyle}>{index + 1}</td>

    //               <td style={tdStyle}>
    //                 <div
    //                   style={{
    //                     display: "flex",
    //                     alignItems: "center",
    //                     gap: "10px"
    //                   }}
    //                 >

    //                   <div
    //                     style={{
    //                       width: "42px",
    //                       height: "42px",
    //                       borderRadius: "50%",
    //                       background: "#DBEAFE",
    //                       display: "flex",
    //                       justifyContent: "center",
    //                       alignItems: "center",
    //                       fontWeight: "bold",
    //                       color: "#2563EB"
    //                     }}
    //                   >
    //                     {user.name.charAt(0).toUpperCase()}
    //                   </div>

    //                   <div>

    //                     <div style={{ fontWeight: "600" }}>
    //                       {user.name}
    //                     </div>

    //                   </div>

    //                 </div>
    //               </td>



    //               <td style={tdStyle}>

    //                 <span
    //                   style={{
    //                     padding: "6px 14px",
    //                     borderRadius: "20px",
    //                     background:
    //                       user.role === "admin"
    //                         ? "#DBEAFE"
    //                         : "#DCFCE7",
    //                     color:
    //                       user.role === "admin"
    //                         ? "#2563EB"
    //                         : "#16A34A",
    //                     fontWeight: "600"
    //                   }}
    //                 >
    //                   {user.role}
    //                 </span>

    //               </td>

    //               <td style={tdStyle}>
    //                 {(user.role === "admin" || user.role === "customer") && (
    //                   <>
    //                     <button
    //                       onClick={() => {
    //                         setSelectedUser(user);
    //                         setViewModal(true);
    //                       }}
    //                       style={{
    //                         background: "#02a90d",
    //                         color: "#fff",
    //                         border: "none",
    //                         padding: "8px 15px",
    //                         borderRadius: "8px",
    //                         cursor: "pointer",
    //                         marginRight: "10px",
    //                       }}
    //                     >
    //                       View
    //                     </button>

    //                     <button
    //                       onClick={() => handelEdit(user)}
    //                       style={{
    //                         background: "#2563EB",
    //                         color: "#fff",
    //                         border: "none",
    //                         padding: "8px 15px",
    //                         borderRadius: "8px",
    //                         cursor: "pointer",
    //                         marginRight: "10px",
    //                       }}
    //                     >
    //                       Edit
    //                     </button>

    //                     <button
    //                       onClick={() => handleDelete(user._id)}
    //                       style={{
    //                         background: "#EF4444",
    //                         color: "#fff",
    //                         border: "none",
    //                         padding: "8px 15px",
    //                         borderRadius: "8px",
    //                         cursor: "pointer",
    //                       }}
    //                     >
    //                       Delete
    //                     </button>
    //                   </>
    //                 )}
    //               </td>

    //             </tr>

    //           ))}
    //         </tbody>
    //       </table>
    //       {viewModal && selectedUser && (
    //         <div
    //           style={{
    //             position: "fixed",
    //             inset: 0,
    //             background: "rgba(15,23,42,.55)",
    //             backdropFilter: "blur(6px)",
    //             display: "flex",
    //             justifyContent: "center",
    //             alignItems: "center",
    //             zIndex: 1000,
    //           }}
    //         >
    //           <div
    //             style={{
    //               width: "500px",
    //               background: "#fff",
    //               borderRadius: "18px",
    //               overflow: "hidden",
    //               boxShadow: "0 20px 50px rgba(0,0,0,.25)",
    //             }}
    //           >
    //             {/* Header */}

    //             <div
    //               style={{
    //                 background: "linear-gradient(135deg,#2563EB,#3B82F6)",
    //                 color: "#fff",
    //                 padding: "30px",
    //                 textAlign: "center",
    //               }}
    //             >
    //               <div
    //                 style={{
    //                   width: "80px",
    //                   height: "80px",
    //                   margin: "0 auto",
    //                   borderRadius: "50%",
    //                   background: "#fff",
    //                   color: "#2563EB",
    //                   display: "flex",
    //                   justifyContent: "center",
    //                   alignItems: "center",
    //                   fontSize: "32px",
    //                   fontWeight: "bold",
    //                 }}
    //               >
    //                 {selectedUser.name.charAt(0).toUpperCase()}
    //               </div>

    //               <h2 style={{ marginTop: "15px" }}>
    //                 {selectedUser.name}
    //               </h2>
    //             </div>

    //             {/* Body */}

    //             <div style={{ padding: "25px" }}>

    //               <Info label="Name" value={selectedUser.name} />

    //               <Info label="Email" value={selectedUser.email} />

    //               <Info label="Address" value={selectedUser.address} />

    //               <Info label="Role" value={selectedUser.role} />

    //               <div
    //                 style={{
    //                   display: "flex",
    //                   justifyContent: "space-between",
    //                   marginBottom: "15px",
    //                 }}
    //               >
    //                 <strong>Status</strong>

    //                 <span
    //                   style={{
    //                     padding: "7px 18px",
    //                     borderRadius: "20px",
    //                     fontWeight: "600",
    //                     background:
    //                       selectedUser.status === "Blocked"
    //                         ? "#FEE2E2"
    //                         : selectedUser.status === "Deactive"
    //                           ? "#FEF3C7"
    //                           : "#DCFCE7",
    //                     color:
    //                       selectedUser.status === "Blocked"
    //                         ? "#DC2626"
    //                         : selectedUser.status === "Deactive"
    //                           ? "#D97706"
    //                           : "#16A34A",
    //                   }}
    //                 >
    //                   {selectedUser.status || "Active"}
    //                 </span>
    //               </div>

    //               {/* Status Change */}

    //               <select
    //                 value={selectedUser.status || "Active"}
    //                 onChange={(e) =>
    //                   setSelectedUser({
    //                     ...selectedUser,
    //                     status: e.target.value,
    //                   })
    //                 }
    //                 style={{
    //                   width: "100%",
    //                   padding: "12px",
    //                   borderRadius: "10px",
    //                   border: "1px solid #CBD5E1",
    //                   marginTop: "15px",
    //                 }}
    //               >
    //                 <option>Active</option>
    //                 <option>Deactive</option>
    //                 <option>Blocked</option>
    //               </select>

    //               <div
    //                 style={{
    //                   display: "flex",
    //                   gap: "12px",
    //                   marginTop: "25px",
    //                 }}
    //               >
    //                 <button
    //                   style={{
    //                     flex: 1,
    //                     background: "#2563EB",
    //                     color: "#fff",
    //                     border: "none",
    //                     padding: "13px",
    //                     borderRadius: "10px",
    //                     cursor: "pointer",
    //                   }}
    //                 >
    //                   Save Status
    //                 </button>

    //                 <button
    //                   onClick={() => setViewModal(false)}
    //                   style={{
    //                     flex: 1,
    //                     background: "#EF4444",
    //                     color: "#fff",
    //                     border: "none",
    //                     padding: "13px",
    //                     borderRadius: "10px",
    //                     cursor: "pointer",
    //                   }}
    //                 >
    //                   Close
    //                 </button>
    //               </div>

    //             </div>
    //           </div>
    //         </div>
    //       )}
    //     </div>
    //   </div>
    // </div>
     <div className="user-page">

  {/* Left Side */}
  <div className="user-left">

    <div className="user-form-card">

      <div className="user-form-header">
        <h2>{editUserId ? "Edit User" : "Add User"}</h2>
        <p>Create and manage users</p>
      </div>

      <div className="user-form-body">

        <form className="user-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formdata.name}
              onChange={handlerChange}
              placeholder="Enter full name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formdata.email}
              onChange={handlerChange}
              placeholder="Enter email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formdata.password}
              onChange={handlerChange}
              placeholder="Enter password"
            />
          </div>

          <div className="form-group">
            <label>Role</label>

            <select
              name="role"
              value={formdata.role}
              onChange={handlerChange}
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="warehousestaff">Warehouse Staff</option>
              <option value="customer">Customer</option>
            </select>

          </div>

          <div className="button-group">

            <button
              type="submit"
              className="save-btn"
            >
              {editUserId ? "Save Changes" : "Add User"}
            </button>

            {editUserId && (
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}

          </div>

        </form>

      </div>

    </div>

  </div>

  {/* Right Side */}
  <div className="user-right">

    <div className="table-card">

      <div className="table-header">

        <h2>Manage Users</h2>

        <input
          type="text"
          className="search-box"
          placeholder="Search user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

      </div>

      <div className="table-responsive">

        <table className="user-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>    
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {filtereUsers.length > 0 ? (

              filtereUsers.map((user, index) => (

                <tr key={user._id}>

                  <td>
                    <div className="id-circle">
                      {index + 1}
                    </div>
                  </td>

                  <td className="user-name">
                    {user.name}
                  </td>



                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role}
                    </span>
                  </td>


                  <td>

                    <div className="User-action-buttons">
                      
                        {(user.role === "admin" || user.role === "customer") && (
                      <>
                      <button
                        className="edit-btn"
                        onClick={() => handelEdit(user)}
                      >
                        Edit
                      </button>

                      <button
                        className="view-btn"
                       onClick={() => {
                          setSelectedUser(user);
                            setViewModal(true);
                        }}
                      >
                        View
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(user._id)}
                      >
                        Delete
                      </button>
                      
                        </>
                      )}
                    </div>

                  </td>

                </tr>

              ))

            ) : (

              <tr>
                <td colSpan="7" className="empty">
                  No Users Found
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>
  
    </div>

  </div>
  {viewModal && selectedUser && (
  <div className="user-modal">

    <div className="user-modal-card">

      <div className="user-modal-inner">

        {/* Header */}
        <div className="user-modal-header">

          <div className="user-avatar">
            {selectedUser.name?.charAt(0).toUpperCase()}
          </div>

          <h2>{selectedUser.name}</h2>

        </div>

        {/* Body */}
        <div className="user-modal-body">

          <div className="user-detail-row">
            <span>Name</span>
            <strong>{selectedUser.name}</strong>
          </div>

          <div className="user-detail-row">
            <span>Email</span>
            <strong>{selectedUser.email}</strong>
          </div>


          <div className="user-detail-row">
            <span>Address</span>
            <strong>{selectedUser.address}</strong>
          </div>

          <div className="user-detail-row">
            <span>Role</span>
            <strong>{selectedUser.role}</strong>
          </div>

          <div className="user-detail-row">
            <span>Status</span>

            <span
              className={`status-badge ${
                selectedUser.status === "Blocked"
                  ? "status-blocked"
                  : selectedUser.status === "Deactive"
                  ? "status-deactive"
                  : "status-active"
              }`}
            >
              {selectedUser.status || "Active"}
            </span>
          </div>

          {/* Change Status */}

          <select
            className="status-select"
            value={selectedUser.status || "Active"}
            onChange={(e) =>
              setSelectedUser({
                ...selectedUser,
                status: e.target.value,
              })
            }
          >
            <option value="Active">Active</option>
            <option value="Deactive">Deactive</option>
            <option value="Blocked">Blocked</option>
          </select>

          {/* Buttons */}

          <div className="user-modal-buttons">

            <button
              className="save-status-btn"
            >
              Save Status
            </button>

            <button
              className="close-user-btn"
              onClick={() => setViewModal(false)}
            >
              Close
            </button>

          </div>

        </div>

      </div>

    </div>

  </div>
)}

</div>


  );
};

export default User;
