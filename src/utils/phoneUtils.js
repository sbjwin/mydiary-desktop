/**
 * MyDiary Desktop 연락처 유틸리티
 * 학부모는 (모)010-..., 학생 본인은 (본)010-..., 아버지는 (부)010-..., 일반 전화는 (전화)000-... 형태로 통일
 */

/**
 * 연락처 정보 문자열을 표준 형식으로 정규화
 * @param {string} phoneInfo - 원본 연락처 텍스트 (줄바꿈 구분 다중 번호 지원)
 * @returns {string} 정규화된 연락처 문자열
 */
export const formatPhoneInfo = (phoneInfo) => {
  if (!phoneInfo || typeof phoneInfo !== 'string') return '';

  return phoneInfo
    .split('\n')
    .map((line) => {
      let trimmed = line.trim();
      if (!trimmed) return '';

      // 1. 학부모 관련 표기 교정 -> (모)010-XXXX-XXXX
      if (/^\(학부모[^)]*\)/.test(trimmed)) {
        trimmed = trimmed.replace(/^\(학부모[^)]*\)\s*/, '(모)');
      } else if (/^학부모[:\s]*/.test(trimmed)) {
        trimmed = trimmed.replace(/^학부모[:\s]*/, '(모)');
      } else if (/^\(모[^)]*\)/.test(trimmed)) {
        trimmed = trimmed.replace(/^\(모[^)]*\)\s*/, '(모)');
      } else if (/^모[:\s]*/.test(trimmed)) {
        trimmed = trimmed.replace(/^모[:\s]*/, '(모)');
      }

      // 2. 학생 본인 관련 표기 교정 -> (본)010-XXXX-XXXX
      else if (/^\(학생[^)]*\)/.test(trimmed)) {
        trimmed = trimmed.replace(/^\(학생[^)]*\)\s*/, '(본)');
      } else if (/^학생[:\s]*/.test(trimmed)) {
        trimmed = trimmed.replace(/^학생[:\s]*/, '(본)');
      } else if (/^\(본인[^)]*\)/.test(trimmed)) {
        trimmed = trimmed.replace(/^\(본인[^)]*\)\s*/, '(본)');
      } else if (/^본인[:\s]*/.test(trimmed)) {
        trimmed = trimmed.replace(/^본인[:\s]*/, '(본)');
      } else if (/^\(본[^)]*\)/.test(trimmed)) {
        trimmed = trimmed.replace(/^\(본[^)]*\)\s*/, '(본)');
      }

      // 3. 아버지 관련 표기 교정 -> (부)010-XXXX-XXXX
      else if (/^\(아버지[^)]*\)/.test(trimmed)) {
        trimmed = trimmed.replace(/^\(아버지[^)]*\)\s*/, '(부)');
      } else if (/^아버지[:\s]*/.test(trimmed)) {
        trimmed = trimmed.replace(/^아버지[:\s]*/, '(부)');
      } else if (/^\(부[^)]*\)/.test(trimmed)) {
        trimmed = trimmed.replace(/^\(부[^)]*\)\s*/, '(부)');
      }

      // 4. 일반 전화 표기 교정 -> (전화)000-000-0000
      else if (
        /^\(집전화[^)]*\)/.test(trimmed) ||
        /^\(자택[^)]*\)/.test(trimmed) ||
        /^\(전화[^)]*\)/.test(trimmed)
      ) {
        trimmed = trimmed.replace(/^\([^)]*\)\s*/, '(전화)');
      }

      return trimmed;
    })
    .filter(Boolean)
    .join('\n');
};
