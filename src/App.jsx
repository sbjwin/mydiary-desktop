import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StudentSidebar } from './components/StudentSidebar';
import { DiaryListPane } from './components/DiaryListPane';
import { DiaryEditorPane } from './components/DiaryEditorPane';
import { loadStudents, saveStudents, loadDiaries, saveDiaries } from './services/StorageService';
import './styles/app.css';

export function App() {
  const [students, setStudents] = useState([]);
  const [diaries, setDiaries] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedDiaryId, setSelectedDiaryId] = useState(null);

  useEffect(() => {
    const loadedStudents = loadStudents();
    const loadedDiaries = loadDiaries();
    setStudents(loadedStudents);
    setDiaries(loadedDiaries);
    if (loadedStudents.length > 0) {
      setSelectedStudentId(loadedStudents[0].id);
    }
  }, []);

  const currentStudent = students.find((s) => s.id === selectedStudentId) || null;
  const filteredDiaries = diaries.filter((d) => d.studentId === selectedStudentId);
  const currentDiary = filteredDiaries.find((d) => d.id === selectedDiaryId) || null;

  const handleSelectStudent = (studentId) => {
    setSelectedStudentId(studentId);
    setSelectedDiaryId(null);
  };

  const handleSaveDiary = (savedData) => {
    let updated;
    const exists = diaries.some((d) => d.id === savedData.id);
    if (exists) {
      updated = diaries.map((d) => (d.id === savedData.id ? savedData : d));
    } else {
      updated = [savedData, ...diaries];
    }
    setDiaries(updated);
    saveDiaries(updated);
    setSelectedDiaryId(savedData.id);
  };

  const handleNewDiary = () => {
    setSelectedDiaryId(null);
  };

  return (
    <div className="app-container">
      <Header />
      <div className="main-workspace">
        <StudentSidebar
          students={students}
          selectedStudentId={selectedStudentId}
          onSelectStudent={handleSelectStudent}
        />
        <DiaryListPane
          diaries={filteredDiaries}
          selectedDiaryId={selectedDiaryId}
          onSelectDiary={setSelectedDiaryId}
          onNewDiary={handleNewDiary}
        />
        <DiaryEditorPane
          student={currentStudent}
          diary={currentDiary}
          onSaveDiary={handleSaveDiary}
        />
      </div>
    </div>
  );
}

export default App;
