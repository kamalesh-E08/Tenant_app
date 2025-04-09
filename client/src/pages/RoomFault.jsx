import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RoomFaultReporter = ({ roomId, token }) => {
  const [faults, setFaults] = useState([]);
  const [newDescription, setNewDescription] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!roomId || !token) return;

    axios
      .get(`http://localhost:8000/rooms/${roomId}/faults`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const faultList = Array.isArray(res.data.faults) ? res.data.faults : Array.isArray(res.data) ? res.data: []; 
        setFaults(faultList);
      })
      .catch((err) => {
        console.error('Error loading faults:', err);
        setError('Failed to load faults');
      });
  }, [roomId, token]);

  const reportFault = () => {
    if (!newDescription.trim()) {
      return setError('Description cannot be empty.');
    }

    if (newDescription.trim().length < 5) {
      return setError('Description must be at least 5 characters.');
    }

    const isDuplicate = faults.some(
      (fault) => fault.description.trim().toLowerCase() === newDescription.trim().toLowerCase()
    );

    if (isDuplicate) {
      return setError('This fault has already been reported.');
    }

    axios
      .post(
        `http://localhost:8000/rooms/${roomId}/faults`,
        { description: newDescription.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        const faultList = Array.isArray(res.data.faults)
          ? res.data.faults
          : Array.isArray(res.data)
          ? res.data
          : [];
        setFaults(faultList);
        setNewDescription('');
        setError('');
      })
      .catch((err) => {
        console.error('Error reporting fault:', err);
        setError('Failed to report fault.');
      });
  };

  const saveEdit = (index) => {
  const fault = faults[index];
  const updatedFault = { ...fault, description: editDescription, status: editStatus };

  if (editStatus === 'Resolved') {
    axios
      .delete(`http://localhost:8000/rooms/${roomId}/faults/${fault._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setFaults(res.data.faults);
        setEditingIndex(null);
      })
      .catch((err) => console.error('Error deleting fault:', err));
  } else {
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
  }
};

  return (
    <div className="room-faults">
      <h3>Room Faults</h3>

      {error && <p style={{ color: 'red' }}>{error}</p>}

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
        {(faults || []).map((fault, index) => (
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
