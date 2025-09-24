import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/TicketDetails.css";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TicketDetails = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5034/api/Tickets/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTicket(response.data);
      } catch (error) {
        console.error("Error fetching ticket:", error);
        toast.error("Failed to load ticket details");
      }
    };

    fetchTicket();
  }, [id, token]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ticketId: ticket.ticketId,
        status: ticket.status,
        dueDate: ticket.dueDate ? new Date(ticket.dueDate).toISOString() : null,
      };

      await axios.put(
        "http://localhost:5034/api/Tickets/admin/update",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Ticket updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error("Update failed. Please check your data and try again.");
    }
  };

  if (!ticket) return <div>Loading ticket...</div>;

  return (
    <div className="ticket-details-container">
      <h2 className="ticket-header">Ticket Details</h2>
      <table className="ticket-table">
        <tbody>
          <tr>
            <td><strong>Ticket ID:</strong></td>
            <td>{ticket.ticketId}</td>
          </tr>
          <tr>
            <td><strong>Title:</strong></td>
            <td>{ticket.title}</td>
          </tr>
          <tr>
            <td><strong>Description:</strong></td>
            <td>{ticket.description}</td>
          </tr>
          <tr>
            <td><strong>Priority:</strong></td>
            <td>{ticket.priority}</td>
          </tr>
          <tr>
            <td><strong>Status:</strong></td>
            <td>
              {isEditing ? (
                <select
                  value={ticket.status}
                  onChange={(e) => setTicket({ ...ticket, status: e.target.value })}
                  className="select-field"
                >
                  <option value="New">New</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                  <option value="Assigned">Assigned</option>
                  <option value="OnHold">On Hold</option>
                  <option value="Reopened">Reopened</option>
                </select>
              ) : (
                <span className={`status-label status-${ticket.status.toLowerCase()}`}>
                  {ticket.status}
                </span>
              )}
            </td>
          </tr>
          <tr>
            <td><strong>Category:</strong></td>
            <td>{ticket.category}</td>
          </tr>
          <tr>
            <td><strong>Team Assigned:</strong></td>
            <td>{ticket.team}</td>
          </tr>
          <tr>
            <td><strong>Requester:</strong></td>
            <td>{ticket.requesterName}</td>
          </tr>
          <tr>
            <td><strong>Assignee:</strong></td>
            <td>{ticket.assigneeName}</td>
          </tr>
          <tr>
            <td><strong>Created Date:</strong></td>
            <td>{ticket.createdDate?.substring(0, 10)}</td>
          </tr>
          <tr>
            <td><strong>Due Date:</strong></td>
            <td>
              {isEditing ? (
                <input
                  type="date"
                  value={ticket.dueDate?.substring(0, 10) || ""}
                  onChange={(e) =>
                    setTicket({ ...ticket, dueDate: new Date(e.target.value).toISOString() })
                  }
                  className="input-field"
                />
              ) : (
                ticket.dueDate?.substring(0, 10)
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="button-group">
        {!isEditing ? (
          <button className="btn btn-edit" onClick={handleEdit}>Edit</button>
        ) : (
          <button className="btn btn-save" onClick={handleSave}>Save</button>
        )}
        <button className="btn btn-back" onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  );
};

export default TicketDetails;
