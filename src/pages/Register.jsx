import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [team, setTeam] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User'); 

  const navigate = useNavigate();

  const handleRegister = async (e) => {
  e.preventDefault();
  try {
    await axios.post('http://localhost:5034/api/Auth/register', {
      username,
      email,
      password,
      team,
      role,
    });

    alert('Registration successful!');
    navigate('/login');
  } catch (error) {
    const msg = error.response?.data?.message || 'Registration failed';
    alert(msg);
  }
};


  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister} className="register-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          required
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Team (e.g., DevOps, QA)"
          value={team}
          required
          onChange={(e) => setTeam(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </select>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
