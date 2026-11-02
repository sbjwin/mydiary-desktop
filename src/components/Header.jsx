import React, { useState, useRef, useEffect } from 'react';
import { Calendar, BookOpen, Users, HardDrive, Laptop, HelpCircle, Palette, Check } from 'lucide-react';
import { THEME_PRESETS } from '../theme';
import { getTeacherProfile, saveTeacherProfile } from '../services/HwpxExportService';
import { showToast } from '../utils/dialog';

export const Header = ({
  activeTab,
  onSelectTab,
  onOpenHelp,
  currentTheme,
  onSelectTheme,
}) => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const paletteRef = useRef(null);
  const profileRef = useRef(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [teacherProfile, setTeacherProfile] = useState(() => getTeacherProfile());
  const [draftTeacherName, setDraftTeacherName] = useState(() => getTeacherProfile().teacherName);
  const [draftOrgName, setDraftOrgName] = useState(() => getTeacherProfile().orgName);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const saved = saveTeacherProfile({ teacherName: draftTeacherName, orgName: draftOrgName });
    setTeacherProfile(saved);
    setDraftTeacherName(saved.teacherName);
    setDraftOrgName(saved.orgName);
    setIsProfileOpen(false);
    showToast(`교사 프로필이 '${saved.teacherName} 선생님 (${saved.orgName})'으로 저장되었습니다.`, 'success');
  };

  const tabs = [
    { id: 'weekly', label: '주간 시간표', icon: Calendar },
    { id: 'diary', label: '수업 일지', icon: BookOpen },
    { id: 'students', label: '학생 관리', icon: Users },
    { id: 'backup', label: '백업 및 복원', icon: HardDrive },
  ];

  // 외부 클릭 시 테마 팝오버 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target)) {
        setIsPaletteOpen(false);
      }
    };
    if (isPaletteOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPaletteOpen]);

  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo">
          <BookOpen size={20} color="#ffffff" />
        </div>
        <div className="brand-titles">
          <span className="brand-title">MyDiary</span>
          <span className="brand-badge">Desktop v0.6.0</span>
        </div>
      </div>

      <nav className="header-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(tab.id)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="header-actions">
        {/* 🎨 퀵 테마 팔레트 선택기 */}
        <div className="header-theme-wrapper" ref={paletteRef}>
          <button
            className={`header-theme-btn ${isPaletteOpen ? 'active' : ''}`}
            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
            title="화면 테마 색상 변경"
          >
            <Palette size={15} />
            <span>테마</span>
          </button>

          {isPaletteOpen && (
            <div className="theme-popover-dropdown">
              <div className="theme-popover-header">
                <span>🎨 화면 테마 선택</span>
              </div>
              <div className="theme-popover-list">
                {THEME_PRESETS.map((t) => {
                  const isSelected = currentTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      className={`theme-popover-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        onSelectTheme(t.id);
                        setIsPaletteOpen(false);
                      }}
                    >
                      <span
                        className="theme-color-chip"
                        style={{ backgroundColor: t.primary }}
                      />
                      <div className="theme-item-text">
                        <span className="theme-item-name">{t.name}</span>
                        <span className="theme-item-sub">{t.subtitle}</span>
                      </div>
                      {isSelected && <Check size={15} className="theme-check-icon" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 📖 도움말 버튼 */}
        <button
          className="header-help-btn"
          onClick={onOpenHelp}
          title="도움말 및 사용 가이드 (단축키: F1)"
        >
          <HelpCircle size={15} />
          <span>도움말 (F1)</span>
        </button>

        <div className="user-profile-badge">
          <Laptop size={14} />
          <span
            className="user-profile-clickable"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            title="클릭하여 교사명 및 교실/기관명 변경 (HWPX 문서 작성자 연동)"
          >
            {teacherProfile.teacherName} 선생님 ({teacherProfile.orgName}) ▾
          </span>
          {isProfileOpen && (
            <form className="profile-popover-dropdown" onSubmit={handleSaveProfile} ref={profileRef}>
              <div className="theme-popover-header">
                <span>👩‍🏫 교사 및 기관명 설정</span>
              </div>
              <div className="profile-popover-body">
                <label className="form-label">선생님 성함 (HWPX 작성자)</label>
                <input
                  type="text"
                  className="form-input sm"
                  value={draftTeacherName}
                  onChange={(e) => setDraftTeacherName(e.target.value)}
                  placeholder="예: 성백진"
                />
                <label className="form-label">소속 / 교실 모드 표기</label>
                <input
                  type="text"
                  className="form-input sm"
                  value={draftOrgName}
                  onChange={(e) => setDraftOrgName(e.target.value)}
                  placeholder="예: 교실 모드 / OO초교 / OO학원"
                />
                <div className="profile-popover-actions">
                  <button type="button" className="btn-secondary sm" onClick={() => setIsProfileOpen(false)}>
                    취소
                  </button>
                  <button type="submit" className="btn-primary sm">
                    저장
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </header>
  );
};
