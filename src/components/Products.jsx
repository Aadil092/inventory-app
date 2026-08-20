import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  FaExclamationTriangle,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaBoxes,
  FaCheck,
  FaTimes,
  FaLayerGroup,
  FaTruck,
  FaDollarSign,
} from "react-icons/fa";
import "./Products.css";

const API_BASE = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("pos-token");
const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const Products = () => {
  const [addEditModel, setAddEditModel] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editproduct, setEditProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Quick Restock modal state
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockAmount, setRestockAmount] = useState(10);
  const [restockLoading, setRestockLoading] = useState(false);

  const [formdata, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    supplierId: "",
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/products`, getAuthHeader());
      setSuppliers(response.data.suppliers || []);
      setCategories(response.data.categories || []);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
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

  const handleEdit = (product) => {
    setEditProduct(product._id);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      stock: product.stock || "",
      categoryId: product.categoryId?._id || product.categoryId || "",
      supplierId: product.supplierId?._id || product.supplierId || "",
    });
    setAddEditModel(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editproduct) {
        const response = await axios.put(
          `${API_BASE}/products/${editproduct}`,
          formdata,
          getAuthHeader()
        );

        if (response.data.success) {
          handleCancel();
          fetchProducts();
        } else {
          alert("Error updating product.");
        }
      } else {
        const response = await axios.post(
          `${API_BASE}/products/add`,
          formdata,
          getAuthHeader()
        );

        if (response.data.success) {
          handleCancel();
          fetchProducts();
        } else {
          alert("Error adding product.");
        }
      }
    } catch (error) {
      console.error("Save product error:", error);
      alert("Failed to save product. Please check input values.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const response = await axios.delete(
        `${API_BASE}/products/${id}`,
        getAuthHeader()
      );
      if (response.data.success) {
        fetchProducts();
      } else {
        alert("Error deleting product.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };

  // Quick Restock Handler
  const handleQuickRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockProduct || restockAmount <= 0) return;

    setRestockLoading(true);
    try {
      const newStock = (Number(restockProduct.stock) || 0) + Number(restockAmount);
      const response = await axios.put(
        `${API_BASE}/products/${restockProduct._id}`,
        {
          name: restockProduct.name,
          description: restockProduct.description,
          price: restockProduct.price,
          stock: newStock,
          categoryId: restockProduct.categoryId?._id || restockProduct.categoryId,
          supplierId: restockProduct.supplierId?._id || restockProduct.supplierId,
        },
        getAuthHeader()
      );

      if (response.data.success) {
        setRestockProduct(null);
        setRestockAmount(10);
        fetchProducts();
      } else {
        alert("Failed to update stock");
      }
    } catch (error) {
      console.error("Restock error:", error);
      alert("Error restocking product.");
    } finally {
      setRestockLoading(false);
    }
  };

  const lowStockCount = products.filter((p) => Number(p.stock) < 5).length;
  const outOfStockCount = products.filter((p) => Number(p.stock) === 0).length;

  const filteredProducts = products.filter((product) => {
    if (onlyLowStock && Number(product.stock) >= 5) return false;

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();

    const name = (product.name || "").toLowerCase();
    const desc = (product.description || "").toLowerCase();
    const price = (product.price || "").toString().toLowerCase();
    const stock = (product.stock || "").toString().toLowerCase();
    const categoryName = (product.categoryId?.categoryName || "").toLowerCase();
    const supplierName = (product.supplierId?.name || "").toLowerCase();

    return (
      name.includes(q) ||
      desc.includes(q) ||
      price.includes(q) ||
      stock.includes(q) ||
      categoryName.includes(q) ||
      supplierName.includes(q)
    );
  });

  return (
    <div className="product-module-root">
      {/* ─── Header Info ────────────────────────────────────── */}
      <div className="module-header-row">
        <div>
          <h2 className="module-title">Products & Inventory</h2>
          <p className="module-subtitle">Manage catalog items, pricing, inventory stock, and suppliers</p>
        </div>

        <button
          type="button"
          className="add-product-main-btn"
          onClick={() => {
            handleCancel();
            setAddEditModel(true);
          }}
        >
          <FaPlus /> Add New Product
        </button>
      </div>

      {/* ─── Low Stock Alert Banner ───────────────────────── */}
      {lowStockCount > 0 && (
        <div className="low-stock-alert-banner">
          <div className="alert-content">
            <FaExclamationTriangle className="alert-icon" />
            <div>
              <strong>Low Inventory Alert:</strong>{" "}
              <span>
                {lowStockCount} product(s) are low in stock ({outOfStockCount} out of stock). Immediate restock advised.
              </span>
            </div>
          </div>
          <button
            className={`filter-low-stock-btn ${onlyLowStock ? "active" : ""}`}
            onClick={() => setOnlyLowStock(!onlyLowStock)}
          >
            {onlyLowStock ? "Show All Products" : "View Low Stock Only"}
          </button>
        </div>
      )}

      {/* ─── Product Table Card ───────────────────────────── */}
      <div className="product-table-card">
        <div className="table-top-controls">
          <div className="table-search-box">
            <FaSearch className="table-search-icon" />
            <input
              type="text"
              placeholder="Search products by name, category, or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="results-count-tag">{filteredProducts.length} Items</span>
        </div>

        <div className="table-container">
          <table className="product-data-table">
            <thead>
              <tr>
                <th style={{ width: "50px" }}>#</th>
                <th>Product Details</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>In Stock</th>
                <th>Supplier</th>
                <th style={{ textAlign: "right", width: "190px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="empty-state-cell">
                    Loading Products Category...
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => {
                  const stockNum = Number(product.stock) || 0;
                  const isZero = stockNum === 0;
                  const isLow = stockNum > 0 && stockNum < 5;

                  return (
                    <tr key={product._id}>
                      <td>
                        <span className="row-index-badge">{index + 1}</span>
                      </td>
                      <td>
                        <div className="prod-avatar-cell">
                          <div className="prod-avatar-badge">
                            {product.name?.charAt(0).toUpperCase() || "P"}
                          </div>
                          <div>
                            <strong className="prod-name">{product.name}</strong>
                            <p className="prod-desc-text">{product.description || "No description"}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="cat-pill">
                          {product.categoryId?.categoryName || "General"}
                        </span>
                      </td>
                      <td>
                        <strong className="prod-price-text">
                          ₹{Number(product.price || 0).toLocaleString()}
                        </strong>
                      </td>
                      <td>
                        <span
                          className={`stock-pill ${isZero ? "zero" : isLow ? "low" : "healthy"
                            }`}
                        >
                          {stockNum} {isZero ? "Out of Stock" : isLow ? "Low Stock" : "Units"}
                        </span>
                      </td>
                      <td>
                        <span className="sup-pill">
                          {product.supplierId?.name || "Direct Vendor"}
                        </span>
                      </td>
                      <td>
                        <div className="table-action-btn-row">
                          <button
                            className="action-btn restock-action"
                            title="Add Units to Stock"
                            onClick={() => {
                              setRestockProduct(product);
                              setRestockAmount(10);
                            }}
                          >
                            + Restock
                          </button>
                          <button
                            className="action-btn edit-action"
                            onClick={() => handleEdit(product)}
                            title="Edit Product"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="action-btn delete-action"
                            onClick={() => handleDelete(product._id)}
                            title="Delete Product"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state-cell">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Add / Edit Modal ─────────────────────────────── */}
      {addEditModel && (
        <div className="product-modal-overlay" onClick={handleCancel}>
          <div className="product-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-line">
              <div className="modal-heading">
                <FaBoxes className="modal-header-icon blue" />
                <h3>{editproduct ? "Edit Product" : "Add New Product"}</h3>
              </div>
              <button className="modal-close-x" onClick={handleCancel}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="product-modal-form">
              <div className="form-field-group">
                <label>Product Title *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  value={formdata.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field-group">
                <label>Product Description</label>
                <textarea
                  rows="3"
                  name="description"
                  placeholder="Enter specifications, highlights..."
                  value={formdata.description}
                  onChange={handleChange}
                />
              </div>

              <div className="modal-form-grid">
                <div className="form-field-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="e.g. 1499"
                    value={formdata.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-field-group">
                  <label>Initial Stock Units *</label>
                  <input
                    type="number"
                    name="stock"
                    placeholder="e.g. 50"
                    value={formdata.stock}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="modal-form-grid">
                <div className="form-field-group">
                  <label>Category *</label>
                  <select
                    name="categoryId"
                    value={formdata.categoryId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.categoryName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field-group">
                  <label>Supplier Vendor *</label>
                  <select
                    name="supplierId"
                    value={formdata.supplierId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="modal-primary-btn" disabled={submitting}>
                  {submitting ? "Saving..." : editproduct ? <><FaCheck /> Save Changes</> : <><FaPlus /> Add Product</>}
                </button>
                <button type="button" className="modal-secondary-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Quick Restock Modal ──────────────────────────── */}
      {restockProduct && (
        <div className="product-modal-overlay" onClick={() => setRestockProduct(null)}>
          <div className="product-modal-box restock-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-line">
              <div className="modal-heading">
                <FaBoxes className="modal-header-icon emerald" />
                <h3>Quick Inventory Restock</h3>
              </div>
              <button className="modal-close-x" onClick={() => setRestockProduct(null)}>✕</button>
            </div>

            <div className="restock-item-preview">
              <strong>{restockProduct.name}</strong>
              <p>Current Inventory: <span className="highlight-stock">{restockProduct.stock} units</span></p>
            </div>

            <form onSubmit={handleQuickRestockSubmit} className="restock-form">
              <div className="form-field-group">
                <label>Add Stock Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Number(e.target.value))}
                  required
                />
              </div>

              <div className="preset-chips-row">
                {[5, 10, 25, 50, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className="preset-chip"
                    onClick={() => setRestockAmount(num)}
                  >
                    +{num}
                  </button>
                ))}
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="modal-primary-btn emerald-btn" disabled={restockLoading}>
                  {restockLoading ? "Updating..." : `Confirm +${restockAmount} Units`}
                </button>
                <button
                  type="button"
                  className="modal-secondary-btn"
                  onClick={() => setRestockProduct(null)}
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

export default Products;