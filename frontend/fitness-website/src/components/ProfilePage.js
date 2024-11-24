import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExercises, updateExercise, addExercise, deleteExercise } from './storage';
import axios from "axios";
import './ProfilePage.css';
import basicTrainingData from './Basic_training_data.json';

const muscleGroups = ["leg", "chest", "back", "shoulder", "arm"];

const ProfilePage = () => {
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState({ name: '', max1RM: '', group: '' });
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [editExerciseId, setEditExerciseId] = useState(null);
  const [editedExercise, setEditedExercise] = useState({ name: '', max1RM: '' });
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  // 檢查用戶是否已登入
  useEffect(() => {
    const guestMode = localStorage.getItem('guestMode');
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken && !guestMode) {
      navigate('/login'); // 跳轉到登入頁面
    } else {
      fetchUserProfile();
    }
  }, [navigate]);

  // 獲取當前用戶的用戶名
  const fetchUserProfile = async () => {
    if (localStorage.getItem('guestMode')) {
      setUsername("Guest");
      return;
    }
    let accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error("Access token not found");
      navigate('/login');
      return;
    }
  
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      if (response.status === 401) {
        console.log("Access token expired, attempting to refresh...");
        accessToken = await refreshAccessToken();
        if (accessToken) {
          return fetchUserProfile(); // 再次嘗試請求
        } else {
          throw new Error("Unable to refresh token");
        }
      }
  
      const data = await response.json();
      console.log("User Profile:", data);
      setUsername(localStorage.getItem('username') || "Unknown User");
    } catch (err) {
      console.error(err);
      navigate('/login');
    }
  };
  
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.error("Refresh token not found");
      navigate('/login');
      return;
    }
  
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
        refresh: refreshToken,
      });
  
      localStorage.setItem('accessToken', response.data.access);
      console.log("Access token refreshed");
      return response.data.access;
    } catch (err) {
      console.error("Failed to refresh token:", err);
      navigate('/login');
    }
  };
  

  useEffect(() => {
    setExercises(getExercises());
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExercise((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddExercise = (e) => {
    e.preventDefault();
    if (newExercise.name && newExercise.max1RM && newExercise.group) {
      addExercise(newExercise);
      setExercises(getExercises());
      setNewExercise({ name: '', max1RM: '', group: '' });
    }
  };

  const handleDelete = (exerciseId) => {
    deleteExercise(exerciseId);
    setExercises(getExercises());
  };

  const handleEdit = (exercise) => {
    setEditExerciseId(exercise.id);
    setEditedExercise({ name: exercise.name, max1RM: exercise.max1RM });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedExercise((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = (exerciseId) => {
    updateExercise(exerciseId, editedExercise);
    setExercises(getExercises());
    setEditExerciseId(null);
  };

  const toggleGroup = (group) => {
    setExpandedGroup(expandedGroup === group ? null : group);
  };

  const handleExport = () => {
    const data = {
      exercises,
      trainedGroups: JSON.parse(localStorage.getItem("trainedGroups") || "[]"),
      currentCycle: localStorage.getItem("currentCycle") || 'light'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "training_data.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = JSON.parse(event.target.result);
        if (data.exercises && data.trainedGroups && data.currentCycle) {
          localStorage.setItem("trainedGroups", JSON.stringify(data.trainedGroups));
          localStorage.setItem("currentCycle", data.currentCycle);
          localStorage.setItem("exercises", JSON.stringify(data.exercises));
          setExercises(getExercises());
          alert("Data imported successfully!");
        } else {
          alert("Invalid data format.");
        }
      };
      reader.readAsText(file);
    }
  };

  const loadDefaultPlan = () => {
    const existingExercises = getExercises();
    if (existingExercises.length > 0) {
      const confirmOverwrite = window.confirm("This action will overwrite your original plan. Are you sure you want to continue?");
      if (!confirmOverwrite) return;
    }
  
    localStorage.setItem("trainedGroups", JSON.stringify(basicTrainingData.trainedGroups));
    localStorage.setItem("currentCycle", basicTrainingData.currentCycle);
    localStorage.setItem("exercises", JSON.stringify(basicTrainingData.exercises));
    setExercises(getExercises());
    alert("Default training plan loaded!");
  };

  return (
    <div className="outerContainer">
      <div className="container">
        <h1 className="title">Profile Page</h1>
        <h2>Welcome, {username}</h2> {/* 顯示用戶名 */}

        {/* 新增動作表單 */}
        <form className="form" onSubmit={handleAddExercise}>
          <input
            type="text"
            name="name"
            placeholder="Exercise Name"
            value={newExercise.name}
            onChange={handleInputChange}
            className="input"
            required
          />
          <input
            type="number"
            name="max1RM"
            placeholder="Max 1RM"
            value={newExercise.max1RM}
            onChange={handleInputChange}
            className="input"
            required
          />
          <select
            name="group"
            value={newExercise.group}
            onChange={handleInputChange}
            className="input"
            required
          >
            <option value="">Select Muscle Group</option>
            <option value="leg">Leg</option>
            <option value="back">Back</option>
            <option value="chest">Chest</option>
            <option value="arm">Arm</option>
            <option value="shoulder">Shoulder</option>
          </select>
          <button type="submit" className="button">Add Exercise</button>
        </form>

        {/* 匯入和匯出按鈕 */}
        <div className="importExportButtons">
          <button onClick={handleExport} className="button">Export Data</button>
          <label htmlFor="importFile" className="button">Import Data</label>
          <input
            id="importFile"
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: "none" }}
          />
          <button onClick={loadDefaultPlan} className="button">Default Plan</button>
        </div>

        {/* 顯示訓練動作列表 */}
        {muscleGroups.map((group) => (
          <div key={group} style={{ margin: "10px 0" }}>
            <h3 
              className={`groupTitle ${expandedGroup === group ? 'highlightedGroup' : ''}`} 
              onClick={() => toggleGroup(group)}
            >
              {group.charAt(0).toUpperCase() + group.slice(1)}
            </h3>
            
            {expandedGroup === group && (
              <div className="exerciseList">
                {exercises
                  .filter((exercise) => exercise.group === group)
                  .map((exercise) => (
                    <div key={exercise.id} className="exerciseCard">
                      {editExerciseId === exercise.id ? (
                        <>
                          <input
                            type="text"
                            name="name"
                            value={editedExercise.name}
                            onChange={handleEditChange}
                            className="input"
                          />
                          <input
                            type="number"
                            name="max1RM"
                            value={editedExercise.max1RM}
                            onChange={handleEditChange}
                            className="input"
                          />
                          <button onClick={() => handleSaveEdit(exercise.id)} className="button">Save</button>
                        </>
                      ) : (
                        <>
                          <h4>{exercise.name}</h4>
                          <p>Max 1RM: {exercise.max1RM} lb</p>
                          <button onClick={() => handleEdit(exercise)} className="button">Edit</button>
                          <button onClick={() => handleDelete(exercise.id)} className="button">Delete</button>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;