import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import TrainingPage from './components/TrainingPage';
import LoginPage from "./components/LoginPage";
import ProfilePage from './components/ProfilePage';
import RegisterPage from "./components/RegisterPage";
import './App.css';

const App = () => {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    // 檢查本地存儲中是否有訪問 token，如果有就設置用戶名
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <Router>
      <div>
        <nav className="navbar">
          <div className="nav-links">
            <a href="/Training" className="nav-link">Training</a>
            <a href="/Profile" className="nav-link">Profile</a>
            {username ? (
              // <span className="nav-link">Hello, {username}</span>
              <a href="/Profile" className="nav-link">Hello, {username}</a>
            ) : (
              <a href="/login" className="nav-link">Login</a>
            )}
          </div>
          <LogoutButton setUsername={setUsername} />
        </nav>

        <Routes>
          <Route path="/Training" element={<TrainingPage />} />
          <Route path="/Profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage setUsername={setUsername} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<h1>Welcome to the Fitness App</h1>} />
        </Routes>
      </div>
    </Router>
  );
};

// Logout 按鈕組件
const LogoutButton = ({ setUsername }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('guestMode');

    setUsername(null);
    navigate('/login');
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Logout
    </button>
  );
};

export default App;
