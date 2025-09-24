import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminTickets.css';

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(8);  

  const navigate = useNavigate();

  useEffect(() => {
    fetchAllTickets();
  }, []);

  const fetchAllTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5034/api/Tickets/admin/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sorted = sortByPriority(response.data);
      setTickets(sorted);
      setFilteredTickets(sorted);
      setSearch('');
      setTicketId('');
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    }
  };

  const sortByPriority = (data) => {
    const priorityOrder = { Critical: 1, High: 2, Medium: 3, Normal: 4, Low: 5 };
    return data.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  };

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearch(keyword);
    const results = tickets.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(keyword) ||
        ticket.status.toLowerCase().includes(keyword)
    );
    setFilteredTickets(sortByPriority(results));
    setCurrentPage(1);
  };

  const handleSearchById = async () => {
    if (!ticketId.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5034/api/Tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFilteredTickets([response.data]);
      setCurrentPage(1);
    } catch (err) {
      console.error('Ticket not found', err);
      setFilteredTickets([]);
    }
  };

  const handleViewTicket = (ticketId) => {
    navigate(`/admin/ticket/${ticketId}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="admin-tickets-container">
      <h2>All Tickets</h2>

      <div className="search-controls">
        <input
          className="search-input"
          type="text"
          placeholder="Search by title or status"
          value={search}
          onChange={handleSearch}
          aria-label="Search by title or status"
        />

        <div className="search-id-section">
          <input
            className="id-input"
            type="text"
            placeholder="Enter Ticket ID"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            aria-label="Enter Ticket ID"
          />
          <button className="btn" onClick={handleSearchById}>Search by ID</button>
          <button className="btn reset" onClick={fetchAllTickets}>Reset</button>
        </div>
      </div>

      <table className="ticket-table" aria-label="Ticket list">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Priority</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentTickets.length > 0 ? (
            currentTickets.map((ticket) => (
              <tr key={ticket.ticketId}>
                <td>{ticket.ticketId}</td>
                <td>{ticket.title}</td>
                <td>
                  <span className={`priority ${ticket.priority.toLowerCase()}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td>
                  <button className="btn view-btn" onClick={() => handleViewTicket(ticket.ticketId)}>
                    View Details
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>No tickets found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {filteredTickets.length > ticketsPerPage && (
        <div className="pagination">
          <button className="btn" onClick={goToPrevPage} disabled={currentPage === 1}>Prev</button>
          <span className="page-info">Page {currentPage} of {totalPages}</span>
          <button className="btn" onClick={goToNextPage} disabled={currentPage === totalPages}>Next</button>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button className="back-button" onClick={handleBack}>Back</button>
      </div>
    </div>
  );
};

export default AdminTickets;
