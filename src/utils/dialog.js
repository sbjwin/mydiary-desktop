/**
 * MyDiary Desktop 전역 인앱 다이얼로그 & 토스트 시스템
 * Electron OS 네이티브 alert() / confirm() 호출로 인한 키보드/포커스 잠김 버그를 100% 원천 차단합니다.
 */

export const focusAppWindow = () => {
  if (typeof window !== 'undefined') {
    if (window.focus) window.focus();
    if (window.electronAPI?.focusWindow) {
      window.electronAPI.focusWindow();
    }
  }
};

/**
 * 전역 인라인 토스트 알림 표시
 * @param {string} message - 표시할 메시지
 * @param {'success' | 'error' | 'warning' | 'info'} type - 토스트 유형
 */
export const showToast = (message, type = 'success') => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('mydiary:toast', {
        detail: { message, type },
      })
    );
    focusAppWindow();
  }
};

/**
 * 전역 인앱 확인 모달 팝업 표시
 * @param {Object} options
 * @param {string} options.title - 모달 제목
 * @param {string} options.message - 설명 문구 (줄바꿈 지원)
 * @param {'primary' | 'warning' | 'danger' | 'info'} [options.type='primary'] - 스타일 유형
 * @param {string} [options.confirmText='확인'] - 확인 버튼 텍스트
 * @param {string} [options.cancelText='취소'] - 취소 버튼 텍스트
 * @param {boolean} [options.isAlertOnly=false] - 취소 버튼 없는 단순 안내용 모달 여부
 * @param {Function} [options.onConfirm] - 확인 클릭 시 콜백
 * @param {Function} [options.onCancel] - 취소 클릭 시 콜백
 */
export const showConfirm = ({
  title = '확인',
  message = '',
  type = 'primary',
  confirmText = '확인',
  cancelText = '취소',
  isAlertOnly = false,
  onConfirm,
  onCancel,
}) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('mydiary:confirm', {
        detail: {
          title,
          message,
          type,
          confirmText,
          cancelText,
          isAlertOnly,
          onConfirm,
          onCancel,
        },
      })
    );
    focusAppWindow();
  }
};
