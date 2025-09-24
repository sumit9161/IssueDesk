import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AuthContext from "../Context/AuthContext";
import "../styles/AdminDashboard.css"; 

const CreateUserPage = () => {
  const { token } = useContext(AuthContext); 

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "User",
    team: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5034/api/Auth/register", newUser, {
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        },
      });

      toast.success("User created successfully!");

      setNewUser({
        username: "",
        email: "",
        password: "",
        role: "User",
        team: "",
      });
      setMessage("");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create user";
      setMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="create-user-page">
      <h3>Create New User</h3>
      <form onSubmit={handleSubmit} className="user-form">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={newUser.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newUser.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={newUser.password}
          onChange={handleChange}
          required
        />

        <select
          name="role"
          value={newUser.role}
          disabled
          onChange={handleChange}
        >
          <option value="User">User</option>
        </select>

        <select
          name="team"
          value={newUser.team}
          onChange={handleChange}
          required
        >
          <option value="">Select Team</option>
          <option value="DevOps">DevOps</option>
          <option value="QA">QA</option>
          <option value="Developer">Developer</option>
          <option value="HR">HR</option>
          <option value="ITSupport">IT Support</option>
        </select>

        <button type="submit" className="submit-button">
          Create User
        </button>
      </form>
      {message && <p className="error-message">{message}</p>}
    </div>
  );
};

export default CreateUserPage;
