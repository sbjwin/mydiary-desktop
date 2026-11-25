import { useEffect } from 'react';

/**
 * 지정된 ref 요소 바깥 영역을 클릭(mousedown)할 때 onClose 콜백을 실행합니다.
 * @param {React.RefObject<HTMLElement>} ref - 감지 기준 DOM 요소 ref
 * @param {boolean} isOpen - 현재 팝오버/드롭다운 열림 상태
 * @param {Function} onClose - 닫기 콜백
 */
export function useClickOutside(ref, isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, isOpen, onClose]);
}
