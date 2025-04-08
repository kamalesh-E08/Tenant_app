import React, { useState, useEffect } from "react";
import axios from "axios";

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
    if (!newRoomName.trim()) {
      alert("Room name cannot be empty");
      return;
    }

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
    if (!roomInput?.email || !roomInput?.name || !roomInput.rentAmount) {
      alert("Please fill in all fields");
      return;
    }

    axios
      .post(
        `http://localhost:8000/rooms/${roomId}/members`,
        {
          email: roomInput.email,
          name: roomInput.name,
          rentAmount: parseFloat(roomInput.rentAmount),
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

  const reportFault = (roomId, faultDescription) => {
    axios
      .post(
        "http://localhost:8000/room-faults",
        { roomId, description: faultDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setRooms((prevRooms) =>
          prevRooms.map((room) => (room._id === roomId ? res.data : room))
        );
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


            <h3>Report Fault</h3>
            <input
              type="text"
              placeholder="Describe issue"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  reportFault(room._id, e.target.value);
                  e.target.value = "";
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
