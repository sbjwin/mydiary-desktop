import React from 'react';
import { BookOpen, Laptop, Sparkles } from 'lucide-react';

export const Header = () => {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo">
          <BookOpen size={18} />
        </div>
        <span className="brand-title">MyDiary Desktop</span>
        <span className="brand-badge">v0.1.0</span>
      </div>

      <div className="header-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <Laptop size={14} />
          <span>성백진 선생님 (교실 모드)</span>
        </div>
      </div>
    </header>
  );
};
