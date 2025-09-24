import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./components/AdminDashboard";
import CreateUserPage from "./pages/CreateUserPage.jsx";       
import AdminTickets from "./pages/AdminTickets";
import UserDashboard from "./pages/UserDashboard";
import TicketDetails from "./components/TicketDetails";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/admin/*"
          element={
            <AdminLayout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="create-user" element={<CreateUserPage />} /> 
                <Route path="tickets" element={<AdminTickets />} />
                <Route path="ticket/:id" element={<TicketDetails />} />
              </Routes>
            </AdminLayout>
          }
        />

        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/ticket/:id" element={<TicketDetails />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
