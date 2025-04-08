import React, { useState, useEffect } from "react";
import axios from "axios";

const TenantDashboard = () => {
    const [room, setRoom] = useState(null);
    const [faultDescription, setFaultDescription] = useState("");

    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");

    useEffect(() => {
        axios.get("http://localhost:8000/rooms/faults", {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(res => setRoom(res.data[0]))
        .catch(err => console.error("Error fetching room:", err));
    }, [token]);

    const reportFault = () => {
        if (!faultDescription.trim()) {
            alert("Fault description cannot be empty.");
            return;
        }

        axios.post(`http://localhost:8000/rooms/${room._id}/faults`, 
        { description: faultDescription, reportedBy: email }, 
        {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(res => {
            alert("Fault reported successfully!");
            setRoom(res.data.room);
            setFaultDescription("");
        })
        .catch(err => console.error("Error reporting fault:", err));
    };

    return (
        <div>
            <h1>Tenant Dashboard</h1>

            {room ? (
                <div>
                    <h2>Room: {room.name}</h2>
                    <p>Rent Amount: ₹{room.rentAmount}</p>
                    <h3>Faults:</h3>
                    <ul>
                        {room.faults.map((fault, index) => (
                            <li key={index}>
                                {fault.description} - <strong>{fault.status}</strong>
                            </li>
                        ))}
                    </ul>

                    <div>
                        <input 
                            type="text"
                            placeholder="Describe fault"
                            value={faultDescription}
                            onChange={(e) => setFaultDescription(e.target.value)}
                        />
                        <button onClick={reportFault}>Report Fault</button>
                    </div>
                </div>
            ) : (
                <p>No room assigned yet.</p>
            )}
        </div>
    );
};

export default TenantDashboard;
