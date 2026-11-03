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
      desc: '시간대별 주간 전체 표(오전~저녁 8시, 점심시간)와 요일별 카드 뷰를 전환하며, 마우스 드래그 앤 드롭으로 일정을 자유롭게 이동하고 일지 작성으로 즉시 연동하는 메인 대시보드입니다.',
      image: './guide/guide_weekly.png',
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
          title: '마우스 드래그 앤 드롭 일정 이동 (v0.6.0)',
          desc: '수업 카드를 마우스로 잡고 원하는 요일이나 다른 교시 칸으로 끌어놓으면(Drag & Drop) 시작 시간과 요일이 즉시 변경되어 일정을 직관적으로 재배치할 수 있습니다.',
          tip: '마우스 드래그로 요일/시간 1초 변경',
        },
        {
          num: '④',
          title: '원클릭 수업 등록(+) & 일지 연동 모달',
          desc: '빈 시간대 셀의 [+] 버튼을 누르면 요일/시간이 자동 세팅된 일정 등록 창이 열리며, 학생 선택 시 과목·연락처·주소가 자동 채워집니다. 기존 수업 카드 클릭 시 수정/삭제 및 [수업 일지 작성 바로가기]를 지원합니다.',
          tip: '특이사항 퀵 태그 및 일지 즉시 연동',
        },
        {
          num: '⑤',
          title: '인쇄 / PDF / 한글(HWPX) / 워드(DOCX) 내보내기',
          desc: '상단 툴바의 [문서 내보내기 ▾] 드롭다운을 통해 이번 주 전체 수업 일정 보고서를 A4 종이로 즉시 출력하거나 PDF 저장, 공문서 표준 한글(*.hwpx) 및 워드(*.docx) 파일로 안전하게 내보낼 수 있습니다.',
          tip: '주간 보고서 다중 포맷 원클릭 출력',
        },
      ],
    },
    diary: {
      id: 'diary',
      title: '수업 일지 (Class Diary)',
      badge: '3단 와이드 워크스테이션',
      desc: '좌측(학생 및 일지 목록) - 중앙(상세 작성기) - 우측(학생 프로필 & 직전 수업 과제/교재 원클릭 참조 카드 및 상용구 칩) 3단 레이아웃을 통해 최적의 수업 기록 환경을 제공합니다.',
      image: './guide/guide_diary.png',
      features: [
        {
          num: '①',
          title: '기간별 복합 검색 & 상태 필터',
          desc: '학생 필터 외에도 [전체], [이번 주], [이번 달], [직접 선택] 기간 버튼과 작성 완료/임시저장 상태 칩을 조합하여 원하는 일지 목록을 빠르게 선별할 수 있습니다.',
          tip: '기간 및 키워드 복합 즉시 필터링',
        },
        {
          num: '②',
          title: '직전 수업 과제 및 교재 원클릭 참조',
          desc: '우측 참조 패널에 직전 수업에서 나갔던 진도, 교재, 과제가 자동으로 표시되며 [+ 본문에 삽입] 버튼을 누르면 오늘 일지의 숙제 확인 란으로 즉시 복사됩니다.',
          tip: '이전 학습 진도 연속성 완벽 유지',
        },
        {
          num: '③',
          title: '자주 쓰는 상용구 원클릭 칩',
          desc: '"숙제 검사 완료", "집중도 우수", "보충 지도 필요" 등 자주 사용하는 피드백 문구를 클릭 한 번으로 본문에 빠르게 삽입할 수 있습니다.',
          tip: '반복 타이핑 피로 대폭 경감',
        },
        {
          num: '④',
          title: 'HWPX 3종 양식 프리셋 & 다건 일괄 저장',
          desc: '[표준 서식], [결재란 포함 서식], [학부모 공유용 서식] 중 원하는 OWPML 양식을 선택하여 단일 일지를 저장하거나, 현재 학생의 전체 일지를 통합 문서로 일괄 저장할 수 있습니다.',
          tip: '기관 제출용 결재란 서식 완벽 지원',
        },
        {
          num: '⑤',
          title: '데스크톱 단축키 & 미저장 보호 (Ctrl+S)',
          desc: '작성 중 [Ctrl+S]로 즉시 저장할 수 있으며, 일지 수정 중 저장하지 않고 다른 탭으로 이동하려고 하면 안전 확인 모달이 표시되어 데이터를 보호합니다.',
          tip: 'Ctrl+S 단축키 및 데이터 유실 원천 차단',
        },
      ],
    },
    students: {
      id: 'students',
      title: '학생 관리 (Student Management)',
      badge: '학습 차수 & 성장 통계',
      desc: '재원생/휴회생별 기본 인적사항, 학부모 연락처, 요일별 정규 수업 시간표, 차수별 학습 히스토리 및 최근 6개월 수업 추이 통계를 체계적으로 관리합니다.',
      image: './guide/guide_students.png',
      features: [
        {
          num: '①',
          title: '재원생 / 휴회생 탭 필터',
          desc: '현재 수업 중인 재원생 목록과 잠시 쉬는 휴회생 목록을 분리하여 조회할 수 있으며, 학생 검색창을 통해 이름으로 즉시 학생을 찾을 수 있습니다.',
          tip: '상태별 맞춤형 목록 분류',
        },
        {
          num: '②',
          title: '최근 6개월 수업 추이 시각화 차트',
          desc: '학생을 선택하면 하단에 최근 6개월 동안의 월별 수업 횟수가 시각적인 바 차트로 렌더링되어 학습 주기와 출석 빈도를 한눈에 파악할 수 있습니다.',
          tip: '월별 수업 참여도 직관적 조망',
        },
        {
          num: '③',
          title: '최근 일지 5건 타임라인 바로가기',
          desc: '해당 학생의 가장 최근 수업 일지 5건의 날짜, 과목, 주요 진도가 카드로 나열되며 클릭 시 수업 일지 탭의 해당 기록으로 1초 만에 이동합니다.',
          tip: '최근 학습 히스토리 즉시 탐색',
        },
        {
          num: '④',
          title: '정규 수업 기본 시간표 등록',
          desc: '요일, 시작 시간, 수업 시간을 학생 프로필에 등록해 두면 매주 주간 시간표를 열 때 해당 학생의 수업 일정이 자동으로 생성됩니다.',
          tip: '매주 반복 수업 자동 스케줄링',
        },
        {
          num: '⑤',
          title: '수강 차수(Term) 이력 관리',
          desc: '수강 기간별 1차, 2차 등 차수 시작일과 종료일, 해당 차수 동안 작성된 수업 일지 건수를 한눈에 확인하고 새 차수를 시작할 수 있습니다.',
          tip: '학생별 장기 성장 이력 추적',
        },
      ],
    },
    backup: {
      id: 'backup',
      title: '백업 및 설정 (Backup & Settings)',
      badge: '스마트 병합 & 롤백 보호',
      desc: '구글 드라이브 클라우드 동기화 및 PC 로컬 백업을 관리하며, 복원 시 스마트 병합 옵션과 자동 롤백 스냅샷으로 소중한 데이터를 완벽히 보호합니다.',
      image: './guide/guide_backup.png',
      features: [
        {
          num: '①',
          title: '스마트 병합(Merge) 복원 정책 (권장)',
          desc: '백업 복원 시 기존 데스크톱 데이터를 무작정 덮어쓰지 않고, 고유 ID 및 키를 기준으로 기존 기록을 온전히 보존하면서 최신 데이터를 스마트하게 병합합니다.',
          tip: '데스크톱 신규 데이터 유실 원천 방어',
        },
        {
          num: '②',
          title: '자동 안전 롤백 스냅샷 & 1클릭 복구',
          desc: '복원을 실행하기 직전에 현재 시스템의 전체 상태가 안전 스냅샷으로 자동 백업되며, 복원 후 이상이 있을 경우 [직전 복원 취소 (롤백)] 버튼으로 1초 만에 원상 복구됩니다.',
          tip: '안전 스냅샷 기반 무손실 복구',
        },
        {
          num: '③',
          title: '구글 드라이브 클라우드 동기화',
          desc: '구글 계정으로 로그인한 뒤, 스마트폰 MyDiary 앱이 업로드한 mydiary_backup.json을 데스크톱으로 원클릭 복원하거나 현재 데스크톱 데이터를 클라우드에 백업할 수 있습니다.',
          tip: '스마트폰 ↔ 데스크톱 무선 데이터 동기화',
        },
        {
          num: '④',
          title: 'PC 로컬 백업 파일 생성 (.json)',
          desc: '[원클릭 백업 파일 저장] 버튼을 클릭하면 컴퓨터의 파일 탐색기가 열리며 원하는 폴더에 날짜가 명시된 JSON 백업 파일로 즉시 안전하게 저장됩니다.',
          tip: 'PC 로컬 영구 보관용 백업',
        },
        {
          num: '⑤',
          title: '헤더 선생님/기관명 프로필 영속화',
          desc: '헤더 우측의 [설정] 버튼을 통해 선생님 성함과 소속 교육기관명을 등록하면 HWPX 문서 출력 및 일지 상단에 자동으로 반영됩니다.',
          tip: '공문서 맞춤형 메타데이터 자동 연동',
        },
      ],
    },
  };

  // FAQ 데이터 (데스크톱 특화)
  const faqs = [
    {
      q: '데스크톱 전역 키보드 단축키는 어떤 것들이 있나요?',
      a: `주요 단축키 안내:
• [Ctrl + 1 ~ 4]: 주간 시간표(1), 수업 일지(2), 학생 관리(3), 백업/설정(4) 탭 즉시 전환
• [Ctrl + S]: 수업 일지 작성/수정 중 즉시 저장
• [Ctrl + N]: 수업 일지 탭에서 새 일지 작성 모드로 즉시 초기화
• [Ctrl + F]: 일지 및 학생 검색창으로 입력 포커스 즉시 이동
• [F1]: 본 도움말 및 사용 안내 모달 열기
• [ESC]: 열려있는 팝업이나 모달 창 닫기`,
    },
    {
      q: '주간 시간표에서 수업 일정을 마우스로 이동할 수 있나요?',
      a: '네! 시간표에 등록된 수업 카드를 마우스로 길게 클릭하여 끌어(Drag & Drop) 다른 요일이나 시간대의 빈 셀로 놓으면, 요일과 시작 시간이 자동으로 변경되어 매우 빠르고 편리하게 일정을 조정할 수 있습니다.',
    },
    {
      q: '한글(HWPX) 문서 출력 시 결재란 서식이나 학부모용 양식은 어떻게 선택하나요?',
      a: '[수업 일지] 탭 상단 툴바의 [한글 문서(HWPX) 저장 ▾] 드롭다운을 누르시면 [기본 표준 서식], [기관 제출용 결재란(담당/원장/학부모 서명) 서식], [학부모 공유용 요약 서식] 중 원하는 서식을 즉시 선택하실 수 있습니다. 또한 [선택 학생 전체 일지 일괄 저장]으로 해당 학생의 모든 일지를 한 파일로 묶어 내보낼 수도 있습니다.',
    },
    {
      q: '스마트폰 백업을 복원할 때 기존 PC 데이터가 지워지지 않나요?',
      a: '네, 걱정하지 않으셔도 됩니다! 기본 복원 모드가 [스마트 병합 (권장)]으로 설정되어 있어, 데스크톱에서 새롭게 등록한 학생이나 작성한 일지를 지우지 않고 모바일 백업의 최신 데이터와 안전하게 합쳐집니다. 또한 복원 실행 직전 안전 스냅샷이 자동 생성되므로 언제든 [직전 복원 취소 (롤백)] 버튼으로 되돌릴 수 있습니다.',
    },
    {
      q: '선생님 성함이나 학원/기관명은 어디서 설정하나요?',
      a: '화면 우측 상단 헤더의 [선생님/기관 설정] 버튼을 클릭하시면 팝오버가 열리며, 선생님 이름과 소속 기관명을 입력하고 저장할 수 있습니다. 입력된 정보는 한글(HWPX) 문서 출력 시 작성자 및 소속 기관명으로 자동 기재됩니다.',
    },
    {
      q: '화면 테마(색상)와 야간 다크모드는 어떻게 변경하나요?',
      a: '상단 헤더 오른쪽의 [🎨 테마] 버튼을 누르시면 5가지 테마(오션 블루, 포레스트 세이지, 로열 라벤더, 웜 선셋, 미드나잇 다크)를 1클릭으로 즉시 변경할 수 있습니다. 선택한 테마는 자동으로 저장되어 다음 실행 시에도 유지됩니다.',
    },
    {
      q: '스마트폰 MyDiary 앱 데이터를 구글 드라이브로 어떻게 연동하나요?',
      a: '[백업 및 설정] 탭에서 [구글 계정으로 로그인]을 진행하신 후 [스마트폰 백업 다운로드 복원]을 클릭하시면, 스마트폰 앱에서 구글 드라이브로 올린 mydiary_backup.json 데이터를 데스크톱으로 즉시 안전하게 복원할 수 있습니다.',
    },
    {
      q: '인터넷 연결이 없는 오프라인 환경에서도 작동하나요?',
      a: '네, MyDiary Desktop은 100% 오프라인 독립형(Offline-First) 데스크톱 프로그램입니다. 모든 데이터가 사용자의 컴퓨터 로컬 디스크에만 안전하게 보관되므로 인터넷 없이도 수업 일지 작성, 학생 관리, 시간표 조회, HWPX 문서 생성을 제약 없이 이용하실 수 있습니다.',
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
                <span className="help-version-tag">Desktop v0.6.1</span>
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
                    onError={(e) => {
                      if (!e.target.dataset.tried) {
                        e.target.dataset.tried = '1';
                        e.target.src = `guide/${currentScreen.id === 'weekly' ? 'guide_weekly.png' : currentScreen.id === 'diary' ? 'guide_diary.png' : currentScreen.id === 'students' ? 'guide_students.png' : 'guide_backup.png'}`;
                      } else if (e.target.dataset.tried === '1') {
                        e.target.dataset.tried = '2';
                        e.target.src = `/guide/${currentScreen.id === 'weekly' ? 'guide_weekly.png' : currentScreen.id === 'diary' ? 'guide_diary.png' : currentScreen.id === 'students' ? 'guide_students.png' : 'guide_backup.png'}`;
                      }
                    }}
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
                  <span className="about-badge">Desktop v0.6.1</span>
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
