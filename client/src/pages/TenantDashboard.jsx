import React, { useState, useEffect } from "react";
import axios from "axios";
import RoomFault from "./RoomFault";

const TenantDashboard = () => {
    const [tenantInfo, setTenantInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reminderMessage, setReminderMessage] = useState("");

    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    useEffect(() => {
        if (!token) {
            setError("User not authenticated. Please log in.");
            setLoading(false);
            return;
        }
        axios.get(`http://localhost:8000/tenant/tenant-info/${email}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(res => {
            setTenantInfo(res.data)
            const reminder = res.data.reminders?.find(
                (r) => r.email === email
              );
          
              if (reminder) {
                setReminderMessage(reminder.message);
              }
            setError("");
        })
        .catch(err => {
            const message = err.response?.data?.message || "Failed to fetch tenant data.";
            setError(message);
        })
        .finally(() => setLoading(false));
    }, [token, email]);

    if (loading) {
        return <p>Loading...</p>;
    }

    console.log("Tenant Info:", tenantInfo);
    console.log("Error:", error);
    
    return (
        <div className="tenant-dashboard">
            <h1>Tenant Dashboard</h1>

            {reminderMessage && (
                <div className="reminder-box">
                    <p><strong>📢 Rent Reminder:</strong> {reminderMessage}</p>
                </div>
            )}

            {tenantInfo? (
                <div className="card">
                    <section>
                        <h2>Your Info</h2>
                        <p><strong>Name:</strong> {tenantInfo.tenant.name}</p>
                        <p><strong>Rent Amount:</strong> ₹{tenantInfo.tenant.rentAmount}</p>
                        <p><strong>Rent Due:</strong> {tenantInfo.tenant.rentDue ? "Yes" : "No"}</p>
                    </section>

                    <section>
                        <h2>Roommates</h2>
                        {tenantInfo.roommates.length > 0 ? (
                            <ul>
                                {tenantInfo.roommates.map((rm, index) => (
                                    <li key={index}>{rm.name} - {rm.email}</li>
                                ))}
                            </ul>
                        ) : <p>No roommates found.</p>}
                    </section>

                    <section>
                        <h2>Admin</h2>
                        <p><strong>Name:</strong> {tenantInfo.admin.name}</p>
                        <p><strong>Email:</strong> {tenantInfo.admin.email}</p>
                    </section>
                    
                    <h2>Faults</h2>
                    <section>
                        <h2>Room Faults</h2>
                        {tenantInfo.roomId ? (
                            <RoomFault roomId={tenantInfo.roomId} token={token} />
                        ) : (
                            <p>No faults in this room.</p>
                        )}
                    </section>
                </div>
            ) : (
                <div className="no-room-card">
                    <h2>Welcome!</h2>
                    <p>👋 It looks like you haven't been assigned to a room yet.</p>
                    <p>Please wait for your admin to assign you, or reach out to them for assistance.</p>
                    <p>If you believe this is a mistake, try logging out and logging back in.</p>
                </div>
            )}
        </div>
    );
};

export default TenantDashboard;
