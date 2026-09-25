
import { showToast } from '../utils/dialog';

// 데스크톱 / 웹 표준 인쇄 헬퍼 (인쇄 및 PDF 저장 시 파일명 동기화)
const executePrintOrPdf = async (htmlContent, title) => {
  const originalTitle = typeof document !== 'undefined' ? document.title : '';
  if (typeof document !== 'undefined' && title) {
    document.title = title;
  }

  const printWindow = typeof window !== 'undefined' ? window.open('', '_blank', 'width=900,height=800') : null;
  if (printWindow) {
    if (title) printWindow.document.title = title;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      if (typeof document !== 'undefined') document.title = originalTitle;
    }, 500);
  } else if (typeof document !== 'undefined') {
    // 팝업 차단 시 iframe 방식 fallback
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();
    if (title) doc.title = title;
    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
      document.title = originalTitle;
    }, 500);
  }
};

import * as docx from 'docx-preview';
import { formatPhoneInfo } from '../database/Database';
import { generateWeeklyReportDocxBlob } from './DocxExportService';

const TEACHER_NAME = '성백진';

// HTML 특수문자 이스케이프 헬퍼 (XSS 및 레이아웃 깨짐 방지)
const escapeHtml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// 오늘 날짜 포맷팅 (YYYY. MM. DD)
const getFormattedToday = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}. ${month}. ${day}`;
};

// 시간 정규화 (24시간 디지털 형식)
const formatDisplayTime = (timeStr) => {
  if (!timeStr || !timeStr.trim()) return '-';
  const str = timeStr.trim();
  const digitalMatch = str.match(/^(\d{1,2}):(\d{2})$/);
  if (digitalMatch) {
    const h = String(parseInt(digitalMatch[1], 10)).padStart(2, '0');
    return `${h}:${digitalMatch[2]}`;
  }
  const isPM = str.includes('오후') || str.includes('PM') || str.includes('pm');
  const isAM = str.includes('오전') || str.includes('AM') || str.includes('am');
  const hourMatch = str.match(/(\d{1,2})\s*시/) || str.match(/(\d{1,2}):/) || str.match(/\b(\d{1,2})\b/);
  const minMatch = str.match(/(\d{1,2})\s*분/) || str.match(/:(\d{2})/);
  if (hourMatch) {
    let hour = parseInt(hourMatch[1], 10);
    const minute = minMatch ? String(parseInt(minMatch[1], 10)).padStart(2, '0') : '00';
    if (isPM && hour < 12) hour += 12;
    else if (isAM && hour === 12) hour = 0;
    return `${String(hour).padStart(2, '0')}:${minute}`;
  }
  return str;
};

// 공통 인쇄용 CSS 스타일
const getCommonStyle = () => `
  @page {
    size: A4;
    margin: 15mm 15mm 15mm 15mm;
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", "맑은 고딕", sans-serif;
  }
  body {
    background-color: #FFFFFF;
    color: #1F2937;
    padding: 10px;
  }
  .doc-header {
    border-bottom: 2.5px solid #2563EB;
    padding-bottom: 12px;
    margin-bottom: 18px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .doc-title-box h1 {
    font-size: 22px;
    font-weight: 800;
    color: #111827;
    letter-spacing: -0.5px;
    margin-bottom: 3px;
  }
  .doc-title-box p {
    font-size: 11px;
    color: #6B7280;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
  .doc-meta {
    text-align: right;
    font-size: 11px;
    color: #4B5563;
    line-height: 1.5;
  }
  .doc-meta strong {
    color: #111827;
  }
  .section-title {
    font-size: 13px;
    font-weight: 700;
    color: #1D4ED8;
    margin: 16px 0 6px 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .form-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10px;
  }
  .form-table th, .form-table td {
    border: 1px solid #D1D5DB;
    padding: 8px 10px;
    font-size: 12px;
    line-height: 1.4;
  }
  .form-table th {
    background-color: #F9FAFB;
    color: #374151;
    font-weight: 600;
    text-align: center;
    width: 20%;
  }
  .form-table td {
    color: #1F2937;
    background-color: #FFFFFF;
  }
  .badge-chip {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    background: #EFF6FF;
    color: #1D4ED8;
  }
  .memo-box {
    border: 1px solid #D1D5DB;
    border-radius: 4px;
    padding: 10px 12px;
    min-height: 80px;
    background: #F9FAFB;
    font-size: 12px;
    line-height: 1.6;
    color: #374151;
    white-space: pre-wrap;
  }
  .record-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
  }
  .record-table th {
    background-color: #F3F4F6;
    border: 1px solid #D1D5DB;
    padding: 8px 6px;
    font-size: 11.5px;
    font-weight: 700;
    color: #374151;
    text-align: center;
  }
  .record-table td {
    border: 1px solid #D1D5DB;
    padding: 8px 8px;
    font-size: 11.5px;
    line-height: 1.4;
  }
  .record-table tr:nth-child(even) td {
    background-color: #FAFAFA;
  }
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .doc-footer {
    margin-top: 26px;
    padding-top: 14px;
    border-top: 1px dashed #D1D5DB;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: #6B7280;
  }
  .sign-area {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #111827;
  }
  .sign-line {
    display: inline-block;
    width: 80px;
    border-bottom: 1px solid #111827;
    margin-left: 4px;
  }
`;

/**
 * 1. 학생 정보 카드 HTML 생성
 */
export const generateStudentProfileHtml = (student) => {
  const today = getFormattedToday();
  const name = escapeHtml(student?.name || '무명');
  const schoolGrade = escapeHtml(student?.school_grade || '-');
  const residentNumber = escapeHtml(student?.resident_number || '-');
  const studyMethod = escapeHtml(student?.study_method || '미지정');
  const mobilePhone = escapeHtml(student?.mobile_phone || '-');
  const phoneNumber = escapeHtml(student?.phone_number || '-');
  const email = escapeHtml(student?.email || '-');
  const address = escapeHtml(student?.address || '-');
  const parentName = escapeHtml(student?.parent_name || '-');
  const parentMobilePhone = escapeHtml(student?.parent_mobile_phone || '-');
  const notes = student?.notes
    ? escapeHtml(student.notes).replace(/\n/g, '<br/>')
    : '(등록된 특이사항이나 메모가 없습니다.)';

  const isPaused = student?.status === 'paused';
  const statusLabel = isPaused ? '휴회' : `${student?.current_term_number || 1}차 수강중`;
  const enrolledDate = escapeHtml(student?.first_enrolled_date || student?.start_date || '-');

  const terms = Array.isArray(student?.terms) && student.terms.length > 0 ? student.terms : [];
  const termsHtml = terms.length > 0
    ? terms.map((t, idx) => `
        <tr>
          <td class="text-center" style="font-weight: 700;">${t.term_number || idx + 1}차</td>
          <td class="text-center">${escapeHtml(t.start_date || '-')} ~ ${escapeHtml(t.end_date || '진행중')}</td>
          <td class="text-center">
            <span class="badge-chip" style="${t.status === 'paused' ? 'background: #F3F4F6; color: #6B7280;' : 'background: #DCFCE7; color: #16A34A;'}">
              ${t.status === 'paused' ? '휴회' : '수강중'}
            </span>
          </td>
          <td>${escapeHtml(t.reason || '-')}</td>
        </tr>
      `).join('')
    : `
        <tr>
          <td class="text-center" style="font-weight: 700;">1차</td>
          <td class="text-center">${enrolledDate} ~ ${isPaused ? '휴회' : '진행중'}</td>
          <td class="text-center">
            <span class="badge-chip" style="${isPaused ? 'background: #F3F4F6; color: #6B7280;' : 'background: #DCFCE7; color: #16A34A;'}">
              ${statusLabel}
            </span>
          </td>
          <td>최초 등록</td>
        </tr>
      `;

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${name} 학생 관리 카드</title>
  <style>
    ${getCommonStyle()}
  </style>
</head>
<body>
  <div class="doc-header">
    <div class="doc-title-box">
      <h1>학생 관리 기록 카드</h1>
      <p>STUDENT PROFILE & INFORMATION</p>
    </div>
    <div class="doc-meta">
      <div><strong>출력일자:</strong> ${today}</div>
      <div><strong>학생명:</strong> ${name}</div>
    </div>
  </div>

  <div class="section-title">■ 기본 인적사항</div>
  <table class="form-table">
    <tr>
      <th>성 명</th>
      <td style="font-weight: 700; font-size: 13px;">${name}</td>
      <th>학교 및 학년</th>
      <td>${schoolGrade}</td>
    </tr>
    <tr>
      <th>수강 상태</th>
      <td>
        <span class="badge-chip" style="${isPaused ? 'background: #F3F4F6; color: #6B7280;' : 'background: #EFF6FF; color: #1D4ED8;'}">
          ${statusLabel}
        </span>
      </td>
      <th>최초 입회일</th>
      <td style="font-weight: 600;">${enrolledDate}</td>
    </tr>
    <tr>
      <th>주민등록번호</th>
      <td>${residentNumber}</td>
      <th>학습 방법</th>
      <td><span class="badge-chip">${studyMethod}</span></td>
    </tr>
    <tr>
      <th>휴대전화</th>
      <td style="font-weight: 600;">${mobilePhone}</td>
      <th>전화번호</th>
      <td>${phoneNumber}</td>
    </tr>
    <tr>
      <th>이메일</th>
      <td colspan="3">${email}</td>
    </tr>
    <tr>
      <th>거주지 주소</th>
      <td colspan="3">${address}</td>
    </tr>
  </table>

  <div class="section-title">■ 수강 차수 및 등록 이력</div>
  <table class="record-table">
    <thead>
      <tr>
        <th style="width: 15%;">차수</th>
        <th style="width: 45%;">수강 기간</th>
        <th style="width: 15%;">상태</th>
        <th style="width: 25%;">비고 / 사유</th>
      </tr>
    </thead>
    <tbody>
      ${termsHtml}
    </tbody>
  </table>

  <div class="section-title">■ 학부모 (보호자) 정보</div>
  <table class="form-table">
    <tr>
      <th>학부모 성함</th>
      <td>${parentName}</td>
      <th>비상 연락처</th>
      <td style="font-weight: 600; color: #1D4ED8;">${parentMobilePhone}</td>
    </tr>
  </table>

  <div class="section-title">■ 특이사항 및 지도 참고내용</div>
  <div class="memo-box">${notes}</div>

  <div class="doc-footer">
    <div>MyDiary 학습관리 시스템</div>
    <div class="sign-area">
      <span>담당 교사: <strong>${TEACHER_NAME}</strong></span>
      <span class="sign-line"></span> (인)
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * 2. 수업일지 보고서 HTML 생성
 */
export const generateClassRecordsHtml = (student, records = [], periodTitle = '전체 기간') => {
  const name = escapeHtml(student?.name || '학생');
  const schoolGrade = student?.school_grade ? `(${escapeHtml(student.school_grade)})` : '';
  const safePeriodTitle = escapeHtml(periodTitle);
  const totalCount = records.length;

  // 날짜 최신순 정렬
  const sortedRecords = [...records].sort((a, b) => b.class_date.localeCompare(a.class_date));

  const tableRows = sortedRecords.length > 0 ? sortedRecords.map((r, index) => {
    const roundNumber = totalCount - index; // 최신순일 때 역순 번호 (1부터 시작하도록)
    const date = escapeHtml(r.class_date || '-');
    const time = escapeHtml(formatDisplayTime(r.class_time));
    const course = escapeHtml(r.course || '-');
    const content = escapeHtml(r.content || '-').replace(/\n/g, '<br/>');

    return `
      <tr>
        <td class="text-center" style="font-weight: 600;">${roundNumber}</td>
        <td class="text-center">${date}</td>
        <td class="text-center">${time}</td>
        <td style="font-weight: 600; color: #1D4ED8;">${course}</td>
        <td>${content}</td>
      </tr>
    `;
  }).join('') : `
    <tr>
      <td colspan="5" class="text-center" style="padding: 24px; color: #6B7280;">
        등록된 수업 일지가 없습니다.
      </td>
    </tr>
  `;

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${name} 학생 수업 일지</title>
  <style>
    ${getCommonStyle()}
  </style>
</head>
<body>
  <div class="doc-header">
    <div class="doc-title-box">
      <h1>수업 일지 및 학습 보고서</h1>
      <p>STUDENT CLASS RECORDS & REPORT</p>
    </div>
    <div class="doc-meta">
      <div><strong>학생명:</strong> <span style="font-size: 13px; font-weight: bold; color: #111827;">${name}</span> ${schoolGrade}</div>
      <div><strong>조회 기간:</strong> ${safePeriodTitle}</div>
      <div><strong>총 수업 횟수:</strong> <strong>${totalCount}회차</strong></div>
    </div>
  </div>

  <table class="record-table">
    <thead>
      <tr>
        <th style="width: 7%;">회차</th>
        <th style="width: 14%;">수업일자</th>
        <th style="width: 15%;">수업시간</th>
        <th style="width: 18%;">과정 / 진도</th>
        <th style="width: 46%;">수업 내용 및 지도 사항</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <div class="doc-footer" style="margin-top: 32px;">
    <div>MyDiary 학습관리 시스템 | 성장의 기록</div>
    <div class="sign-area">
      <span>지도 교사: <strong>${TEACHER_NAME}</strong></span>
      <span class="sign-line"></span> (인)
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * 학생 정보 인쇄 실행
 */
export const printStudentProfile = async (student) => {
  try {
    const html = generateStudentProfileHtml(student);
    const title = `${student?.name || '학생'}_학생기록카드`;
    await executePrintOrPdf(html, title);
  } catch (error) {
    console.error('Failed to print student profile:', error);
    showToast('학생 정보를 인쇄하는 도중 오류가 발생했습니다: ' + error.message, 'error');
  }
};

/**
 * 학생 정보 PDF 인쇄/저장
 */
export const shareStudentProfile = async (student) => {
  return printStudentProfile(student);
};

/**
 * 수업 일지 보고서 인쇄 실행
 */
export const printClassRecords = async (student, records, periodTitle = '전체 기간') => {
  try {
    const html = generateClassRecordsHtml(student, records, periodTitle);
    const title = `${student?.name || '학생'}_수업일지`;
    await executePrintOrPdf(html, title);
  } catch (error) {
    console.error('Failed to print class records:', error);
    showToast('수업 일지를 인쇄하는 도중 오류가 발생했습니다: ' + error.message, 'error');
  }
};

/**
 * 수업 일지 보고서 PDF 인쇄/저장
 */
export const shareClassRecords = async (student, records, periodTitle = '전체 기간') => {
  return printClassRecords(student, records, periodTitle);
};

/**
 * 3. 주간 업무 보고서 (시간표 & 기타 업무) HTML 생성
 * (docs-template.docx 양식과 100% 동일한 A4 1장 19개 행 일체형 규격)
 */
export const generateWeeklyReportHtml = (weeklyPlan) => {
  const startDate = weeklyPlan?.startDate || '2026-09-14';
  const [year, month, day] = startDate.split('-').map(Number);
  const title = `${year}년 ${month}월 ${day}일 주간의 ${TEACHER_NAME} 업무 보고서`;

  // 요일 날짜 계산 (월: 0 ~ 일: 6)
  const getDayLabel = (offset, label) => {
    const d = new Date(year, month - 1, day + offset);
    return `${label} (${d.getMonth() + 1}/${d.getDate()})`;
  };

  const scheduleItems = weeklyPlan?.scheduleItems || [];

  // 평일/토요일(1~6) 슬롯 필터
  const getItemsForSlot = (dayOfWeek, hour) => {
    return scheduleItems.filter((item) => {
      if (Number(item.dayOfWeek) !== dayOfWeek) return false;
      const rawHour = (item.startTime || '').match(/\d{1,2}/);
      if (!rawHour) return false;
      const startH = parseInt(rawHour[0], 10);
      if (hour === 9) return startH <= 9;
      if (hour === 20) return startH >= 20;
      return startH === hour;
    });
  };

  // 일요일(7) 슬롯 필터
  const sundayItems = scheduleItems.filter((item) => Number(item.dayOfWeek) === 7);
  const getSundayItemsForSlot = (hour) => {
    return sundayItems.filter((item) => {
      const rawHour = (item.startTime || '').match(/\d{1,2}/);
      if (!rawHour) return false;
      const startH = parseInt(rawHour[0], 10);
      if (hour === 10) return startH <= 10;
      if (hour === 13) return startH === 12 || startH === 13;
      if (hour === 18) return startH >= 18;
      return startH === hour;
    });
  };

  // 수업 카드 HTML 렌더링 (docs-template.docx 정밀 폰트 및 컬러 일치)
  const renderCellCard = (item) => {
    const studentName = escapeHtml(item.studentName || '');
    const startTime = escapeHtml(item.startTime || '');
    const subject = escapeHtml(item.subject || '');
    const address = escapeHtml(item.address || '');
    const phoneLines = formatPhoneInfo(item.phoneInfo || '')
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);
    const noteClean = item.statusNote
      ? item.statusNote.replace(/^※\s*=>\s*|^=>\s*/, '').trim()
      : '';

    return `
      <div class="schedule-card">
        <div class="card-header">
          <span class="card-time">${startTime}</span>
          <span class="card-name">${studentName}</span>
        </div>
        ${subject ? `<div class="card-subject">[${subject}]</div>` : ''}
        ${address ? `<div class="card-addr">${address}</div>` : ''}
        ${phoneLines.map((p) => `<div class="card-phone">${escapeHtml(p)}</div>`).join('')}
        ${noteClean ? `<div class="card-note">※ =&gt; ${escapeHtml(noteClean)}</div>` : ''}
      </div>
    `;
  };

  // 셀 내부 수업 카드 목록 렌더링 (구분선 포함)
  const renderCellItems = (items) => {
    if (!items || items.length === 0) return '';
    return items
      .map((it, idx) => {
        const divider = idx > 0 ? '<div class="card-divider">----------------</div>' : '';
        return divider + renderCellCard(it);
      })
      .join('');
  };

  // 평일/토요일 시간 슬롯 행 생성
  const makeTimeRow = (label, hour, rowClass = '') => {
    const dayConfigs = [
      { day: 1, span: 1 },
      { day: 2, span: 1 },
      { day: 3, span: 2 },
      { day: 4, span: 1 },
      { day: 5, span: 2 },
      { day: 6, span: 1 },
    ];

    const cellsHtml = dayConfigs
      .map((dc) => {
        const items = getItemsForSlot(dc.day, hour);
        const spanAttr = dc.span > 1 ? ` colspan="${dc.span}"` : '';
        return `<td class="class-cell"${spanAttr}>${renderCellItems(items)}</td>`;
      })
      .join('');

    return `
      <tr class="time-row ${rowClass}">
        <td class="time-label-cell">${label}</td>
        ${cellsHtml}
      </tr>
    `;
  };

  // 하단 기타 업무 항목 파싱
  const parseNotesToList = (notesStr, defaultStr) => {
    const text = (notesStr || defaultStr || '').trim();
    if (!text) return '';
    const lines = text
      .split('\n')
      .map((l) => l.replace(/^[#•\-\*]\s*/, '').trim())
      .filter(Boolean);
    return lines.map((l) => `<div class="note-bullet">• ${escapeHtml(l)}</div>`).join('');
  };

  // Row 1~14 생성
  const tableRows = [];

  // Row 1: 최상단 타이틀 행 (학원수업 / 방문수업)
  tableRows.push(`
    <tr class="row-top-title">
      <td colspan="9" class="top-title-cell">학원수업 / 방문수업</td>
    </tr>
  `);

  // Row 2: 요일 헤더 행
  tableRows.push(`
    <tr class="row-day-header">
      <th class="time-header-blank"></th>
      <th class="day-th">${getDayLabel(0, '월')}</th>
      <th class="day-th">${getDayLabel(1, '화')}</th>
      <th colspan="2" class="day-th">${getDayLabel(2, '수')}</th>
      <th class="day-th">${getDayLabel(3, '목')}</th>
      <th colspan="2" class="day-th">${getDayLabel(4, '금')}</th>
      <th class="day-th sat-th">${getDayLabel(5, '토')}</th>
    </tr>
  `);

  // Row 3: 9시
  tableRows.push(makeTimeRow('9시', 9, 'time-row-9'));
  // Row 4: 10시
  tableRows.push(makeTimeRow('10시', 10, 'time-row-regular'));
  // Row 5: 11시
  tableRows.push(makeTimeRow('11시', 11, 'time-row-regular'));

  // Row 6: 점심시간 (12:00)
  tableRows.push(`
    <tr class="time-row time-row-lunch">
      <td class="time-label-cell">12:00</td>
      <td colspan="8" class="lunch-cell">☕ 12:00 ~ 13:00 점심 및 이동 시간</td>
    </tr>
  `);

  // Row 7~14: 오후 1시 ~ 8시
  const pmSlots = [
    { label: '1시', hour: 13 },
    { label: '2시', hour: 14 },
    { label: '3시', hour: 15 },
    { label: '4시', hour: 16 },
    { label: '5시', hour: 17 },
    { label: '6시', hour: 18 },
    { label: '7시', hour: 19 },
    { label: '8시', hour: 20 },
  ];
  pmSlots.forEach((slot) => {
    tableRows.push(makeTimeRow(slot.label, slot.hour, 'time-row-regular'));
  });

  // Row 15: 하단 섹션 헤더 (기타 업무 + 일요일 시간표)
  const sundayHeaderLabel = `■ 일요일 (${new Date(year, month - 1, day + 6).getMonth() + 1}/${new Date(year, month - 1, day + 6).getDate()}) 시간표`;
  tableRows.push(`
    <tr class="row-bottom-header">
      <td colspan="3" class="notes-header-cell">■ 기타 업무 (전달물 / 특이사항)</td>
      <td colspan="6" class="sunday-header-cell">${sundayHeaderLabel}</td>
    </tr>
  `);

  // Row 16~19: 하단 본문 4행 (좌측 기타업무 통합 + 우측 일요일 4행 2열 배치)
  const sundayRowSlots = [
    { leftLabel: '10시', leftHour: 10, rightLabel: '3시', rightHour: 15 },
    { leftLabel: '11시', leftHour: 11, rightLabel: '4시', rightHour: 16 },
    { leftLabel: '1시', leftHour: 13, rightLabel: '5시', rightHour: 17 },
    { leftLabel: '2시', leftHour: 14, rightLabel: '6시', rightHour: 18 },
  ];

  sundayRowSlots.forEach((sSlot, idx) => {
    const leftItems = getSundayItemsForSlot(sSlot.leftHour);
    const rightItems = getSundayItemsForSlot(sSlot.rightHour);

    let leftTdHtml = '';
    if (idx === 0) {
      // Row 16에서만 rowspan 4로 좌측 통합 셀 생성
      leftTdHtml = `
        <td rowspan="4" colspan="3" class="bottom-notes-cell">
          <div class="note-section-title">▶ 금주 주요사항</div>
          ${parseNotesToList(weeklyPlan?.mainNotes, '개학 후 시간변동 체크\n마감보고서 제출')}
          <div class="note-section-spacer"></div>
          <div class="note-section-title">▶ 전주 결석</div>
          ${parseNotesToList(weeklyPlan?.prevAbsentNotes, '개인사정 결석')}
          <div class="note-section-spacer"></div>
          <div class="note-section-title">▶ 특이사항</div>
          ${parseNotesToList(weeklyPlan?.specialNotes, '공지사항 확인')}
        </td>
      `;
    }

    tableRows.push(`
      <tr class="sunday-content-row">
        ${leftTdHtml}
        <td class="sunday-slot-label">${sSlot.leftLabel}</td>
        <td colspan="2" class="sunday-slot-cell">${renderCellItems(leftItems)}</td>
        <td class="sunday-slot-label">${sSlot.rightLabel}</td>
        <td colspan="2" class="sunday-slot-cell">${renderCellItems(rightItems)}</td>
      </tr>
    `);
  });

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 5mm 5mm 3mm 5mm;
    }
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background: #FFFFFF;
      color: #000000;
      font-family: "맑은 고딕", "Malgun Gothic", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* 상단 타이틀 영역 (docs-template.docx 정밀 일치) */
    .report-title-container {
      text-align: center;
      margin-bottom: 2mm;
      line-height: 1.2;
    }
    .report-title-text {
      font-size: 14pt;
      color: #0F172A;
      letter-spacing: -0.4px;
    }
    .report-title-text strong {
      font-size: 16pt;
      font-weight: 800;
      letter-spacing: -0.6px;
    }

    /* 19개 행 통합 일체형 테이블 (A4 1장 꽉 채움: 278mm) */
    .unified-table {
      width: 100%;
      height: 278mm;
      border-collapse: collapse;
      table-layout: fixed;
      border: 1.2px solid #000000;
      margin: 0 auto;
    }
    .unified-table th, .unified-table td {
      border: 0.5px solid #475569;
      padding: 2px 3px;
      vertical-align: top;
      word-break: break-all;
      box-sizing: border-box;
    }

    /* Row 1: 최상단 타이틀 행 */
    .row-top-title td {
      height: 5.5mm;
      background-color: #F1F5F9 !important;
      text-align: center;
      font-size: 10.5px;
      font-weight: 700;
      color: #000000;
      vertical-align: middle !important;
      border-bottom: 1.2px solid #000000 !important;
      padding: 0 !important;
    }

    /* Row 2: 요일 헤더 행 */
    .row-day-header th {
      height: 5.5mm;
      background-color: #F1F5F9 !important;
      text-align: center;
      font-size: 10px;
      font-weight: 700;
      color: #000000;
      vertical-align: middle !important;
      border-bottom: 1.2px solid #000000 !important;
      padding: 0 !important;
    }
    .row-day-header .sat-th {
      background-color: #EBDEF1 !important; /* 토요일 연보라 배경 */
    }

    /* 시간대 행 공통 */
    .time-label-cell {
      background-color: #F8FAFC !important;
      text-align: center;
      font-weight: 700;
      font-size: 9.5px;
      color: #000000;
      vertical-align: middle !important;
    }
    .time-row-9 td {
      height: 7mm;
    }
    .time-row-regular td {
      height: 18.5mm;
    }
    .class-cell {
      background-color: #FFFFFF !important;
      vertical-align: top !important;
    }

    /* Row 6: 점심시간 */
    .time-row-lunch td {
      height: 6mm;
      background-color: #FEF9C3 !important; /* 점심 연노랑 배경 */
      text-align: center;
      font-weight: 700;
      font-size: 9.5px;
      color: #000000;
      vertical-align: middle !important;
      padding: 0 !important;
    }

    /* Row 15: 하단 섹션 헤더 */
    .row-bottom-header td {
      height: 6.5mm;
      text-align: center;
      font-weight: 700;
      font-size: 9.5px;
      color: #000000;
      vertical-align: middle !important;
      border-top: 1.2px solid #000000 !important;
      border-bottom: 1px solid #000000 !important;
      padding: 0 !important;
    }
    .notes-header-cell {
      background-color: #DFE6F7 !important; /* 기타 업무 연파랑 배경 */
    }
    .sunday-header-cell {
      background-color: #EBDEF1 !important; /* 일요일 연보라 배경 */
    }

    /* Row 16~19: 하단 본문 */
    .sunday-content-row td {
      height: 16.5mm;
    }
    .bottom-notes-cell {
      background-color: #F1F5F9 !important;
      padding: 4px 6px !important;
      vertical-align: top !important;
    }
    .note-section-title {
      font-size: 9px;
      font-weight: 700;
      color: #000000;
      margin-top: 2px;
      margin-bottom: 2px;
    }
    .note-bullet {
      font-size: 8px;
      color: #000000;
      line-height: 1.35;
      padding-left: 2px;
    }
    .note-section-spacer {
      height: 4px;
    }
    .sunday-slot-label {
      background-color: #FFFFFF !important;
      text-align: center;
      font-weight: 700;
      font-size: 9.5px;
      color: #000000;
      vertical-align: middle !important;
    }
    .sunday-slot-cell {
      background-color: #FFFFFF !important;
      vertical-align: top !important;
    }

    /* 수업 카드 디자인 (docs-template.docx 100% 일치) */
    .schedule-card {
      font-size: 8px;
      line-height: 1.3;
      margin-bottom: 2px;
    }
    .card-header {
      font-size: 8.5px;
      font-weight: 700;
      color: #0F172A;
      letter-spacing: -0.2px;
    }
    .card-time {
      margin-right: 2px;
    }
    .card-name {
      font-weight: 700;
    }
    .card-subject {
      color: #1D4ED8;
      font-weight: 700;
      font-size: 8.5px;
    }
    .card-addr {
      color: #475569;
      font-size: 7.5px;
    }
    .card-phone {
      color: #475569;
      font-size: 8px;
    }
    .card-note {
      color: #DC2626;
      font-weight: 700;
      font-size: 8px;
    }
    .card-divider {
      text-align: center;
      color: #CBD5E1;
      font-size: 7px;
      line-height: 1;
      margin: 2px 0;
    }
  </style>
</head>
<body>
  <div class="report-title-container">
    <div class="report-title-text">
      ${year}년 ${month}월 ${day}일 주간의 <strong>${TEACHER_NAME}</strong> 업무 보고서
    </div>
  </div>

  <table class="unified-table">
    <colgroup>
      <col style="width: 6.18%;">
      <col style="width: 15.28%;">
      <col style="width: 15.28%;">
      <col style="width: 7.26%;">
      <col style="width: 9.10%;">
      <col style="width: 15.28%;">
      <col style="width: 7.26%;">
      <col style="width: 9.10%;">
      <col style="width: 15.28%;">
    </colgroup>
    <tbody>
      ${tableRows.join('')}
    </tbody>
  </table>
</body>
</html>
  `;
};

