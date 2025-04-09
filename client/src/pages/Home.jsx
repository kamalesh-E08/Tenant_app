import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-card">
        <h1>🏠 Tenant Management System</h1>
        <p>Manage rooms, tenants, rent, and faults with ease.</p>
        <div className="button-group">
          <Link to="/login" className="home-btn">Login</Link>
          <Link to="/register" className="home-btn secondary">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
