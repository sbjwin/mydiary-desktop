import React, { useState, useEffect } from 'react';
import {
  X,
  HelpCircle,
  Calendar,
  BookOpen,
  Users,
  HardDrive,
  Mail,
  ExternalLink,
  Search,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  Laptop,
} from 'lucide-react';

export const HelpModal = ({ isOpen, onClose, initialTab = 'guide' }) => {
  const [activeMainTab, setActiveMainTab] = useState(initialTab); // 'guide' | 'faq' | 'about'
  const [activeGuideScreen, setActiveGuideScreen] = useState('weekly'); // 'weekly' | 'diary' | 'students' | 'backup'
  const [faqSearch, setFaqSearch] = useState('');

  // initialTab 변경 시 동기화
  useEffect(() => {
    if (initialTab) setActiveMainTab(initialTab);
  }, [initialTab]);

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

  // 화면별 상세 가이드 데이터 (실행 화면 캡처 기반)
  const screensGuideData = {
    weekly: {
      id: 'weekly',
      title: '주간 시간표 (Weekly Schedule)',
      badge: '핵심 대시보드',
      desc: '1주일 단위의 전체 수업 일정을 요일별 컬럼으로 한눈에 파악하고, 수업 카드를 클릭하여 즉시 일지를 작성할 수 있는 메인 대시보드입니다.',
      image: '/guide/guide_weekly.png',
      features: [
        {
          num: '①',
          title: '주간 내비게이터 & 통계',
          desc: '좌우 화살표 버튼으로 지난 주나 다음 주를 자유롭게 탐색할 수 있으며, [이번 주] 버튼으로 오늘 속한 주차로 즉시 복귀합니다. 우측에는 이번 주 총 계획 수업 건수가 실시간 집계됩니다.',
          tip: '주 단위 이동 단축 지원',
        },
        {
          num: '②',
          title: '7요일 와이드 시간표 그리드',
          desc: '월요일부터 일요일까지 7개 요일의 수업 일정이 열(Column) 형태로 정렬됩니다. 오늘 날짜는 파란색 테두리와 하이라이트로 직관적으로 강조되어 일정을 놓치지 않습니다.',
          tip: '오늘 날짜 시각적 자동 강조',
        },
        {
          num: '③',
          title: '수업 일정 카드 & 일지 즉시 연동',
          desc: '수업 시간, 학생 이름, 수강 과목, 학생/학부모 연락처가 카드에 표시됩니다. 카드를 클릭하면 해당 학생의 해당 일자 수업 일지 작성 화면으로 바로 자동 이동합니다.',
          tip: '원클릭 일지 작성 화면 전환',
        },
        {
          num: '④',
          title: '주간 공지 및 주요 전달사항 메모',
          desc: '하단의 메모장에 이번 주 학부모 상담 일정, 학원 휴강일, 주간 목표 등 중요 전달사항을 기록하고 [메모 저장] 버튼으로 안전하게 보관할 수 있습니다.',
          tip: '주간별 개별 독립 저장',
        },
      ],
    },
    diary: {
      id: 'diary',
      title: '수업 일지 (Class Diary)',
      badge: '2열 마스터-디테일',
      desc: '학생별/날짜별 수업 진도, 과제, 학생 태도를 체계적으로 기록하고 공문서 표준 한글(HWPX) 문서 저장 및 A4 인쇄를 원클릭으로 처리합니다.',
      image: '/guide/guide_diary.png',
      features: [
        {
          num: '①',
          title: '학생 필터 & 실시간 일지 검색',
          desc: '좌측 상단 드롭다운으로 특정 학생의 일지만 모아보거나, 과목·날짜·내용 키워드로 과거에 작성했던 수업 기록을 빠르게 검색할 수 있습니다.',
          tip: '키워드 실시간 즉시 필터링',
        },
        {
          num: '②',
          title: '새 일지 작성 & 과거 기록 목록',
          desc: '좌측 목록에서 지난 일지를 클릭하여 언제든 내용을 확인하고 수정할 수 있으며, [+ 새 일지 작성] 버튼을 누르면 새로운 일지 작성 폼이 초기화됩니다.',
          tip: '이전 학습 진도 연속성 유지',
        },
        {
          num: '③',
          title: '상세 진도 및 과제/태도 에디터',
          desc: '대상 학생, 수업 일자, 시간, 과목 태그와 함께 [학습 진도 및 지도 내용], [과제 및 숙제], [수업 태도 및 특이사항]을 나누어 꼼꼼하게 기록합니다.',
          tip: '단축 과목 태그 원클릭 입력',
        },
        {
          num: '④',
          title: '한글 문서(HWPX) 저장 & 인쇄',
          desc: '상단의 [한글 문서(HWPX) 저장]을 누르면 한글과컴퓨터 표준 공문서 양식(*.hwpx)으로 PC에 저장되며, [인쇄 / 미리보기]로 깔끔한 A4 용지 출력이 가능합니다.',
          tip: 'HWPX 표준 OWPML 포맷 100% 지원',
        },
      ],
    },
    students: {
      id: 'students',
      title: '학생 관리 (Student Management)',
      badge: '수강생 통합 관리',
      desc: '학생의 기본 인적사항, 학부모 연락처, 정규 수업 요일/시간 매핑, 그리고 수강 차수(Terms) 및 휴회/재수강 이력을 전문적으로 관리합니다.',
      image: '/guide/guide_students.png',
      features: [
        {
          num: '①',
          title: '재원생 / 휴회생 필터 & 등록',
          desc: '상단 탭으로 현재 수업 중인 [재원생], 일시 정지된 [휴회생], [전체] 목록을 구분하여 볼 수 있으며, [+ 신규 학생 등록] 버튼으로 신규 수강생을 추가합니다.',
          tip: '수강 상태별 탭 필터링',
        },
        {
          num: '②',
          title: '학생 인적사항 & 보호자 정보',
          desc: '학생 성명, 학교 및 학년, 최초 입회일, 학습/결제 방식뿐만 아니라 학생 연락처, 학부모 비상 연락처, 거주지 주소를 체계적으로 등록하고 관리합니다.',
          tip: '안전한 개인 로컬 보관',
        },
        {
          num: '③',
          title: '정규 수업 기본 시간표 자동 매핑',
          desc: '이 학생의 정규 수업 요일(월~일), 시작 시간, 수업 시간(분), 과목을 등록해 두면 주간 시간표 탭을 열 때마다 매주 자동으로 수업 일정이 배치됩니다.',
          tip: '주간 시간표 자동 일정 생성의 원천',
        },
        {
          num: '④',
          title: '수강 차수 이력 & 관리카드 출력',
          desc: '[휴회 처리]와 [재수강 시작] 기능으로 학생의 수강 차수(1차, 2차...)를 정밀하게 관리하고, [관리카드 출력]을 통해 A4 규격의 학생 대장을 인쇄할 수 있습니다.',
          tip: '공식 학원/교실 양식 A4 출력',
        },
      ],
    },
    backup: {
      id: 'backup',
      title: '백업 및 설정 (Backup & Settings)',
      badge: '데이터 안전 보관',
      desc: '학생 정보, 수업 일지, 주간 시간표 데이터를 안전한 JSON 파일로 컴퓨터에 백업하고 모바일 MyDiary 앱과도 완벽하게 상호 복원합니다.',
      image: '/guide/guide_backup.png',
      features: [
        {
          num: '①',
          title: '보관 데이터 요약 통계',
          desc: '현재 컴퓨터 로컬 데이터베이스에 보관 중인 등록 학생 수, 작성된 누적 수업 일지 수, 관리 중인 주간 계획 수를 직관적인 카드로 한눈에 확인합니다.',
          tip: '데이터베이스 상태 실시간 점검',
        },
        {
          num: '②',
          title: 'PC 로컬 백업 파일 생성 (.json)',
          desc: '[원클릭 백업 파일 저장] 버튼을 클릭하면 컴퓨터의 파일 탐색기가 열리며 원하는 폴더에 날짜가 명시된 JSON 백업 파일로 즉시 안전하게 저장됩니다.',
          tip: 'PC 로컬 영구 보관용 백업',
        },
        {
          num: '③',
          title: '백업 불러오기 & 모바일 앱 호환',
          desc: 'PC에서 백업한 파일은 물론, 모바일 스마트폰 MyDiary 앱에서 내보낸 백업 JSON 파일도 데스크톱에서 완벽하게 호환 복원되어 기기 간 데이터 이전이 편리합니다.',
          tip: '모바일 MyDiary JSON 100% 호환',
        },
        {
          num: '④',
          title: '오프라인 독립형 스토리지 보장',
          desc: '인터넷 연결이 전혀 없어도 로컬 IndexedDB를 통해 모든 기능이 100% 독립적으로 작동하며, 외부 유출 걱정 없이 데이터 무결성을 보호합니다.',
          tip: '100% 오프라인 동작 및 프라이버시',
        },
      ],
    },
  };

  // FAQ 데이터 (데스크톱 특화)
  const faqs = [
    {
      q: '주간 시간표에서 수업 일지로 어떻게 연결되나요?',
      a: '주간 시간표 탭에서 배치되어 있는 학생의 수업 카드를 마우스로 클릭하시면, 해당 학생의 정보와 날짜, 시간이 자동으로 채워진 상태로 [수업 일지] 탭으로 즉시 이동하여 편리하게 일지를 작성하실 수 있습니다.',
    },
    {
      q: '한글 문서(*.hwpx)는 어떻게 생성되고 열람하나요?',
      a: '[수업 일지] 탭에서 [한글 문서(HWPX) 저장] 버튼을 누르면 컴퓨터의 파일 탐색기 저장 창이 열립니다. 저장된 .hwpx 파일은 한글과컴퓨터 한글 오피스 2014/2020/2024, 한글 뷰어, 폴라리스 오피스 등에서 원본 서식 그대로 열어 편집하실 수 있습니다.',
    },
    {
      q: '모바일 스마트폰 MyDiary 앱 데이터를 가져올 수 있나요?',
      a: '네, 완벽하게 지원합니다! 모바일 MyDiary 앱의 [설정] 메뉴에서 생성한 백업 JSON 파일을 PC로 전송한 후, 데스크톱의 [백업 및 설정] 탭에서 [백업 파일 불러오기 (.json)]를 실행하시면 모든 학생 정보와 수업 일지가 그대로 이전됩니다.',
    },
    {
      q: '주간 시간표에 학생 수업은 어떻게 자동으로 나오게 하나요?',
      a: '[학생 관리] 탭에서 해당 학생의 상세 정보로 들어간 뒤, [정규 수업 기본 시간표 설정] 항목에 수업 요일(예: 월요일, 수요일), 시작 시간(예: 14:00), 수업 시간(분)을 등록해 두시면 주간 시간표 탭을 열 때 매주 자동으로 배치됩니다.',
    },
    {
      q: '인터넷 연결이 없는 오프라인 환경에서도 작동하나요?',
      a: '네, MyDiary Desktop은 100% 오프라인 독립형(Offline-First) 데스크톱 프로그램입니다. 모든 데이터가 사용자의 컴퓨터 로컬 디스크에만 안전하게 보관되므로 인터넷 없이도 수업 일지 작성, 학생 관리, 시간표 조회, HWPX 문서 생성을 제약 없이 이용하실 수 있습니다.',
    },
    {
      q: '키보드 단축키를 지원하나요?',
      a: '네! 언제든지 키보드의 [F1] 키를 누르면 본 도움말 창이 바로 열리며, [ESC] 키를 누르면 열려있는 모달 창을 빠르게 닫을 수 있습니다.',
    },
  ];

  const filteredFaqs = faqs.filter((item) => {
    if (!faqSearch) return true;
    const q = faqSearch.toLowerCase();
    return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q);
  });

  const handleOpenEmail = () => {
    const mailUrl = 'mailto:sbjwin4271@gmail.com';
    if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(mailUrl);
    } else {
      window.open(mailUrl, '_blank');
    }
  };

  const currentScreen = screensGuideData[activeGuideScreen];

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 */}
        <div className="help-modal-header">
          <div className="help-header-title-box">
            <div className="help-icon-circle">
              <HelpCircle size={22} color="#ffffff" />
            </div>
            <div>
              <div className="help-title-row">
                <h3 className="help-title">MyDiary Desktop 도움말 및 사용 가이드</h3>
                <span className="help-version-tag">Desktop v0.2.0</span>
              </div>
              <p className="help-subtitle">
                선생님을 위한 스마트 수업 다이어리 핵심 기능과 화면별 사용법을 확인하세요.
              </p>
            </div>
          </div>
          <button className="help-close-btn" onClick={onClose} title="닫기 (ESC)">
            <X size={20} />
          </button>
        </div>

        {/* 3대 메인 탭 전환 바 */}
        <div className="help-main-tabs">
          <button
            className={`help-main-tab-btn ${activeMainTab === 'guide' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('guide')}
          >
            <BookOpen size={16} />
            <span>화면별 기능 가이드</span>
          </button>
          <button
            className={`help-main-tab-btn ${activeMainTab === 'faq' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('faq')}
          >
            <HelpCircle size={16} />
            <span>자주 묻는 질문 (FAQ)</span>
          </button>
          <button
            className={`help-main-tab-btn ${activeMainTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('about')}
          >
            <Info size={16} />
            <span>앱 소개 및 개발자 정보</span>
          </button>
        </div>

        {/* 모달 본문 영역 */}
        <div className="help-modal-body">
          {/* 1. 화면별 기능 가이드 (실제 실행 그림 + 영역별 콜아웃) */}
          {activeMainTab === 'guide' && (
            <div className="help-guide-section">
              {/* 화면 선택 서브 탭 */}
              <div className="guide-sub-tabs">
                <button
                  className={`guide-sub-tab-btn ${activeGuideScreen === 'weekly' ? 'active' : ''}`}
                  onClick={() => setActiveGuideScreen('weekly')}
                >
                  <Calendar size={15} />
                  <span>주간 시간표</span>
                </button>
                <button
                  className={`guide-sub-tab-btn ${activeGuideScreen === 'diary' ? 'active' : ''}`}
                  onClick={() => setActiveGuideScreen('diary')}
                >
                  <BookOpen size={15} />
                  <span>수업 일지</span>
                </button>
                <button
                  className={`guide-sub-tab-btn ${activeGuideScreen === 'students' ? 'active' : ''}`}
                  onClick={() => setActiveGuideScreen('students')}
                >
                  <Users size={15} />
                  <span>학생 관리</span>
                </button>
                <button
                  className={`guide-sub-tab-btn ${activeGuideScreen === 'backup' ? 'active' : ''}`}
                  onClick={() => setActiveGuideScreen('backup')}
                >
                  <HardDrive size={15} />
                  <span>백업 및 설정</span>
                </button>
              </div>

              {/* 선택된 화면 개요 배너 */}
              <div className="guide-screen-intro-banner">
                <div className="intro-badge-row">
                  <span className="intro-screen-badge">{currentScreen.badge}</span>
                  <h4 className="intro-screen-title">{currentScreen.title}</h4>
                </div>
                <p className="intro-screen-desc">{currentScreen.desc}</p>
              </div>

              {/* 실제 실행 화면 캡처 뷰어 (윈도우 모니터 프레임 스타일) */}
              <div className="guide-screenshot-frame">
                <div className="screenshot-window-bar">
                  <div className="window-dots">
                    <span className="dot dot-red"></span>
                    <span className="dot dot-yellow"></span>
                    <span className="dot dot-green"></span>
                  </div>
                  <span className="window-title">실행 화면 미리보기 - {currentScreen.title}</span>
                  <span className="window-hint">데스크톱 1280x800 와이드 뷰</span>
                </div>
                <div className="screenshot-img-wrapper">
                  <img
                    src={currentScreen.image}
                    alt={currentScreen.title}
                    className="screenshot-img"
                  />
                </div>
              </div>

              {/* 각 영역별 번호 콜아웃 기능 안내 그리드 */}
              <div className="guide-features-container">
                <h5 className="features-group-title">
                  <Sparkles size={16} className="text-primary" />
                  주요 영역별 기능 안내 (①, ②, ③, ④)
                </h5>
                <div className="features-grid">
                  {currentScreen.features.map((item, idx) => (
                    <div key={idx} className="feature-callout-card">
                      <div className="feature-card-header">
                        <span className="callout-num-badge">{item.num}</span>
                        <strong className="feature-item-title">{item.title}</strong>
                      </div>
                      <p className="feature-item-desc">{item.desc}</p>
                      <div className="feature-item-tip">
                        <CheckCircle2 size={13} className="text-primary" />
                        <span>{item.tip}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. FAQ 탭 */}
          {activeMainTab === 'faq' && (
            <div className="help-faq-section">
              {/* FAQ 검색창 */}
              <div className="faq-search-box">
                <Search size={16} className="text-muted" />
                <input
                  type="text"
                  placeholder="궁금하신 기능이나 단어를 검색하세요 (예: 한글, 백업, 시간표, 단축키)..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                />
                {faqSearch && (
                  <button className="search-clear-btn" onClick={() => setFaqSearch('')}>
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* FAQ 질문 목록 */}
              <div className="faq-list">
                {filteredFaqs.length === 0 ? (
                  <div className="empty-faq-notice">
                    검색 결과가 없습니다. 다른 키워드로 검색해 보세요.
                  </div>
                ) : (
                  filteredFaqs.map((faq, idx) => (
                    <div key={idx} className="faq-item-card">
                      <div className="faq-q-row">
                        <span className="faq-badge q">Q</span>
                        <strong className="faq-question-text">{faq.q}</strong>
                      </div>
                      <div className="faq-divider"></div>
                      <div className="faq-a-row">
                        <span className="faq-badge a">A</span>
                        <p className="faq-answer-text">{faq.a}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 3. 앱 소개 & 개발자 정보 탭 */}
          {activeMainTab === 'about' && (
            <div className="help-about-section">
              {/* 프로필 카드 */}
              <div className="about-profile-card">
                <div className="about-avatar-box">
                  <BookOpen size={36} color="#ffffff" />
                </div>
                <h4 className="about-app-name">MyDiary Desktop</h4>
                <p className="about-app-slogan">선생님을 위한 스마트 수업 다이어리 및 학생 성장 관리 시스템</p>
                <div className="about-badges-row">
                  <span className="about-badge">Desktop v0.2.0</span>
                  <span className="about-badge">Electron + React</span>
                  <span className="about-badge">HWPX 표준 지원</span>
                </div>
              </div>

              {/* 개발 취지 카드 */}
              <div className="about-info-card">
                <div className="info-card-header">
                  <Sparkles size={18} className="text-primary" />
                  <strong>앱 기획 및 개발 취지</strong>
                </div>
                <p className="about-text-p">
                  선생님들이 수업 일지와 학생 관리에 들이는 반복적인 행정 시간을 대폭 줄이고, 오롯이 아이들과의 수업 및 교육에 집중할 수 있도록 돕기 위해 개발된 개인 맞춤형 데스크톱 수업 다이어리입니다.
                </p>
                <p className="about-text-p">
                  불필요한 복잡한 기능은 과감히 덜어내고, 한눈에 보이는 7요일 와이드 시간표, 직관적인 2열 수업 일지, 학생별 정규 시간표 자동 연동, 공문서 표준 한글(HWPX) 저장 및 안전한 로컬 오프라인 데이터 보관 기능을 데스크톱 화면에 최적화하여 담았습니다.
                </p>
              </div>

              {/* 개발자 및 문의 카드 */}
              <div className="about-info-card">
                <div className="info-card-header">
                  <Mail size={18} className="text-primary" />
                  <strong>기획 및 개발자 문의 / 기술 지원</strong>
                </div>
                <p className="about-text-p">
                  MyDiary Desktop을 사용하시면서 제안하고 싶으신 개선 아이디어나 사용 중 문의사항, 버그 제보가 있으시면 언제든지 편하게 연락해 주세요.
                </p>

                <div className="developer-profile-box">
                  <div className="dev-meta-row">
                    <span className="dev-label">기획 / 개발자:</span>
                    <strong className="dev-value">Sung Baekjin (성백진)</strong>
                  </div>
                  <div className="dev-meta-row">
                    <span className="dev-label">이메일 문의:</span>
                    <button className="dev-email-link-btn" onClick={handleOpenEmail}>
                      <Mail size={14} />
                      <span>sbjwin4271@gmail.com</span>
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* 저작권 표시 */}
              <div className="about-copyright-footer">
                <p>© 2026 Sung Baekjin (성백진). All rights reserved.</p>
              </div>
            </div>
          )}
        </div>

        {/* 모달 푸터 */}
        <div className="help-modal-footer">
          <div className="footer-shortcut-hint">
            <span className="kbd-badge">F1</span> 키를 눌러 언제든 도움말을 다시 열 수 있습니다.
          </div>
          <button className="btn-secondary" onClick={onClose}>
            닫기 (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};
