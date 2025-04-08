import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RoomFaultReporter = ({ roomId, token }) => {
  const [faults, setFaults] = useState([]);
  const [newDescription, setNewDescription] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');

  // Fetch faults for this room
  useEffect(() => {
    axios
      .get(`http://localhost:8000/rooms/${roomId}/faults`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setFaults(res.data))
      .catch((err) => console.error('Error loading faults:', err));
  }, [roomId, token]);

  // Submit a new fault
  const reportFault = () => {
    axios
      .post(
        `http://localhost:8000/rooms/${roomId}/faults`,
        { description: newDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setFaults(res.data.faults || []);
        setNewDescription('');
      })
      .catch((err) => console.error('Error reporting fault:', err));
  };

  // Save edited fault
  const saveEdit = (index) => {
    const fault = faults[index];
    const updatedFault = { ...fault, description: editDescription, status: editStatus };

    axios
      .put(
        `http://localhost:8000/rooms/${roomId}/faults/${fault._id}`,
        updatedFault,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setFaults(res.data.faults);
        setEditingIndex(null);
      })
      .catch((err) => console.error('Error updating fault:', err));
  };

  return (
    <div className="room-faults">
      <h3>Room Faults</h3>

      <div className="add-fault">
        <input
          type="text"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Describe a fault"
        />
        <button onClick={reportFault}>Report</button>
      </div>

      <ul className="fault-list">
        {faults.map((fault, index) => (
          <li key={fault._id} className="fault-item">
            {editingIndex === index ? (
              <>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
                <button onClick={() => saveEdit(index)}>Save</button>
              </>
            ) : (
              <>
                <strong>{fault.description}</strong> - <em>{fault.status}</em>
                <button
                  onClick={() => {
                    setEditingIndex(index);
                    setEditDescription(fault.description);
                    setEditStatus(fault.status);
                  }}
                >
                  Edit
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomFaultReporter;
