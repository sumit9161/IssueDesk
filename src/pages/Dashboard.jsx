import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get("http://localhost:5034/api/Tickets", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTickets(response.data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    fetchTickets();
  }, [token]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>User Dashboard</h2>
      {tickets.map((ticket) => (
        <div key={ticket.ticketId} style={{ marginBottom: "10px" }}>
          <strong>{ticket.title}</strong>
          <br />
          <Link to={`/tickets/${ticket.ticketId}`}>View Details</Link>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
