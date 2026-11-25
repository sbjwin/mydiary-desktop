import { useEffect } from 'react';

/**
 * 열려 있는 모달/드롭다운에서 Escape 키 입력 시 onClose 콜백을 실행합니다.
 * @param {boolean} isOpen - 현재 열림 상태
 * @param {Function} onClose - 닫기 콜백
 */
export function useEscapeKey(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
}
