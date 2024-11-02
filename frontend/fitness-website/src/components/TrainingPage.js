import React, { useState, useEffect } from 'react';
import { getExercises, updateExercise } from './storage';

const cycles = {
  light: { rm: 60, times: [12, 15], sets: 6 },
  medium: { rm: 70, times: [8, 10], sets: 6 },
  heavy: { rm: 85, times: [3, 5], sets: 5 },
  deload: { rm: 40, times: [25, 30], sets: 6 },
};

const muscleGroups = ["leg", "chest", "back", "shoulder", "arm"];

const TrainingPage = () => {
  const [exercises, setExercises] = useState([]);
  const [currentCycle, setCurrentCycle] = useState(() => {
    return localStorage.getItem("currentCycle") || 'light';
  });
  const [trainedGroups, setTrainedGroups] = useState(() => {
    const storedTrainedGroups = localStorage.getItem("trainedGroups");
    return storedTrainedGroups ? JSON.parse(storedTrainedGroups) : [];
  });
  const [expandedGroup, setExpandedGroup] = useState(null);

  useEffect(() => {
    setExercises(getExercises());
  }, []);

  useEffect(() => {
    // 儲存當前週期和訓練進度至 localStorage
    localStorage.setItem("currentCycle", currentCycle);
    localStorage.setItem("trainedGroups", JSON.stringify(trainedGroups));
  }, [currentCycle, trainedGroups]);

  const handleDone = (group) => {
    setTrainedGroups([...trainedGroups, group]);
  };

  const handleRetrain = (group) => {
    setTrainedGroups(trainedGroups.filter((g) => g !== group));
  };

  const toggleGroup = (group) => {
    setExpandedGroup(expandedGroup === group ? null : group);
  };

  const finishCycle = () => {
    const untrainedGroups = muscleGroups.filter(group => !trainedGroups.includes(group) && group !== 'arm');
    if (untrainedGroups.length > 0) {
      const confirmNextCycle = window.confirm("There are untrained groups. Are you sure you want to proceed to the next cycle?");
      if (!confirmNextCycle) return;
    }
    setTrainedGroups([]);
    setCurrentCycle((prevCycle) => {
      const cycles = ["light", "medium", "heavy", "deload"];
      const nextIndex = (cycles.indexOf(prevCycle) + 1) % cycles.length;
      return cycles[nextIndex];
    });
  };

  return (
    <div style={styles.outerContainer}>
      <div style={styles.container}>
        <h1 style={styles.title}>Training Page</h1>
        <h2>Current Cycle: {currentCycle.charAt(0).toUpperCase() + currentCycle.slice(1)}</h2>

        {muscleGroups.map((group) => {
          const isTrained = trainedGroups.includes(group);
          const groupExercises = exercises.filter((exercise) => exercise.group === group);

          return (
            <div key={group} style={{ margin: "10px 0" }}>
              <div style={styles.groupHeader}>
                <h3 
                  style={group === expandedGroup ? styles.highlightedGroup : styles.groupTitle} 
                  onClick={() => toggleGroup(group)}
                >
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                </h3>
                {isTrained ? (
                  <button onClick={() => handleRetrain(group)} style={styles.button}>Retrain</button>
                ) : (
                  <button onClick={() => handleDone(group)} style={styles.button}>Done</button>
                )}
              </div>
              
              {expandedGroup === group && (
                <div style={styles.exerciseList}>
                  {groupExercises.map((exercise) => (
                    <div key={exercise.id} style={isTrained ? styles.trainedExercise : styles.exerciseCard}>
                      <h4>{exercise.name}</h4>
                      <p>Weight: {Math.round(exercise.max1RM * cycles[currentCycle].rm / 100)} lb</p>
                      <p>Reps: {cycles[currentCycle].times.join(" - ")}</p>
                      <p>Sets: {cycles[currentCycle].sets}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <button onClick={finishCycle} style={styles.finishButton}>Finish Cycle</button>
      </div>
    </div>
  );
};

export default TrainingPage;

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
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
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
  trainedExercise: {
    padding: '10px',
    margin: '10px 0',
    border: '1px solid #ddd',
    borderRadius: '5px',
    backgroundColor: '#d3d3d3',
    color: '#aaa',
    textAlign: 'left',
  },
  button: {
    padding: '10px 20px',
    fontSize: '14px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  finishButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    marginTop: '20px',
    textAlign: 'center',
  },
};
