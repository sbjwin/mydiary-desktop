import React, { useState, useEffect } from 'react';
import { Database, getMondayOfWeek, getDateFromMondayOffset } from '../database/Database';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Clock, FileEdit, Plus, Save } from 'lucide-react';

const DAYS = [
  { dayOfWeek: 1, name: '월요일' },
  { dayOfWeek: 2, name: '화요일' },
  { dayOfWeek: 3, name: '수요일' },
  { dayOfWeek: 4, name: '목요일' },
  { dayOfWeek: 5, name: '금요일' },
  { dayOfWeek: 6, name: '토요일' },
  { dayOfWeek: 7, name: '일요일' },
];

export const WeeklyScheduleTab = ({ onNavigateToDiary }) => {
  const [currentMonday, setCurrentMonday] = useState(() => getMondayOfWeek(new Date()));
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [dailyData, setDailyData] = useState({});
  const [loading, setLoading] = useState(true);
  const [mainNotes, setMainNotes] = useState('');

  const loadWeekData = async (monday) => {
    setLoading(true);
    try {
      const plan = await Database.getWeeklyPlan(monday);
      setWeeklyPlan(plan);
      setMainNotes(plan.mainNotes || '');

      const daily = {};
      for (let i = 0; i < 7; i++) {
        const dateStr = getDateFromMondayOffset(monday, i);
        const daySchedule = await Database.getDailyScheduleAndRecords(dateStr);
        daily[dateStr] = daySchedule;
      }
      setDailyData(daily);
    } catch (err) {
      console.error('Failed to load weekly schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeekData(currentMonday);
  }, [currentMonday]);

  const handlePrevWeek = () => {
    const [y, m, d] = currentMonday.split('-').map(Number);
    const prevDate = new Date(y, m - 1, d - 7);
    setCurrentMonday(getMondayOfWeek(prevDate));
  };

  const handleNextWeek = () => {
    const [y, m, d] = currentMonday.split('-').map(Number);
    const nextDate = new Date(y, m - 1, d + 7);
    setCurrentMonday(getMondayOfWeek(nextDate));
  };

  const handleCurrentWeek = () => {
    setCurrentMonday(getMondayOfWeek(new Date()));
  };

  const handleSaveNotes = async () => {
    if (!weeklyPlan) return;
    try {
      await Database.saveWeeklyPlan(currentMonday, {
        ...weeklyPlan,
        mainNotes: mainNotes,
      });
      alert('주간 메모가 저장되었습니다.');
    } catch (err) {
      alert('저장 실패: ' + err.message);
    }
  };

  const sundayDate = getDateFromMondayOffset(currentMonday, 6);

  return (
    <div className="tab-container weekly-schedule-tab">
      {/* 상단 컨트롤 바 */}
      <div className="tab-top-bar">
        <div className="week-nav-controls">
          <button className="icon-btn" onClick={handlePrevWeek} title="이전 주">
            <ChevronLeft size={18} />
          </button>
          <div className="current-week-display">
            <CalendarIcon size={18} className="text-primary" />
            <span className="week-range-text">
              {currentMonday} ~ {sundayDate}
            </span>
          </div>
          <button className="icon-btn" onClick={handleNextWeek} title="다음 주">
            <ChevronRight size={18} />
          </button>
          <button className="btn-secondary sm" onClick={handleCurrentWeek}>
            이번 주
          </button>
        </div>

        <div className="week-summary-stat">
          <span>총 계획 수업: </span>
          <strong>
            {Object.values(dailyData).reduce((sum, list) => sum + (list?.length || 0), 0)}건
          </strong>
        </div>
      </div>

      {/* 7일간의 주간 시간표 그리드 */}
      <div className="weekly-grid-container">
        {DAYS.map((dayInfo, idx) => {
          const dateStr = getDateFromMondayOffset(currentMonday, idx);
          const isToday = dateStr === new Date().toISOString().slice(0, 10);
          const items = dailyData[dateStr] || [];

          return (
            <div key={dateStr} className={`day-column ${isToday ? 'is-today' : ''}`}>
              <div className="day-column-header">
                <span className="day-name">{dayInfo.name}</span>
                <span className="day-date">{dateStr.slice(5)}</span>
              </div>

              <div className="day-items-list">
                {items.length === 0 ? (
                  <div className="no-schedules-placeholder">일정 없음</div>
                ) : (
                  items.map((item) => {
                    const isDone = item.status === 'completed' || item.status === 'completed_extra';
                    return (
                      <div
                        key={item.id}
                        className={`schedule-card ${isDone ? 'done' : 'pending'}`}
                        onClick={() =>
                          onNavigateToDiary &&
                          onNavigateToDiary({
                            studentId: item.studentId,
                            studentName: item.studentName,
                            date: dateStr,
                            classTime: item.classTime,
                            course: item.course,
                            diaryId: item.record?.id,
                          })
                        }
                      >
                        <div className="card-time-row">
                          <span className="card-time">
                            <Clock size={12} /> {item.classTime || '시간 미지정'}
                          </span>
                          <span className={`status-pill ${isDone ? 'completed' : 'planned'}`}>
                            {isDone ? (
                              <>
                                <CheckCircle2 size={11} /> 작성완료
                              </>
                            ) : (
                              '미작성'
                            )}
                          </span>
                        </div>

                        <div className="card-student-name">{item.studentName}</div>

                        {item.course && <div className="card-course-badge">{item.course}</div>}

                        {item.phoneInfo && (
                          <div className="card-phone-hint">
                            {item.phoneInfo.split('\n')[0]}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 주간 메모 섹션 */}
      <div className="weekly-notes-card">
        <div className="notes-header">
          <span className="notes-title">📌 주간 공지 및 주요 전달사항</span>
          <button className="btn-primary sm" onClick={handleSaveNotes}>
            <Save size={14} /> 메모 저장
          </button>
        </div>
        <textarea
          className="form-textarea notes-textarea"
          rows={3}
          value={mainNotes}
          onChange={(e) => setMainNotes(e.target.value)}
          placeholder="이번 주 학부모 상담 일정, 학원 휴강일, 주간 목표 등 주요 메모를 기록하세요..."
        />
      </div>
    </div>
  );
};
