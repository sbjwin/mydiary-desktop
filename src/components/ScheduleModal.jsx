import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, BookOpen, Trash2, Edit3, ArrowRight, Tag, AlertTriangle } from 'lucide-react';
import { formatPhoneInfo } from '../database/Database';

const QUICK_TAGS = ['=> 보강', '=> 시간변경', '=> 임시수업', '휴강'];
const DURATION_OPTIONS = [30, 40, 50, 60, 80, 90, 120];

export const ScheduleModal = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  students = [],
  existingSchedules = [],
  onNavigateToDiary,
}) => {
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [duration, setDuration] = useState(60);
  const [subject, setSubject] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [paymentType, setPaymentType] = useState('지사입금');
  const [phoneInfo, setPhoneInfo] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setStudentId(initialData.studentId || '');
      setStudentName(initialData.studentName || '');
      setDate(initialData.date || new Date().toISOString().slice(0, 10));
      setStartTime(initialData.startTime || '10:00');
      setDuration(initialData.duration || 60);
      setSubject(initialData.subject || initialData.course || '');
      setStatusNote(initialData.statusNote || '');
      setPaymentType(initialData.paymentType || '지사입금');
      setPhoneInfo(initialData.phoneInfo || '');
      setAddress(initialData.address || '');
    } else {
      // 기본값
      setStudentId('');
      setStudentName('');
      setDate(new Date().toISOString().slice(0, 10));
      setStartTime('10:00');
      setDuration(60);
      setSubject('');
      setStatusNote('');
      setPaymentType('지사입금');
      setPhoneInfo('');
      setAddress('');
    }
  }, [isOpen, initialData]);

  // 동일 날짜 및 시작 시간대 수업 중복 감지 (현재 수정 중인 대상 제외)
  const conflictSchedule = existingSchedules?.find((item) => {
    if (!date || !startTime) return false;
    if (initialData?.id && item.id === initialData.id) return false;
    const itemTime = (item.startTime || item.classTime || '').slice(0, 5);
    const targetTime = startTime.slice(0, 5);
    return item.date === date && itemTime === targetTime;
  });

  // 동일 날짜에 같은 학생이 이미 등록되어 있는지 감지 (현재 수정 중인 대상 제외)
  const sameStudentOnDate = existingSchedules?.find((item) => {
    if (!date || !studentName?.trim()) return false;
    if (initialData?.id && item.id === initialData.id) return false;
    const isSameId = studentId && item.studentId && item.studentId === studentId;
    const isSameName = item.studentName && item.studentName.trim() === studentName.trim();
    return item.date === date && (isSameId || isSameName);
  });

  // ESC 키로 모달 닫기 지원
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isEditMode = !!(initialData && initialData.id);

  // 학생 선택 시 기본 정보 자동 채우기
  const handleStudentSelect = (e) => {
    const selectedId = e.target.value;
    setStudentId(selectedId);

    const student = students.find((s) => s.id === selectedId);
    if (student) {
      setStudentName(student.name || '');
      const studentCourse =
        student.subject ||
        student.course ||
        (Array.isArray(student.default_schedules) && student.default_schedules[0]?.subject) ||
        '';
      setSubject(studentCourse);
      setPaymentType(student.payment_type || '지사입금');
      setAddress(student.address || '');

      const phoneList = [];
      const parentPhone = student.parent_mobile_phone || student.parentMobilePhone;
      const studentPhone = student.mobile_phone || student.mobilePhone;
      const homePhone = student.phone_number || student.phoneNumber;
      if (studentPhone) phoneList.push(`(본)${studentPhone}`);
      if (parentPhone) phoneList.push(`(모)${parentPhone}`);
      if (homePhone) phoneList.push(`(전화)${homePhone}`);
      setPhoneInfo(formatPhoneInfo(phoneList.join('\n')));
    }
  };

  const handleAddTag = (tag) => {
    if (!statusNote) {
      setStatusNote(tag);
    } else if (!statusNote.includes(tag)) {
      setStatusNote(`${statusNote} ${tag}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!studentName.trim()) {
      alert('학생 이름을 입력하거나 선택해 주세요.');
      return;
    }

    if (conflictSchedule) {
      const confirmDup = window.confirm(
        `[수업 시간 중복 안내]\n\n같은 시간대(${date} ${startTime})에 이미 [${conflictSchedule.studentName}] 학생의 수업이 등록되어 있습니다.\n\n그래도 이 시간에 등록하시겠습니까?`
      );
      if (!confirmDup) return;
    }

    if (sameStudentOnDate) {
      const confirmStudentDup = window.confirm(
        `[동일 학생 중복 안내]\n\n[${studentName.trim()}] 학생은 같은 날(${date})에 이미 다른 수업(${sameStudentOnDate.startTime || sameStudentOnDate.classTime || ''})이 등록되어 있습니다.\n\n해당 학생의 수업을 추가로 등록하시겠습니까?`
      );
      if (!confirmStudentDup) return;
    }

    const [y, m, d] = date.split('-').map(Number);
    const dayOfWeek = new Date(y, m - 1, d).getDay() || 7; // 1(월) ~ 7(일)

    const scheduleData = {
      id: initialData?.id || ('sched_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)),
      studentId: studentId || undefined,
      studentName: studentName.trim(),
      date,
      dayOfWeek,
      startTime,
      duration: Number(duration) || 60,
      subject: subject.trim(),
      course: subject.trim(),
      statusNote: statusNote.trim(),
      paymentType,
      phoneInfo,
      address,
    };

    onSave(scheduleData);
    onClose();
  };

  const handleDelete = () => {
    if (!initialData?.id) return;
    if (window.confirm(`'${studentName}' 학생의 이 수업 일정을 삭제하시겠습니까?`)) {
      onDelete(initialData.id);
      onClose();
    }
  };

  const handleGoToDiary = () => {
    if (!onNavigateToDiary) return;
    onNavigateToDiary({
      studentId: studentId || initialData?.studentId,
      studentName: studentName || initialData?.studentName,
      date: date,
      classTime: startTime,
      course: subject,
      diaryId: initialData?.record?.id,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop schedule-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-content schedule-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header schedule-modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              {isEditMode ? <Edit3 size={18} /> : <Calendar size={18} />}
            </div>
            <div>
              <h3 className="modal-title">{isEditMode ? '수업 일정 수정' : '새 수업 일정 등록'}</h3>
              <p className="modal-subtitle">
                {isEditMode
                  ? '수업 날짜와 시간을 조정하거나 일지 작성으로 바로 이동할 수 있습니다.'
                  : '주간 시간표에 새로운 수업 일정을 등록합니다.'}
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} title="닫기 (ESC)">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form schedule-modal-form">
          <div className="modal-body schedule-modal-body">
            {/* 학생 선택 */}
            <div className="form-group">
              <label className="form-label">
                <User size={14} className="mr-1 inline-icon" /> 학생 선택
              </label>
              <div className="schedule-student-select-row">
                <select
                  className="form-select schedule-student-select"
                  value={studentId}
                  onChange={handleStudentSelect}
                >
                  <option value="">-- 등록된 학생에서 선택 --</option>
                  {students
                    .filter((s) => s.status !== 'paused')
                    .slice()
                    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko'))
                    .map((s) => {
                      const displayCourse =
                        s.subject ||
                        s.course ||
                        (Array.isArray(s.default_schedules) && s.default_schedules[0]?.subject) ||
                        '과목미지정';
                      return (
                        <option key={s.id} value={s.id}>
                          {s.name} ({displayCourse})
                        </option>
                      );
                    })}
                </select>
                <input
                  type="text"
                  className="form-input schedule-student-input"
                  placeholder="직접 학생명 입력"
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    if (studentId) setStudentId('');
                  }}
                  required
                />
              </div>
            </div>

            {/* 일자 및 시작 시간 */}
            <div className="form-row-grid-2">
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={14} className="mr-1 inline-icon" /> 수업 일자
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={14} className="mr-1 inline-icon" /> 시작 시간
                </label>
                <input
                  type="time"
                  className="form-input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
                {conflictSchedule && (
                  <div
                    style={{
                      backgroundColor: '#fffbeb',
                      border: '1px solid #fde047',
                      color: '#b45309',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      marginTop: '6px',
                    }}
                  >
                    <AlertTriangle size={14} color="#d97706" style={{ flexShrink: 0 }} />
                    <span>
                      ⚠️ <strong>{conflictSchedule.studentName}</strong> 학생과 시간이 겹칩니다!
                    </span>
                  </div>
                )}
                {sameStudentOnDate && !conflictSchedule && (
                  <div
                    style={{
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#1e40af',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      marginTop: '6px',
                    }}
                  >
                    <AlertTriangle size={14} color="#3b82f6" style={{ flexShrink: 0 }} />
                    <span>
                      ℹ️ <strong>{studentName}</strong> 학생의 수업이 같은 날({sameStudentOnDate.startTime || sameStudentOnDate.classTime})에 이미 등록되어 있습니다.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 수업 시간 & 과목 */}
            <div className="form-row-grid-2">
              <div className="form-group">
                <label className="form-label">수업 시간 (분)</label>
                <select
                  className="form-select"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                >
                  {DURATION_OPTIONS.map((min) => (
                    <option key={min} value={min}>
                      {min}분
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <BookOpen size={14} className="mr-1 inline-icon" /> 과목 / 과정
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="예: 수학, 영어, 독서 등"
                  value={subject || ''}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>

            {/* 특이사항 & 퀵 태그 */}
            <div className="form-group">
              <label className="form-label">
                <Tag size={14} className="mr-1 inline-icon" /> 특이사항 메모 / 태그
              </label>
              <div className="tag-quick-buttons">
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="tag-btn-chip"
                    onClick={() => handleAddTag(tag)}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
              <input
                type="text"
                className="form-input"
                placeholder="예: => 이번주만 30분 일찍, 보강 등"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </div>

            {/* 수납 구분 */}
            <div className="form-group">
              <label className="form-label">수납 구분</label>
              <select
                className="form-select"
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
              >
                <option value="지사입금">지사입금</option>
                <option value="직접결제">직접결제</option>
                <option value="계좌이체">계좌이체</option>
                <option value="기타">기타</option>
              </select>
            </div>
          </div>

          <div className="modal-footer schedule-modal-footer">
            <div className="footer-left-actions">
              {isEditMode && (
                <button
                  type="button"
                  className="btn-danger sm"
                  onClick={handleDelete}
                  title="일정 삭제"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Trash2 size={14} /> 삭제
                </button>
              )}
            </div>

            <div className="footer-right-actions">
              {isEditMode && onNavigateToDiary && (
                <button
                  type="button"
                  className="btn-secondary sm btn-diary-direct"
                  onClick={handleGoToDiary}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <ArrowRight size={14} /> 수업 일지 작성
                </button>
              )}
              <button type="button" className="btn-secondary sm" onClick={onClose}>
                취소
              </button>
              <button type="submit" className="btn-primary sm">
                {isEditMode ? '수정 저장' : '등록'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
