import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "../api/axios";
import AuthContext from "../Context/AuthContext";
import TicketCard from "../components/TicketCard";
import TicketDetailsUser from "../components/TicketDetailsUser";
import CreateTicketForm from "../components/CreateTicketForm";
import "../styles/UserDashboard.css";
import { useNavigate } from "react-router-dom";

const ProfileIcon = ({ onClick }) => (
  <button
    onClick={onClick}
    title="Profile"
    className="profile-icon-button"
    aria-label="Profile"
    type="button"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  </button>
);

const UserDashboard = () => {
  const { token, logout, username, userId, role, team } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("assigned"); 
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 4;
  const navigate = useNavigate();
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const profileRef = useRef(null);

  const fetchTickets = async () => {
    try {
      let endpoint = "";

      switch (activeTab) {
        case "assigned":
          endpoint = "/Tickets/user/assigned";
          break;
        case "requested":
          endpoint = "/Tickets/user/requested";
          break;
        case "team":
          endpoint = "/Tickets/team";
          break;
        default:
          setTickets([]);
          return;
      }

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTickets(response.data);
    } catch (error) {
      console.error(`Error fetching ${activeTab} tickets:`, error);
      setTickets([]);
    }
  };

  useEffect(() => {
    setSelectedTicket(null);
    setShowCreateForm(false);
    setCurrentPage(1);

    if (activeTab !== "createTicket") {
      fetchTickets();
    } else {
      setTickets([]);
    }
  }, [activeTab]);

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = Array.isArray(tickets) ? tickets.slice(indexOfFirstTicket, indexOfLastTicket) : [];
const totalPages = Array.isArray(tickets) ? Math.ceil(tickets.length / ticketsPerPage) : 0;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleProfileInfo = () => {
    setShowProfileInfo((prev) => !prev);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileInfo(false);
      }
    }
    if (showProfileInfo) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileInfo]);

  return (
    <div className="user-dashboard">
      <nav className="navbar">
        <div className="navbar-left">
          <span className="navbar-brand">User Dashboard</span>

          <button
            className={`nav-btn ${activeTab === "assigned" ? "active" : ""}`}
            onClick={() => setActiveTab("assigned")}
          >
            Assigned Tickets
          </button>

          <button
            className={`nav-btn ${activeTab === "requested" ? "active" : ""}`}
            onClick={() => setActiveTab("requested")}
          >
            Requested Tickets
          </button>

          <button
            className={`nav-btn ${activeTab === "team" ? "active" : ""}`}
            onClick={() => setActiveTab("team")}
          >
            Team Tickets
          </button>

          <button
            className={`nav-btn ${activeTab === "createTicket" ? "active" : ""}`}
            onClick={() => setActiveTab("createTicket")}
          >
            Create Ticket
          </button>
        </div>

        <div className="navbar-right" ref={profileRef}>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>

          <ProfileIcon onClick={toggleProfileInfo} />

          {showProfileInfo && (
            <div className="profile-info-popover" role="region" aria-label="User profile info">
              <div>
                <strong>ID:</strong> {userId}
              </div>
              <div>
                <strong>Name:</strong> {username}
              </div>
              <div>
                <strong>Role:</strong> {role}
              </div>
              <div>
                <strong>Team:</strong> {team || "N/A"}
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="dashboard-content">
        {showCreateForm && activeTab === "createTicket" && (
          <CreateTicketForm
            token={token}
            onClose={() => {
              setShowCreateForm(false);
              setActiveTab("assigned");
            }}
            onSuccess={() => {
              setShowCreateForm(false);
              setActiveTab("assigned");
            }}
          />
        )}

        {(activeTab === "assigned" ||
          activeTab === "requested" ||
          activeTab === "team") &&
          !showCreateForm && (
            <>
              {selectedTicket ? (
                <TicketDetailsUser
                  ticket={selectedTicket}
                  token={token}
                  onClose={() => setSelectedTicket(null)}
                  onRefresh={fetchTickets}
                />
              ) : (
                <div className="ticket-list">
                  {Array.isArray(currentTickets) && currentTickets.length > 0 ? (
                    currentTickets.map((ticket) => (
                      <TicketCard
                        key={ticket.ticketId}
                        ticket={ticket}
                        onClick={() => setSelectedTicket(ticket)}
                      />
                    ))
                  ) : (
                    <p className="no-tickets">No tickets found.</p>
                  )}

                  {totalPages > 1 && (
                    <div className="pagination">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (num) => (
                          <button
                            key={num}
                            className={`page-btn ${
                              currentPage === num ? "active" : ""
                            }`}
                            onClick={() => handlePageChange(num)}
                          >
                            {num}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        {activeTab === "createTicket" && !showCreateForm && (
          <CreateTicketForm
            token={token}
            onClose={() => {
              setShowCreateForm(false);
              setActiveTab("assigned");
            }}
            onSuccess={() => {
              setShowCreateForm(false);
              setActiveTab("assigned");
            }}
          />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
