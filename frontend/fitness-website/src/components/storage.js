export const getExercises = () => {
  const exercises = localStorage.getItem('exercises');
  return exercises ? JSON.parse(exercises) : [];
};

export const updateExercise = (exerciseId, updateData) => {
  const exercises = getExercises();
  const updatedExercises = exercises.map((exercise) => {
    if (exercise.id === exerciseId) {
      return { ...exercise, ...updateData };
    }
    return exercise;
  });
  localStorage.setItem('exercises', JSON.stringify(updatedExercises));
};

export const addExercise = (exercise) => {
  const exercises = getExercises();
  const newExercise = { ...exercise, id: `exercise_${Date.now()}` };
  exercises.push(newExercise);
  localStorage.setItem('exercises', JSON.stringify(exercises));
};

// 新增 deleteExercise 函數
export const deleteExercise = (exerciseId) => {
  const exercises = getExercises();
  const updatedExercises = exercises.filter(exercise => exercise.id !== exerciseId);
  localStorage.setItem('exercises', JSON.stringify(updatedExercises));
};
