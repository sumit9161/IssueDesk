import React from "react";
import "../styles/TicketCard.css";

const TicketCard = ({ ticket, onClick }) => {
  return (
    <div
      className="ticket-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === "Enter") onClick();
      }}
    >
      <p>
        <strong>ID:</strong> {ticket.ticketId}
      </p>
      <p>
        <strong>Title:</strong> {ticket.title}
      </p>
      <p>
        <strong>Priority:</strong>{" "}
        <span className={`priority ${ticket.priority.toLowerCase()}`}>
          {ticket.priority}
        </span>
      </p>
      <p>
        <strong>Status:</strong>{" "}
        <span className={`status ${ticket.status.toLowerCase()}`}>
          {ticket.status}
        </span>
      </p>
    </div>
  );
};

export default TicketCard;
