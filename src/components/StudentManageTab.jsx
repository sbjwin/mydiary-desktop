import React, { useState, useEffect } from 'react';
import { Database, getTodayDateString, formatPhoneInfo } from '../database/Database';
import { generateStudentProfileHtml } from '../services/PrintService';
import { showToast, showConfirm, focusAppWindow } from '../utils/dialog';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Save,
  Trash2,
  PauseCircle,
  PlayCircle,
  Printer,
  Plus,
  X,
} from 'lucide-react';

const WEEKDAYS = [
  { val: 1, label: '월요일' },
  { val: 2, label: '화요일' },
  { val: 3, label: '수요일' },
  { val: 4, label: '목요일' },
  { val: 5, label: '금요일' },
  { val: 6, label: '토요일' },
  { val: 7, label: '일요일' },
];

export const StudentManageTab = () => {
  const [students, setStudents] = useState([]);
  const [activeFilter, setActiveFilter] = useState('active'); // 'active' | 'paused' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // 학생 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    school_grade: '',
    course: '',
    status: 'active',
    first_enrolled_date: getTodayDateString(),
    payment_type: '지사입금',
    study_method: '방문지도',
    mobile_phone: '',
    parent_name: '',
    parent_mobile_phone: '',
    phone_number: '',
    address: '',
    resident_number: '',
    notes: '',
    default_schedules: [],
  });

  // 휴회 / 재수강 모달 상태
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(getTodayDateString());
  const [modalReason, setModalReason] = useState('');

  const loadStudents = async () => {
    const list = await Database.getAllStudents();
    setStudents(list);
    if (!selectedStudentId && list.length > 0) {
      setSelectedStudentId(list[0].id);
      populateForm(list[0]);
    } else if (selectedStudentId) {
      const current = list.find((s) => s.id === selectedStudentId);
      if (current) populateForm(current);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const populateForm = (st) => {
    const resolvedCourse =
      st.course ||
      st.subject ||
      (Array.isArray(st.default_schedules) && st.default_schedules[0]?.subject) ||
      '';
    setFormData({
      name: st.name || '',
      school_grade: st.school_grade || st.grade || '',
      course: resolvedCourse,
      status: st.status || 'active',
      first_enrolled_date: st.first_enrolled_date || st.start_date || getTodayDateString(),
      payment_type: st.payment_type || '지사입금',
      study_method: st.study_method || '방문지도',
      mobile_phone: st.mobile_phone || '',
      parent_name: st.parent_name || '',
      parent_mobile_phone: st.parent_mobile_phone || '',
      phone_number: st.phone_number || '',
      address: st.address || '',
      resident_number: st.resident_number || '',
      notes: st.notes || '',
      default_schedules: Array.isArray(st.default_schedules) ? [...st.default_schedules] : [],
    });
  };

  const handleSelectStudent = (st) => {
    setSelectedStudentId(st.id);
    populateForm(st);
  };

  const handleNewStudent = () => {
    setSelectedStudentId(null);
    setFormData({
      name: '',
      school_grade: '',
      course: '',
      status: 'active',
      first_enrolled_date: getTodayDateString(),
      payment_type: '지사입금',
      study_method: '방문지도',
      mobile_phone: '',
      parent_name: '',
      parent_mobile_phone: '',
      phone_number: '',
      address: '',
      resident_number: '',
      notes: '',
      default_schedules: [{ dayOfWeek: 1, startTime: '14:00', duration: 60, subject: '수학' }],
    });
  };

  const handleSaveStudent = async () => {
    if (!formData.name.trim()) {
      showToast('학생 성명을 입력해 주세요.', 'warning');
      return;
    }

    try {
      const payload = {
        ...formData,
        course: formData.course.trim(),
        subject: formData.course.trim(),
      };

      if (selectedStudentId) {
        await Database.updateStudent(selectedStudentId, payload);
        showToast('학생 정보가 수정되었습니다.', 'success');
      } else {
        const newSt = await Database.addStudent(payload);
        setSelectedStudentId(newSt.id);
        showToast('새 학생이 등록되었습니다.', 'success');
      }
      await loadStudents();
      focusAppWindow();
    } catch (err) {
      showToast('저장 실패: ' + err.message, 'error');
    }
  };

  const handleDeleteStudent = () => {
    if (!selectedStudentId) return;
    showConfirm({
      title: '학생 정보 삭제',
      message: '이 학생과 관련된 모든 수업 일지 및 기록이 삭제됩니다.\n정말 삭제하시겠습니까?',
      type: 'danger',
      confirmText: '삭제',
      cancelText: '취소',
      onConfirm: async () => {
        try {
          await Database.deleteStudent(selectedStudentId);
          showToast('학생이 성공적으로 삭제되었습니다.', 'info');
          setSelectedStudentId(null);
          await loadStudents();
          focusAppWindow();
        } catch (err) {
          showToast('삭제 실패: ' + err.message, 'error');
        }
      },
    });
  };

  // 휴회 처리
  const handleConfirmPause = async () => {
    if (!selectedStudentId) return;
    try {
      await Database.pauseStudentTerm(selectedStudentId, {
        endDate: modalDate,
        reason: modalReason || '휴회',
      });
      showToast('학생이 휴회 상태로 변경되었습니다.', 'info');
      setPauseModalOpen(false);
      setModalReason('');
      await loadStudents();
      focusAppWindow();
    } catch (err) {
      showToast('휴회 처리 실패: ' + err.message, 'error');
    }
  };

  // 재수강(복귀) 처리
  const handleConfirmResume = async () => {
    if (!selectedStudentId) return;
    try {
      await Database.resumeStudentTerm(selectedStudentId, {
        startDate: modalDate,
        reason: modalReason || '재수강 복귀',
        defaultSchedules: formData.default_schedules,
      });
      showToast('학생이 재수강(새 차수)으로 등록되었습니다.', 'success');
      setResumeModalOpen(false);
      setModalReason('');
      await loadStudents();
      focusAppWindow();
    } catch (err) {
      showToast('재수강 처리 실패: ' + err.message, 'error');
    }
  };

  // 기본 시간표 스케줄 추가/삭제/변경
  const handleAddSchedule = () => {
    setFormData((prev) => ({
      ...prev,
      default_schedules: [
        ...prev.default_schedules,
        { dayOfWeek: 1, startTime: '15:00', duration: 60, subject: '수학' },
      ],
    }));
  };

  const handleRemoveSchedule = (index) => {
    setFormData((prev) => ({
      ...prev,
      default_schedules: prev.default_schedules.filter((_, idx) => idx !== index),
    }));
  };

  const handleScheduleChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.default_schedules];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, default_schedules: updated };
    });
  };

  // 학생 카드 인쇄
  const handlePrintProfile = () => {
    const st = students.find((s) => s.id === selectedStudentId);
    if (!st) return;
    const html = generateStudentProfileHtml(st);
    const win = window.open('', '_blank', 'width=900,height=800');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 400);
    }
  };

  // 필터링된 학생 리스트
  const filteredStudents = students.filter((s) => {
    if (activeFilter === 'active' && s.status === 'paused') return false;
    if (activeFilter === 'paused' && s.status !== 'paused') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (s.name || '').toLowerCase().includes(q);
      const matchGrade = (s.school_grade || s.grade || '').toLowerCase().includes(q);
      const matchPhone = (s.mobile_phone || '').includes(q);
      return matchName || matchGrade || matchPhone;
    }
    return true;
  });

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="tab-container student-manage-tab">
      {/* 좌측 사이드바: 학생 필터 및 목록 */}
      <div className="student-list-sidebar">
        <div className="student-sidebar-top">
          <div className="filter-pill-group">
            <button
              className={`pill-btn ${activeFilter === 'active' ? 'active' : ''}`}
              onClick={() => setActiveFilter('active')}
            >
              재원생 ({students.filter((s) => s.status !== 'paused').length})
            </button>
            <button
              className={`pill-btn ${activeFilter === 'paused' ? 'active' : ''}`}
              onClick={() => setActiveFilter('paused')}
            >
              휴회생 ({students.filter((s) => s.status === 'paused').length})
            </button>
            <button
              className={`pill-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              전체 ({students.length})
            </button>
          </div>

          <div className="search-input-box">
            <Search size={14} className="text-muted" />
            <input
              type="text"
              placeholder="학생 이름, 학교, 연락처 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button className="btn-primary full-width" onClick={handleNewStudent}>
            <UserPlus size={15} /> 신규 학생 등록
          </button>
        </div>

        <div className="student-items-scroll">
          {filteredStudents.length === 0 ? (
            <div className="empty-notice">해당 조건의 학생이 없습니다.</div>
          ) : (
            filteredStudents.map((st) => {
              const isSelected = st.id === selectedStudentId;
              const isPaused = st.status === 'paused';
              return (
                <div
                  key={st.id}
                  className={`student-item-card ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectStudent(st)}
                >
                  <div className="student-item-header">
                    <span className="student-name">{st.name}</span>
                    <span className={`status-badge ${isPaused ? 'paused' : 'active'}`}>
                      {isPaused ? '휴회' : `${st.current_term_number || 1}차 수강`}
                    </span>
                  </div>
                  <div className="student-sub-info">
                    <span>{st.school_grade || st.grade || '학교/학년 미지정'}</span>
                    <span>
                      {st.course ||
                        st.subject ||
                        (Array.isArray(st.default_schedules) && st.default_schedules[0]?.subject) ||
                        '과목미지정'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 우측: 학생 프로필 상세 및 관리 편집기 */}
      <div className="student-detail-panel">
        <div className="detail-top-bar">
          <div className="detail-title-area">
            <h2>{selectedStudentId ? `${formData.name} 학생 상세 정보` : '신규 학생 정보 등록'}</h2>
            {selectedStudent && (
              <span className={`term-chip ${selectedStudent.status === 'paused' ? 'paused' : 'active'}`}>
                {selectedStudent.status === 'paused'
                  ? '현재 휴회 중'
                  : `현재 ${selectedStudent.current_term_number || 1}차 수강 중`}
              </span>
            )}
          </div>

          <div className="btn-group">
            {selectedStudentId && (
              <>
                <button className="btn-secondary" onClick={handlePrintProfile}>
                  <Printer size={15} /> 관리카드 출력
                </button>
                {selectedStudent?.status === 'paused' ? (
                  <button className="btn-success" onClick={() => setResumeModalOpen(true)}>
                    <PlayCircle size={15} /> 재수강(복귀) 시작
                  </button>
                ) : (
                  <button className="btn-warning" onClick={() => setPauseModalOpen(true)}>
                    <PauseCircle size={15} /> 휴회 처리
                  </button>
                )}
                <button className="btn-danger" onClick={handleDeleteStudent}>
                  <Trash2 size={15} /> 학생 삭제
                </button>
              </>
            )}
            <button className="btn-primary" onClick={handleSaveStudent}>
              <Save size={15} /> 저장하기
            </button>
          </div>
        </div>

        <div className="student-form-scroll">
          {/* 섹션 1: 기본 인적사항 */}
          <div className="form-section-card">
            <h3 className="section-title">■ 기본 인적사항</h3>
            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">학생 성명 *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="예: 김민준"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">학교 및 학년</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="예: 중앙초 3학년"
                  value={formData.school_grade}
                  onChange={(e) => setFormData({ ...formData, school_grade: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">수업 과목 / 과정</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="예: 수학, 영어, 독서 등"
                  value={formData.course || ''}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">최초 입회(시작)일</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.first_enrolled_date}
                  onChange={(e) => setFormData({ ...formData, first_enrolled_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">수업/학습 방법</label>
                <select
                  className="form-select"
                  value={formData.study_method}
                  onChange={(e) => setFormData({ ...formData, study_method: e.target.value })}
                >
                  <option value="방문지도">방문지도</option>
                  <option value="교실(학원)">교실(학원)</option>
                  <option value="화상(온라인)">화상(온라인)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">결제 방식</label>
                <select
                  className="form-select"
                  value={formData.payment_type}
                  onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                >
                  <option value="지사입금">지사입금</option>
                  <option value="직접결제(카드)">직접결제(카드)</option>
                  <option value="계좌이체">계좌이체</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">주민등록번호 (선택)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="앞자리 또는 전체"
                  value={formData.resident_number}
                  onChange={(e) => setFormData({ ...formData, resident_number: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '12px' }}>
              <label className="form-label">거주지 주소</label>
              <input
                type="text"
                className="form-input"
                placeholder="예: 서울시 강남구 테헤란로 123 아파트 101동"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          {/* 섹션 2: 연락처 및 보호자 정보 */}
          <div className="form-section-card">
            <h3 className="section-title">■ 연락처 및 보호자 정보</h3>
            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">학생 본인 휴대폰</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="010-XXXX-XXXX"
                  value={formData.mobile_phone}
                  onChange={(e) => setFormData({ ...formData, mobile_phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">학부모(보호자) 성함</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="예: 홍길동 (모)"
                  value={formData.parent_name}
                  onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">학부모 휴대폰 (비상)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="010-XXXX-XXXX"
                  value={formData.parent_mobile_phone}
                  onChange={(e) => setFormData({ ...formData, parent_mobile_phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* 섹션 3: 기본 주간 시간표 설정 (정규 수업 일정) */}
          <div className="form-section-card">
            <div className="section-title-row">
              <h3 className="section-title">■ 정규 수업 기본 시간표 설정</h3>
              <button className="btn-secondary sm" onClick={handleAddSchedule}>
                <Plus size={13} /> 일정 추가
              </button>
            </div>
            <p className="section-desc">
              이 학생의 정규 수업 요일과 시간을 설정하면, 주간 시간표 탭에서 자동으로 일정이 매핑됩니다.
            </p>

            <div className="default-schedules-list">
              {formData.default_schedules.length === 0 ? (
                <div className="empty-sub-notice">설정된 정규 수업 일정이 없습니다. 일정을 추가해 주세요.</div>
              ) : (
                formData.default_schedules.map((sched, idx) => (
                  <div key={idx} className="schedule-config-row">
                    <select
                      className="form-select sm"
                      value={sched.dayOfWeek}
                      onChange={(e) => handleScheduleChange(idx, 'dayOfWeek', Number(e.target.value))}
                    >
                      {WEEKDAYS.map((w) => (
                        <option key={w.val} value={w.val}>
                          {w.label}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      className="form-input sm"
                      placeholder="시작시간 (예: 14:00)"
                      value={sched.startTime || ''}
                      onChange={(e) => handleScheduleChange(idx, 'startTime', e.target.value)}
                    />

                    <input
                      type="number"
                      className="form-input sm"
                      placeholder="수업시간 (분)"
                      value={sched.duration || 60}
                      onChange={(e) => handleScheduleChange(idx, 'duration', Number(e.target.value))}
                    />

                    <input
                      type="text"
                      className="form-input sm"
                      placeholder="과목 (예: 수학)"
                      value={sched.subject || ''}
                      onChange={(e) => handleScheduleChange(idx, 'subject', e.target.value)}
                    />

                    <button
                      className="icon-btn-danger"
                      onClick={() => handleRemoveSchedule(idx)}
                      title="일정 제거"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 섹션 4: 수강 차수(Terms) 히스토리 조회 */}
          {selectedStudent?.terms && selectedStudent.terms.length > 0 && (
            <div className="form-section-card">
              <h3 className="section-title">■ 수강 차수 및 등록 이력</h3>
              <table className="term-history-table">
                <thead>
                  <tr>
                    <th>차수</th>
                    <th>수강 기간</th>
                    <th>상태</th>
                    <th>비고 / 사유</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudent.terms.map((term, tIdx) => (
                    <tr key={tIdx}>
                      <td>{term.term_number || tIdx + 1}차</td>
                      <td>
                        {term.start_date} ~ {term.end_date || '현재 진행중'}
                      </td>
                      <td>
                        <span className={`status-badge ${term.status === 'paused' ? 'paused' : 'active'}`}>
                          {term.status === 'paused' ? '휴회' : '수강중'}
                        </span>
                      </td>
                      <td>{term.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 섹션 5: 특이사항 및 지도 메모 */}
          <div className="form-section-card">
            <h3 className="section-title">■ 특이사항 및 지도 참고사항</h3>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="학생의 성향, 학습 스타일, 주의할 점 등을 기록하세요..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* 휴회 처리 모달 */}
      {pauseModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>학생 휴회 처리</h3>
            <p className="modal-desc">
              <strong>{formData.name}</strong> 학생의 수강을 일시 중단(휴회)합니다.
            </p>
            <div className="form-group">
              <label className="form-label">휴회 종료일</label>
              <input
                type="date"
                className="form-input"
                value={modalDate}
                onChange={(e) => setModalDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">휴회 사유</label>
              <input
                type="text"
                className="form-input"
                placeholder="예: 개인 사정, 시험 준비, 해외 체류 등"
                value={modalReason}
                onChange={(e) => setModalReason(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setPauseModalOpen(false)}>
                취소
              </button>
              <button className="btn-warning" onClick={handleConfirmPause}>
                휴회 확정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 재수강(새 차수) 모달 */}
      {resumeModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>재수강 (새 차수) 복귀 시작</h3>
            <p className="modal-desc">
              <strong>{formData.name}</strong> 학생의 새로운 수강 차수를 시작합니다.
            </p>
            <div className="form-group">
              <label className="form-label">재수강 시작일</label>
              <input
                type="date"
                className="form-input"
                value={modalDate}
                onChange={(e) => setModalDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">재수강 사유</label>
              <input
                type="text"
                className="form-input"
                placeholder="예: 방학 복귀, 2차 수강 시작 등"
                value={modalReason}
                onChange={(e) => setModalReason(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setResumeModalOpen(false)}>
                취소
              </button>
              <button className="btn-success" onClick={handleConfirmResume}>
                재수강 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
