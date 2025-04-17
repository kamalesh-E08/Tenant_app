import React, { useState } from "react";
import RoomFaultReporter from "../pages/RoomFault";

const RoomCard = ({
  room,
  token,
  addMember,
  removeMember,
  deleteRoom,
  sendRentReminder,
}) => {
  const [newMember, setNewMember] = useState({});
  const [customMessage, setCustomMessage] = useState("");
  const [showForms, setShowForms] = useState({
    addMember: false,
    reminder: false,
  });

  const toggleForm = (form) => {
    setShowForms((prev) => ({
      ...prev,
      [form]: !prev[form],
    }));
  };

  return (
    <div className="room-card">
      <h2>{room.name}</h2>
      <p>
        <strong>Status:</strong> {room.status || "Available"}
      </p>

      <ul className="member-list">
        {room.members.map((member) => (
          <li key={member._id}>
            <span>
              {member.name} - ₹{member.rentAmount}
            </span>
            <span className={`rent-status ${member.rentDue ? "due" : "paid"}`}>
              {member.rentDue ? "Due" : "Paid"}
            </span>
            <button onClick={() => removeMember(room._id, member._id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <button onClick={() => toggleForm("addMember")}>
        {showForms.addMember ? "Close Add Member" : "Add Member"}
      </button>

      {showForms.addMember && (
        <div className="form-card">
          <input
            type="text"
            placeholder="Name"
            value={newMember.name || ""}
            onChange={(e) =>
              setNewMember((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <input
            type="email"
            placeholder="Email"
            value={newMember.email || ""}
            onChange={(e) =>
              setNewMember((prev) => ({ ...prev, email: e.target.value }))
            }
          />
          <input
            type="number"
            placeholder="Rent Amount"
            value={newMember.rentAmount || ""}
            onChange={(e) =>
              setNewMember((prev) => ({ ...prev, rentAmount: e.target.value }))
            }
          />
          <button
            onClick={() => {
              addMember(room._id, newMember);
              setNewMember({});
              setShowForms((prev) => ({ ...prev, addMember: false }));
            }}
          >
            Add
          </button>
        </div>
      )}

      <button onClick={() => toggleForm("reminder")}>
        {showForms.reminder ? "Close Reminder" : "Send Reminder"}
      </button>

      {showForms.reminder && (
        <div className="form-card">
          <textarea
            placeholder="Custom rent reminder"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
          />
          <button
            onClick={() => {
              sendRentReminder(room._id, customMessage);
              setShowForms((prev) => ({ ...prev, reminder: false }));
            }}
          >
            Send
          </button>
        </div>
      )}

      <RoomFaultReporter roomId={room._id} token={token} />
      <button onClick={() => deleteRoom(room._id)} className="delete-btn">
        Delete Room
      </button>
    </div>
  );
};

export default RoomCard;
