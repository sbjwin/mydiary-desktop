import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Palette,
  Sliders,
  Info,
  Check,
  CheckCircle,
  BookOpen,
} from 'lucide-react';
import { THEME_PRESETS } from '../theme';

export const SettingsModal = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  const [activeTab, setActiveTab] = useState('theme'); // 'theme' | 'general' | 'about'

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div
        className="settings-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* 상단 헤더 */}
        <div className="settings-modal-header">
          <div className="settings-header-title">
            <div className="settings-icon-badge">
              <Settings size={20} />
            </div>
            <div>
              <h3>환경 설정 (Preferences)</h3>
              <p className="settings-header-desc">
                화면 테마, 기본 작업 환경 및 애플리케이션 정보를 설정합니다.
              </p>
            </div>
          </div>
          <button
            className="settings-modal-close"
            onClick={onClose}
            title="설정 창 닫기 (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="settings-modal-nav">
          <button
            className={`settings-nav-btn ${activeTab === 'theme' ? 'active' : ''}`}
            onClick={() => setActiveTab('theme')}
          >
            <Palette size={16} />
            <span>화면 테마</span>
          </button>
          <button
            className={`settings-nav-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <Sliders size={16} />
            <span>일반 환경</span>
          </button>
          <button
            className={`settings-nav-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <Info size={16} />
            <span>프로그램 정보</span>
          </button>
        </div>

        {/* 탭 본문 영역 */}
        <div className="settings-modal-body">
          {/* 1. 화면 테마 탭 */}
          {activeTab === 'theme' && (
            <div className="settings-tab-content">
              <div className="settings-section-intro">
                <h4>화면 테마 설정 (Theme Preferences)</h4>
                <p>
                  작업 환경과 눈의 편안함에 맞게 테마를 선택하세요. 변경 사항은 즉시 화면에 반영되고 자동 저장됩니다.
                </p>
              </div>

              <div className="theme-cards-grid settings-theme-grid">
                {THEME_PRESETS.map((t) => {
                  const isSelected = currentTheme === t.id;
                  return (
                    <div
                      key={t.id}
                      className={`theme-preset-card ${isSelected ? 'active' : ''}`}
                      onClick={() => onSelectTheme(t.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div
                        className="theme-card-preview"
                        style={{ backgroundColor: t.previewBg }}
                      >
                        <div
                          className="mini-preview-header"
                          style={{ backgroundColor: t.previewHeader }}
                        >
                          <span className="mini-dot red" />
                          <span className="mini-dot yellow" />
                          <span className="mini-dot green" />
                          <span
                            className="mini-header-bar"
                            style={{ backgroundColor: t.primary }}
                          />
                        </div>
                        <div className="mini-preview-body">
                          <div className="mini-preview-sidebar">
                            <span
                              className="mini-line"
                              style={{ backgroundColor: t.primary }}
                            />
                            <span className="mini-line muted" />
                            <span className="mini-line muted" />
                          </div>
                          <div className="mini-preview-main">
                            <div
                              className="mini-card-chip"
                              style={{ backgroundColor: t.primaryLight }}
                            >
                              <span
                                className="mini-chip-text"
                                style={{ color: t.primary }}
                              >
                                MyDiary
                              </span>
                            </div>
                            <div
                              className="mini-badge-btn"
                              style={{ backgroundColor: t.primary }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="theme-card-info">
                        <div className="theme-card-title-row">
                          <span className="theme-card-name">{t.name}</span>
                          {isSelected ? (
                            <span className="theme-active-tag">
                              <Check size={12} />
                              사용 중
                            </span>
                          ) : (
                            <span className="theme-sub-badge">{t.subtitle}</span>
                          )}
                        </div>
                        <span className="theme-card-desc">{t.description}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. 일반 환경 탭 */}
          {activeTab === 'general' && (
            <div className="settings-tab-content">
              <div className="settings-section-intro">
                <h4>기본 작업 환경 (General Settings)</h4>
                <p>시간표 및 일지 작성 시 적용되는 기본 편의 설정을 확인합니다.</p>
              </div>

              <div className="settings-options-list">
                <div className="settings-option-item">
                  <div className="option-info">
                    <span className="option-title">기본 수업 진행 시간</span>
                    <span className="option-desc">시간표에서 수업 등록 시 기본으로 설정되는 시간 단위</span>
                  </div>
                  <div className="option-ctrl">
                    <span className="badge-setting">60분 (1시간)</span>
                  </div>
                </div>

                <div className="settings-option-item">
                  <div className="option-info">
                    <span className="option-title">주간 시간표 표시 범위</span>
                    <span className="option-desc">주간 매트릭스 그리드에 표시되는 표준 시간대</span>
                  </div>
                  <div className="option-ctrl">
                    <span className="badge-setting">09:00 ~ 20:00 (월~금)</span>
                  </div>
                </div>

                <div className="settings-option-item">
                  <div className="option-info">
                    <span className="option-title">데이터 동기화 보호 및 자동 백업</span>
                    <span className="option-desc">로컬 IndexedDB 무결성 보호 및 스마트폰 구글 드라이브 동기화 지원</span>
                  </div>
                  <div className="option-ctrl">
                    <span className="badge-setting success">
                      <CheckCircle size={13} /> 활성화됨
                    </span>
                  </div>
                </div>

                <div className="settings-option-item">
                  <div className="option-info">
                    <span className="option-title">한글 문서 (HWPX) 내보내기 규격</span>
                    <span className="option-desc">KS X 6101 OWPML 표준 한글 파일 생성 및 PC 다운로드 폴더 자동 연동</span>
                  </div>
                  <div className="option-ctrl">
                    <span className="badge-setting">표준 HWPX</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. 프로그램 정보 탭 */}
          {activeTab === 'about' && (
            <div className="settings-tab-content">
              <div className="settings-section-intro">
                <h4>애플리케이션 정보 (About MyDiary)</h4>
                <p>MyDiary 데스크톱 버전 및 개발자 정보입니다.</p>
              </div>

              <div className="settings-about-card">
                <div className="about-brand-row">
                  <div className="about-logo">
                    <BookOpen size={28} color="#ffffff" />
                  </div>
                  <div>
                    <h3 className="about-app-title">MyDiary Desktop</h3>
                    <div className="about-version-row">
                      <span className="about-version-badge">v0.4.2</span>
                      <span className="about-build-badge">Production Release</span>
                    </div>
                    <p className="about-app-desc">
                      선생님을 위한 맞춤형 학생 일지 및 수업 시간표 관리 솔루션
                    </p>
                  </div>
                </div>

                <div className="about-details-grid">
                  <div className="about-detail-item">
                    <span className="detail-label">개발자</span>
                    <span className="detail-value font-medium">성백진 (Sung Baekjin)</span>
                  </div>
                  <div className="about-detail-item">
                    <span className="detail-label">문의 메일</span>
                    <span className="detail-value">sbjwin4271@gmail.com</span>
                  </div>
                  <div className="about-detail-item">
                    <span className="detail-label">플랫폼 엔진</span>
                    <span className="detail-value">Electron + React + Vite</span>
                  </div>
                  <div className="about-detail-item">
                    <span className="detail-label">스토리지</span>
                    <span className="detail-value">Dexie.js (IndexedDB) & Google Drive API</span>
                  </div>
                  <div className="about-detail-item">
                    <span className="detail-label">지원 환경</span>
                    <span className="detail-value">Windows 10/11, macOS, Linux</span>
                  </div>
                  <div className="about-detail-item">
                    <span className="detail-label">라이선스</span>
                    <span className="detail-value">MIT License</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 하단 푸터 */}
        <div className="settings-modal-footer">
          <button className="btn-primary" onClick={onClose}>
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
