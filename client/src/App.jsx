import { BrowserRouter , Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import TenantDashboard from "./pages/TenantDashboard";
import AdminDashboard from "./pages/AdminDashboard.jsx"; 


function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/login" element={< Login/>} />
          <Route path="/tenant" element={<TenantDashboard/>} />
          <Route path="/admin" element={<AdminDashboard/>} />
        </Routes>
    </BrowserRouter> 
  );
}

export default App;
