
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname.toLowerCase();
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    if (path.startsWith("/admin/tickets")) {
      setActiveTab("allTickets");
    } else if (path.startsWith("/admin/create-user")) {
      setActiveTab("createUser");
    } else if (path === "/admin" || path === "/admin/") {
      setActiveTab("");
    } else {
      setActiveTab("");
    }
  }, [path]);

  const handleViewTickets = () => {
    navigate("/admin/tickets");
  };

  const handleCreateUserTab = () => {
    navigate("/admin/create-user");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "http://localhost:5173/";
  };

  return (
    <div className="admin-dashboard">
      <nav className="navbar">
        <div className="navbar-left">
          <span className="navbar-brand">Admin Dashboard</span>
          <button
            className={`nav-btn ${activeTab === "allTickets" ? "active" : ""}`}
            onClick={handleViewTickets}
          >
            View All Tickets
          </button>
          <button
            className={`nav-btn ${activeTab === "createUser" ? "active" : ""}`}
            onClick={handleCreateUserTab}
          >
            Create User
          </button>
        </div>

        <div className="navbar-right">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">{children}</div>
    </div>
  );
};

export default AdminLayout;
