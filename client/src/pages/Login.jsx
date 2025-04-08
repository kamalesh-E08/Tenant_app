import { useState } from "react";
import { Link, useNavigate} from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return alert("Invalid email format.");
    }

    if (!password) {
      return alert("Password is required.");
    }
    axios.post('http://localhost:8000/login', { email, password })
    .then(res => {
      if (res.data.message === "Login successful!" && res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        alert("Login successful!");
        navigate(res.data.role === "admin" ? '/admin' : '/tenant');
      } else {
        alert("Login failed!");
      }
      console.log(res);
    })
    .catch(err => {
        console.error("Login error:", err.response?.data || err);
        alert(err.response?.data?.message || "Login failed!");
    });
};
 
  return (
    <div className="auth-container">
        <h2>Login</h2>
        <form onSubmit={handleRegister}>
          <input 
            type="email"
            placeholder="Email"
            required
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            required 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button type="submit">Login</button>
        </form>
        <p>New to this</p>
        <Link to="/register">Register</Link>
    </div>
  );
};

export default Login;

