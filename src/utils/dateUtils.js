/**
 * MyDiary Desktop 날짜 및 시간 공통 유틸리티
 */

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 * @returns {string} 예: '2026-10-06'
 */
export const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

/**
 * 오늘 날짜를 YYYY. MM. DD 형식으로 반환 (문서/보고서 출력용)
 * @returns {string} 예: '2026. 10. 06'
 */
export const getFormattedToday = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}. ${month}. ${day}`;
};

/**
 * 특정 날짜가 속한 주의 월요일 날짜 구하기 (YYYY-MM-DD)
 * @param {string | Date} [dateInput=new Date()]
 * @returns {string} 월요일 날짜 YYYY-MM-DD
 */
export const getMondayOfWeek = (dateInput = new Date()) => {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput);
  const day = d.getDay(); // 0(일), 1(월), ... 6(토)
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 월요일 기준 계산
  const monday = new Date(d.setDate(diff));
  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, '0');
  const date = String(monday.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

/**
 * 월요일 기준 N일 후 날짜 구하기 (0: 월, 1: 화, ... 6: 일)
 * @param {string} mondayString - YYYY-MM-DD
 * @param {number} offsetDays - 일수 오프셋
 * @returns {string} 계산된 날짜 YYYY-MM-DD
 */
export const getDateFromMondayOffset = (mondayString, offsetDays) => {
  const [y, m, d] = mondayString.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d + offsetDays);
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const date = String(targetDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

/**
 * 시간 문자열을 24시간 디지털 형식(HH:mm)으로 통일 정규화
 * @param {string} timeStr - 예: '14:00', '오후 2시', '2시'
 * @returns {string} 예: '14:00'
 */
export const formatDisplayTime = (timeStr) => {
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

/**
 * 시간 문자열에서 24시간 형식의 '시(hour, 0~23)' 정수 추출
 * @param {string} timeStr - 예: '14:00', '오후 2시'
 * @returns {number} 시간 숫자 (기본값: 10)
 */
export const extractHour = (timeStr) => {
  if (!timeStr) return 10;
  const str = String(timeStr).trim();
  const digitalMatch = str.match(/^(\d{1,2}):(\d{2})/);
  if (digitalMatch) {
    return parseInt(digitalMatch[1], 10);
  }
  const isPM = str.includes('오후') || str.includes('PM') || str.includes('pm');
  const isAM = str.includes('오전') || str.includes('AM') || str.includes('am');
  const hourMatch = str.match(/(\d{1,2})\s*시/) || str.match(/\b(\d{1,2})\b/);
  if (hourMatch) {
    let hour = parseInt(hourMatch[1], 10);
    if (isPM && hour < 12) hour += 12;
    else if (isAM && hour === 12) hour = 0;
    return hour;
  }
  return 10;
};
