import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, BookOpen, Trash2, Edit3, ArrowRight, Tag } from 'lucide-react';
import { formatPhoneInfo } from '../database/Database';

const QUICK_TAGS = ['=> 이번주만', '=> 보강', '=> 시간변경', '휴강'];
const DURATION_OPTIONS = [30, 40, 50, 60, 80, 90, 120];

export const ScheduleModal = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  students = [],
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
  const [isRecurring, setIsRecurring] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setStudentId(initialData.studentId || '');
      setStudentName(initialData.studentName || '');
      setDate(initialData.date || new Date().toISOString().slice(0, 10));
      setStartTime(initialData.startTime || '10:00');
      setDuration(initialData.duration || 60);
      setSubject(initialData.subject || '');
      setStatusNote(initialData.statusNote || '');
      setPaymentType(initialData.paymentType || '지사입금');
      setPhoneInfo(initialData.phoneInfo || '');
      setAddress(initialData.address || '');
      setIsRecurring(initialData.isRecurring !== false);
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
      setIsRecurring(true);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isEditMode = !!(initialData && initialData.id);

  // 학생 선택 시 기본 정보 자동 채우기
  const handleStudentSelect = (e) => {
    const selectedId = e.target.value;
    setStudentId(selectedId);

    const student = students.find((s) => s.id === selectedId);
    if (student) {
      setStudentName(student.name || '');
      setSubject(student.subject || student.course || '');
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
      statusNote: statusNote.trim(),
      paymentType,
      phoneInfo,
      address,
      isRecurring,
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
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content schedule-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', width: '92%' }}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <Calendar className="modal-title-icon" size={20} />
            <h3 className="modal-title">{isEditMode ? '수업 일정 수정' : '새 수업 일정 등록'}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="닫기">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 학생 선택 */}
            <div className="form-group">
              <label className="form-label">
                <User size={14} className="mr-1 inline-icon" /> 학생 선택
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  className="form-select"
                  value={studentId}
                  onChange={handleStudentSelect}
                  style={{ flex: 1 }}
                >
                  <option value="">-- 등록된 학생에서 선택 --</option>
                  {students
                    .filter((s) => s.status !== 'paused')
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.course || s.subject || '과목미지정'})
                      </option>
                    ))}
                </select>
                <input
                  type="text"
                  className="form-input"
                  placeholder="직접 학생명 입력"
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    if (studentId) setStudentId('');
                  }}
                  style={{ flex: 1 }}
                  required
                />
              </div>
            </div>

            {/* 일자 및 시작 시간 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
              </div>
            </div>

            {/* 수업 시간 & 과목 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>

            {/* 특이사항 & 퀵 태그 */}
            <div className="form-group">
              <label className="form-label">
                <Tag size={14} className="mr-1 inline-icon" /> 특이사항 메모 / 태그
              </label>
              <div className="tag-quick-buttons" style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
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

            {/* 기타 정보: 연락처 및 주소 (접이식 혹은 간소) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '22px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                  />
                  <span>매주 이 요일에 정규 반복</span>
                </label>
              </div>
            </div>
          </div>

          <div
            className="modal-footer"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '18px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-color, #e2e8f0)',
            }}
          >
            <div>
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

            <div style={{ display: 'flex', gap: '8px' }}>
              {isEditMode && onNavigateToDiary && (
                <button
                  type="button"
                  className="btn-secondary sm"
                  onClick={handleGoToDiary}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#e0f2fe', color: '#0369a1' }}
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
