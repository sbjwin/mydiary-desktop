import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Database, getTodayDateString } from '../database/Database';
import { printStudentProfile } from '../services/PrintService';
import { showToast, showConfirm } from '../utils/dialog';
import { WEEKDAYS } from '../utils/dateUtils';
import { getStudentPrimaryCourse } from '../utils/studentUtils';
import { useEscapeKey } from '../hooks/useEscapeKey';
import {
  UserPlus,
  Search,
  Calendar,
  Clock,
  Save,
  Trash2,
  PauseCircle,
  PlayCircle,
  Printer,
  Plus,
  X,
  BookOpen,
  TrendingUp,
} from 'lucide-react';

export const StudentManageTab = ({ onDirtyChange, onNavigateToDiary }) => {
  const [ isDirty, setIsDirty ] = useState(false);
  const searchInputRef = useRef(null);
  const updateDirty = (dirty) => {
    setIsDirty(dirty);
    if (onDirtyChange) onDirtyChange(dirty);
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    updateDirty(true);
  };

  const confirmDiscardIfDirty = (action) => {
    if (!isDirty) {
      action();
      return;
    }
    showConfirm({
      title: '작성 중인 내용 확인',
      message: '저장하지 않은 학생 정보 변경사항이 있습니다.\n저장하지 않고 이동하시겠습니까?',
      type: 'warning',
      confirmText: '이동하기',
      cancelText: '계속 작성',
      onConfirm: () => {
        updateDirty(false);
        action();
      },
    });
  };
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

  useEscapeKey(pauseModalOpen, () => setPauseModalOpen(false));
  useEscapeKey(resumeModalOpen, () => setResumeModalOpen(false));

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

  // 선택된 학생의 누적 수업 및 성장 통계 상태
  const [studentStats, setStudentStats] = useState({
    totalCount: 0,
    monthCount: 0,
    lastClassDate: null,
    recentCourse: '',
  });

  useEffect(() => {
    if (!selectedStudentId) {
      setStudentStats({
        totalCount: 0,
        monthCount: 0,
        lastClassDate: null,
        recentCourse: '',
      });
      return;
    }

    let isMounted = true;
    Database.getRecordsByStudent(selectedStudentId)
      .then((records) => {
        if (!isMounted) return;
        if (!Array.isArray(records) || records.length === 0) {
          setStudentStats({
            totalCount: 0,
            monthCount: 0,
            lastClassDate: null,
            recentCourse: '',
            monthlyTrend: [],
            recentRecords: [],
          });
          return;
        }

        // 날짜 내림차순 정렬 (최신 수업이 맨 앞)
        const sorted = [...records].sort((a, b) => (b.class_date || '').localeCompare(a.class_date || ''));
        const latest = sorted[0];

        // 이번 달(YYYY-MM) 계산
        const currentYearMonth = getTodayDateString().slice(0, 7);
        const thisMonthCount = sorted.filter((r) => (r.class_date || '').startsWith(currentYearMonth)).length;

        // 최근 6개월 월별 수업 추이 계산
        const now = new Date();
        const monthlyTrend = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const cnt = sorted.filter((r) => (r.class_date || '').startsWith(ym)).length;
          monthlyTrend.push({ ym, label: `${d.getMonth() + 1}월`, count: cnt });
        }

        setStudentStats({
          totalCount: sorted.length,
          monthCount: thisMonthCount,
          lastClassDate: latest.class_date || null,
          recentCourse: latest.course || latest.subject || '',
          monthlyTrend,
          recentRecords: sorted.slice(0, 5),
        });
      })
      .catch((err) => {
        console.warn('학생 통계 로드 실패:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedStudentId]);

  const populateForm = (st) => {
    const resolvedCourse = getStudentPrimaryCourse(st, '');
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
    updateDirty(false);
  };

  const handleSelectStudent = (st) => {
    if (st.id === selectedStudentId) return;
    confirmDiscardIfDirty(() => {
      setSelectedStudentId(st.id);
      populateForm(st);
    });
  };

  const applyNewStudent = () => {
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
    updateDirty(false);
  };

  const handleNewStudent = () => {
    confirmDiscardIfDirty(applyNewStudent);
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
      updateDirty(false);
      await loadStudents();
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
    updateDirty(true);
  };

  const handleRemoveSchedule = (index) => {
    setFormData((prev) => ({
      ...prev,
      default_schedules: prev.default_schedules.filter((_, idx) => idx !== index),
    }));
    updateDirty(true);
  };

  const handleScheduleChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.default_schedules];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, default_schedules: updated };
    });
    updateDirty(true);
  };

  // 학생 카드 인쇄
  const handlePrintProfile = async () => {
    const st = students.find((s) => s.id === selectedStudentId);
    if (!st) return;
    await printStudentProfile(st);
  };

  const statusCounts = useMemo(() => {
    let activeCount = 0;
    let pausedCount = 0;
    students.forEach((s) => {
      if (s.status === 'paused') pausedCount += 1;
      else activeCount += 1;
    });
    return { activeCount, pausedCount };
  }, [students]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return students.filter((s) => {
      if (activeFilter === 'active' && s.status === 'paused') return false;
      if (activeFilter === 'paused' && s.status !== 'paused') return false;
      if (q) {
        const matchName = (s.name || '').toLowerCase().includes(q);
        const matchGrade = (s.school_grade || s.grade || '').toLowerCase().includes(q);
        const matchPhone = (s.mobile_phone || '').includes(q);
        return matchName || matchGrade || matchPhone;
      }
      return true;
    });
  }, [students, activeFilter, searchQuery]);

  const maxMonthlyCount = useMemo(
    () => Math.max(1, ...(studentStats.monthlyTrend || []).map((x) => x.count)),
    [studentStats.monthlyTrend]
  );

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // 전역 키보드 단축키 연동 (Ctrl+S: 저장, Ctrl+N: 신규 학생, Ctrl+F: 검색)
  const shortcutsRef = useRef({ save: handleSaveStudent, create: handleNewStudent });
  shortcutsRef.current = { save: handleSaveStudent, create: handleNewStudent };

  useEffect(() => {
    const onShortcutSave = () => shortcutsRef.current.save();
    const onShortcutNew = () => shortcutsRef.current.create();
    const onShortcutSearch = () => searchInputRef.current?.focus();
    window.addEventListener('mydiary:shortcut-save', onShortcutSave);
    window.addEventListener('mydiary:shortcut-new', onShortcutNew);
    window.addEventListener('mydiary:shortcut-search', onShortcutSearch);
    return () => {
      window.removeEventListener('mydiary:shortcut-save', onShortcutSave);
      window.removeEventListener('mydiary:shortcut-new', onShortcutNew);
      window.removeEventListener('mydiary:shortcut-search', onShortcutSearch);
    };
  }, []);

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
              재원생 ({statusCounts.activeCount})
            </button>
            <button
              className={`pill-btn ${activeFilter === 'paused' ? 'active' : ''}`}
              onClick={() => setActiveFilter('paused')}
            >
              휴회생 ({statusCounts.pausedCount})
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
              ref={searchInputRef} placeholder="학생 이름, 학교, 연락처 검색... (Ctrl+F)"
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
                    <span>{getStudentPrimaryCourse(st, '과목미지정')}</span>
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
            {isDirty && <span className="unsaved-dirty-badge">● 수정 중 (미저장)</span>}
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
          {/* 학생 성장 및 수업 통계 요약 카드 (선택된 학생이 있을 때) */}
          {selectedStudentId && (
            <div className="student-stats-overview">
              <div className="stat-card">
                <div className="stat-icon-wrapper blue">
                  <TrendingUp size={18} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">누적 수업 일지</span>
                  <span className="stat-value">{studentStats.totalCount}회</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper green">
                  <Calendar size={18} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">이번 달 진행 수업</span>
                  <span className="stat-value">{studentStats.monthCount}회</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper orange">
                  <BookOpen size={18} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">최근 진행 교재</span>
                  <span className="stat-value" title={studentStats.recentCourse || formData.course || '미지정'}>
                    {studentStats.recentCourse || formData.course || '미지정'}
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper purple">
                  <Clock size={18} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">최근 수업 일자</span>
                  <span className="stat-value">
                    {studentStats.lastClassDate || '기록 없음'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 학생 성장 추이 시각화 차트 및 최근 수업 일지 타임라인 */}
          {selectedStudentId && (
            <div className="student-growth-dashboard-grid">
              {/* 좌측: 최근 6개월 월별 수업 횟수 바 차트 */}
              <div className="form-section-card growth-chart-card">
                <h3 className="section-title">📊 최근 6개월 월별 수업 추이</h3>
                <div className="monthly-bar-chart">
                  {(studentStats.monthlyTrend || []).map((m) => {
                    const heightPct = Math.max(10, Math.round((m.count / maxMonthlyCount) * 100));
                    return (
                      <div key={m.ym} className="bar-col" title={`${m.ym}: ${m.count}회 수업`}>
                        <span className="bar-count-label">{m.count}회</span>
                        <div className="bar-track">
                          <div
                            className={`bar-fill ${m.count > 0 ? 'has-val' : ''}`}
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                        <span className="bar-month-label">{m.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 우측: 최근 수업 일지 5건 바로보기 타임라인 */}
              <div className="form-section-card recent-records-card">
                <h3 className="section-title">📝 최근 작성된 수업 일지 (클릭 시 이동)</h3>
                {(!studentStats.recentRecords || studentStats.recentRecords.length === 0) ? (
                  <div className="empty-sub-notice">아직 작성된 수업 일지가 없습니다.</div>
                ) : (
                  <div className="recent-diary-mini-list">
                    {studentStats.recentRecords.map((rec) => (
                      <div
                        key={rec.id}
                        className="recent-diary-mini-item"
                        onClick={() =>
                          onNavigateToDiary?.({
                            studentId: selectedStudentId,
                            diaryId: rec.id,
                            date: rec.class_date || rec.date,
                          })
                        }
                        title="클릭하여 이 수업 일지 상세 편집 화면으로 이동"
                      >
                        <div className="recent-mini-top">
                          <span className="recent-mini-date">{rec.class_date || rec.date}</span>
                          <span className="recent-mini-course">{rec.course || rec.subject || '수업'}</span>
                        </div>
                        <div className="recent-mini-content">{rec.content || '(진도 기록 없음)'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

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
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">학교 및 학년</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="예: 중앙초 3학년"
                  value={formData.school_grade}
                  onChange={(e) => handleFieldChange('school_grade', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">수업 과목 / 과정</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="예: 수학, 영어, 독서 등"
                  value={formData.course || ''}
                  onChange={(e) => handleFieldChange('course', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">최초 입회(시작)일</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.first_enrolled_date}
                  onChange={(e) => handleFieldChange('first_enrolled_date', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">수업/학습 방법</label>
                <select
                  className="form-select"
                  value={formData.study_method}
                  onChange={(e) => handleFieldChange('study_method', e.target.value)}
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
                  onChange={(e) => handleFieldChange('payment_type', e.target.value)}
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
                  onChange={(e) => handleFieldChange('resident_number', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group mt-3">
              <label className="form-label">거주지 주소</label>
              <input
                type="text"
                className="form-input"
                placeholder="예: 서울시 강남구 테헤란로 123 아파트 101동"
                value={formData.address}
                onChange={(e) => handleFieldChange('address', e.target.value)}
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
                  onChange={(e) => handleFieldChange('mobile_phone', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">학부모(보호자) 성함</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="예: 홍길동 (모)"
                  value={formData.parent_name}
                  onChange={(e) => handleFieldChange('parent_name', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">학부모 휴대폰 (비상)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="010-XXXX-XXXX"
                  value={formData.parent_mobile_phone}
                  onChange={(e) => handleFieldChange('parent_mobile_phone', e.target.value)}
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
                        <option key={w.dayOfWeek} value={w.dayOfWeek}>
                          {w.name}
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
              onChange={(e) => handleFieldChange('notes', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 휴회 처리 모달 */}
      {pauseModalOpen && (
        <div className="modal-overlay" onClick={() => setPauseModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
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
        <div className="modal-overlay" onClick={() => setResumeModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
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
