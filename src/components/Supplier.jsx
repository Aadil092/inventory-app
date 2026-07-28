import axios from "axios";
import React, { useEffect, useState } from "react";
import State from "../components/State";
import City from "../components/City";
import "./Supplier.css"

const Supplier = () => {
  const [addEditModel, setAddEditModel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
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

  const filtereSupplier = suppliers.filter(
    (supplier) =>
      supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.address?.toLowerCase().includes(searchTerm.toLowerCase())

  );


  const fetchSupplier = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/supplier", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });
      if (response.data.success) {
        setSuppliers(response.data.suppliers || []);
        setStates(response.data.states || []);
        setCities(response.data.cities || []);
        setLoading(false);
      }
    } catch (error) {
      // console.error("Error fetching categories:", error);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSupplier();
  }, []);




  const handlerChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  const handleEdit = async (supplier) => {
    setEditSupplier(supplier._id);
    setFormData({
      name: supplier.name,
      email: supplier.email,
      number: supplier.number,
      address: supplier.address,
      stateId: supplier.stateId,
      cityId: supplier.cityId,
    });

    setAddEditModel(true);

  };

  const handleCancel = async () => {
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
    if (editSupplier) {
      const response = await axios.put(`http://localhost:5000/api/supplier/${editSupplier}`,
        formdata,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        setEditSupplier(null);
        alert("Supplier Updated Successfully");
        fetchSupplier();
        setFormData({
          name: "",
          email: "",
          number: "",
          address: "",
          stateId: "",
          cityId: "",
        })
        setAddEditModel(false);
      } else {
        alert("Error upateded suppliers. please try again.");
      }
    } else {
      const response = await axios.post("http://localhost:5000/api/supplier/add",
        formdata,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        alert("Supplier added Successfully");
        fetchSupplier();
        setFormData({
          name: "",
          email: "",
          number: "",
          address: "",
          stateId: "",
          cityId: "",
        });

        setAddEditModel(null);
      } else {
        alert("Error adding supplier. please try again.");
      }
    }
  }
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this supplier?");
    if (confirmDelete) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/supplier/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        });
        if (response.data.success) {
          alert("Supplier deleted successfully!");
          fetchSupplier();
        } else {
          // console.error("Error deleting category:", data);
          alert("Error deleting supplier. Please try again.");
        }
      } catch (error) {
        // console.error("Error deleting category:", error);
        alert("Error deleting supplier. Please try again.");
      }
    }
  };

  if (loading) return <div>Loading....</div>;

  return (
  
    <div className="supplier-page">

      {/* Top Toolbar */}
      <div className="supplier-toolbar">

        <input
          type="text"
          placeholder="Search supplier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="supplier-search"
        />

        <button
          className="add-supplier-btn"
          onClick={() => setAddEditModel(true)}
        >
          Add Supplier
        </button>

        <State />
        <City />

      </div>

      {/* Add / Edit Modal */}
      {addEditModel && (
        <div className="supplier-modal">
          <div className="supplier-modal-card">

            <button
              className="modal-close"
              onClick={handleCancel}
            >
              ✕
            </button>

            <h2 className="supplier-modal-title">
              {editSupplier ? "Edit Supplier" : "Add Supplier"}
            </h2>

            <form
              className="supplier-form"
              onSubmit={handleSubmit}
            >

              <input
                className="supplier-input"
                type="text"
                name="name"
                placeholder="Supplier Name"
                value={formdata.name}
                onChange={handlerChange}
              />

              <input
                className="supplier-input"
                type="email"
                name="email"
                placeholder="Supplier Email"
                value={formdata.email}
                onChange={handlerChange}
              />

              <input
                className="supplier-input"
                type="text"
                name="number"
                placeholder="Phone Number"
                value={formdata.number}
                onChange={handlerChange}
              />

              <input
                className="supplier-input"
                type="text"
                name="address"
                placeholder="Supplier Address"
                value={formdata.address}
                onChange={handlerChange}
              />

              <select
                className="supplier-input"
                name="stateId"
                value={formdata.stateId}
                onChange={handlerChange}
              >
                <option value="">Select State</option>

                {states.map((state) => (
                  <option
                    key={state._id}
                    value={state._id}
                  >
                    {state.stateName}
                  </option>
                ))}
              </select>
               <select
                className="supplier-input"
                name="cityId"
                value={formdata.cityId}
                onChange={handlerChange}
                
              >
                <option value="">Select City</option>
                {cities
                  .filter((city) => {
                    const cid = city.stateId?._id || city.stateId?.id || city.stateId;
                    return cid === formdata.stateId;
                  })
                  .map((city) => (
                    <option key={city._id || city.id} value={city._id || city.id}>
                      {city.cityName || city.name}
                    </option>
                  ))}

              </select>

             

              <button
                className="save-btn"
                type="submit"
              >
                {editSupplier ? "Save Changes" : "Add Supplier"}
              </button>

              {editSupplier && (

                <button
                  className="cancel-btn"
                  type="button"
                  onClick={handleCancel}
                >
                  Cancel
                </button>

              )}

            </form>


          </div>
        </div>
      )}

      {/* Supplier Table */}
      <div className="supplier-table-card">

        <table className="supplier-table">

          <thead className="supplier-table-head">
            <tr>
              {[
                "ID",
                "Supplier",
                "Email",
                "Phone",
                "Address",
                "State",
                "City",
                "Actions",
              ].map((item) => (
                <th key={item}>
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtereSupplier.length > 0 ? (
              filtereSupplier.map((supplier, index) => (
                <tr key={supplier._id} className="supplier-row">

                  {/* ID */}
                  <td className="supplier-id">
                    {index + 1}
                  </td>

                  {/* Supplier */}
                  <td>
                    <div className="supplier-info">

                      <div className="supplier-avatar">
                        {supplier.name.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <div className="supplier-name">
                          {supplier.name}
                        </div>
                      </div>

                    </div>
                  </td>

                  {/* Email */}
                  <td className="supplier-email">
                    {supplier.email}
                  </td>

                  {/* Phone */}
                  <td className="supplier-phone">
                    {supplier.number}
                  </td>

                  {/* Address */}
                  <td className="supplier-address">
                    {supplier.address}
                  </td>

                  {/* State */}
                  <td>
                    <span className="state-badge">
                      {supplier.stateId?.stateName}
                    </span>
                  </td>

                  {/* City */}
                  <td>
                    <span className="city-badge">
                      {supplier.cityId?.name}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="supplier-actions">

                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(supplier)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(supplier._id)}
                      >
                        Delete
                      </button>

                    </div>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="supplier-empty">
                  No Supplier Found
                </td>
              </tr>
            )}
          </tbody>

        </table>

      </div>

    </div>

  );
};


export default Supplier;
