import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaBox,
  FaCartPlus,
  FaCheck,
  FaMinus,
  FaPlus,
  FaSearch,
  FaShoppingBag,
  FaShoppingCart,
  FaTrash,
  FaBolt,
  FaMoneyBillWave,
  FaCreditCard,
} from "react-icons/fa";
import "./CustomerProduct.css";

const API_BASE = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("pos-token");
const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const CustomerProduct = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Cart State (Persisted in localStorage)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("customer-cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Single Item "Buy Now" Modal State
  const [buyNowProduct, setBuyNowProduct] = useState(null);
  const [buyNowQuantity, setBuyNowQuantity] = useState(1);
  const [singleOrderAddress, setSingleOrderAddress] = useState("");
  const [singleOrderPayment, setSingleOrderPayment] = useState("cash");

  // Cart Checkout State
  const [cartAddress, setCartAddress] = useState("");
  const [cartPayment, setCartPayment] = useState("cash");
  const [orderSubmitting, setOrderSubmitting] = useState(false);

  // Persist cart
  useEffect(() => {
    localStorage.setItem("customer-cart", JSON.stringify(cart));
  }, [cart]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/products`, getAuthHeader());
      setCategories(response.data.categories || []);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ─── Cart Functions ────────────────────────────────────────
  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert("This item is currently out of stock.");
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.productId === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Cannot add more than available stock (${product.stock})`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            productId: product._id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            quantity: 1,
          },
        ];
      }
    });
  };

  const updateCartQuantity = (productId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.stock) {
              alert(`Maximum available stock is ${item.stock}`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ─── Cart Checkout Submission ──────────────────────────────
  const handleCartCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!cartAddress.trim()) {
      alert("Please enter your delivery destination address.");
      return;
    }

    setOrderSubmitting(true);
    try {
      const payload = {
        items: cart.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        address: cartAddress,
        paymentId: cartPayment,
      };

      const response = await axios.post(
        `${API_BASE}/orders/add`,
        payload,
        getAuthHeader()
      );

      if (response.data.success) {
        alert("🎉 Order placed successfully for all items!");
        clearCart();
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
        setCartAddress("");
        fetchProducts();
      } else {
        alert(response.data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Cart checkout error:", error);
      alert(error.response?.data?.message || "Error placing order.");
    } finally {
      setOrderSubmitting(false);
    }
  };

  // ─── Single Item "Buy Now" Submission ──────────────────────
  const handleBuyNowSubmit = async (e) => {
    e.preventDefault();
    if (!buyNowProduct) return;
    if (!singleOrderAddress.trim()) {
      alert("Please enter your delivery address.");
      return;
    }

    setOrderSubmitting(true);
    try {
      const payload = {
        productId: buyNowProduct._id,
        quantity: buyNowQuantity,
        price: buyNowProduct.price * buyNowQuantity,
        address: singleOrderAddress,
        paymentId: singleOrderPayment,
      };

      const response = await axios.post(
        `${API_BASE}/orders/add`,
        payload,
        getAuthHeader()
      );

      if (response.data.success) {
        alert("🎉 Order placed successfully!");
        setBuyNowProduct(null);
        setBuyNowQuantity(1);
        setSingleOrderAddress("");
        fetchProducts();
      } else {
        alert(response.data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Buy now error:", error);
      alert(error.response?.data?.message || "Error placing order.");
    } finally {
      setOrderSubmitting(false);
    }
  };

  // ─── Filtering ─────────────────────────────────────────────
  const filteredProducts = products.filter((product) => {
    const q = searchTerm.toLowerCase().trim();
    const nameMatch = product.name ? product.name.toLowerCase().includes(q) : false;
    const priceMatch = product.price ? product.price.toString().includes(q) : false;

    const matchesSearch = !q || nameMatch || priceMatch;
    const matchesCategory =
      !selectedCategory ||
      product.categoryId === selectedCategory ||
      product.categoryId?._id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="customer-product-root">
      {/* ─── Top Header & Controls ──────────────────────────── */}
      <div className="cust-header-banner">
        <div>
          <h2 className="cust-catalog-title">Product Catalog Table</h2>
          <p className="cust-catalog-subtitle">
            Browse available products in table view, add items to cart, or purchase directly
          </p>
        </div>

        {/* Floating Cart Trigger */}
        <button
          className="cart-trigger-btn"
          onClick={() => setIsCartOpen(true)}
          title="Open Shopping Cart"
        >
          <FaShoppingCart className="cart-btn-icon" />
          <span className="cart-btn-label">My Cart</span>
          {cartTotalItems > 0 && (
            <span className="cart-count-badge">{cartTotalItems}</span>
          )}
        </button>
      </div>

      {/* ─── Table Card Container ───────────────────────────── */}
      <div className="cust-product-table-card">
        {/* Search & Category Filter Toolbar */}
        <div className="table-top-controls">
          <div className="table-search-box">
            <FaSearch className="table-search-icon" />
            <input
              type="text"
              placeholder="Search products by name or price..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-select-wrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>

          <span className="results-count-tag">{filteredProducts.length} Products</span>
        </div>

        {/* Products Table */}
        <div className="table-container">
          <table className="cust-product-data-table">
            <thead>
              <tr>
                <th style={{ width: "50px" }}>#</th>
                <th>Product Details</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Stock Status</th>
                <th style={{ textAlign: "right", width: "210px" }}>Purchase Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty-state-cell">
                    Loading Products Catalog...
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
                        <div className="cust-prod-cell">
                          <div className="cust-prod-avatar">
                            {product.name?.charAt(0).toUpperCase() || "P"}
                          </div>
                          <div>
                            <strong className="cust-prod-title">{product.name}</strong>
                            <p className="cust-prod-desc">
                              {product.description || "High quality inventory item guaranteed."}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="cust-cat-pill">
                          {product.categoryId?.categoryName || "General"}
                        </span>
                      </td>

                      <td>
                        <strong className="cust-price-pill">
                          ₹{Number(product.price || 0).toLocaleString()}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`cust-stock-pill ${
                            isZero ? "zero" : isLow ? "low" : "healthy"
                          }`}
                        >
                          {isZero
                            ? "Out of Stock"
                            : isLow
                            ? `${stockNum} Left (Low)`
                            : `${stockNum} in Stock`}
                        </span>
                      </td>

                      <td>
                        <div className="table-action-btn-row">
                          <button
                            className="action-btn cart-table-btn"
                            disabled={isZero}
                            onClick={() => addToCart(product)}
                            title="Add to Cart"
                          >
                            <FaCartPlus /> Cart
                          </button>
                          <button
                            className="action-btn buy-table-btn"
                            disabled={isZero}
                            onClick={() => {
                              setBuyNowProduct(product);
                              setBuyNowQuantity(1);
                              setSingleOrderAddress("");
                            }}
                            title="Instant Checkout"
                          >
                            <FaBolt /> Buy Now
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state-cell">
                    No products found matching your search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Cart Drawer ────────────────────────────────────── */}
      {isCartOpen && (
        <div className="cart-backdrop" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-drawer-header">
              <div className="cart-header-title">
                <FaShoppingCart className="cart-drawer-icon" />
                <h3>Shopping Cart ({cartTotalItems})</h3>
              </div>
              <button className="cart-close-x" onClick={() => setIsCartOpen(false)}>
                ✕
              </button>
            </div>

            <div className="cart-drawer-body">
              {cart.length > 0 ? (
                <div className="cart-items-list">
                  {cart.map((item) => (
                    <div className="cart-item-card" key={item.productId}>
                      <div className="cart-item-info">
                        <strong className="item-title">{item.name}</strong>
                        <span className="item-price">
                          ₹{Number(item.price).toLocaleString()}
                        </span>
                      </div>

                      <div className="cart-qty-controls">
                        <button
                          className="qty-btn"
                          onClick={() => updateCartQuantity(item.productId, -1)}
                        >
                          <FaMinus />
                        </button>
                        <span className="qty-number">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateCartQuantity(item.productId, 1)}
                        >
                          <FaPlus />
                        </button>
                        <button
                          className="item-remove-btn"
                          onClick={() => removeFromCart(item.productId)}
                          title="Remove item"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cart-empty-message">
                  <FaShoppingCart className="empty-cart-icon" />
                  <p>Your cart is empty.</p>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-total-row">
                  <span>Grand Total:</span>
                  <strong>₹{cartTotalAmount.toLocaleString()}</strong>
                </div>
                <button
                  className="cart-checkout-proceed-btn"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  Proceed to Checkout · ₹{cartTotalAmount.toLocaleString()}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Cart Checkout Modal ────────────────────────────── */}
      {isCheckoutOpen && (
        <div className="checkout-modal-backdrop" onClick={() => setIsCheckoutOpen(false)}>
          <div className="checkout-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-line">
              <div className="modal-heading">
                <FaShoppingBag className="modal-header-icon emerald" />
                <h3>Cart Order Checkout</h3>
              </div>
              <button className="modal-close-x" onClick={() => setIsCheckoutOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCartCheckoutSubmit} className="checkout-form">
              <div className="cart-summary-box">
                <div className="summary-line">
                  <span>Total Items:</span>
                  <strong>{cartTotalItems} units</strong>
                </div>
                <div className="summary-line total">
                  <span>Order Total:</span>
                  <strong>₹{cartTotalAmount.toLocaleString()}</strong>
                </div>
              </div>

              <div className="form-field-group">
                <label>Delivery Destination Address *</label>
                <textarea
                  rows="3"
                  placeholder="Street Address, City, Postal Code"
                  value={cartAddress}
                  onChange={(e) => setCartAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-field-group">
                <label>Select Payment Method</label>
                <div className="payment-radio-group">
                  <label className={`payment-radio-card ${cartPayment === "cash" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="cartPayment"
                      value="cash"
                      checked={cartPayment === "cash"}
                      onChange={(e) => setCartPayment(e.target.value)}
                    />
                    <FaMoneyBillWave className="payment-icon green" />
                    <div>
                      <strong>Cash on Delivery</strong>
                      <small>Pay when goods arrive</small>
                    </div>
                  </label>

                  <label className={`payment-radio-card ${cartPayment === "online" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="cartPayment"
                      value="online"
                      checked={cartPayment === "online"}
                      onChange={(e) => setCartPayment(e.target.value)}
                    />
                    <FaCreditCard className="payment-icon blue" />
                    <div>
                      <strong>Online Prepaid</strong>
                      <small>UPI / Cards / Net Banking</small>
                    </div>
                  </label>
                </div>
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="modal-primary-btn emerald-btn" disabled={orderSubmitting}>
                  {orderSubmitting ? "Placing Order..." : `Place Order · ₹${cartTotalAmount.toLocaleString()}`}
                </button>
                <button
                  type="button"
                  className="modal-secondary-btn"
                  onClick={() => setIsCheckoutOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Single Item "Buy Now" Modal ────────────────────── */}
      {buyNowProduct && (
        <div className="checkout-modal-backdrop" onClick={() => setBuyNowProduct(null)}>
          <div className="checkout-modal-card buy-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-line">
              <div className="modal-heading">
                <FaBolt className="modal-header-icon blue" />
                <h3>Instant Checkout</h3>
              </div>
              <button className="modal-close-x" onClick={() => setBuyNowProduct(null)}>✕</button>
            </div>

            <form onSubmit={handleBuyNowSubmit} className="checkout-form">
              <div className="cart-summary-box">
                <strong className="buy-product-title">{buyNowProduct.name}</strong>
                <p className="buy-product-unit-price">
                  ₹{Number(buyNowProduct.price).toLocaleString()} / unit · Max {buyNowProduct.stock} in stock
                </p>

                <div className="buy-qty-picker">
                  <span>Quantity:</span>
                  <div className="qty-stepper">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => setBuyNowQuantity(Math.max(1, buyNowQuantity - 1))}
                    >
                      <FaMinus />
                    </button>
                    <span className="qty-number">{buyNowQuantity}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() =>
                        setBuyNowQuantity(
                          Math.min(buyNowProduct.stock, buyNowQuantity + 1)
                        )
                      }
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>

                <div className="summary-line total" style={{ marginTop: "10px" }}>
                  <span>Total Amount:</span>
                  <strong>
                    ₹{(buyNowProduct.price * buyNowQuantity).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="form-field-group">
                <label>Delivery Address *</label>
                <textarea
                  rows="3"
                  placeholder="Street Address, City, Postal Code"
                  value={singleOrderAddress}
                  onChange={(e) => setSingleOrderAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-field-group">
                <label>Payment Method</label>
                <div className="payment-radio-group">
                  <label className={`payment-radio-card ${singleOrderPayment === "cash" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="singleOrderPayment"
                      value="cash"
                      checked={singleOrderPayment === "cash"}
                      onChange={(e) => setSingleOrderPayment(e.target.value)}
                    />
                    <FaMoneyBillWave className="payment-icon green" />
                    <div>
                      <strong>Cash on Delivery</strong>
                      <small>Pay upon receipt</small>
                    </div>
                  </label>

                  <label className={`payment-radio-card ${singleOrderPayment === "online" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="singleOrderPayment"
                      value="online"
                      checked={singleOrderPayment === "online"}
                      onChange={(e) => setSingleOrderPayment(e.target.value)}
                    />
                    <FaCreditCard className="payment-icon blue" />
                    <div>
                      <strong>Online Prepaid</strong>
                      <small>Cards / UPI / NetBanking</small>
                    </div>
                  </label>
                </div>
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="modal-primary-btn" disabled={orderSubmitting}>
                  {orderSubmitting ? "Confirming..." : `Confirm Order · ₹${(buyNowProduct.price * buyNowQuantity).toLocaleString()}`}
                </button>
                <button
                  type="button"
                  className="modal-secondary-btn"
                  onClick={() => setBuyNowProduct(null)}
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

export default CustomerProduct;