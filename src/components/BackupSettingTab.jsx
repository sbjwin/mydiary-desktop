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
} from 'lucide-react';

export const BackupSettingTab = () => {
  const [stats, setStats] = useState({
    studentsCount: 0,
    recordsCount: 0,
    plansCount: 0,
  });

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

  useEffect(() => {
    loadStats();
  }, []);

  const handleExportBackup = async () => {
    await GoogleDriveService.exportLocalBackup();
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (content) {
        GoogleDriveService.importLocalBackup(content);
      }
    };
    reader.readAsText(file);
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
            <h2>데이터 백업 및 복원 설정</h2>
            <p>학생 주소록, 수업 일지, 주간 시간표 데이터를 안전하게 PC에 백업하고 언제든 복원하세요.</p>
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

        {/* 백업 / 복원 카드 그리드 */}
        <div className="backup-action-grid">
          {/* 백업 내보내기 */}
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

          {/* 백업 복원하기 */}
          <div className="action-box-card">
            <div className="action-box-title">
              <Upload size={18} className="text-warning" />
              <h3>백업 파일 불러오기 (.json)</h3>
            </div>
            <p className="action-box-desc">
              이전에 백업해둔 JSON 파일(모바일 MyDiary 백업 파일 포함)을 선택하여 데이터를 즉시 복원합니다.
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
            <span>엔진 버전: <strong>v0.2.0</strong> | 크로스 플랫폼 (Windows, macOS, Linux 지원)</span>
          </div>
          <div className="info-row">
            <Users size={16} className="text-muted" />
            <span>개발자: <strong>성백진 (Sung Baekjin)</strong> | 문의: sbjwin4271@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};
