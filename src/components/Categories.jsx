import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaTags,
  FaEdit,
  FaTrash,
  FaSearch,
  FaPlus,
  FaTimes,
  FaCheck,
  FaLayerGroup,
} from "react-icons/fa";
import "./Categories.css";

const API_BASE = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("pos-token");
const headers = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const Categories = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = categories.filter(
    (category) =>
      (category.categoryName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.categoryDescription || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/category`, headers());
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      alert("Please enter a category name.");
      return;
    }

    setSubmitting(true);
    try {
      if (editCategory) {
        const response = await axios.put(
          `${API_BASE}/category/${editCategory}`,
          { categoryName, categoryDescription },
          headers()
        );

        if (response.data.success) {
          setEditCategory(null);
          setCategoryName("");
          setCategoryDescription("");
          fetchCategories();
        } else {
          alert("Error updating category.");
        }
      } else {
        const response = await axios.post(
          `${API_BASE}/category/add`,
          { categoryName, categoryDescription },
          headers()
        );

        if (response.data.success) {
          setCategoryName("");
          setCategoryDescription("");
          fetchCategories();
        } else {
          alert("Error adding category.");
        }
      }
    } catch (error) {
      console.error("Submit Category Error:", error);
      alert("An error occurred while saving the category.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditCategory(category._id);
    setCategoryName(category.categoryName);
    setCategoryDescription(category.categoryDescription || "");
  };

  const handleCancel = () => {
    setEditCategory(null);
    setCategoryName("");
    setCategoryDescription("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      const response = await axios.delete(`${API_BASE}/category/${id}`, headers());
      if (response.data.success) {
        fetchCategories();
      } else {
        alert("Error deleting category.");
      }
    } catch (error) {
      console.error("Delete Category Error:", error);
      alert("Failed to delete category.");
    }
  };

  return (
    <div className="categories-module-root">
      {/* ─── Header Info ────────────────────────────────────── */}
      <div className="module-header-row">
        <div>
          <h2 className="module-title">Categories Management</h2>
          <p className="module-subtitle">Organize and group catalog items for smart filtering</p>
        </div>
        <div className="module-stats-pill">
          <FaLayerGroup /> {categories.length} Total Groups
        </div>
      </div>

      <div className="categories-grid-layout">
        {/* ─── Left Form Card ───────────────────────────────── */}
        <div className="category-form-card">
          <div className="form-header-box">
            <div className="form-header-icon">
              <FaTags />
            </div>
            <div>
              <h3>{editCategory ? "Edit Category" : "Add New Category"}</h3>
              <p>{editCategory ? "Modify existing category details" : "Create a new catalog classification"}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="category-form-body">
            <div className="form-field-group">
              <label>Category Name *</label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. Electronics, Footwear"
                required
              />
            </div>

            <div className="form-field-group">
              <label>Description</label>
              <textarea
                rows="4"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="Brief description of items in this category..."
              />
            </div>

            <div className="form-actions-group">
              <button
                type="submit"
                className="category-submit-btn"
                disabled={submitting}
              >
                {submitting ? "Saving..." : editCategory ? <><FaCheck /> Update Category</> : <><FaPlus /> Add Category</>}
              </button>

              {editCategory && (
                <button
                  type="button"
                  className="category-cancel-btn"
                  onClick={handleCancel}
                >
                  <FaTimes /> Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ─── Right Table Card ──────────────────────────────── */}
        <div className="category-table-card">
          <div className="table-top-controls">
            <div className="table-search-box">
              <FaSearch className="table-search-icon" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="results-count-tag">
              {filteredCategories.length} Found
            </span>
          </div>

          <div className="table-container">
            <table className="category-data-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>#</th>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th style={{ textAlign: "right", width: "160px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="empty-state-cell">
                      Loading Categories...
                    </td>
                  </tr>
                ) : filteredCategories.length > 0 ? (
                  filteredCategories.map((cat, index) => (
                    <tr key={cat._id}>
                      <td>
                        <span className="row-index-badge">{index + 1}</span>
                      </td>
                      <td>
                        <strong className="cat-name-highlight">{cat.categoryName}</strong>
                      </td>
                      <td className="cat-desc-cell">
                        {cat.categoryDescription || "No description provided"}
                      </td>
                      <td>
                        <div className="table-action-btn-row">
                          <button
                            className="action-btn edit-action"
                            onClick={() => handleEdit(cat)}
                            title="Edit Category"
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            className="action-btn delete-action"
                            onClick={() => handleDelete(cat._id)}
                            title="Delete Category"
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-state-cell">
                      No categories found matching your query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
