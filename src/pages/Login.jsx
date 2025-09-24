import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../Context/AuthContext';
import axios from 'axios';
import '../styles/Login.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading,setIsLoading]= useState(false);
  const handleLogin = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5034/api/Auth/login', {
        email,
        password,
      });
      const token = res.data.token;
      const role = res.data.role;
      const userId =res.data.id;
      const username = res.data.username || res.data.userName || res.data.name || "";
      const team = res.data.team || "";
      login(token, role,userId,username,team);
      toast.success('Login successful');

      setTimeout(() => {
        navigate(role === 'Admin' ? '/admin/dashboard' : '/user/dashboard');
      }, 1500);
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      toast.error('Login failed: ' + message);
    }
    setIsLoading(false)
  };

  const getStatus = () => {
    if(isLoading) return "Loading ..";
    else return "Login"
  }

  return (
  <div className="login-container">
    <div className="login-card">
      <div className="login-header">
        <h2>Internal Ticketing System</h2>
        <p className="subtitle">
          Streamlined ticket tracking for better collaboration and faster issue resolution.
        </p>
      </div>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{getStatus()}</button>
      </form>
    </div>
    <ToastContainer position="top-center" autoClose={2000} />
  </div>
);

};

export default Login;