/**
 * DOCX 바이너리를 docx-preview를 통해 A4 1장 최적화 완전한 HTML로 변환
 * (Word 원본 테마, 표 테두리, 행 높이, 셀 패딩, 맑은 고딕 폰트 100% 보존)
 */
export const renderDocxToHtml = async (docxBlob, title = '주간업무보고서') => {
  const container = document.createElement('div');
  await docx.renderAsync(docxBlob, container, null, {
    inWrapper: false,
    ignoreWidth: false,
    ignoreHeight: false,
    renderHeaders: true,
    renderFooters: true,
    renderFootnotes: true,
    renderEndnotes: true,
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .docx-wrapper {
      padding: 0 !important;
      background: #ffffff !important;
    }
    section.docx {
      box-sizing: border-box !important;
      margin: 0 auto !important;
      box-shadow: none !important;
      width: 595.3pt !important;
      min-height: 841.9pt !important;
      page-break-after: avoid !important;
      page-break-inside: avoid !important;
    }
    @media print {
      body {
        margin: 0 !important;
        padding: 0 !important;
      }
      section.docx {
        box-shadow: none !important;
        margin: 0 !important;
      }
    }
  </style>
</head>
<body>
  ${container.innerHTML}
</body>
</html>`;
};

/**
 * 주간 업무 보고서 인쇄 실행 (워드 템플릿 기반 자동 렌더링)
 */
export const printWeeklyReport = async (weeklyPlan) => {
  try {
    const startDate = weeklyPlan?.startDate || '2026-09-14';
    const [year, month, day] = startDate.split('-').map(Number);
    const title = `주간업무보고서_${year}년_${month}월_${day}일_${TEACHER_NAME}`;

    // 워드 템플릿(docs-template.docx) 기반 DOCX Blob 취득 후 HTML 변환
    const docxBlob = await generateWeeklyReportDocxBlob(weeklyPlan);
    const html = await renderDocxToHtml(docxBlob, title);
    await executePrintOrPdf(html, title);
  } catch (error) {
    console.error('Failed to print weekly report:', error);
    showToast('주간 업무 보고서를 인쇄하는 도중 오류가 발생했습니다: ' + error.message, 'error');
  }
};

/**
 * 주간 업무 보고서 PDF 파일 직접 저장 (docs-template.docx 워드 템플릿 기반 자동 렌더링)
 */
export const exportWeeklyReportPdf = async (weeklyPlan) => {
  try {
    const startDate = weeklyPlan?.startDate || '2026-09-14';
    const [year, month, day] = startDate.split('-').map(Number);
    const defaultFileName = `주간업무보고서_${year}년_${month}월_${day}일_${TEACHER_NAME}.pdf`;

    // 1. docs-template.docx 기반 완성된 DOCX 바이너리 Blob 취득
    const docxBlob = await generateWeeklyReportDocxBlob(weeklyPlan);

    // 2. docx-preview를 사용하여 워드 원본 규격 그대로 완벽한 HTML 렌더링
    const htmlContent = await renderDocxToHtml(docxBlob, defaultFileName.replace('.pdf', ''));

    if (typeof window !== 'undefined' && window.electronAPI?.exportPdf) {
      const result = await window.electronAPI.exportPdf(htmlContent, defaultFileName);
      if (result.success) {
        showToast(`PDF 문서가 성공적으로 저장되었습니다. (경로: ${result.filePath})`, 'success');
        return result;
      } else if (!result.canceled) {
        showToast(`PDF 저장 중 오류 발생: ${result.error}`, 'error');
        return result;
      }
      return result;
    } else {
      // 웹 환경 브라우저 인쇄 대화상자 fallback (파일명 동기화)
      await executePrintOrPdf(htmlContent, defaultFileName.replace('.pdf', ''));
    }
  } catch (error) {
    console.error('Failed to export PDF:', error);
    showToast(`PDF 문서 생성 중 오류가 발생했습니다: ${error?.message || error}`, 'error');
  }
};

/**
 * 주간 업무 보고서 PDF 인쇄/저장 (기존 호환)
 */
export const shareWeeklyReport = async (weeklyPlan) => {
  return exportWeeklyReportPdf(weeklyPlan);
};

export { shareWeeklyReportDocx } from './DocxExportService';
export { shareWeeklyReportHwpx } from './HwpxExportService';


