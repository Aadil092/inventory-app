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
