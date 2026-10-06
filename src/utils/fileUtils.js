/**
 * MyDiary Desktop 파일 처리 및 텍스트 이스케이프 공통 유틸리티
 */

import { showToast } from './dialog';

/**
 * XML 특수문자 이스케이프 (HWPX, DOCX XML 안전성 보장)
 * @param {*} unsafe - 변환할 원본 문자열
 * @returns {string} 이스케이프된 문자열
 */
export const escapeXml = (unsafe) => {
  if (unsafe == null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * HTML 특수문자 이스케이프 (XSS 및 레이아웃 깨짐 방지)
 * @param {*} unsafe - 변환할 원본 문자열
 * @returns {string} 이스케이프된 문자열
 */
export const escapeHtml = (unsafe) => {
  if (unsafe == null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * 데스크톱(Electron) 또는 웹 브라우저 환경에서 공통으로 파일을 안전하게 저장/다운로드
 * @param {Object} options
 * @param {string} options.defaultFileName - 기본 파일명
 * @param {string} options.base64Data - Base64 인코딩된 파일 데이터
 * @param {string} [options.filterType='all'] - Electron 다이얼로그 필터 ('hwpx' | 'docx' | 'pdf' | 'json')
 * @param {string} [options.mimeType='application/octet-stream'] - 브라우저 Blob MIME 타입
 * @param {string} [options.successMessage] - 저장 성공 시 표시할 토스트 메시지
 * @returns {Promise<{success: boolean, filePath?: string, canceled?: boolean, error?: string}>}
 */
export const saveOrDownloadFile = async ({
  defaultFileName,
  base64Data,
  filterType = 'all',
  mimeType = 'application/octet-stream',
  successMessage,
}) => {
  // 1. Electron 환경: IPC save-file-dialog 호출
  if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.saveFile) {
    try {
      const result = await window.electronAPI.saveFile(defaultFileName, base64Data, filterType);
      if (result.success) {
        const msg = successMessage || `파일이 성공적으로 저장되었습니다. (저장 경로: ${result.filePath})`;
        showToast(msg, 'success');
        return result;
      } else if (!result.canceled) {
        showToast(`파일 저장 중 오류가 발생했습니다: ${result.error}`, 'error');
        return result;
      }
      return result;
    } catch (err) {
      console.warn('Native electron saveFile failed, fallback to browser download:', err);
    }
  }

  // 2. 브라우저 fallback: Blob + 가상 a 태그 다운로드
  if (typeof window !== 'undefined') {
    try {
      const binary = atob(base64Data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultFileName;
      a.click();
      URL.revokeObjectURL(url);
      if (successMessage) {
        showToast(successMessage, 'success');
      }
      return { success: true };
    } catch (err) {
      console.error('Browser download failed:', err);
      showToast(`다운로드 중 오류가 발생했습니다: ${err.message}`, 'error');
      return { success: false, error: err.message };
    }
  }

  return { success: false, error: 'Environment not supported' };
};
