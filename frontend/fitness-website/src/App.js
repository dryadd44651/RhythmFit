import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import TrainingPage from './components/TrainingPage';
import LoginPage from "./components/LoginPage";
import ProfilePage from './components/ProfilePage';
import './App.css'; // 引入更新的 CSS 文件

const App = () => {
  return (
    <Router>
      <div>
        <nav className="navbar">
          <div className="nav-links">
            <a href="/Training" className="nav-link">Training</a>
            <a href="/Profile" className="nav-link">Profile</a>
            <a href="/login" className="nav-link">Login</a>
          </div>
          <LogoutButton />
        </nav>

        <Routes>
          <Route path="/Training" element={<TrainingPage />} />
          <Route path="/Profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<h1>Welcome to the Fitness App</h1>} />
        </Routes>
      </div>
    </Router>
  );
};

// Logout 按鈕組件
const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 清除 localStorage 中的 token
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // 跳轉到登入頁面
    navigate('/login');
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Logout
    </button>
  );
};

export default App;
