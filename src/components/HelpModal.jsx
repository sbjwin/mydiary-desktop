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
      badge: '시간표 매트릭스 & 대시보드',
      desc: '시간대별 주간 전체 표(오전~저녁 8시, 점심시간)와 요일별 카드 뷰를 전환하며, 빈 칸의 + 버튼으로 수업을 즉시 등록하고 일지 작성으로 연동할 수 있는 메인 대시보드입니다.',
      image: '/guide/guide_weekly.png',
      features: [
        {
          num: '①',
          title: '주간 내비게이터 & 듀얼 뷰 전환',
          desc: '[▦ 주간 전체 표 (PDF 서식)]과 [:= 요일별 상세 보기] 뷰 모드를 자유롭게 전환할 수 있으며, 주차 이동 버튼 및 이번 주 총 등록 수업 건수가 실시간 집계됩니다.',
          tip: '서식 표 ↔ 카드 뷰 원클릭 전환',
        },
        {
          num: '②',
          title: '시간대별 매트릭스 표 & 점심시간 배너',
          desc: '오전 9시부터 저녁 8시까지 7개 요일의 시간표가 매트릭스로 정렬되며, 12:00~13:00 즐거운 점심 시간(🍱☕) 가로 병합 배너가 표시됩니다. 오늘 날짜는 파란색으로 자동 강조됩니다.',
          tip: '시간대별 시각적 전체 조망',
        },
        {
          num: '③',
          title: '원클릭 수업 등록(+) & 일지 연동 모달',
          desc: '빈 시간대 셀의 [+] 버튼을 누르면 요일/시간이 자동 세팅된 일정 등록 창이 열리며, 학생 선택 시 과목·연락처·주소가 자동 채워집니다. 기존 수업 카드 클릭 시 수정/삭제 및 [수업 일지 작성 바로가기]를 지원합니다.',
          tip: '특이사항 퀵 태그 및 일지 즉시 연동',
        },
        {
          num: '④',
          title: '인쇄 / PDF / 한글(HWPX) / 워드(DOCX) 내보내기',
          desc: '상단 툴바의 버튼들을 통해 이번 주 전체 수업 일정 보고서를 A4 종이로 즉시 출력하거나 PDF 저장, 공문서 표준 한글(*.hwpx) 및 워드(*.docx) 파일로 안전하게 내보낼 수 있습니다.',
          tip: '주간 보고서 다중 포맷 원클릭 출력',
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
      badge: '학습 차수 & 시간표',
      desc: '재원생/휴회생별 기본 인적사항, 학부모 연락처, 요일별 정규 수업 시간표, 차수별 학습 히스토리를 꼼꼼하게 등록하고 관리합니다.',
      image: '/guide/guide_students.png',
      features: [
        {
          num: '①',
          title: '재원생 / 휴회생 탭 필터',
          desc: '현재 수업 중인 재원생 목록과 잠시 쉬는 휴회생 목록을 분리하여 조회할 수 있으며, 학생 검색창을 통해 이름으로 즉시 학생을 찾을 수 있습니다.',
          tip: '상태별 맞춤형 목록 분류',
        },
        {
          num: '②',
          title: '기본 정보 & 연락처 정규화',
          desc: '학생 및 학부모 전화번호를 등록하면 (본)010-XXXX, (모)010-XXXX 형식으로 자동 정규화되어 시간표와 보고서에 깔끔하게 반영됩니다.',
          tip: '연락처 서식 자동 교정',
        },
        {
          num: '③',
          title: '정규 수업 기본 시간표 등록',
          desc: '요일, 시작 시간, 수업 시간을 학생 프로필에 등록해 두면 매주 주간 시간표를 열 때 해당 학생의 수업 일정이 자동으로 생성됩니다.',
          tip: '매주 반복 수업 자동 스케줄링',
        },
        {
          num: '④',
          title: '수강 차수(Term) 이력 관리',
          desc: '수강 기간별 1차, 2차 등 차수 시작일과 종료일, 해당 차수 동안 작성된 수업 일지 건수를 한눈에 확인하고 새 차수를 시작할 수 있습니다.',
          tip: '학생별 장기 성장 이력 추적',
        },
      ],
    },
    backup: {
      id: 'backup',
      title: '백업 및 설정 (Backup & Settings)',
      badge: '데이터 안전 보관 & 클라우드',
      desc: '구글 드라이브를 통해 스마트폰과 PC 간에 원클릭으로 데이터를 동기화하고, PC 로컬 JSON 파일 백업으로 소중한 교육 데이터를 안전하게 이중 보관합니다.',
      image: '/guide/guide_backup.png',
      features: [
        {
          num: '①',
          title: '구글 드라이브 원클릭 클라우드 동기화 (v0.3.0)',
          desc: '구글 계정으로 로그인한 뒤, 스마트폰 MyDiary 앱이 업로드한 mydiary_backup.json을 데스크톱으로 원클릭 복원하거나 현재 데스크톱 데이터를 클라우드에 백업할 수 있습니다.',
          tip: '스마트폰 ↔ 데스크톱 무선 데이터 동기화',
        },
        {
          num: '②',
          title: '보관 데이터 요약 통계',
          desc: '현재 컴퓨터 로컬 데이터베이스에 보관 중인 등록 학생 수, 작성된 누적 수업 일지 수, 관리 중인 주간 계획 수를 직관적인 카드로 한눈에 확인합니다.',
          tip: '데이터베이스 상태 실시간 점검',
        },
        {
          num: '③',
          title: 'PC 로컬 백업 파일 생성 (.json)',
          desc: '[원클릭 백업 파일 저장] 버튼을 클릭하면 컴퓨터의 파일 탐색기가 열리며 원하는 폴더에 날짜가 명시된 JSON 백업 파일로 즉시 안전하게 저장됩니다.',
          tip: 'PC 로컬 영구 보관용 백업',
        },
        {
          num: '④',
          title: '오프라인 독립형 스토리지 보장',
          desc: '인터넷 연결이 전혀 없어도 로컬 스토리지를 통해 모든 기능이 100% 독립적으로 작동하며, 외부 유출 걱정 없이 데이터 무결성을 보호합니다.',
          tip: '100% 오프라인 동작 및 프라이버시',
        },
      ],
    },
  };

  // FAQ 데이터 (데스크톱 특화)
  const faqs = [
    {
      q: '스마트폰 MyDiary 앱 데이터를 구글 드라이브로 어떻게 연동하나요?',
      a: '[백업 및 설정] 탭에서 [구글 계정으로 로그인]을 진행하신 후 [스마트폰 백업 다운로드 복원]을 클릭하시면, 스마트폰 앱에서 구글 드라이브로 올린 mydiary_backup.json 데이터를 데스크톱으로 즉시 안전하게 복원할 수 있습니다.',
    },
    {
      q: '과거에 작성했던 수업 일지를 어떻게 수정(편집)하나요?',
      a: '[수업 일지] 탭의 좌측 사이드바 목록에서 수정하고자 하는 과거 일지 카드를 마우스로 클릭하시면, 우측 화면이 [수업 일지 상세 및 수정] 모드로 전환되며 기존 내용이 채워져 자유롭게 수정 후 [저장하기]를 누르시면 됩니다.',
    },
    {
      q: '주간 시간표에서 빈 시간에 새 수업 일정을 어떻게 추가하나요?',
      a: '[▦ 주간 전체 표] 화면에서 원하는 요일과 시간대 칸에 마우스를 올리면 나타나는 [+] 버튼을 누르시면, 해당 날짜와 시작 시간이 자동으로 채워진 수업 일정 등록 모달이 열립니다. 학생을 선택하거나 직접 입력하고 [등록]을 누르면 즉시 시간표에 반영됩니다.',
    },
    {
      q: '주간 시간표에서 수업 일지로 어떻게 연결되나요?',
      a: '주간 시간표에서 배치되어 있는 학생의 수업 카드를 마우스로 클릭하시면, 상세 수정 모달에서 [수업 일지 작성] 버튼을 눌러 해당 학생과 일자의 수업 일지 탭으로 즉시 이동합니다. 이미 일지가 작성된 수업인 경우 기존 일지 내용이 자동으로 열립니다.',
    },
    {
      q: '주간 시간표를 종이로 인쇄하거나 문서 파일로 내보낼 수 있나요?',
      a: '네! 주간 시간표 상단 툴바의 [🖨️ 인쇄 / PDF], [📄 한글(HWPX)], [📝 워드(DOCX)] 버튼을 누르면 A4 규격의 주간 업무 보고서를 바로 인쇄하거나 한글/워드 파일 형태로 안전하게 저장하실 수 있습니다.',
    },
    {
      q: '한글 문서(*.hwpx)는 어떻게 생성되고 열람하나요?',
      a: '[수업 일지] 탭에서 [한글 문서(HWPX) 저장] 버튼을 누르면 컴퓨터의 파일 탐색기 저장 창이 열립니다. 저장된 .hwpx 파일은 한글과컴퓨터 한글 오피스 2014/2020/2024, 한글 뷰어, 폴라리스 오피스 등에서 원본 서식 그대로 열어 편집하실 수 있습니다.',
    },
    {
      q: '모바일 스마트폰 MyDiary 앱 데이터를 파일로도 가져올 수 있나요?',
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
      a: '네! 언제든지 키보드의 [F1] 키를 누르면 본 도움말 창이 바로 열리며, [ESC] 키를 누르면 열려있는 모달 창을 빠르게 닫을 수 있습니다. 또한 [Ctrl+P]로 인쇄 창을 열 수 있습니다.',
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
                <span className="help-version-tag">Desktop v0.3.0</span>
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
                  <span className="about-badge">Desktop v0.3.0</span>
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
