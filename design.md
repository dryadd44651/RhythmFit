以下是針對你的健身網站的技術文件，包含頁面結構、資料結構、設計模式、以及實作方式：

### 1. 專案結構規劃

- **Components**: 
  - `TrainingPage.js`
  - `ProfilePage.js`
  - `ExerciseCard.js` （顯示單個動作的卡片）
  - `EditableExerciseCard.js` （Profile頁面中的可編輯動作卡片）
  - `Header.js` （導航和標題）
  - `Footer.js`

- **Pages**:
  - `/Training`：訓練頁面
  - `/Profile`：Profile頁面

- **Utilities**: 
  - `storage.js` （封裝 localStorage 的操作）

- **Styles**: 
  - 使用 CSS 或 Styled Components 來管理樣式

### 2. 資料結構設計

#### a. Training Page 資料結構
- **`MuscleGroup`**: 包含主要的肌肉群，像是「胸部」、「背部」、「腿部」等。
- **`Exercise`**:
  ```javascript
  {
    id: "exercise_1",
    name: "Bench Press",
    muscleGroup: "Chest",
    description: "A basic chest exercise.",
    selected: false // 是否被選擇進行訓練
  }
  ```

#### b. Profile Page 資料結構
- **`UserProfile`**:
  ```javascript
  {
    userId: "user_1",
    exercises: [
      {
        id: "exercise_1",
        name: "Bench Press",
        muscleGroup: "Chest",
        max1RM: 100 // 最大的 1RM 重量
      },
      // ...更多的動作
    ]
  }
  ```

### 3. Design Patterns

1. **Facade Pattern**：用於 `storage.js`，簡化 localStorage 的存取操作。
2. **Container-Presenter Pattern**：將頁面邏輯與 UI 分離。Container（如 TrainingPage 和 ProfilePage）負責處理資料和狀態，Presenter（如 ExerciseCard 和 EditableExerciseCard）負責顯示。
3. **State Management**：在頁面間共享狀態可以使用 `Context API` 或直接在 localStorage 中同步，以保持簡單。

### 4. 實作方式

#### a. 訓練頁面（Training Page）

1. **資料讀取**：
   - 從 localStorage 中讀取所有可用的動作，依據 `muscleGroup` 來篩選和顯示。
   
2. **互動**：
   - 使用按鈕或勾選框讓使用者選擇欲訓練的動作，並更新 localStorage 中的 `selected` 屬性。

3. **元件渲染**：
   - 使用 `ExerciseCard` 來渲染動作列表，顯示動作名稱、目標肌肉群等。

#### b. Profile 頁面（Profile Page）

1. **資料讀取**：
   - 從 localStorage 中讀取所有訓練動作，並根據 `muscleGroup` 來分組顯示。

2. **編輯功能**：
   - 使用 `EditableExerciseCard` 元件，允許使用者編輯每個動作的 `max1RM` 值。
   - 點擊動作卡片的「編輯」按鈕，切換至編輯模式，允許使用者輸入新的 1RM 值，更新完成後將資料保存至 localStorage。

3. **資料更新**：
   - 將每個編輯動作的更新即時同步到 localStorage，確保在切換頁面後也能保持最新狀態。

### 5. 簡易範例程式碼

#### TrainingPage.js

```javascript
import React, { useEffect, useState } from 'react';
import ExerciseCard from './ExerciseCard';
import { getExercises, updateExercise } from './storage';

const TrainingPage = () => {
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    setExercises(getExercises());
  }, []);

  const handleSelectExercise = (exerciseId) => {
    updateExercise(exerciseId, { selected: true });
    setExercises(getExercises());
  };

  return (
    <div>
      <h1>Training Page</h1>
      {exercises.map((exercise) => (
        <ExerciseCard key={exercise.id} exercise={exercise} onSelect={() => handleSelectExercise(exercise.id)} />
      ))}
    </div>
  );
};

export default TrainingPage;
```

#### ProfilePage.js

```javascript
import React, { useState, useEffect } from 'react';
import EditableExerciseCard from './EditableExerciseCard';
import { getExercises, updateExercise } from './storage';

const ProfilePage = () => {
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    setExercises(getExercises());
  }, []);

  const handleUpdateMax1RM = (exerciseId, newMax1RM) => {
    updateExercise(exerciseId, { max1RM: newMax1RM });
    setExercises(getExercises());
  };

  return (
    <div>
      <h1>Profile Page</h1>
      {exercises.map((exercise) => (
        <EditableExerciseCard key={exercise.id} exercise={exercise} onUpdateMax1RM={handleUpdateMax1RM} />
      ))}
    </div>
  );
};

export default ProfilePage;
```

#### storage.js

```javascript
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
```

這份技術文件提供了健身網站的基本架構、資料結構、設計模式和實作方式。如果有其他需求或是需要進一步的擴展功能，可以隨時告訴我！