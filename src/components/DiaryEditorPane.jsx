import React, { useState, useEffect } from 'react';
import { Save, FileDown, Calendar, User } from 'lucide-react';
import { exportDiaryToHwpx } from '../services/HwpxExportService';

export const DiaryEditorPane = ({ student, diary, onSaveDiary }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (diary) {
      setTitle(diary.title || '');
      setDate(diary.date || '');
      setContent(diary.content || '');
    } else {
      setTitle('');
      setDate(new Date().toISOString().slice(0, 10));
      setContent('');
    }
  }, [diary]);

  const handleSave = () => {
    if (!title.trim()) {
      alert('일지 제목을 입력해주세요.');
      return;
    }
    onSaveDiary({
      id: diary ? diary.id : 'd_' + Date.now(),
      studentId: student.id,
      title,
      date,
      content,
    });
    alert('일지가 저장되었습니다.');
  };

  const handleExportHwpx = async () => {
    if (!title.trim() && !content.trim()) {
      alert('내보낼 일지 내용이 없습니다.');
      return;
    }
    const currentData = {
      title,
      date,
      content,
    };
    await exportDiaryToHwpx(student, currentData);
  };

  if (!student) {
    return (
      <main className="diary-editor-pane" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          좌측에서 학생을 선택해주세요.
        </div>
      </main>
    );
  }

  return (
    <main className="diary-editor-pane">
      <div className="editor-card">
        <div className="editor-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
              {student.name} 학생 일지 작성
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              ({student.grade})
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-export-hwpx" onClick={handleExportHwpx}>
              <FileDown size={15} />
              <span>한글 문서(HWPX) 저장</span>
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              <Save size={15} />
              <span>저장</span>
            </button>
          </div>
        </div>

        <div className="editor-body">
          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ width: '180px' }}>
              <label className="form-label">일지 날짜</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">일지 제목</label>
              <input
                type="text"
                placeholder="제목을 입력하세요 (예: 수업 관찰 및 지도 사항)"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label className="form-label">관찰 및 활동 내용</label>
            <textarea
              className="form-textarea"
              placeholder="학생의 학습 태도, 교우 관계, 관찰 기록을 자유롭게 입력하세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>
      </div>
    </main>
  );
};
