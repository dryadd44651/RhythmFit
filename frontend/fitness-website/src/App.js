import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TrainingPage from './components/TrainingPage';
import ProfilePage from './components/ProfilePage';

function App() {
  return (
    <Router>
      <div>
        {/* 可以加入導航列 */}
        <nav>
          <a href="/Training">Training</a>
          <a href="/Profile">Profile</a>
        </nav>

        <Routes>
          {/* 訓練頁面路由 */}
          <Route path="/Training" element={<TrainingPage />} />
          
          {/* Profile頁面路由 */}
          <Route path="/Profile" element={<ProfilePage />} />

          {/* 預設頁面，可選擇設定為首頁 */}
          <Route path="/" element={<h1>Welcome to the Fitness App</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
