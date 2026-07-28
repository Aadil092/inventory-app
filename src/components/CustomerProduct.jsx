import axios from "axios";
import React, { useEffect, useState } from "react";
import "./CustomerProduct.css"

const CustomerProduct = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [formdata, setFormData] = useState({ categoryId: "" });
    const [selectedproduct, setSelectedProduct] = useState(null);
    const [orderData, setOrderData] = useState({
        // customername: "",
        productId: "",
        quantity: 1,
        price: 0,
        address: "",
        paymentId: "",
    });

    const filteredProducts = products.filter((product) => {
        // Safe checks added to prevent toLowerCase() errors on null values
        const nameMatch = product.name ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
        const priceMatch = product.price ? product.price.toString().toLowerCase().includes(searchTerm.toLowerCase()) : false;
        const stockMatch = product.stock ? product.stock.toString().toLowerCase().includes(searchTerm.toLowerCase()) : false;

        const matchesSearch = nameMatch || priceMatch || stockMatch;

        const matchesCategory =
            !formdata.categoryId ||
            product.categoryId === formdata.categoryId ||
            product.categoryId?._id === formdata.categoryId;

        return matchesSearch && matchesCategory;
    });

    const handlerSubmit = async (e) => {
        e.preventDefault();

        const finalOrderData = {
            ...orderData,
            productId: selectedproduct._id,
            quantity: quantity,
            price: selectedproduct.price * quantity
        };

        try {
            const response = await axios.post("http://localhost:5000/api/orders/add",
                finalOrderData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                    },
                }
            );

            if (response.data.success) {
                alert("Order added Successfully");
                fetchProducts();
                setProducts((prevProducts) =>
                    prevProducts.map((p) =>
                        p._id === selectedproduct._id
                            ? { ...p, stock: p.stock - quantity }
                            : p
                    )
                );

                setSelectedProduct(null);
                // Reset form data after successful submission
                setOrderData({
                    // customername: "",
                    productId: "",
                    quantity: 1,
                    price: 0,
                    address: "",
                    paymentId: "",
                });
                setQuantity(1);
            } else {
                alert("Error adding orders. Please try again.");
            }
        } catch (error) {
            // console.error("Order submission error:", error);
            alert("Error adding order.");
        }
    };

    const handleCancelOrder = () => {
        const confirmCancel = window.confirm("Are you sure you want to cancel the order?");
        if (confirmCancel) {
            alert("Order cancelled successfully.");
            setSelectedProduct(null);
            setQuantity(1);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/api/products", {
                headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
            });
            setCategories(response.data.categories || []);
            setProducts(response.data.products || []);
        } catch (error) {
            // console.error(error);
            alert("Error fetching products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <div className="customer-product">
            {/* 🔹 Search + Category Select inline */}
            <div className="product-toolbar">

                {/* Search */}

                <div className="search-box">

                    <input
                        type="text"
                        className="product-search"
                        placeholder="🔍 Search Products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                </div>

                {/* Category */}

                <div className="category-box">

                    <select
                        className="category-select"
                        name="categoryId"
                        value={formdata.categoryId}
                        onChange={(e) =>
                            setFormData({
                                ...formdata,
                                categoryId: e.target.value,
                            })
                        }
                    >
                        <option value="">All Categories</option>

                        {categories.map((category) => (

                            <option
                                key={category._id}
                                value={category._id}
                            >
                                {category.categoryName}
                            </option>

                        ))}

                    </select>

                </div>

            </div>


            {/* 🔹 Product Table */}
            <div className="customer-product-table-card">

                <table className="customer-product-table">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Availability</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {filteredProducts.length > 0 ? (

                            filteredProducts.map((product, index) => (

                                <tr key={product._id}>

                                    <td>
                                        <div className="product-id-circle">
                                            {index + 1}
                                        </div>
                                    </td>

                                    <td className="product-name">
                                        {product.name}
                                    </td>

                                    <td>
                                        <span className="category-badge">
                                            {product.categoryId?.categoryName || "—"}
                                        </span>
                                    </td>

                                    <td className="price-text">
                                        ₹{product.price}
                                    </td>

                                    <td className="stock-text">
                                        {product.stock}
                                    </td>

                                    <td>

                                        <span
                                            className={`stock-badge ${product.stock === 0
                                                    ? "out-stock"
                                                    : product.stock <= 5
                                                        ? "low-stock"
                                                        : "in-stock"
                                                }`}
                                        >
                                            {product.stock === 0
                                                ? "Out of Stock"
                                                : product.stock <= 5
                                                    ? "Low Stock"
                                                    : "In Stock"}
                                        </span>

                                    </td>

                                    <td className="customer-order-action-buttons">
                                     

                                        <button
                                            className="order-btn"
                                            onClick={() => {
                                                if (product.stock === 0) {
                                                    alert(
                                                        "This product is out of stock. You cannot place an order."
                                                    );
                                                } else {
                                                    setSelectedProduct(product);
                                                }
                                            }}
                                        >
                                            Order
                                        </button>

                                    </td>

                                </tr>

                            ))

                        ) : (

                            <tr>

                                <td colSpan="7" className="empty-product">

                                    {loading
                                        ? "Loading products..."
                                        : "No products found"}

                                </td>

                            </tr>

                        )}

                    </tbody>

                </table>

            </div>
            
            {selectedproduct && (
                <div className="order-modal">

                    <div className="order-modal-card">

                        <div className="order-modal-header">
                            <h2>Place Your Order</h2>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={handleCancelOrder}
                            >
                                ✕
                            </button>
                        </div>
                         <div className="order-modal-body">

    <form className="order-form" onSubmit={handlerSubmit}>

        {/* Product */}

        <div className="order-group">
            <label>Product</label>

            <input
                type="text"
                value={selectedproduct.name}
                readOnly
            />
        </div>

        {/* Product Summary */}

        <div className="order-summary">

            <div className="summary-row">
                <span>Stock Available</span>

                <strong className="stock-value">
                    {selectedproduct.stock}
                </strong>
            </div>

        </div>
            <div className="order-summary">
            <div className="summary-row">
                <span>Price </span>

                <strong className="price-value">
                    ₹ {selectedproduct.price}
                </strong>
            </div>

        </div>

        {/* Quantity */}

        <div className="order-group">
            <label>Quantity</label>

            <input
                type="number"
                min="1"
                max={selectedproduct.stock}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
            />
        </div>

        {/* Total */}

        <div className="total-card">

            <span>Total Amount</span>

            <h3>
                ₹ {selectedproduct.price * quantity}
            </h3>

        </div>

        {/* Address */}

        <div className="order-group">
            <label>Delivery Address</label>

            <textarea
                rows="4"
                placeholder="Enter delivery address"
                value={orderData.address}
                onChange={(e) =>
                    setOrderData({
                        ...orderData,
                        address: e.target.value,
                    })
                }
                required
            />
        </div>

        {/* Payment */}

        <div className="payment-section">

            <label className="payment-title">
                Payment Method
            </label>

            <div className="payment-options">

                <label className="payment-option">

                    <input
                        type="radio"
                        name="payment"
                        value="online"
                        checked={orderData.paymentId === "online"}
                        onChange={(e) =>
                            setOrderData({
                                ...orderData,
                                paymentId: e.target.value,
                            })
                        }
                        required
                    />

                    <span>Online Payment</span>

                </label>

                <label className="payment-option">

                    <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={orderData.paymentId === "cash"}
                        onChange={(e) =>
                            setOrderData({
                                ...orderData,
                                paymentId: e.target.value,
                            })
                        }
                        required
                    />

                    <span>Cash On Delivery</span>

                </label>

            </div>

        </div>

        {/* Buttons */}

        <div className="order-buttons">

            <button
                type="submit"
                className="confirm-order-btn"
            >
                Confirm Order
            </button>

            <button
                type="button"
                className="cancel-order-btn"
                onClick={handleCancelOrder}
            >
                Cancel
            </button>

        </div>

    </form>

</div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default CustomerProduct;