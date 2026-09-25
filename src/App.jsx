import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { WeeklyScheduleTab } from './components/WeeklyScheduleTab';
import { ClassDiaryTab } from './components/ClassDiaryTab';
import { StudentManageTab } from './components/StudentManageTab';
import { BackupSettingTab } from './components/BackupSettingTab';
import { HelpModal } from './components/HelpModal';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmModal } from './components/ConfirmModal';
import { CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Database, getTodayDateString } from './database/Database';
import { getStoredTheme, applyTheme } from './theme';
import './styles/app.css';

export function App() {
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' | 'diary' | 'students' | 'backup'
  const [diaryParams, setDiaryParams] = useState(null);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpInitialTab, setHelpInitialTab] = useState('guide');
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => getStoredTheme());

  // 전역 토스트 및 확인 모달 상태 (Electron 네이티브 팝업 포커스 단절 원천 방어)
  const [globalToast, setGlobalToast] = useState(null);
  const [globalConfirm, setGlobalConfirm] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'primary',
    confirmText: '확인',
    cancelText: '취소',
    isAlertOnly: false,
    onConfirm: null,
    onCancel: null,
  });

  // 전역 다이얼로그 & 토스트 커스텀 이벤트 리스너
  useEffect(() => {
    let toastTimer = null;
    const handleToastEvent = (e) => {
      const { message, type = 'success' } = e.detail || {};
      setGlobalToast({ message, type });
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        setGlobalToast(null);
      }, 3000);
    };

    const handleConfirmEvent = (e) => {
      const {
        title = '확인',
        message = '',
        type = 'primary',
        confirmText = '확인',
        cancelText = '취소',
        isAlertOnly = false,
        onConfirm,
        onCancel,
      } = e.detail || {};

      setGlobalConfirm({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        isAlertOnly,
        onConfirm,
        onCancel,
      });
    };

    window.addEventListener('mydiary:toast', handleToastEvent);
    window.addEventListener('mydiary:confirm', handleConfirmEvent);

    return () => {
      window.removeEventListener('mydiary:toast', handleToastEvent);
      window.removeEventListener('mydiary:confirm', handleConfirmEvent);
      if (toastTimer) clearTimeout(toastTimer);
    };
  }, []);

  // 앱 마운트 시 저장된 테마 적용
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const handleSelectTheme = (themeId) => {
    const applied = applyTheme(themeId);
    setCurrentTheme(applied);
  };

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

  // F1 단축키 및 Electron 네이티브 메뉴 IPC 리스너 등록
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setHelpInitialTab('guide');
        setHelpModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Electron 상단 도움말 메뉴 클릭 수신
    let cleanupIpc = null;
    if (window.electronAPI?.onOpenHelp) {
      cleanupIpc = window.electronAPI.onOpenHelp((tab) => {
        setHelpInitialTab(tab || 'guide');
        setHelpModalOpen(true);
      });
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (cleanupIpc) cleanupIpc();
    };
  }, []);

  // 주간 시간표에서 수업 카드를 클릭했을 때 해당 일지 작성 화면으로 바로 이동
  const handleNavigateToDiary = (params) => {
    setDiaryParams(params);
    setActiveTab('diary');
  };

  const handleOpenHelp = (tab = 'guide') => {
    setHelpInitialTab(tab);
    setHelpModalOpen(true);
  };

  return (
    <div className="app-container">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenHelp={() => handleOpenHelp('guide')}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
      />
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

      {/* 종합 시각적 도움말 모달 */}
      <HelpModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        initialTab={helpInitialTab}
      />

      {/* 독립된 환경 설정 모달 */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
      />

      {/* 전역 인앱 확인 및 알림 모달 (Electron 네이티브 OS 팝업 포커스 단절 원천 방지) */}
      <ConfirmModal
        isOpen={globalConfirm.isOpen}
        title={globalConfirm.title}
        message={globalConfirm.message}
        type={globalConfirm.type}
        confirmText={globalConfirm.confirmText}
        cancelText={globalConfirm.cancelText}
        isAlertOnly={globalConfirm.isAlertOnly}
        onConfirm={() => {
          setGlobalConfirm((prev) => ({ ...prev, isOpen: false }));
          if (globalConfirm.onConfirm) globalConfirm.onConfirm();
        }}
        onClose={() => {
          setGlobalConfirm((prev) => ({ ...prev, isOpen: false }));
          if (globalConfirm.onCancel) globalConfirm.onCancel();
        }}
      />

      {/* 전역 인라인 토스트 알림 */}
      {globalToast && (
        <div className={`diary-toast-notice ${globalToast.type || 'success'}`}>
          <span className="toast-icon">
            {globalToast.type === 'error' && <AlertCircle size={16} />}
            {globalToast.type === 'warning' && <AlertTriangle size={16} />}
            {globalToast.type === 'info' && <Info size={16} />}
            {(!globalToast.type || globalToast.type === 'success') && <CheckCircle size={16} />}
          </span>
          <span>{globalToast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
