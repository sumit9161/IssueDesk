import { useState } from "react";
import AuthContext from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [userId, setUserId] = useState(parseInt(localStorage.getItem("userId")));
  const [username, setUsername] = useState(localStorage.getItem("userName"));
  const [team, setTeam] = useState(localStorage.getItem("team"));
  
  const login = (newToken, newRole,newId,newUsername,newTeam) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", newRole);
    localStorage.setItem("userId",newId);
    localStorage.setItem("userName", newUsername);
    localStorage.setItem("team", newTeam);
    setUserId(newId)
    setToken(newToken);
    setRole(newRole);
    setUsername(newUsername);
    setTeam(newTeam);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem('userId');
    localStorage.removeItem("userName");
    localStorage.removeItem("team");
    setUserId(null)
    setToken(null);
    setRole(null);
    setUsername(null);
    setTeam(null);
  };

  return (
    <AuthContext.Provider value={{ token, role,userId,username,team, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
