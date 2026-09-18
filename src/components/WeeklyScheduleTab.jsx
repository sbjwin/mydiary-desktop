import React, { useState, useEffect, useMemo } from 'react';
import { Database, getMondayOfWeek, getDateFromMondayOffset } from '../database/Database';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Plus,
  Save,
  Printer,
  FileDown,
  LayoutGrid,
  Columns,
  Sparkles,
  Copy,
  RotateCcw,
} from 'lucide-react';
import { ScheduleModal } from './ScheduleModal';
import { printWeeklyReport, shareWeeklyReportHwpx, shareWeeklyReportDocx } from '../services/PrintService';

const DAYS = [
  { dayOfWeek: 1, name: '월요일', short: '월' },
  { dayOfWeek: 2, name: '화요일', short: '화' },
  { dayOfWeek: 3, name: '수요일', short: '수' },
  { dayOfWeek: 4, name: '목요일', short: '목' },
  { dayOfWeek: 5, name: '금요일', short: '금' },
  { dayOfWeek: 6, name: '토요일', short: '토' },
  { dayOfWeek: 7, name: '일요일', short: '일' },
];

const TIME_SLOTS = [
  { label: '오전', hour: 9 },
  { label: '10시', hour: 10 },
  { label: '11시', hour: 11 },
  { label: '12시', hour: 12, isLunch: true },
  { label: '1시', hour: 13 },
  { label: '2시', hour: 14 },
  { label: '3시', hour: 15 },
  { label: '4시', hour: 16 },
  { label: '5시', hour: 17 },
  { label: '6시', hour: 18 },
  { label: '7시', hour: 19 },
  { label: '8시', hour: 20 },
];

// 시간 문자열에서 24시간 형식의 '시(hour)' 추출 헬퍼
const extractHour = (timeStr) => {
  if (!timeStr) return 10;
  const str = String(timeStr).trim();
  const digitalMatch = str.match(/^(\d{1,2}):(\d{2})/);
  if (digitalMatch) {
    return parseInt(digitalMatch[1], 10);
  }
  const isPM = str.includes('오후') || str.includes('PM') || str.includes('pm');
  const isAM = str.includes('오전') || str.includes('AM') || str.includes('am');
  const hourMatch = str.match(/(\d{1,2})\s*시/) || str.match(/\b(\d{1,2})\b/);
  if (hourMatch) {
    let hour = parseInt(hourMatch[1], 10);
    if (isPM && hour < 12) hour += 12;
    else if (isAM && hour === 12) hour = 0;
    return hour;
  }
  return 10;
};

