import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExercises, updateExercise, addExercise, deleteExercise } from './storage';
import basicTrainingData from './Basic_training_data.json';
import './GuestPage.css';

const muscleGroups = ["leg", "chest", "back", "shoulder", "arm"];

const GuestPage = () => {
    const [exercises, setExercises] = useState([]);
    const [newExercise, setNewExercise] = useState({ name: '', max1RM: '', group: '' });
    const [expandedGroup, setExpandedGroup] = useState(null);
    const [editExerciseId, setEditExerciseId] = useState(null);
    const [editedExercise, setEditedExercise] = useState({ name: '', max1RM: '' });
    const [username, setUsername] = useState('Guest'); // 用戶名設置為 Guest
    const [trainedGroups, setTrainedGroups] = useState([]);
    const [currentCycle, setCurrentCycle] = useState('light');
  
    useEffect(() => {
        setExercises(getExercises());
        setTrainedGroups(JSON.parse(localStorage.getItem("trainedGroups") || "[]"));
        setCurrentCycle(localStorage.getItem("currentCycle") || 'light');
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
            trainedGroups,
            currentCycle
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
                    setTrainedGroups(data.trainedGroups);
                    setCurrentCycle(data.currentCycle);
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
  
    const handleDone = (group) => {
        if (!trainedGroups.includes(group)) {
            const updatedTrainedGroups = [...trainedGroups, group];
            setTrainedGroups(updatedTrainedGroups);
            localStorage.setItem("trainedGroups", JSON.stringify(updatedTrainedGroups));
        }
    };

    const handleFinishCycle = () => {
        if (trainedGroups.length < muscleGroups.length) {
            const confirmIncomplete = window.confirm("There are untrained groups. Do you still want to finish the cycle?");
            if (!confirmIncomplete) return;
        }
        const nextCycle = currentCycle === 'light' ? 'medium' : currentCycle === 'medium' ? 'heavy' : currentCycle === 'heavy' ? 'deload' : 'light';
        setCurrentCycle(nextCycle);
        setTrainedGroups([]);
        localStorage.setItem("currentCycle", nextCycle);
        localStorage.setItem("trainedGroups", JSON.stringify([]));
    };

    return (
        <div className="outerContainer">
            <div className="container">
                <h1 className="title">Guest Page</h1>
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
                        {muscleGroups.map((group) => (
                            <option key={group} value={group}>
                                {group.charAt(0).toUpperCase() + group.slice(1)}
                            </option>
                        ))}
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

                {/* Training Section */}
                <div className="trainingSection">
                    <h2>Current Cycle: {currentCycle.charAt(0).toUpperCase() + currentCycle.slice(1)}</h2>
                    {muscleGroups.map((group) => (
                        <div key={group} className="groupTraining">
                            <h3 className="groupName">{group.charAt(0).toUpperCase() + group.slice(1)}</h3>
                            {!trainedGroups.includes(group) ? (
                                <button onClick={() => handleDone(group)} className="button">Done</button>
                            ) : (
                                <button disabled className="button doneButton">Done</button>
                            )}
                        </div>
                    ))}
                    <button onClick={handleFinishCycle} className="button finishButton">Finish Cycle</button>
                </div>
            </div>
        </div>
    );
};
  
export default GuestPage;
