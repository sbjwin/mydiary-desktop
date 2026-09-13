import React from 'react';
import { Calendar, BookOpen, Users, HardDrive, Laptop } from 'lucide-react';

export const Header = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'weekly', label: '주간 시간표', icon: Calendar },
    { id: 'diary', label: '수업 일지', icon: BookOpen },
    { id: 'students', label: '학생 관리', icon: Users },
    { id: 'backup', label: '백업 및 설정', icon: HardDrive },
  ];

  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo">
          <BookOpen size={20} color="#ffffff" />
        </div>
        <div className="brand-titles">
          <span className="brand-title">MyDiary</span>
          <span className="brand-badge">Desktop v0.1.0</span>
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
        <div className="user-profile-badge">
          <Laptop size={14} />
          <span>성백진 선생님 (교실 모드)</span>
        </div>
      </div>
    </header>
  );
};
