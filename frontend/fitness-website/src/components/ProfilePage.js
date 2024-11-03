import React, { useState, useEffect } from 'react';
import { getExercises, updateExercise, addExercise, deleteExercise } from './storage';

const muscleGroups = ["leg", "chest", "back", "shoulder", "arm"];

const ProfilePage = () => {
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState({ name: '', max1RM: '', group: '' });
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [editExerciseId, setEditExerciseId] = useState(null); // 用於追蹤編輯中的動作
  const [editedExercise, setEditedExercise] = useState({ name: '', max1RM: '' });

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

  return (
    <div style={styles.outerContainer}>
      <div style={styles.container}>
        <h1 style={styles.title}>Profile Page</h1>

        {/* 新增動作表單 */}
        <form style={styles.form} onSubmit={handleAddExercise}>
          <input
            type="text"
            name="name"
            placeholder="Exercise Name"
            value={newExercise.name}
            onChange={handleInputChange}
            style={styles.input}
            required
          />
          <input
            type="number"
            name="max1RM"
            placeholder="Max 1RM"
            value={newExercise.max1RM}
            onChange={handleInputChange}
            style={styles.input}
            required
          />
          <select
            name="group"
            value={newExercise.group}
            onChange={handleInputChange}
            style={styles.input}
            required
          >
            <option value="">Select Muscle Group</option>
            <option value="leg">Leg</option>
            <option value="back">Back</option>
            <option value="chest">Chest</option>
            <option value="arm">Arm</option>
            <option value="shoulder">Shoulder</option>
          </select>
          <button type="submit" style={styles.button}>Add Exercise</button>
        </form>

        {/* 匯入和匯出按鈕 */}
        <div style={styles.importExportButtons}>
          <button onClick={handleExport} style={styles.button}>Export Data</button>
          <label htmlFor="importFile" style={styles.button}>Import Data</label>
          <input
            id="importFile"
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: "none" }}
          />
        </div>

        {/* 顯示訓練動作列表 */}
        {muscleGroups.map((group) => (
          <div key={group} style={{ margin: "10px 0" }}>
            <h3 
              style={group === expandedGroup ? styles.highlightedGroup : styles.groupTitle} 
              onClick={() => toggleGroup(group)}
            >
              {group.charAt(0).toUpperCase() + group.slice(1)}
            </h3>
            
            {expandedGroup === group && (
              <div style={styles.exerciseList}>
                {exercises
                  .filter((exercise) => exercise.group === group)
                  .map((exercise) => (
                    <div key={exercise.id} style={styles.exerciseCard}>
                      {editExerciseId === exercise.id ? (
                        <>
                          <input
                            type="text"
                            name="name"
                            value={editedExercise.name}
                            onChange={handleEditChange}
                            style={styles.input}
                          />
                          <input
                            type="number"
                            name="max1RM"
                            value={editedExercise.max1RM}
                            onChange={handleEditChange}
                            style={styles.input}
                          />
                          <button onClick={() => handleSaveEdit(exercise.id)} style={styles.button}>Save</button>
                        </>
                      ) : (
                        <>
                          <h4>{exercise.name}</h4>
                          <p>Max 1RM: {exercise.max1RM} lb</p>
                          <button onClick={() => handleEdit(exercise)} style={styles.button}>Edit</button>
                          <button onClick={() => handleDelete(exercise.id)} style={styles.button}>Delete</button>
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

const styles = {
  outerContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  container: {
    maxWidth: '400px',
    width: '100%',
    textAlign: 'left',
  },
  title: {
    textAlign: 'center',
    fontSize: '24px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginBottom: '20px',
  },
  input: {
    margin: '10px 0',
    padding: '8px',
    fontSize: '16px',
    width: '100%',
  },
  button: {
    padding: '10px 20px',
    fontSize: '14px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  importExportButtons: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  groupTitle: {
    fontSize: '20px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  highlightedGroup: {
    fontSize: '20px',
    cursor: 'pointer',
    color: 'blue',
    textAlign: 'left',
  },
  exerciseList: {
    paddingLeft: '10px',
  },
  exerciseCard: {
    padding: '10px',
    margin: '10px 0',
    border: '1px solid #ddd',
    borderRadius: '5px',
    backgroundColor: '#f9f9f9',
    textAlign: 'left',
  },
};
