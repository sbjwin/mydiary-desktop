import React, { useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Info,
  CheckCircle,
  HelpCircle,
  X,
} from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey';

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
  const handleCancel = useCallback(() => {
    if (onClose) onClose();
    if (typeof window !== 'undefined' && window.focus) {
      window.focus();
    }
    if (window.electronAPI?.focusWindow) {
      window.electronAPI.focusWindow();
    }
  }, [onClose]);

  useEscapeKey(isOpen, handleCancel);

  // 모달이 닫힐 때 윈도우 포커스 복원 보장
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.focus) {
        window.focus();
      }
      if (window.electronAPI?.focusWindow) {
        window.electronAPI.focusWindow();
      }
    };
  }, [isOpen]);

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
