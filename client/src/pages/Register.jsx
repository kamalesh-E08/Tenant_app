import { useState } from "react";
import { Link, useNavigate} from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("tenant");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8000/register',{name, email, password, role})
    .then(res =>{
      navigate('/login');
      console.log(res)
    })
    .catch(err =>console.log(err))
  };
 
  return (
    <div className="auth-container">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text" 
            placeholder="Name" 
            required onChange={(e) => setName(e.target.value)} 
          />
          <input 
            type="email"
            placeholder="Email"
            required onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            required onChange={(e) => setPassword(e.target.value)} 
          />
          <select onChange={(e) => setRole(e.target.value)}>
            <option value="tenant">Tenant</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Register</button>
        </form>
        <p>Already have an account?</p>
        <Link to="/login">Login</Link>
    </div>
  );
};

export default Register;
