import axios from 'axios';
import React, { useState, useEffect } from 'react'
import "./Products.css"

const Products = () => {
  const [addEditModel, setAddEditModel] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editproduct, setEditProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formdata, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    supplierId: "",
  });



  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.price.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.stock.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categoryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplierId.toLowerCase().includes(searchTerm.toLowerCase())


  );


  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });

      setSuppliers(response.data.suppliers);
      setCategories(response.data.categories);
      setProducts(response.data.products);
      setLoading(false);

    } catch (error) {
      alert("Error fecthing products");
      // console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  useEffect(() => {

    fetchProducts();
  }, []);

  const handlerChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevdata) => ({
      ...prevdata,
      [name]: value,
    }));
  }

  const handleCancel = async () => {
    setEditProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      categoryId: "",
      supplierId: "",
    });

    setAddEditModel(false);

  };

  const handleEdit = async (product) => {
    setEditProduct(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      supplierId: product.supplierId,
    });

    setAddEditModel(true);


  };
  const handlerSubmit = async (e) => {
    e.preventDefault();
    if (editproduct) {
      const response = await axios.put(`http://localhost:5000/api/products/${editproduct}`,
        formdata,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        setEditProduct(null);
        alert("Products Updated Successfully");
        fetchProducts();
        setFormData({
          name: "",
          description: "",
          price: "",
          stock: "",
          categoryId: "",
          supplierId: "",
        })
        setAddEditModel(false);
      } else {
        alert("Error upateded products. please try again.");
      }
    } else {
      const response = await axios.post("http://localhost:5000/api/products/add",
        formdata,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        alert("Products added Successfully");
        fetchProducts();
        setAddEditModel(null);
      } else {
        alert("Error adding products. please try again.");
      }
    }
  }
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (confirmDelete) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/products/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        });
        if (response.data.success) {
          alert("Product deleted successfully!");
          fetchProducts();
        } else {
          // console.error("Error deleting category:", data);
          alert("Error deleting product. Please try again.");
        }
      } catch (error) {
        // console.error("Error deleting category:", error);
        alert("Error deleting product. Please try again.");
      }
    }
  };

  if (loading) return <div>Loading....</div>;
  return (

<div className="product-container">

  {/* Search + Add Button */}
  <div className="product-toolbar">

    <input
      type="text"
      placeholder="Search Products..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="search-input"
    />

    <button
      type="button"
      className="add-product-btn"
      onClick={() => setAddEditModel(true)}
    >
      + Add Product
    </button>

  </div>

  {/* Modal */}
  {addEditModel && (
    <div className="product-modal-overlay">

      <div className="product-modal">

        <button
          className="close-btn"
          onClick={handleCancel}
        >
          ✕
        </button>

        <h2 className="modal-title">
          {editproduct ? "Update Product" : "Add Product"}
        </h2>

        <form
          className="product-form"
          onSubmit={handlerSubmit}
        >

          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={formdata.name}
            onChange={handlerChange}
            className="form-input"
          />

          <textarea
            name="description"
            placeholder="Product Description"
            value={formdata.description}
            onChange={handlerChange}
            className="form-input textarea"
          />

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formdata.price}
            onChange={handlerChange}
            className="form-input"
          />

          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={formdata.stock}
            onChange={handlerChange}
            className="form-input"
          />

          <select
            name="categoryId"
            value={formdata.categoryId}
            onChange={(e) =>
              setFormData({
                ...formdata,
                categoryId: e.target.value,
              })
            }
            className="form-select"
          >
            <option>Select Category</option>

            {categories.map((category) => (
              <option
                key={category._id}
                value={category._id}
              >
                {category.categoryName}
              </option>
            ))}
          </select>

          <select
            name="supplierId"
            value={formdata.supplierId}
            onChange={(e) =>
              setFormData({
                ...formdata,
                supplierId: e.target.value,
              })
            }
            className="form-select"
          >
            <option>Select Supplier</option>

            {suppliers.map((supplier) => (
              <option
                key={supplier._id}
                value={supplier._id}
              >
                {supplier.name}
              </option>
            ))}
          </select>

          <div className="button-group">

            <button
              type="submit"
              className="save-btn"
            >
              {editproduct ? "Update Product" : "Save Product"}
            </button>

            {editproduct && (
              <button
                type="button"
                className="cancel-btn"
                onClick={() => handleCancel()}
              >
                Cancel
              </button>
            )}

          </div>

        </form>

      </div>

    </div>
  )}

  {/* Product Table */}
  <div className="product-table-card">


    <table>

      <thead className="product-table-head">

        <tr>
          <th>ID</th>
          <th>Product</th>
          <th>Description</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Category</th>
          <th>Supplier</th>
          <th>Actions</th>
        </tr>

      </thead>
    
      <tbody>

        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <tr key={product._id}>

              <td className="product-id">
                {index + 1}
              </td>

              <td>
                <div className="product-info">

                  <div className="product-avatar">
                    {product.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="product-name">
                    {product.name}
                  </div>

                </div>
              </td>

              <td className="product-description">
                {product.description}
              </td>

              <td className="product-price">
                ₹ {product.price}
              </td>

              <td>
                <span
                  className={`stock-badge ${
                    product.stock === 0
                      ? "stock-zero"
                      : product.stock < 5
                      ? "stock-low"
                      : "stock-high"
                  }`}
                >
                  {product.stock}
                </span>
              </td>

              <td>
                <span className="category-badge">
                  {product.categoryId?.categoryName}
                </span>
              </td>

              <td>
                <span className="supplier-badge">
                  {product.supplierId?.name}
                </span>
              </td>

              <td>

                <div className="product-actions">

                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      handleDelete(product._id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </td>

            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan="8"
              className="no-data"
            >
              No Products Found
            </td>
          </tr>
        )}

      </tbody>

    </table>

  </div>

</div>
  )
}

// Reusable input style
const inputStyle = {
  display: "block",
  width: "90%",
  padding: "12px",
  marginBottom: "15px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "15px",
  outline: "none",
  transition: "border 0.2s",
};

export default Products;