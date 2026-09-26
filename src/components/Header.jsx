import React, { useState, useRef, useEffect } from 'react';
import { Calendar, BookOpen, Users, HardDrive, Laptop, HelpCircle, Palette, Check } from 'lucide-react';
import { THEME_PRESETS } from '../theme';

export const Header = ({ activeTab, onSelectTab, onOpenHelp, currentTheme, onSelectTheme }) => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const paletteRef = useRef(null);

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
          <span className="brand-badge">Desktop v0.4.3</span>
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
          <span>성백진 선생님 (교실 모드)</span>
        </div>
      </div>
    </header>
  );
};
