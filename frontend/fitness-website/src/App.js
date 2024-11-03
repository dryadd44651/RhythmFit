import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TrainingPage from './components/TrainingPage';
import ProfilePage from './components/ProfilePage';
import './index.css'; // 引入更新的 CSS 文件

function App() {
  return (
    <Router>
      <div>
        <nav>
          <a href="/Training">Training</a>
          <a href="/Profile">Profile</a>
        </nav>

        <Routes>
          <Route path="/Training" element={<TrainingPage />} />
          <Route path="/Profile" element={<ProfilePage />} />
          <Route path="/" element={<h1>Welcome to the Fitness App</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
