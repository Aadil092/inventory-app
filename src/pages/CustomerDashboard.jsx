import React, { useState } from "react";
import { FaBox, FaShoppingBasket, FaSignOutAlt, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router";
import CustomerProduct from "../components/CustomerProduct";
import CustomerOrder from "../components/CustomerOrder";
import CustomerProfile from "../components/CustomerProfile";
import "./CustomerDashboard.css"

export default function CustomerDashboard() {
  const [activePage, setActivePage] = useState("products");
    const navigate = useNavigate();

 
   const menuItems = [
    { key: "products", label: "Products", icon: <FaBox /> },
    { key: "order", label: " Orders", icon: <FaShoppingBasket /> },
    { key: "profile", label: "Profile", icon: <FaUsers /> },
    { key: "logout", label: " Logout", icon: <FaSignOutAlt /> },
  ];

  return (
    // <div style={containerStyle}>
    //   <aside style={sidebarStyle}>
    //     <h1> Customer</h1>
    //      <ul style={{ listStyle: "none", padding: 0.25 }}>
    //       {menuItems.map((item) => (
    //         <li
    //           key={item.key}
    //           style={{
    //             cursor: "pointer",
    //             margin: "12px 2px",
    //             display: "flex",            // flex layout
    //             alignItems: "center",       // vertical center
    //             padding: "8px 12px",
    //             borderRadius: "6px",
    //             transition: "background 0.3s, color 0.3s",
    //             color: activePage === item.key ? "#e6e6e5" : "#eae1e1",
    //           }}
    //           onClick={() => {
    //             if (item.key === "logout") {
    //               navigate("/login"); // ✅ redirect to login
    //             } else {
    //               setActivePage(item.key);
    //             }
    //           }}
    //           onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
    //           onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    //         >
    //           <span style={{ fontSize: "1.5rem" }}>{item.icon}</span>
    //           <a href={item.path} style={{ marginLeft: "12px", textDecoration: "none", color: "inherit" }}>
    //             {item.label}
    //           </a>
    //         </li>

    //       ))}
    //     </ul>
    //   </aside>

    //   <main style={contentStyle}>
    //     {activePage === "products" && (
    //       <>
    //         <h2>Products</h2>
    //         <div>
    //           <CustomerProduct/>
    //         </div>
  
    //       </>
    //     )}
    //     {activePage === "order" && (
    //       <>
    //         <h2>Orders</h2>
    //         <CustomerOrder/>
       
    //       </>
    //     )}
    //     {activePage === "profile" && (
    //       <>
    //         <h2>Profiles</h2>
    //         <CustomerProfile/>
    //       </>
    //     )}
    //   </main>
    // </div>

<div className="customer-dashboard">

  {/* Sidebar */}
  <aside className="customer-sidebar">

    <div className="customer-logo">
      <h1>Customer</h1>
    </div>

    <ul className="customer-menu">

      {menuItems.map((item) => (

        <li
          key={item.key}
          className={`customer-menu-item ${
            activePage === item.key ? "active" : ""
          }`}
          onClick={() => {
            if (item.key === "logout") {
              navigate("/login");
            } else {
              setActivePage(item.key);
            }
          }}
        >
          <span className="menu-icon">
            {item.icon}
          </span>

          <span className="menu-text">
            {item.label}
          </span>

        </li>

      ))}

    </ul>

  </aside>

  {/* Main Content */}

  <main className="customer-content">

    

    <div className="customer-body">

      {activePage === "products" && (
        
        <CustomerProduct />
      )}

      {activePage === "order" && (
        <CustomerOrder />
      )}

      {activePage === "profile" && (
        <CustomerProfile />
      )}

    </div>

  </main>

</div>
  );
}
