import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTags } from "react-icons/fa";
import "./Categories.css"

const Categories = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCategory, setEditCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = categories.filter(
    (category) =>
      category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.categoryDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/category", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });
      console.log(response.data.categories);
      setCategories(response.data.categories);
      setLoading(false);
    } catch (error) {
      // console.error("Error fetching categories:", error);
      setLoading(false);
    }
  };

  useEffect(() => {

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editCategory) {
      const response = await axios.put(`http://localhost:5000/api/category/${editCategory}`,
        {
          categoryName,
          categoryDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        setEditCategory(null);
        alert("Category Updated Successfully");
        fetchCategories();
        setCategoryName("");
        setCategoryDescription("");
      } else {
        alert("Error upateded category. please try again.");
      }
    } else {
      const response = await axios.post(
        "http://localhost:5000/api/category/add",
        {
          categoryName,
          categoryDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        alert("Category added Successfully");
        fetchCategories();
        setCategoryName("");
        setCategoryDescription("");
      } else {
        alert("Error adding category. please try again.");
      }

    };
  }
  const handleEdit = async (category) => {
    setEditCategory(category._id);
    setCategoryName(category.categoryName);
    setCategoryDescription(category.categoryDescription);
  };

  const handleCancel = async () => {
    setEditCategory(null);
    setCategoryName("");
    setCategoryDescription("");
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this category?");
    if (confirmDelete) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/category/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        });
        if (response.data.success) {
          alert("Category deleted successfully!");
          fetchCategories();
        } else {
          // console.error("Error deleting category:", data);
          alert("Error deleting category. Please try again.");
        }
      } catch (error) {
        // console.error("Error deleting category:", error);
        alert("Error deleting category. Please try again.");
      }
    }
  };

  if (loading) return <div>Loading....</div>;

  return (
   <div className="categories-wrapper">
    <div className="category-left">

    <div className="category-card">

        <div className="category-header">

            <h2>
                {editCategory ? "Edit Category" : "Add Category"}
            </h2>

            <p>
                Create and manage product categories
            </p>

        </div>

        <form
            onSubmit={handleSubmit}
            className="category-form"
        >

            <label>Category Name</label>

            <input
                type="text"
                className="category-input"
                value={categoryName}
                onChange={(e)=>setCategoryName(e.target.value)}
                placeholder="Enter Category Name"
            />

            <label>Description</label>

            <textarea
                rows="4"
                className="category-textarea"
                value={categoryDescription}
                onChange={(e)=>setCategoryDescription(e.target.value)}
                placeholder="Enter Category Description"
            />

            <div className="button-group">

                <button
                    type="submit"
                    className="save-btn"
                >
                    {editCategory ? "Update Category" : "Add Category"}
                </button>

                {editCategory && (

                    <button
                        type="button"
                        className="delete-btn"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>

                )}

            </div>

        </form>

    </div>

</div>
<div className="category-right">

    <div className="table-header">

        <h2>Category List</h2>

        <input
            type="text"
            className="search-box"
            placeholder="🔍 Search Category..."
            value={searchTerm}
            onChange={(e)=>setSearchTerm(e.target.value)}
        />

    </div>

    <div className="table-responsive">

        <table>

            <thead>

                <tr>

                    <th>ID</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th style={{textAlign:"center"}}>Actions</th>

                </tr>

            </thead>

            <tbody>

                {filteredCategories.length > 0 ? (

                    filteredCategories.map((category,index)=>(

                        <tr key={category._id}>

                            <td>

                                <div className="id-circle">
                                    {index+1}
                                </div>

                            </td>

                            <td>

                                <div className="category-name">
                                    {category.categoryName}
                                </div>

                            </td>

                            <td className="category-description">
                                {category.categoryDescription}
                            </td>

                            <td>

                                <div className="category-action-buttons">

                                    <button
                                        className="edit-btn"
                                        onClick={()=>handleEdit(category)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="delete-btn"
                                        onClick={()=>handleDelete(category._id)}
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
                            colSpan="4"
                            className="empty"
                        >
                            No Categories Found
                        </td>

                    </tr>

                )}

            </tbody>

        </table>

    </div>

</div>
    </div>


  );
};

export default Categories;

