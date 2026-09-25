import React, { useEffect } from 'react';
import {
  AlertTriangle,
  Info,
  CheckCircle,
  HelpCircle,
  X,
} from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  title = '확인',
  message = '',
  type = 'primary', // 'primary' | 'warning' | 'danger' | 'info' | 'success'
  confirmText = '확인',
  cancelText = '취소',
  isAlertOnly = false,
  onConfirm,
  onClose,
}) => {
  // ESC 키로 모달 닫기 및 포커스 복원 보장
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // 모달이 닫힐 때 윈도우 포커스 복원
      if (typeof window !== 'undefined' && window.focus) {
        window.focus();
      }
      if (window.electronAPI?.focusWindow) {
        window.electronAPI.focusWindow();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    if (typeof window !== 'undefined' && window.focus) {
      window.focus();
    }
    if (window.electronAPI?.focusWindow) {
      window.electronAPI.focusWindow();
    }
  };

  const handleCancel = () => {
    if (onClose) onClose();
    if (typeof window !== 'undefined' && window.focus) {
      window.focus();
    }
    if (window.electronAPI?.focusWindow) {
      window.electronAPI.focusWindow();
    }
  };

  const renderIcon = () => {
    switch (type) {
      case 'danger':
      case 'warning':
        return <AlertTriangle size={24} className="confirm-icon text-warning" />;
      case 'info':
        return <Info size={24} className="confirm-icon text-primary" />;
      case 'success':
        return <CheckCircle size={24} className="confirm-icon text-success" />;
      default:
        return <HelpCircle size={24} className="confirm-icon text-primary" />;
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={handleCancel}>
      <div
        className={`confirm-modal-container type-${type}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="confirm-modal-header">
          <div className="confirm-title-group">
            {renderIcon()}
            <h3 className="confirm-modal-title">{title}</h3>
          </div>
          <button
            type="button"
            className="confirm-modal-close"
            onClick={handleCancel}
            title="닫기"
          >
            <X size={18} />
          </button>
        </div>

        <div className="confirm-modal-body">
          {message.split('\n').map((line, idx) => (
            <p key={idx} className={line.startsWith('※') ? 'confirm-note' : ''}>
              {line || '\u00A0'}
            </p>
          ))}
        </div>

        <div className="confirm-modal-footer">
          {!isAlertOnly && (
            <button
              type="button"
              className="btn-secondary confirm-btn-cancel"
              onClick={handleCancel}
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            className={`btn-primary confirm-btn-submit ${type === 'danger' ? 'btn-danger' : ''}`}
            onClick={handleConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
