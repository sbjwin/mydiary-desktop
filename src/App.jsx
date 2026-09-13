import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { WeeklyScheduleTab } from './components/WeeklyScheduleTab';
import { ClassDiaryTab } from './components/ClassDiaryTab';
import { StudentManageTab } from './components/StudentManageTab';
import { BackupSettingTab } from './components/BackupSettingTab';
import { Database, getTodayDateString } from './database/Database';
import './styles/app.css';

export function App() {
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' | 'diary' | 'students' | 'backup'
  const [diaryParams, setDiaryParams] = useState(null);

  // 초기 실행 시 학생 데이터가 전혀 없는 경우 기본 가이드 학생 생성
  useEffect(() => {
    const initDefaultStudents = async () => {
      try {
        const students = await Database.getAllStudents();
        if (students.length === 0) {
          const today = getTodayDateString();
          await Database.addStudent({
            name: '김민준',
            school_grade: '중앙초 3학년',
            status: 'active',
            first_enrolled_date: today,
            payment_type: '지사입금',
            study_method: '방문지도',
            mobile_phone: '010-1234-5678',
            parent_name: '이수진 (모)',
            parent_mobile_phone: '010-9876-5432',
            address: '서울시 강남구 테헤란로 123',
            notes: '수학 개념 이해도가 높으며, 응용 문제 풀이에 적극적임.',
            default_schedules: [
              { dayOfWeek: 1, startTime: '14:00', duration: 60, subject: '초등 수학 3-1' },
              { dayOfWeek: 3, startTime: '14:00', duration: 60, subject: '초등 수학 3-1' },
            ],
          });
        }
      } catch (err) {
        console.error('Initial seeding error:', err);
      }
    };

    initDefaultStudents();
  }, []);

  // 주간 시간표에서 수업 카드를 클릭했을 때 해당 일지 작성 화면으로 바로 이동
  const handleNavigateToDiary = (params) => {
    setDiaryParams(params);
    setActiveTab('diary');
  };

  return (
    <div className="app-container">
      <Header activeTab={activeTab} onSelectTab={setActiveTab} />
      <main className="app-main-content">
        {activeTab === 'weekly' && (
          <WeeklyScheduleTab onNavigateToDiary={handleNavigateToDiary} />
        )}
        {activeTab === 'diary' && (
          <ClassDiaryTab initialParams={diaryParams} />
        )}
        {activeTab === 'students' && (
          <StudentManageTab />
        )}
        {activeTab === 'backup' && (
          <BackupSettingTab />
        )}
      </main>
    </div>
  );
}

export default App;
