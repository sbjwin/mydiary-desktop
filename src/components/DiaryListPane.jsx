import React from 'react';
import { Calendar, PlusCircle } from 'lucide-react';

export const DiaryListPane = ({ diaries, selectedDiaryId, onSelectDiary, onNewDiary }) => {
  return (
    <section className="diary-list-pane">
      <div className="pane-header">
        <span className="sidebar-title">일지 기록 ({diaries.length})</span>
        <button className="btn btn-primary" onClick={onNewDiary} style={{ padding: '4px 10px', fontSize: '12px' }}>
          <PlusCircle size={14} />
          <span>새 일지</span>
        </button>
      </div>

      <div className="diary-list">
        {diaries.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            작성된 일지가 없습니다.
          </div>
        ) : (
          diaries.map((diary) => {
            const isActive = diary.id === selectedDiaryId;
            return (
              <div
                key={diary.id}
                className={`diary-card ${isActive ? 'active' : ''}`}
                onClick={() => onSelectDiary(diary.id)}
              >
                <div className="diary-card-date">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    {diary.date}
                  </span>
                </div>
                <div className="diary-card-title">{diary.title}</div>
                <div className="diary-card-preview">{diary.content}</div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
