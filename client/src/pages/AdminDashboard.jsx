import React, { useState, useEffect } from "react";
import axios from "axios";
import RoomFaultReporter from "./RoomFault";

const AdminDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [newMember, setNewMember] = useState({});
  const [customMessage, setCustomMessage] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      alert("Please log in first!");
      return;
    }

    axios
      .get("http://localhost:8000/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRooms(res.data))
      .catch((err) => console.error(err));
  }, [token]);

  const addRoom = () => {
    const trimmedRoom = newRoomName.trim().toLowerCase();
    const isDuplicate = rooms.some(
      (room) => room.name.trim().toLowerCase() === trimmedRoom
    );
  
    if (!trimmedRoom) {return alert("Room name cannot be empty.");}
  
    if (isDuplicate) {return alert("Room with this name already exists.");}
  
    axios
      .post(
        "http://localhost:8000/rooms",
        { name: newRoomName },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setRooms([...rooms, res.data]);
        setNewRoomName("");
      })
      .catch((err) => console.error(err));
  };
  
const addMember = (roomId) => {
  const roomInput = newMember[roomId];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!roomInput?.email || !roomInput?.name || !roomInput?.rentAmount) {
    return alert("Please fill in all fields.");
  }

  if (!emailRegex.test(roomInput.email)) {
    return alert("Invalid email format.");
  }

  const room = rooms.find((r) => r._id === roomId);
  const duplicateEmail = room?.members?.some(
    (member) => member.email.toLowerCase() === roomInput.email.toLowerCase()
  );

  if (duplicateEmail) {
    return alert("Member with this email already exists in this room.");
  }

  const rent = parseFloat(roomInput.rentAmount);
  if (isNaN(rent) || rent <= 0) {
    return alert("Enter a valid rent amount.");
  }

  axios
    .post(
      `http://localhost:8000/rooms/${roomId}/members`,
      {
        email: roomInput.email,
        name: roomInput.name,
        rentAmount: rent,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then((res) => {
      setRooms((prevRooms) =>
        prevRooms.map((room) => (room._id === roomId ? res.data : room))
      );
      setNewMember((prev) => ({
        ...prev,
        [roomId]: { email: "", name: "", rentAmount: "" },
      }));
    })
    .catch((err) => console.error(err));
};


const deleteRoom = (roomId) => {
  axios
      .delete(`http://localhost:8000/rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
          setRooms((prevRooms) => prevRooms.filter((room) => room._id !== roomId));
      })
      .catch((err) => console.error("Error deleting room:", err));
};


  const removeMember = (roomId, memberId) => {
    axios.delete(
      `http://localhost:8000/rooms/${roomId}/members/${memberId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then((res) => {
      setRooms((prevRooms) =>
          prevRooms.map((room) =>
              room._id === roomId ? res.data : room
          )
      );
  })
      .catch((err) => console.error(err));
  };

  const sendRentReminder = (roomId) => {
    const customMsg = customMessage[roomId] || "Please pay your rent soon!";
    axios
      .post(
        `http://localhost:8000/rooms/${roomId}/rent-reminder`,
        { message: customMsg },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        res.data.forEach((reminder) => {
          alert(
            `Message to ${reminder.memberName}: ${reminder.personalizedMessage}`
          );
        });
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="add-room">
        <h2>Add New Room</h2>
        <input
          type="text"
          placeholder="Enter room name"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
        />
        <button onClick={addRoom}>Add Room</button>
      </div>

      <div className="room-container">
        {rooms.map((room) => (
          <div className="room-card" key={room._id}>
            <h2>{room.name}</h2>
            <p>
              <strong>Status:</strong> {room.status || "Available"}
            </p>
            <p>Members:</p>
            <ul className="member-list">
              {room.members.map((member) => (
                <li key={`${room._id}-${member.email || member._id}`}>
                  <span>{member.name} - ₹{member.rentAmount}</span>
                  <span
                    className={`rent-status ${member.rentDue ? "due" : "paid"}`}
                  >
                    {member.rentDue ? "Due" : "Paid"}
                  </span>
                  <button onClick={() => removeMember(room._id, member._id)}>Remove</button>
                </li>
              ))}
            </ul>


            <div className="add-member">
              <input
                type="email"
                placeholder="New member email"
                value={newMember[room._id]?.email || ""}
                onChange={(e) =>
                  setNewMember((prev) => ({
                    ...prev,
                    [room._id]: {
                      ...prev[room._id],
                      email: e.target.value,
                    },
                  }))
                }
              />
              <input
                type="text"
                placeholder="New member Name"
                value={newMember[room._id]?.name || ""}
                onChange={(e) =>
                  setNewMember((prev) => ({
                    ...prev,
                    [room._id]: {
                      ...prev[room._id],
                      name: e.target.value,
                    },
                  }))
                }
              />
              <input
                type="number"
                placeholder="Rent amount"
                value={newMember[room._id]?.rentAmount || ""}
                onChange={(e) =>
                  setNewMember((prev) => ({
                    ...prev,
                    [room._id]: {
                      ...prev[room._id],
                      rentAmount: e.target.value,
                    },
                  }))
                }
              />
              <button onClick={() => addMember(room._id)}>Add Member</button>
            </div>

            <div>
              <textarea
                placeholder="Enter custom rent reminder message"
                value={customMessage[room._id] || ""}
                onChange={(e) =>
                  setCustomMessage((prev) => ({
                    ...prev,
                    [room._id]: e.target.value,
                  }))
                }
              />
              <button onClick={() => sendRentReminder(room._id)}>
                Send Rent Reminder
              </button>
            </div>

          <button onClick={() => deleteRoom(room._id)} style={{ marginTop: "10px", color: "red" }}>
            Delete Room
          </button>
          <RoomFaultReporter/>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
