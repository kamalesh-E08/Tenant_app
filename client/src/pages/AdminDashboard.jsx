import React, { useState, useEffect } from "react";
import axios from "axios";
import RoomCard from "../components/RoomCard"; 

const AdminDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");
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

    if (!trimmedRoom) return alert("Room name cannot be empty.");
    if (isDuplicate) {
      setNewRoomName("");
      return alert("Room with this name already exists.");
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

  const addMember = (roomId, memberData) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!memberData?.email || !memberData?.name || !memberData?.rentAmount) {
      return alert("Please fill in all fields.");
    }

    if (!emailRegex.test(memberData.email)) {
      return alert("Invalid email format.");
    }

    const room = rooms.find((r) => r._id === roomId);
    const duplicateEmail = room?.members?.some(
      (member) => member.email.toLowerCase() === memberData.email.toLowerCase()
    );
    if (duplicateEmail) {
      return alert("Member with this email already exists in this room.");
    }

    const rent = parseFloat(memberData.rentAmount);
    if (isNaN(rent) || rent <= 0) {
      return alert("Enter a valid rent amount.");
    }

    axios
      .post(
        `http://localhost:8000/rooms/${roomId}/members`,
        {
          email: memberData.email,
          name: memberData.name,
          rentAmount: rent,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setRooms((prevRooms) =>
          prevRooms.map((room) => (room._id === roomId ? res.data : room))
        );
      })
      .catch((err) => console.error(err));
  };

  const removeMember = (roomId, memberId) => {
    axios
      .delete(`http://localhost:8000/rooms/${roomId}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setRooms((prevRooms) =>
          prevRooms.map((room) => (room._id === roomId ? res.data : room))
        );
      })
      .catch((err) => console.error(err));
  };

  const deleteRoom = (roomId) => {
    axios
      .delete(`http://localhost:8000/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setRooms((prevRooms) =>
          prevRooms.filter((room) => room._id !== roomId)
        );
      })
      .catch((err) => console.error("Error deleting room:", err));
  };

  const sendRentReminder = (roomId, message) => {
    const msg = message || "Please pay your rent soon!";
    axios
      .post(
        `http://localhost:8000/rooms/${roomId}/rent-reminder`,
        { message: msg },
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
          <RoomCard
            key={room._id}
            room={room}
            token={token}
            addMember={addMember}
            removeMember={removeMember}
            deleteRoom={deleteRoom}
            sendRentReminder={sendRentReminder}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