export const WeeklyScheduleTab = ({ onNavigateToDiary }) => {
  const [currentMonday, setCurrentMonday] = useState(() => getMondayOfWeek(new Date()));
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [dailyData, setDailyData] = useState({});
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainNotes, setMainNotes] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' (주간 전체 표) | 'cards' (요일별 상세 카드)

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState(null);

  const loadWeekData = async (monday) => {
    setLoading(true);
    try {
      const [plan, allStudents] = await Promise.all([
        Database.getWeeklyPlan(monday),
        Database.getAllStudents(),
      ]);

      setWeeklyPlan(plan);
      setMainNotes(plan.mainNotes || '');
      setStudents(allStudents || []);

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

  // 모달 열기: 신규 추가 (특정 날짜 및 시간대 지정)
  const handleOpenAddSchedule = (dateStr, hour) => {
    const paddedHour = String(hour).padStart(2, '0');
    setModalInitialData({
      date: dateStr,
      startTime: `${paddedHour}:00`,
      duration: 60,
    });
    setIsModalOpen(true);
  };

  // 모달 열기: 기존 일정 수정
  const handleOpenEditSchedule = (item) => {
    const rawData = item.planItem ? { ...item.planItem, record: item.record } : item;
    const targetData = {
      ...rawData,
      subject: rawData.subject || rawData.course || '',
      course: rawData.course || rawData.subject || '',
      startTime: rawData.startTime || rawData.classTime || '10:00',
    };
    setModalInitialData(targetData);
    setIsModalOpen(true);
  };

  // 모달에서 저장 완료 처리
  const handleSaveSchedule = async (scheduleData) => {
    if (!weeklyPlan) return;
    try {
      const items = Array.isArray(weeklyPlan.scheduleItems) ? [...weeklyPlan.scheduleItems] : [];
      const index = items.findIndex((it) => it.id === scheduleData.id);

      if (index >= 0) {
        // 기존 수정
        items[index] = { ...items[index], ...scheduleData };
      } else {
        // 신규 추가
        items.push(scheduleData);
      }

      const updatedPlan = {
        ...weeklyPlan,
        scheduleItems: items,
      };

      await Database.saveWeeklyPlan(currentMonday, updatedPlan);
      await loadWeekData(currentMonday);
    } catch (err) {
      console.error('Failed to save schedule:', err);
      alert('일정 저장 중 오류가 발생했습니다: ' + err.message);
    }
  };

  // 모달에서 삭제 완료 처리
  const handleDeleteSchedule = async (scheduleId) => {
    if (!weeklyPlan) return;
    try {
      const items = (weeklyPlan.scheduleItems || []).filter((it) => it.id !== scheduleId);
      const updatedPlan = {
        ...weeklyPlan,
        scheduleItems: items,
      };

      await Database.saveWeeklyPlan(currentMonday, updatedPlan);
      await loadWeekData(currentMonday);
    } catch (err) {
      console.error('Failed to delete schedule:', err);
      alert('일정 삭제 중 오류가 발생했습니다: ' + err.message);
    }
  };

  // 이전 주 시간표 복사 핸들러 (선생님 수동 선택 복사)
  const handleCopyPrevWeek = async () => {
    const prevMonday = getDateFromMondayOffset(currentMonday, -7);
    const prevSunday = getDateFromMondayOffset(currentMonday, -1);
    const confirmMsg = `이전 주(${prevMonday} ~ ${prevSunday})에 등록된 수업 일정들을 이번 주로 복사해 오시겠습니까?\n\n※ 기존에 등록된 이번 주 수업 일정이 있다면 이전 주 일정으로 새로 갱신됩니다.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await Database.copyPreviousWeekPlan(currentMonday);
      await loadWeekData(currentMonday);
      alert('이전 주 시간표가 성공적으로 복사되었습니다.');
    } catch (err) {
      alert('시간표 복사 실패: ' + err.message);
    }
  };

  // 학생 기본 시간표 불러오기 핸들러 (학생 원장의 정규 수업 시간표를 이번 주로 일괄 가져오기)
  const handleLoadDefaultSchedule = async () => {
    const confirmMsg = `학생 원장에 등록된 정규 수업 시간표를 이번 주(${currentMonday} ~ ${sundayDate})로 불러오시겠습니까?\n\n※ 중복 시간은 1건으로 정제되며, 기존에 등록된 이번 주 수업 일정이 있다면 기본 시간표로 새로 대체됩니다.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const updatedPlan = await Database.loadWeeklyPlanFromStudentDefaults(currentMonday);
      await loadWeekData(currentMonday);
      const count = updatedPlan?.scheduleItems?.length || 0;
      alert(`학생 기본 시간표 ${count}건을 성공적으로 불러왔습니다.`);
    } catch (err) {
      alert('기본 시간표 불러오기 실패: ' + err.message);
    }
  };

  // 이번 주 시간표 전체 비우기 핸들러 (잘못 등록되거나 겹친 일정 일괄 정리)
  const handleClearWeek = async () => {
    const confirmMsg = `이번 주(${currentMonday} ~ ${sundayDate})에 등록된 모든 수업 일정을 비우시겠습니까?\n\n※ 작성 완료된 과거 수업 일지는 안전하게 보관되며, 시간표의 수업 배치만 깨끗이 비워집니다.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await Database.clearWeeklyPlan(currentMonday);
      await loadWeekData(currentMonday);
      alert('이번 주 시간표의 모든 수업 일정이 초기화되었습니다.');
    } catch (err) {
      alert('시간표 비우기 실패: ' + err.message);
    }
  };

  // 인쇄 및 문서 내보내기 핸들러
  const handlePrint = async () => {
    if (!weeklyPlan) return;
    await printWeeklyReport(weeklyPlan);
  };

  const handleExportHwpx = async () => {
    if (!weeklyPlan) return;
    await shareWeeklyReportHwpx(weeklyPlan);
  };

  const handleExportDocx = async () => {
    if (!weeklyPlan) return;
    await shareWeeklyReportDocx(weeklyPlan);
  };

  const sundayDate = getDateFromMondayOffset(currentMonday, 6);

  // 주간 총 수업 건수
  const totalScheduleCount = useMemo(() => {
    return Object.values(dailyData).reduce((sum, list) => sum + (list?.length || 0), 0);
  }, [dailyData]);

  // 특정 날짜 및 시간 슬롯에 해당하는 일정 아이템 조회
  const getSlotItems = (dateStr, slot) => {
    const dayItems = dailyData[dateStr] || [];
    return dayItems.filter((item) => {
      const h = extractHour(item.classTime || item.startTime);
      if (slot.hour === 9) {
        return h <= 9; // 9시 및 9시 이전(오전)
      } else if (slot.hour === 20) {
        return h >= 20; // 20시 및 20시 이후(저녁/야간)
      }
      return h === slot.hour;
    });
  };

  return (
    <div className="tab-container weekly-schedule-tab">
      {/* 1. 상단 컨트롤 바 */}
      <div className="tab-top-bar weekly-top-toolbar">
        {/* 주차 이동 버튼 */}
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

        {/* 뷰 모드 탭 (주간 전체 표 vs 요일별 카드) */}
        <div className="view-mode-toggle-group">
          <button
            className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="스마트폰 앱 및 PDF 서식의 주간 전체 시간표"
          >
            <LayoutGrid size={15} /> 주간 전체 표 (PDF 서식)
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
            title="요일별 카드 뷰"
          >
            <Columns size={15} /> 요일별 상세 보기
          </button>
        </div>

        {/* 액션 버튼 그룹 (수업 등록 / 복사 / 비우기 / 인쇄 / 한글 / 워드) */}
        <div className="week-actions-group">
          <button
            className="btn-primary sm"
            onClick={() => handleOpenAddSchedule(currentMonday, 10)}
            title="새 수업 일정 등록"
          >
            <Plus size={15} /> 일정 추가
          </button>
          <button
            className="btn-secondary sm"
            onClick={handleCopyPrevWeek}
            title="이전 주의 수업 일정들을 이번 주로 한 번에 복사합니다"
          >
            <Copy size={15} /> 이전 주 복사
          </button>
          <button
            className="btn-secondary sm"
            onClick={handleLoadDefaultSchedule}
            title="학생 원장에 등록된 정규 기본 시간표를 이번 주로 일괄 불러옵니다"
          >
            <Sparkles size={15} /> 기본 시간표 불러오기
          </button>
          <button
            className="btn-secondary sm"
            onClick={handleClearWeek}
            title="이번 주 시간표에 등록된 모든 수업 일정을 비웁니다"
          >
            <RotateCcw size={15} /> 시간표 비우기
          </button>
          <button className="btn-secondary sm" onClick={handlePrint} title="A4 인쇄 또는 PDF 저장">
            <Printer size={15} /> 인쇄 / PDF
          </button>
          <button className="btn-secondary sm" onClick={handleExportHwpx} title="한글(HWPX) 문서로 내보내기">
            <FileDown size={15} /> 한글(HWPX)
          </button>
          <button className="btn-secondary sm" onClick={handleExportDocx} title="워드(DOCX) 문서로 내보내기">
            <FileDown size={15} /> 워드(DOCX)
          </button>
        </div>
      </div>

      {/* 요약 바 */}
      <div className="weekly-sub-bar">
        <div className="week-stats">
          <span>📅 이번 주 등록 수업: <strong>{totalScheduleCount}건</strong></span>
        </div>
        <div className="view-hint">
          {viewMode === 'table' ? (
            <span>💡 빈 칸의 <strong>+</strong>를 누르면 해당 시간대에 수업을 즉시 등록할 수 있으며, 수업 카드를 클릭하면 일지 작성으로 바로 이동합니다.</span>
          ) : (
            <span>💡 요일별 카드를 클릭하면 해당 일자의 수업 일지를 바로 작성하거나 수정할 수 있습니다.</span>
          )}
        </div>
      </div>

      {/* 2. 본문 영역 */}
      {viewMode === 'table' ? (
        /* ▦ 주간 전체 표 (시간표 매트릭스) */
        <div className="weekly-matrix-container">
          <table className="weekly-matrix-table">
            <thead>
              <tr>
                <th className="time-col-header">구분</th>
                {DAYS.map((dayInfo, idx) => {
                  const dateStr = getDateFromMondayOffset(currentMonday, idx);
                  const isToday = dateStr === new Date().toISOString().slice(0, 10);
                  const isSunday = dayInfo.dayOfWeek === 7;
                  const isSaturday = dayInfo.dayOfWeek === 6;

                  return (
                    <th
                      key={dateStr}
                      className={`day-col-header ${isToday ? 'is-today' : ''} ${
                        isSunday ? 'sunday-col' : isSaturday ? 'saturday-col' : ''
                      }`}
                    >
                      <div className="header-day-name">{dayInfo.name}</div>
                      <div className="header-day-date">{dateStr.slice(5)}</div>
                      {isToday && <span className="today-badge">오늘</span>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((slot) => {
                // 12시 점심시간 배너 행 (가로 전체 병합)
                if (slot.isLunch) {
                  return (
                    <tr key="lunch-row" className="matrix-lunch-row">
                      <td className="time-slot-label lunch-label">{slot.label}</td>
                      <td colSpan={7} className="lunch-banner-cell">
                        <div className="lunch-banner-content">
                          <span className="lunch-icon">🍱</span>
                          <span className="lunch-title">12:00 ~ 13:00 즐거운 점심 시간</span>
                          <span className="lunch-icon">☕</span>
                        </div>
                      </td>
                    </tr>
                  );
                }

                // 일반 시간 슬롯 행
                return (
                  <tr key={slot.hour} className="matrix-time-row">
                    <td className="time-slot-label">{slot.label}</td>
                    {DAYS.map((dayInfo, idx) => {
                      const dateStr = getDateFromMondayOffset(currentMonday, idx);
                      const items = getSlotItems(dateStr, slot);
                      const isToday = dateStr === new Date().toISOString().slice(0, 10);

                      return (
                        <td
                          key={`${dateStr}-${slot.hour}`}
                          className={`matrix-slot-cell ${isToday ? 'cell-today' : ''}`}
                        >
                          <div className="slot-cell-content">
                            {/* 일정 카드 목록 */}
                            {items.map((item) => {
                              const isDone = item.status === 'completed' || item.status === 'completed_extra';
                              return (
                                <div
                                  key={item.id}
                                  className={`matrix-schedule-badge ${isDone ? 'done' : 'pending'}`}
                                  onClick={() =>
                                    handleOpenEditSchedule(
                                      item.planItem ? { ...item.planItem, record: item.record } : item
                                    )
                                  }
                                  title={`클릭하여 수정 또는 일지 작성 (${item.studentName})`}
                                >
                                  <div className="badge-header-row">
                                    <span className="badge-time">
                                      {item.classTime ? item.classTime.slice(0, 5) : `${slot.hour}:00`}
                                    </span>
                                    <span className={`badge-status-dot ${isDone ? 'dot-done' : 'dot-pending'}`} />
                                  </div>
                                  <div className="badge-student-name">
                                    {item.studentName}
                                  </div>
                                  {item.course && (
                                    <div className="badge-subject">{item.course}</div>
                                  )}
                                  {item.statusNote && (
                                    <div className="badge-note" title={item.statusNote}>
                                      {item.statusNote}
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            {/* 빈 자리 또는 추가 버튼 */}
                            <button
                              type="button"
                              className="slot-add-btn"
                              onClick={() => handleOpenAddSchedule(dateStr, slot.hour)}
                              title={`${dayInfo.name} ${slot.label} 수업 추가`}
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* := 요일별 카드 뷰 (기존 7열 카드 목록) */
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
                  <button
                    className="day-header-add-btn"
                    onClick={() => handleOpenAddSchedule(dateStr, 10)}
                    title="이 날짜에 수업 추가"
                  >
                    <Plus size={14} />
                  </button>
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
                            handleOpenEditSchedule(
                              item.planItem ? { ...item.planItem, record: item.record } : item
                            )
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

                          {item.statusNote && (
                            <div className="card-note-badge">{item.statusNote}</div>
                          )}

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
      )}

      {/* 3. 주간 메모 섹션 */}
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

      {/* 4. 수업 일정 등록/수정 모달 */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSchedule}
        onDelete={handleDeleteSchedule}
        initialData={modalInitialData}
        students={students}
        existingSchedules={weeklyPlan?.scheduleItems || []}
        onNavigateToDiary={onNavigateToDiary}
      />
    </div>
  );
};
