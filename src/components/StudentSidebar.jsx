import React from 'react';
import { UserPlus, Users } from 'lucide-react';

export const StudentSidebar = ({ students, selectedStudentId, onSelectStudent }) => {
  return (
    <aside className="student-sidebar">
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={16} color="var(--primary)" />
          <span className="sidebar-title">학생 목록 ({students.length})</span>
        </div>
        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>
          <UserPlus size={14} />
          <span>추가</span>
        </button>
      </div>

      <div className="student-list">
        {students.map((student) => {
          const isActive = student.id === selectedStudentId;
          return (
            <div
              key={student.id}
              className={`student-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectStudent(student.id)}
            >
              <div className="student-avatar">
                {student.name.slice(0, 1)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: isActive ? 600 : 500 }}>{student.name}</div>
                <div style={{ fontSize: '11px', color: isActive ? 'var(--primary-dark)' : 'var(--text-muted)' }}>
                  {student.grade}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
