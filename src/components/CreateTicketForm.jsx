import React, { useState, useEffect, useContext } from "react";
import axios from "../api/axios";
import AuthContext from "../Context/AuthContext";
import "../styles/CreateTicketForm.css";

const CreateTicketForm = () => {
  const { token } = useContext(AuthContext);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Incident");
  const [priority, setPriority] = useState("Low");
  const [team, setTeam] = useState("None");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState(0);
  const [assignees, setAssignees] = useState([]);

  const categories = ["Incident", "ServiceRequest", "ChangeRequest","Task","FeatureRequest","Bug"];
  const priorities = ["Low", "Medium", "High", "Critical"];
  const teams = ["None", "Developer", "QA", "ITSupport", "DevOps", "HR"];

  useEffect(() => {
    const fetchAssignees = async () => {
      if (team !== "None") {
        try {
          const response = await axios.get(`/Tickets/team/${team}/users`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setAssignees(response.data);
        } catch (error) {
          console.error("Failed to load assignees:", error);
          setAssignees([]);
        }
      } else {
        setAssignees([]);
        setAssigneeId(0);
      }
    };

    fetchAssignees();
  }, [team, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ticketData = {
      title,
      description,
      category,
      priority,
      team,
      dueDate,
      assigneeId: assigneeId || 0, 
    };

    try {
      await axios.post("/Tickets", ticketData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      
      setTitle("");
      setDescription("");
      setCategory("Incident");
      setPriority("Low");
      setTeam("None");
      setDueDate("");
      setAssigneeId(0);
    } catch (error) {
      console.error("Error creating ticket:", error);
      alert("Failed to create ticket. Please check the input.");
    }
  };

  return (
    <div className="create-ticket-form">
      <h2>Create Ticket</h2>
      <form onSubmit={handleSubmit}>
        <label>Title:</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Description:</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />

        <label>Category:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <label>Priority:</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          {priorities.map((pri) => (
            <option key={pri} value={pri}>{pri}</option>
          ))}
        </select>

        <label>Assign to Team:</label>
        <select value={team} onChange={(e) => setTeam(e.target.value)}>
          {teams.map((tm) => (
            <option key={tm} value={tm}>{tm}</option>
          ))}
        </select>

        {team !== "None" && (
          <>
            <label>Assign to Individual:</label>
            <select value={assigneeId} onChange={(e) => setAssigneeId(Number(e.target.value))}>
              <option value={0}>-- No individual assigned --</option>
              {assignees.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.username}
                </option>
              ))}
            </select>
          </>
        )}

        
        <label>Due Date:</label>
        <input
          type="date"
          value={dueDate?.split("T")[0] || ""}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />

        <button type="submit">Create Ticket</button>
      </form>
    </div>
  );
};

export default CreateTicketForm;
