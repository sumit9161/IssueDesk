import React, { useState, useContext, useEffect } from "react";
import axios from "../api/axios";
import AuthContext from "../Context/AuthContext";
import "../styles/TicketDetails.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TicketDetailsUser = ({ ticket, token, onClose, onRefresh }) => {
  const { userId } = useContext(AuthContext);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (ticket) setFormData({ ...ticket });
  }, [ticket]);

  const isRequester = ticket.requesterId === userId;
  const isAssignee = ticket.assigneeId === userId;
  const isUnassigned = ticket.assigneeId === null || ticket.assigneeId === undefined;
  const isTeamMember =
    Array.isArray(ticket.teamMembers) && ticket.teamMembers.includes(userId);

  const status = formData?.status || ticket.status;
  const isStatusClosed = status === "Closed";
  const isStatusResolved = status === "Resolved";
  const isStatusClosedOrResolved = isStatusClosed || isStatusResolved;

  const canAttemptEdit = isRequester || isAssignee || (isUnassigned && isTeamMember);
  const canEdit = isEdit && canAttemptEdit;

  const canEditDueDate = isRequester && isEdit;

  const onEdit = () => {
    if (!canAttemptEdit) {
      toast.error("You are not authorised to edit this ticket.");
      return;
    }
    setIsEdit((prev) => !prev);
  };

  const getStatusOptions = () => {
    if (isStatusClosed) {
      if (isRequester && isEdit) {
        return ["Closed", "Reopened"];
      }
      return [];
    }
    if (isAssignee) {
      return ["Assigned", "Open", "InProgress", "OnHold", "Resolved"];
    }
    if (isRequester) {
      return ["Reopened", "Assigned", "Open", "InProgress", "OnHold", "Closed"];
    }
    return ["New", "Assigned", "Open", "InProgress", "Resolved", "Closed", "OnHold"];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "dueDate") {
      if (!canEditDueDate) {
        toast.info("Due Date cannot be changed.");
        return;
      }
      const created = new Date(ticket.createdDate || ticket.createdAt);
      const due = new Date(value);

      if (due < created) {
        toast.error("Due Date cannot be before the Created Date.");
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }

    if (name === "status" && isStatusClosedOrResolved && value === "Reopened") {
      toast.info("You are reopening this ticket.");
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      if (!formData.status) {
        toast.error("Status cannot be empty.");
        return;
      }
      if (isAssignee && formData.status === "Closed") {
        toast.error("Assignee cannot close the ticket.");
        return;
      }
      if (isRequester && formData.status === "Resolved") {
        toast.error("Requester cannot resolve the ticket.");
        return;
      }
      if (ticket.status === "Closed" && formData.status === "Reopened" && !isRequester) {
        toast.error("Only the requester can reopen a closed ticket.");
        return;
      }

      const payload = {
        ticketId: formData.ticketId,
        status: formData.status,
        dueDate: isRequester
          ? (formData.dueDate ? new Date(formData.dueDate).toISOString() : null)
          : (ticket.dueDate ? new Date(ticket.dueDate).toISOString() : null),
      };

      const response = await axios.put("/Tickets/self/update", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = response.data;

      setFormData((prev) => ({
        ...prev,
        status: updated.status,
        dueDate: updated.dueDate,
        resolvedDate: updated.resolvedDate,
      }));

      toast.success("Ticket updated successfully.");
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update ticket.");
    }
  };

  if (!ticket || !formData) return <p>Loading ticket...</p>;

  const statusOptions = getStatusOptions();

  return (
    <div className="ticket-container">
      <div className="ticket-card">
        <h2>Ticket #{ticket.ticketId}</h2>

        <table className="ticket-table">
          <tbody>
            <tr>
              <th>Title</th>
              <td>{ticket.title}</td>
            </tr>
            <tr>
              <th>Description</th>
              <td>{ticket.description}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td>
                {canEdit && statusOptions.length > 0 ? (
                  <select name="status" value={formData.status} onChange={handleChange}>
                    {statusOptions.map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {statusOption}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span>{formData.status}</span>
                )}
              </td>
            </tr>
            <tr>
              <th>Priority</th>
              <td>{ticket.priority}</td>
            </tr>
            <tr>
              <th>Category</th>
              <td>{ticket.category}</td>
            </tr>
            <tr>
              <th>Team Assigned</th>
              <td>{ticket.team || ticket.teamAssignedId}</td>
            </tr>
            <tr>
              <th>Requester</th>
              <td>{ticket.requesterName || ticket.requesterId}</td>
            </tr>
            <tr>
              <th>Assignee</th>
              <td>{ticket.assigneeName || "Unassigned"}</td>
            </tr>
            <tr>
              <th>Due Date</th>
              <td>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate?.slice(0, 10) || ""}
                  onChange={handleChange}
                  disabled={!canEditDueDate}
                  readOnly={!canEditDueDate}
                  style={{
                    backgroundColor: canEditDueDate ? "#fff" : "#f0f0f0",
                    color: canEditDueDate ? "#000" : "#888",
                    cursor: canEditDueDate ? "pointer" : "not-allowed",
                  }}
                />
              </td>
            </tr>
            {formData.resolvedDate && (
              <tr>
                <th>Resolved Date</th>
                <td>
                  {new Date(formData.resolvedDate).toLocaleDateString("en-IN")}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="button-group">
          <button className="back-button" onClick={onClose}>
            Back
          </button>
          {(isRequester || isAssignee || (isUnassigned && isTeamMember)) && (
            <button className="edit-button" onClick={onEdit}>
              {isEdit ? "Cancel Edit" : "Edit"}
            </button>
          )}
          {canEdit && (
            <button className="save-button" onClick={handleUpdate}>
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsUser;
