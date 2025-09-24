import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleViewTickets = () => {
    navigate("/admin/tickets");
  };

  const handleCreateUser = () => {
    navigate("/admin/create-user");
  };

  
  const handleLogout = () => {
  try {
    localStorage.removeItem("token");
  } catch (error) {
    console.warn("Could not access localStorage:", error);
  }
  window.location.href = "http://localhost:5173/";
};

  return (
    <div className="admin-dashboard">
      <nav className="navbar">
        <div className="navbar-left">
          <span className="navbar-brand">Admin Dashboard</span>
          <button className="nav-btn" onClick={handleViewTickets}>
            View All Tickets
          </button>
          <button className="nav-btn" onClick={handleCreateUser}>
            Create User
          </button>
        </div>

        <div className="navbar-right">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-message">
          <h2>Welcome to Admin Dashboard</h2>
          <p>Please select an action using the buttons above.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
