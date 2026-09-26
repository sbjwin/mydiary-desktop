import React, { useState, useEffect } from 'react';
import { Database } from '../database/Database';
import { GoogleDriveService } from '../services/GoogleDriveService';
import {
  HardDrive,
  Download,
  Upload,
  Database as DbIcon,
  Users,
  BookOpen,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Info,
  Cloud,
  CloudUpload,
  CloudDownload,
  LogOut,
  LogIn,
  RefreshCw,
} from 'lucide-react';

import { ConfirmModal } from './ConfirmModal';

export const BackupSettingTab = () => {
  const [stats, setStats] = useState({
    studentsCount: 0,
    recordsCount: 0,
    plansCount: 0,
  });

  const [auth, setAuth] = useState({
    isLoggedIn: false,
    user: null,
    accessToken: null,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [toastNotice, setToastNotice] = useState(null);

  // 인앱 확인/알림 모달 상태
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'primary',
    confirmText: '확인',
    cancelText: '취소',
    onConfirm: null,
  });

  const showToast = (message, type = 'success') => {
    setToastNotice({ message, type });
    if (window._backupToastTimer) clearTimeout(window._backupToastTimer);
    window._backupToastTimer = setTimeout(() => {
      setToastNotice(null);
    }, 2800);
  };

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    if (typeof window !== 'undefined' && window.focus) {
      window.focus();
    }
    if (window.electronAPI?.focusWindow) {
      window.electronAPI.focusWindow();
    }
  };

  const loadStats = async () => {
    try {
      const students = await Database.getAllStudents();
      const records = await Database.getAllRecords();
      const plansMap = await Database.getAllWeeklyPlansMap();
      setStats({
        studentsCount: students.length,
        recordsCount: records.length,
        plansCount: Object.keys(plansMap).length,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const checkAuth = () => {
    const currentAuth = GoogleDriveService.getAuthState();
    setAuth(currentAuth);
  };

  useEffect(() => {
    loadStats();
    checkAuth();
  }, []);

  // 1. 구글 로그인
  const handleGoogleLogin = async () => {
    setIsProcessing(true);
    setStatusMessage({ type: 'info', text: '기본 웹 브라우저에서 구글 로그인을 진행해 주세요...' });
    try {
      const authData = await GoogleDriveService.signIn();
      setAuth({
        isLoggedIn: true,
        user: authData.user,
        accessToken: authData.accessToken,
      });
      setStatusMessage({ type: 'success', text: `구글 드라이브 계정(${authData.user?.email || '인증됨'})이 연결되었습니다.` });
      showToast('구글 드라이브 계정이 성공적으로 연결되었습니다.', 'success');
      if (typeof window !== 'undefined' && window.focus) window.focus();
      if (window.electronAPI?.focusWindow) window.electronAPI.focusWindow();
    } catch (err) {
      console.error('Login failed:', err);
      setStatusMessage({ type: 'error', text: `구글 로그인 실패: ${err.message}` });
      showToast(`구글 로그인 실패: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. 구글 로그아웃 (인앱 모달 적용)
  const handleGoogleLogout = () => {
    setConfirmModal({
      isOpen: true,
      title: '구글 계정 연동 해제',
      message: '구글 드라이브 계정 연동을 해제하시겠습니까?\n해제 시 클라우드 동기화가 중단됩니다.',
      type: 'warning',
      confirmText: '연동 해제',
      cancelText: '취소',
      onConfirm: async () => {
        closeConfirmModal();
        await GoogleDriveService.signOut();
        setAuth({ isLoggedIn: false, user: null, accessToken: null });
        setStatusMessage({ type: 'info', text: '구글 드라이브 연결이 해제되었습니다.' });
        showToast('구글 드라이브 연결이 해제되었습니다.', 'info');
      },
    });
  };

  // 3. 스마트폰 구글 드라이브 백업 가져와 복원 (인앱 모달 및 토스트 적용)
  const handleDownloadCloudBackup = () => {
    setConfirmModal({
      isOpen: true,
      title: '스마트폰 백업 데이터 복원',
      message: '구글 드라이브(스마트폰 백업)에서 데이터를 다운로드하여 현재 데스크톱 데이터를 복원하시겠습니까?\n\n※ 기존 로컬 데이터가 스마트폰 백업 데이터로 갱신됩니다.',
      type: 'primary',
      confirmText: '복원 실행',
      cancelText: '취소',
      onConfirm: async () => {
        closeConfirmModal();
        setIsProcessing(true);
        setStatusMessage({ type: 'info', text: '구글 드라이브(appDataFolder)에서 백업 파일을 탐색하고 다운로드하는 중입니다...' });

        try {
          const result = await GoogleDriveService.downloadCloudBackup();
          setStatusMessage({
            type: 'success',
            text: `성공적으로 복원되었습니다! (학생 ${result.studentsCount}명, 수업 일지 ${result.recordsCount}건, 주간 계획 ${result.plansCount}주차)`,
          });
          await loadStats();
          showToast(`스마트폰 백업 복원 성공 (학생 ${result.studentsCount}명, 일지 ${result.recordsCount}건)`, 'success');

          // Electron 창 포커스 복원 보장
          if (typeof window !== 'undefined' && window.focus) {
            window.focus();
          }
          if (window.electronAPI?.focusWindow) {
            window.electronAPI.focusWindow();
          }
        } catch (err) {
          console.error('Restore error:', err);
          setStatusMessage({ type: 'error', text: err.message });
          showToast(`클라우드 복원 실패: ${err.message}`, 'error');
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  // 4. 현재 데스크톱 데이터를 구글 드라이브에 백업 (인앱 모달 및 토스트 적용)
  const handleUploadCloudBackup = () => {
    setConfirmModal({
      isOpen: true,
      title: '구글 드라이브 클라우드 백업',
      message: '현재 데스크톱에 등록된 모든 데이터를 구글 드라이브(appDataFolder)에 백업하시겠습니까?\n\n※ 스마트폰 MyDiary 앱에서도 이 백업 데이터를 복원할 수 있습니다.',
      type: 'primary',
      confirmText: '백업 저장',
      cancelText: '취소',
      onConfirm: async () => {
        closeConfirmModal();
        setIsProcessing(true);
        setStatusMessage({ type: 'info', text: '구글 드라이브로 백업 데이터를 업로드하는 중입니다...' });

        try {
          await GoogleDriveService.uploadCloudBackup();
          setStatusMessage({
            type: 'success',
            text: '현재 데스크톱 데이터가 구글 드라이브(mydiary_backup.json)에 안전하게 백업되었습니다.',
          });
          showToast('구글 드라이브 백업이 성공적으로 완료되었습니다.', 'success');

          if (typeof window !== 'undefined' && window.focus) {
            window.focus();
          }
          if (window.electronAPI?.focusWindow) {
            window.electronAPI.focusWindow();
          }
        } catch (err) {
          console.error('Upload error:', err);
          setStatusMessage({ type: 'error', text: err.message });
          showToast(`클라우드 백업 실패: ${err.message}`, 'error');
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  // 5. PC 로컬 파일 백업
  const handleExportBackup = async () => {
    try {
      const res = await GoogleDriveService.exportLocalBackup();
      if (res && res.success) {
        showToast(res.filePath ? `백업 파일이 저장되었습니다: ${res.filePath}` : '백업 파일이 안전하게 다운로드되었습니다.', 'success');
      }
      if (typeof window !== 'undefined' && window.focus) window.focus();
      if (window.electronAPI?.focusWindow) window.electronAPI.focusWindow();
    } catch (err) {
      showToast(`백업 파일 생성 실패: ${err.message}`, 'error');
    }
  };

  // 6. PC 로컬 파일 복원 (인앱 모달 적용)
  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setConfirmModal({
      isOpen: true,
      title: '로컬 백업 파일 불러오기',
      message: `선택한 파일(${file.name})로 복원하시겠습니까?\n\n※ 기존 데이터가 이 백업 파일의 데이터로 대체됩니다.`,
      type: 'warning',
      confirmText: '복원 실행',
      cancelText: '취소',
      onConfirm: async () => {
        closeConfirmModal();
        setIsProcessing(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const content = event.target?.result;
            if (content) {
              const res = await GoogleDriveService.importLocalBackup(content);
              await loadStats();
              showToast(`성공적으로 복원되었습니다 (학생 ${res.studentsCount}명, 일지 ${res.recordsCount}건)`, 'success');
              if (typeof window !== 'undefined' && window.focus) window.focus();
              if (window.electronAPI?.focusWindow) window.electronAPI.focusWindow();
            }
          } catch (err) {
            showToast(`백업 복원 실패: ${err.message}`, 'error');
          } finally {
            setIsProcessing(false);
          }
        };
        reader.readAsText(file);
      },
    });
    e.target.value = '';
  };

  return (
    <div className="tab-container backup-setting-tab">
      <div className="backup-content-max">
        {/* 상단 타이틀 */}
        <div className="section-header-banner">
          <div className="banner-icon-box">
            <HardDrive size={24} color="#ffffff" />
          </div>
          <div>
            <h2>데이터 백업 및 복원</h2>
            <p>스마트폰 MyDiary(구글 드라이브)와의 클라우드 동기화 및 PC 로컬 백업을 관리하세요.</p>
          </div>
        </div>

        {/* 현재 보관 데이터 요약 통계 */}
        <div className="stats-cards-grid">
          <div className="stat-card">
            <div className="stat-icon-wrap blue">
              <Users size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-label">등록된 학생 수</span>
              <strong className="stat-val">{stats.studentsCount}명</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap green">
              <BookOpen size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-label">작성된 수업 일지</span>
              <strong className="stat-val">{stats.recordsCount}건</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap purple">
              <Calendar size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-label">관리 중인 주간 계획</span>
              <strong className="stat-val">{stats.plansCount}주차</strong>
            </div>
          </div>
        </div>

        {/* 상태/진행 안내 메시지 배너 */}
        {statusMessage && (
          <div className={`sync-status-banner ${statusMessage.type}`}>
            {statusMessage.type === 'success' && <CheckCircle size={18} className="text-success" />}
            {statusMessage.type === 'error' && <AlertTriangle size={18} className="text-danger" />}
            {statusMessage.type === 'info' && <Info size={18} className="text-primary" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* 구글 드라이브(스마트폰 연동) 클라우드 동기화 카드 */}
        <div className="cloud-sync-card">
          <div className="cloud-card-header">
            <div className="cloud-title-group">
              <div className="cloud-icon-badge">
                <Cloud size={20} color="#0284c7" />
              </div>
              <div>
                <h3>구글 드라이브 클라우드 연동 (스마트폰 MyDiary 동기화)</h3>
                <p className="cloud-subtitle">
                  스마트폰 앱과 동일한 구글 계정으로 로그인하여 <strong>appDataFolder</strong>에 보관된 백업을 즉시 가져오거나 올립니다.
                </p>
              </div>
            </div>

            {auth.isLoggedIn ? (
              <div className="cloud-user-box">
                {auth.user?.photo ? (
                  <img src={auth.user.photo} alt="User Avatar" className="cloud-user-avatar" />
                ) : (
                  <div className="cloud-user-avatar-placeholder">
                    {auth.user?.name ? auth.user.name.charAt(0) : 'U'}
                  </div>
                )}
                <div className="cloud-user-meta">
                  <span className="cloud-user-name">{auth.user?.name || '구글 사용자'}</span>
                  <span className="cloud-user-email">{auth.user?.email || '연결됨'}</span>
                </div>
                <button
                  className="btn-outline-sm btn-logout"
                  onClick={handleGoogleLogout}
                  disabled={isProcessing}
                  title="구글 계정 연동 해제"
                >
                  <LogOut size={14} /> 해제
                </button>
              </div>
            ) : (
              <button
                className="btn-google-login"
                onClick={handleGoogleLogin}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={16} className="spin-icon" /> 인증 대기 중...
                  </>
                ) : (
                  <>
                    <LogIn size={16} /> 구글 드라이브 연결 및 로그인
                  </>
                )}
              </button>
            )}
          </div>

          {auth.isLoggedIn ? (
            <div className="cloud-actions-grid">
              {/* 클라우드 복원 */}
              <div className="cloud-action-subbox">
                <div className="action-box-title">
                  <CloudDownload size={18} className="text-primary" />
                  <h4>스마트폰 백업 가져와 복원</h4>
                </div>
                <p className="action-box-desc">
                  스마트폰 MyDiary 앱이 구글 드라이브에 올려둔 <strong>mydiary_backup.json</strong>을 다운로드하여 현재 데스크톱에 복원합니다.
                </p>
                <button
                  className="btn-primary"
                  onClick={handleDownloadCloudBackup}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw size={16} className="spin-icon" /> 다운로드 중...
                    </>
                  ) : (
                    <>
                      <CloudDownload size={16} /> 스마트폰 백업 복원 실행
                    </>
                  )}
                </button>
              </div>

              {/* 클라우드 백업 */}
              <div className="cloud-action-subbox">
                <div className="action-box-title">
                  <CloudUpload size={18} className="text-success" />
                  <h4>현재 데이터 클라우드 백업</h4>
                </div>
                <p className="action-box-desc">
                  현재 데스크톱의 모든 데이터를 구글 드라이브에 백업하여 스마트폰 MyDiary 앱에서도 복원할 수 있도록 업로드합니다.
                </p>
                <button
                  className="btn-secondary"
                  onClick={handleUploadCloudBackup}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw size={16} className="spin-icon" /> 업로드 중...
                    </>
                  ) : (
                    <>
                      <CloudUpload size={16} /> 구글 드라이브에 백업 저장
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="cloud-login-prompt">
              <p>
                💡 상단의 <strong>[구글 드라이브 연결 및 로그인]</strong> 버튼을 누르면 기본 웹 브라우저에서 안전하게 구글 로그인을 진행할 수 있습니다.
              </p>
            </div>
          )}
        </div>

        {/* PC 로컬 백업 / 복원 카드 그리드 */}
        <div className="backup-action-grid">
          {/* 로컬 백업 내보내기 */}
          <div className="action-box-card">
            <div className="action-box-title">
              <Download size={18} className="text-primary" />
              <h3>PC 로컬 백업 파일 생성 (.json)</h3>
            </div>
            <p className="action-box-desc">
              현재 등록된 모든 학생 정보, 수업 일지, 주간 계획을 하나의 안전한 JSON 파일로 컴퓨터에 다운로드합니다.
            </p>
            <button className="btn-primary" onClick={handleExportBackup}>
              <Download size={16} /> 원클릭 백업 파일 저장
            </button>
          </div>

          {/* 로컬 백업 복원하기 */}
          <div className="action-box-card">
            <div className="action-box-title">
              <Upload size={18} className="text-warning" />
              <h3>로컬 백업 파일 불러오기 (.json)</h3>
            </div>
            <p className="action-box-desc">
              이전에 백업해둔 JSON 파일(모바일 MyDiary 백업 파일 포함)을 직접 선택하여 데이터를 복원합니다.
            </p>
            <label className="btn-secondary file-upload-label">
              <Upload size={16} /> 백업 파일 선택 (.json)
              <input
                type="file"
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={handleFileImport}
              />
            </label>
          </div>
        </div>

        {/* 앱 및 개발자 정보 */}
        <div className="app-info-card">
          <div className="info-row">
            <Info size={16} className="text-muted" />
            <span>애플리케이션: <strong>MyDiary Desktop</strong> (학생 일지 및 성장 기록 관리 앱)</span>
          </div>
          <div className="info-row">
            <DbIcon size={16} className="text-muted" />
            <span>엔진 버전: <strong>v0.4.3</strong> | 크로스 플랫폼 (Windows, macOS, Linux 지원)</span>
          </div>
          <div className="info-row">
            <Users size={16} className="text-muted" />
            <span>개발자: <strong>성백진 (Sung Baekjin)</strong> | 문의: sbjwin4271@gmail.com</span>
          </div>
        </div>
      </div>

      {/* 인앱 확인 및 알림 모달 (Electron 네이티브 포커스 유실 원천 차단) */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        onConfirm={confirmModal.onConfirm}
        onClose={closeConfirmModal}
      />

      {/* 인라인 토스트 알림 */}
      {toastNotice && (
        <div className={`diary-toast-notice ${toastNotice.type || 'success'}`}>
          <span className="toast-icon">
            {toastNotice.type === 'error' && <AlertTriangle size={16} />}
            {toastNotice.type === 'warning' && <AlertTriangle size={16} />}
            {toastNotice.type === 'info' && <Info size={16} />}
            {(!toastNotice.type || toastNotice.type === 'success') && <CheckCircle size={16} />}
          </span>
          <span>{toastNotice.message}</span>
        </div>
      )}
    </div>
  );
};
