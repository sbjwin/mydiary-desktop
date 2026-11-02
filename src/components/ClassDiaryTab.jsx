import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Database, getTodayDateString, getMondayOfWeek, getDateFromMondayOffset } from '../database/Database';
import { exportDiaryToHwpx, exportMultipleDiariesToHwpx } from '../services/HwpxExportService';
import { generateClassRecordsHtml, printClassRecords } from '../services/PrintService';
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  Users,
  Save,
  Plus,
  Trash2,
  FileDown,
  Printer,
  Search,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
} from 'lucide-react';
import { showToast, showConfirm, focusAppWindow } from '../utils/dialog';

const COMMON_COURSES = ['국어', '수학', '사회', '과학', '영어', '독서논술', '창의체험'];
const CONTENT_PHRASES = [
  '개념 이해 및 기본 문제 풀이 완료',
  '응용/심화 문제 오답 정리',
  '단원 평가 실시 및 피드백',
  '지난 과제 점검 및 보충 설명',
];
const NOTES_PHRASES = [
  '수업 집중도가 높고 질문이 적극적임',
  '과제를 성실히 수행해 왔음',
  '개념 복습 및 연산 연습이 추가로 필요함',
  '다음 시간 교재 및 오답노트 지참 안내',
];

export const ClassDiaryTab = ({ initialParams, onDirtyChange }) => {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [dateFilterMode, setDateFilterMode] = useState('all'); // 'all' | 'week' | 'month' | 'custom'
  const [customFromDate, setCustomFromDate] = useState('');
  const [hwpxPreset, setHwpxPreset] = useState('standard'); // 'standard' | 'approval' | 'narrative'
  const [hwpxMenuOpen, setHwpxMenuOpen] = useState(false);
  const [customToDate, setCustomToDate] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // 포커스 안전 유지 및 1회성 initialParams 처리용 Refs
  const initialHandledRef = useRef(false);
  const contentTextareaRef = useRef(null);
  const lastFocusedFieldRef = useRef(null);
  const searchInputRef = useRef(null);
  // 저장 버튼 최근 피드백 상태
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const updateDirty = (dirty) => {
    setIsDirty(dirty);
    if (onDirtyChange) onDirtyChange(dirty);
  };

  // 필드 포커스 및 윈도우 OS 포커스 강제 복원 헬퍼
  const ensureFieldFocus = (e) => {
    if (e && e.target) {
      lastFocusedFieldRef.current = e.target;
    }
    if (typeof window !== 'undefined' && window.focus) {
      window.focus();
    }
    if (window.electronAPI?.focusWindow) {
      window.electronAPI.focusWindow();
    }
  };

  // 탭 마운트 시 즉시 창 포커스 보장
  useEffect(() => {
    if (typeof window !== 'undefined' && window.focus) {
      window.focus();
    }
    if (window.electronAPI?.focusWindow) {
      window.electronAPI.focusWindow();
    }
  }, []);

  // 일지 폼 상태
  const [formData, setFormData] = useState({
    studentId: '',
    classDate: getTodayDateString(),
    classTime: '10:00',
    course: '수학',
    content: '',
    homework: '',
    notes: '',
  });

  const loadData = async (keepRecordId = null) => {
    const allStudents = await Database.getAllStudents();
    const allRecords = await Database.getAllRecords();
    setStudents(allStudents);
    setRecords(allRecords);

    // 1순위: 방금 저장했거나 명시적으로 유지를 요청한 recordId가 있는 경우 (최우선 동기화)
    const targetId = keepRecordId || selectedRecordId;
    if (targetId) {
      const existing = allRecords.find((r) => r.id === targetId);
      if (existing) {
        setSelectedRecordId(existing.id);
        setSelectedStudentId(existing.student_id || existing.studentId);
        populateForm(existing);
        return;
      }
    }

    // 2순위: 최초 진입 시 initialParams가 있고 아직 처리되지 않은 경우 (1회성 소비)
    if (initialParams?.studentId && !initialHandledRef.current) {
      initialHandledRef.current = true;
      setSelectedStudentId(initialParams.studentId);

      // 1순위: diaryId가 전달된 경우
      let found = null;
      if (initialParams.diaryId) {
        found = allRecords.find((r) => r.id === initialParams.diaryId);
      }
      // 2순위: diaryId가 없더라도 해당 날짜 + 학생 조합의 일지가 이미 존재하는 경우 자동 연동
      if (!found && initialParams.date) {
        found = allRecords.find(
          (r) =>
            (r.student_id === initialParams.studentId || r.studentId === initialParams.studentId) &&
            (r.class_date === initialParams.date || r.date === initialParams.date)
        );
      }

      if (found) {
        setSelectedRecordId(found.id);
        populateForm(found);
      } else {
        setSelectedRecordId(null);
        setFormData({
          studentId: initialParams.studentId,
          classDate: initialParams.date || getTodayDateString(),
          classTime: initialParams.classTime || '10:00',
          course: initialParams.course || '수학',
          content: '',
          homework: '',
          notes: '',
        });
      }
    } else if (allStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(allStudents[0].id);
      setFormData((prev) => ({ ...prev, studentId: allStudents[0].id }));
    }
  };

  useEffect(() => {
    initialHandledRef.current = false;
    loadData();
  }, [initialParams]);

  const populateForm = (rec) => {
    setFormData({
      studentId: rec.student_id || rec.studentId || '',
      classDate: rec.class_date || rec.date || getTodayDateString(),
      classTime: rec.class_time || rec.time || rec.classTime || '10:00',
      course: rec.course || rec.subject || rec.book_issue_date || '',
      content: rec.content || '',
      homework: rec.homework || rec.assignment || '',
      notes: rec.notes || rec.special_notes || rec.memo || '',
    });
    updateDirty(false);
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    updateDirty(true);
  };

  const handleSelectRecord = (rec) => {
    setSelectedRecordId(rec.id);
    setSelectedStudentId(rec.student_id || rec.studentId);
    populateForm(rec);
  };

  const handleNewDiary = () => {
    setSelectedRecordId(null);
    setFormData({
      studentId: selectedStudentId || (students[0]?.id || ''),
      classDate: getTodayDateString(),
      classTime: '10:00',
      course: '수학',
      content: '',
      homework: '',
      notes: '',
    });
    updateDirty(false);
  };

  const handleSave = async () => {
    if (!formData.studentId) {
      showToast('학생을 선택해 주세요.', 'warning');
      return;
    }

    try {
      const recordPayload = {
        student_id: formData.studentId,
        class_date: formData.classDate,
        class_time: formData.classTime,
        course: formData.course,
        content: formData.content,
        homework: formData.homework,
        notes: formData.notes,
      };

      let targetId = selectedRecordId;
      if (selectedRecordId) {
        await Database.updateClassRecord(selectedRecordId, recordPayload);
        showToast('수업 일지가 성공적으로 수정되었습니다.', 'success');
      } else {
        const newRec = await Database.addClassRecord(recordPayload);
        targetId = newRec.id;
        setSelectedRecordId(newRec.id);
        showToast('새 수업 일지가 성공적으로 등록되었습니다.', 'success');
      }

      setIsSavedRecently(true);
      updateDirty(false);
      setTimeout(() => setIsSavedRecently(false), 2000);

      await loadData(targetId);

      // [2번 포커스 안전 유지]: 윈도우 포커스 보장 및 웹뷰 포커스 유지
      if (typeof window !== 'undefined' && window.focus) {
        window.focus();
      }
      setTimeout(() => {
        if (lastFocusedFieldRef.current && typeof lastFocusedFieldRef.current.focus === 'function') {
          lastFocusedFieldRef.current.focus({ preventScroll: true });
        } else if (contentTextareaRef.current) {
          contentTextareaRef.current.focus({ preventScroll: true });
        }
      }, 50);
    } catch (err) {
      showToast('저장 실패: ' + err.message, 'error');
    }
  };

  const handleDeleteClick = () => {
    if (!selectedRecordId) return;
    showConfirm({
      title: '수업 일지 삭제',
      message: '정말 이 수업 일지를 삭제하시겠습니까?\n삭제된 일지는 복구할 수 없습니다.',
      type: 'danger',
      confirmText: '삭제',
      cancelText: '취소',
      onConfirm: async () => {
        try {
          await Database.deleteClassRecord(selectedRecordId);
          showToast('수업 일지가 삭제되었습니다.', 'info');
          handleNewDiary();
          await loadData();
          focusAppWindow();
        } catch (err) {
          showToast('삭제 실패: ' + err.message, 'error');
        }
      },
    });
  };

  // HWPX 한글 문서 저장
  const handleExportHwpx = async () => {
    const student = students.find((s) => s.id === formData.studentId);
    if (!student) {
      showToast('학생 정보를 찾을 수 없습니다.', 'warning');
      return;
    }

    const diaryForHwpx = {
      date: formData.classDate,
      title: `${student.name} 학생 ${formData.course || '수업'} 일지`,
      content: `[수업 시간] ${formData.classTime}\n[과정/교재] ${formData.course}\n\n■ 학습 진도 및 지도 내용\n${formData.content || '(내용 없음)'}\n\n■ 과제 및 숙제\n${formData.homework || '(없음)'}\n\n■ 수업 태도 및 특이사항\n${formData.notes || '(특이사항 없음)'}`,
    };

    await exportDiaryToHwpx(student, diaryForHwpx, { preset: hwpxPreset });
    setHwpxMenuOpen(false);
  };

  // 현재 검색/필터된 일지 목록 전체 HWPX 일괄 저장
  const handleExportBulkHwpx = async () => {
    if (filteredRecords.length === 0) {
      showToast('내보낼 수업 일지가 없습니다.', 'warning');
      return;
    }
    const targetSt = students.find((s) => s.id === selectedStudentId);
    const labelName = targetSt ? `${targetSt.name}학생` : '전체학생';
    await exportMultipleDiariesToHwpx(filteredRecords, students, {
      preset: hwpxPreset,
      labelName,
    });
    setHwpxMenuOpen(false);
  };

  // 인쇄 / PDF 출력
  const handlePrint = async () => {
    const student = students.find((s) => s.id === formData.studentId);
    if (!student) return;

    const currentRecord = {
      class_date: formData.classDate,
      class_time: formData.classTime,
      course: formData.course,
      content: `${formData.content}\n\n[과제]: ${formData.homework || '없음'}\n[특이사항]: ${formData.notes || '없음'}`,
    };

    await printClassRecords(student, [currentRecord], formData.classDate);
  };

  // 복합 필터링된 일지 목록 (G5: 학생, 과목, 본문, 과제, 특이사항 + 기간 필터)
  const filteredRecords = useMemo(() => {
    const todayStr = getTodayDateString();
    const mondayStr = getMondayOfWeek(new Date());
    const sundayStr = getDateFromMondayOffset(mondayStr, 6);
    const currentMonthPrefix = todayStr.slice(0, 7);

    return records.filter((r) => {
      const rStudentId = r.student_id || r.studentId;
      if (selectedStudentId && rStudentId !== selectedStudentId) return false;

      const rDate = r.class_date || r.date || '';
      if (dateFilterMode === 'week') {
        if (rDate < mondayStr || rDate > sundayStr) return false;
      } else if (dateFilterMode === 'month') {
        if (!rDate.startsWith(currentMonthPrefix)) return false;
      } else if (dateFilterMode === 'custom') {
        if (customFromDate && rDate < customFromDate) return false;
        if (customToDate && rDate > customToDate) return false;
      }

      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase().trim();
        const st = students.find((s) => s.id === rStudentId);
        const matchStudent = (st?.name || '').toLowerCase().includes(q);
        const matchCourse = (r.course || r.subject || '').toLowerCase().includes(q);
        const matchContent = (r.content || '').toLowerCase().includes(q);
        const matchHomework = (r.homework || r.assignment || '').toLowerCase().includes(q);
        const matchNotes = (r.notes || r.special_notes || r.memo || '').toLowerCase().includes(q);
        const matchDate = rDate.includes(q);
        return matchStudent || matchCourse || matchContent || matchHomework || matchNotes || matchDate;
      }
      return true;
    });
  }, [records, selectedStudentId, dateFilterMode, customFromDate, customToDate, searchFilter, students]);

  // 현재 대상 학생의 직전 수업 일지 탐색
  const prevRecord = useMemo(() => {
    const targetStudentId = formData.studentId || selectedStudentId;
    if (!targetStudentId) return null;
    const studentRecs = records
      .filter((r) => (r.student_id || r.studentId) === targetStudentId && r.id !== selectedRecordId)
      .sort((a, b) => (b.class_date || b.date || '').localeCompare(a.class_date || a.date || ''));
    return studentRecs[0] || null;
  }, [records, formData.studentId, selectedStudentId, selectedRecordId]);

  const handleApplyPrevRecord = () => {
    if (!prevRecord) return;
    const prevCourse = prevRecord.course || prevRecord.subject || formData.course;
    const prevHw = prevRecord.homework || prevRecord.assignment || '';
    const nextContent = prevHw
      ? `[직전 과제 점검] ${prevHw}\n${formData.content || ''}`.trim()
      : formData.content || '';
    setFormData((prev) => ({
      ...prev,
      course: prevCourse,
      content: nextContent,
    }));
    updateDirty(true);
    showToast('직전 수업의 교재와 과제를 현재 일지에 불러왔습니다.', 'info');
  };

  const handleAppendPhrase = (field, phrase) => {
    setFormData((prev) => {
      const current = (prev[field] || '').trim();
      const updated = current ? `${current}\n• ${phrase}` : `• ${phrase}`;
      return { ...prev, [field]: updated };
    });
    updateDirty(true);
  };

  const currentStudent = students.find((s) => s.id === formData.studentId);

  // 전역 키보드 단축키 연동 (Ctrl+S: 저장, Ctrl+N: 새 일지, Ctrl+F: 검색 포커스)
  useEffect(() => {
    const onShortcutSave = () => handleSave();
    const onShortcutNew = () => handleNewDiary();
    const onShortcutSearch = () => searchInputRef.current?.focus();
    window.addEventListener('mydiary:shortcut-save', onShortcutSave);
    window.addEventListener('mydiary:shortcut-new', onShortcutNew);
    window.addEventListener('mydiary:shortcut-search', onShortcutSearch);
    return () => {
      window.removeEventListener('mydiary:shortcut-save', onShortcutSave);
      window.removeEventListener('mydiary:shortcut-new', onShortcutNew);
      window.removeEventListener('mydiary:shortcut-search', onShortcutSearch);
    };
  }, [formData, selectedRecordId, selectedStudentId, students]);

  return (
    <div className="tab-container class-diary-tab">
      {/* 1열: 와이드 데스크톱 3단 학생 빠른 선택 레일 */}
      <aside className="diary-student-rail">
        <div className="rail-header">
          <Users size={14} className="text-primary" />
          <span>학생 빠른 선택</span>
        </div>
        <div className="rail-student-list">
          <button
            type="button"
            className={`rail-student-item ${selectedStudentId === '' ? 'active' : ''}`}
            onClick={() => {
              setSelectedStudentId('');
              setSelectedRecordId(null);
            }}
          >
            <span className="rail-student-name">전체 학생 보기</span>
            <span className="rail-count-badge">{records.length}</span>
          </button>
          {students.map((s) => {
            const count = records.filter((r) => (r.student_id || r.studentId) === s.id).length;
            const isSelected = selectedStudentId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                className={`rail-student-item ${isSelected ? 'active' : ''} ${
                  s.status === 'paused' ? 'is-paused' : ''
                }`}
                onClick={() => {
                  setSelectedStudentId(s.id);
                  setFormData((prev) => ({
                    ...prev,
                    studentId: s.id,
                    course: s.course || s.subject || prev.course,
                  }));
                  setSelectedRecordId(null);
                  updateDirty(false);
                }}
              >
                <div className="rail-student-meta">
                  <span className="rail-student-name">{s.name}</span>
                  <span className="rail-student-sub">{s.school_grade || s.grade || '재원'}</span>
                </div>
                <span className="rail-count-badge">{count}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* 2열: 일지 타임라인 및 복합 검색 패널 */}
      <div className="diary-list-sidebar">
        <div className="diary-sidebar-header">
          <div className="search-input-box">
            <Search size={14} className="text-muted" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="과목, 진도, 과제, 특이사항 검색 (Ctrl+F)"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>

          {/* 기간 복합 필터 칩 (G5) */}
          <div className="diary-period-filter-bar">
            {[
              { id: 'all', label: '전체' },
              { id: 'week', label: '이번 주' },
              { id: 'month', label: '이번 달' },
              { id: 'custom', label: '기간 지정' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                className={`period-chip-btn ${dateFilterMode === p.id ? 'active' : ''}`}
                onClick={() => setDateFilterMode(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {dateFilterMode === 'custom' && (
            <div className="custom-date-range-row">
              <input
                type="date"
                className="form-input sm"
                value={customFromDate}
                onChange={(e) => setCustomFromDate(e.target.value)}
                title="시작일"
              />
              <span>~</span>
              <input
                type="date"
                className="form-input sm"
                value={customToDate}
                onChange={(e) => setCustomToDate(e.target.value)}
                title="종료일"
              />
            </div>
          )}

          <button className="btn-primary full-width" onClick={handleNewDiary} title="단축키: Ctrl+N">
            <Plus size={15} /> 새 일지 작성 ({filteredRecords.length}건)
          </button>
        </div>

        <div className="diary-records-scroll">
          {filteredRecords.length === 0 ? (
            <div className="empty-notice">조건에 맞는 수업 일지가 없습니다.</div>
          ) : (
            filteredRecords.map((rec) => {
              const st = students.find((s) => s.id === (rec.student_id || rec.studentId));
              const isSelected = selectedRecordId === rec.id;
              return (
                <div
                  key={rec.id}
                  className={`diary-item-card ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectRecord(rec)}
                  title="클릭하여 이 수업 일지 수정 및 상세 보기"
                >
                  <div className="diary-item-header">
                    <span className="diary-date">{rec.class_date || rec.date}</span>
                    <span className="diary-time">{rec.class_time || rec.time || rec.classTime}</span>
                  </div>
                  <div className="diary-item-title">
                    <strong>{st?.name || '학생'}</strong> - {rec.course || rec.subject || rec.book_issue_date || '수업'}
                  </div>
                  <p className="diary-item-snippet">{rec.content || '(내용 없음)'}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3열: 정밀 수업 일지 에디터 패널 */}
      <div className="diary-editor-panel">
        <div className="editor-top-actions">
          <div className="editor-title-area">
            <h2>{selectedRecordId ? '수업 일지 상세 및 수정' : '새 수업 일지 작성'}</h2>
            {currentStudent && (
              <span className="target-student-badge">
                {currentStudent.name} ({currentStudent.school_grade || currentStudent.grade || '일반'})
              </span>
            )}
            {isDirty && <span className="unsaved-dirty-badge">● 작성 중 (미저장)</span>}
          </div>

          <div className="btn-group">
            <div className="toolbar-dropdown-wrapper">
              <button type="button" className="btn-secondary" onClick={() => setHwpxMenuOpen(!hwpxMenuOpen)}>
                <FileDown size={15} /> 한글(HWPX) 양식 저장 ▾
              </button>
              {hwpxMenuOpen && (
                <div className="toolbar-dropdown-menu hwpx-preset-dropdown">
                  <div className="hwpx-preset-section-title">1. HWPX 문서 서식 프리셋 (G1)</div>
                  {[
                    { id: 'standard', label: '📄 표준형 (기본 관찰일지 표)' },
                    { id: 'approval', label: '🏛️ 결재란 포함형 (담당·원장·학부모 서명)' },
                    { id: 'narrative', label: '💌 학부모 상담용 (가정 연계 리포트)' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`toolbar-dropdown-item ${hwpxPreset === p.id ? 'selected-preset' : ''}`}
                      onClick={() => setHwpxPreset(p.id)}
                    >
                      <span>{p.label}</span>
                      {hwpxPreset === p.id && <strong>✓</strong>}
                    </button>
                  ))}
                  <div className="dropdown-divider" />
                  <div className="hwpx-preset-section-title">2. 저장 실행 범위 선택</div>
                  <button type="button" className="toolbar-dropdown-item primary-action" onClick={handleExportHwpx}>
                    <FileDown size={14} /> 현재 작성 일지 1건 HWPX 저장
                  </button>
                  <button type="button" className="toolbar-dropdown-item" onClick={handleExportBulkHwpx}>
                    <FileDown size={14} /> 좌측 필터된 일지 일괄 저장 ({filteredRecords.length}건)
                  </button>
                </div>
              )}
            </div>
            <button className="btn-secondary" style={{ display: 'none' }} onClick={handleExportHwpx}>
              <FileDown size={15} /> 한글 문서(HWPX) 저장
            </button>
            <button className="btn-secondary" onClick={handlePrint}>
              <Printer size={15} /> 인쇄 / 미리보기
            </button>
            {selectedRecordId && (
              <button className="btn-danger" onClick={handleDeleteClick}>
                <Trash2 size={15} /> 삭제
              </button>
            )}
            <button
              type="button"
              className={`btn-primary ${isSavedRecently ? 'btn-saved-success' : ''}`}
              onClick={handleSave}
              title="단축키: Ctrl+S"
            >
              {isSavedRecently ? <CheckCircle size={15} /> : <Save size={15} />}
              {isSavedRecently ? '저장 완료!' : '저장하기'}
            </button>
          </div>
        </div>

        {/* 직전 수업 기록 참조 카드 */}
        {prevRecord && (
          <div className="prev-record-reference-card">
            <div className="prev-ref-info">
              <div className="prev-ref-badge-row">
                <span className="prev-ref-tag">📌 직전 수업 참조</span>
                <span className="prev-ref-date">
                  {prevRecord.class_date || prevRecord.date} · {prevRecord.course || '과목 미지정'}
                </span>
              </div>
              <div className="prev-ref-texts">
                <span><strong>진도:</strong> {prevRecord.content || '기록 없음'}</span>
                {(prevRecord.homework || prevRecord.assignment) && (
                  <span><strong>직전 과제:</strong> {prevRecord.homework || prevRecord.assignment}</span>
                )}
              </div>
            </div>
            <button
              type="button"
              className="btn-secondary sm prev-apply-btn"
              onClick={handleApplyPrevRecord}
              title="직전 수업의 교재명과 과제를 오늘 일지 입력란에 즉시 반영합니다"
            >
              <Sparkles size={13} className="text-primary" /> 직전 교재/과제 불러오기
            </button>
          </div>
        )}

        <div className="diary-form-body">
          {/* 기본 메타데이터 그리드 (학생, 날짜, 시간, 과목) */}
          <div className="form-row-grid">
            <div className="form-group">
              <label className="form-label">대상 학생 *</label>
              <select
                className="form-select"
                value={formData.studentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  handleFieldChange('studentId', e.target.value);
                }}
                onFocus={ensureFieldFocus}
                onClick={ensureFieldFocus}
              >
                <option value="">학생을 선택하세요</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.school_grade || s.grade || '재원'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">수업 일자 *</label>
              <input
                type="date"
                className="form-input"
                value={formData.classDate}
                onChange={(e) => handleFieldChange('classDate', e.target.value)}
                onFocus={ensureFieldFocus}
                onClick={ensureFieldFocus}
              />
            </div>

            <div className="form-group">
              <label className="form-label">수업 시간 *</label>
              <input
                type="text"
                className="form-input"
                placeholder="예: 14:00"
                value={formData.classTime}
                onChange={(e) => handleFieldChange('classTime', e.target.value)}
                onFocus={ensureFieldFocus}
                onClick={ensureFieldFocus}
              />
            </div>

            <div className="form-group">
              <label className="form-label">과정 / 교재 *</label>
              <input
                type="text"
                className="form-input"
                placeholder="예: 초등 수학 5-1 디딤돌"
                value={formData.course}
                onChange={(e) => handleFieldChange('course', e.target.value)}
                onFocus={ensureFieldFocus}
                onClick={ensureFieldFocus}
              />
            </div>
          </div>

          {/* 주요 텍스트 입력 영역 */}
          <div className="form-group">
            <div className="form-label-with-chips">
              <label className="form-label">
                <BookOpen size={14} /> 학습 진도 및 상세 지도 내용
              </label>
              <div className="quick-phrase-chips">
                {CONTENT_PHRASES.map((ph) => (
                  <button
                    key={ph}
                    type="button"
                    className="phrase-chip-btn"
                    onClick={() => handleAppendPhrase('content', ph)}
                  >
                    + {ph}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              ref={contentTextareaRef}
              className="form-textarea"
              rows={6}
              placeholder="오늘 진행한 학습 진도, 개념 설명, 문제 풀이 결과 등을 상세히 기록하세요..."
              value={formData.content || ''}
              onChange={(e) => handleFieldChange('content', e.target.value)}
              onFocus={ensureFieldFocus}
              onClick={ensureFieldFocus}
              onMouseDown={ensureFieldFocus}
            />
          </div>

          <div className="form-row-grid-2">
            <div className="form-group">
              <label className="form-label">📝 과제 및 숙제 안내</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="다음 시간까지 완료할 문제집 페이지, 복습 과제 등을 입력하세요..."
                value={formData.homework || ''}
                onChange={(e) => handleFieldChange('homework', e.target.value)}
                onFocus={ensureFieldFocus}
                onClick={ensureFieldFocus}
                onMouseDown={ensureFieldFocus}
              />
            </div>

            <div className="form-group">
              <div className="form-label-with-chips">
                <label className="form-label">💡 수업 태도 및 특이사항 / 학부모 전달사항</label>
                <div className="quick-phrase-chips">
                  {NOTES_PHRASES.slice(0, 2).map((ph) => (
                    <button
                      key={ph}
                      type="button"
                      className="phrase-chip-btn"
                      onClick={() => handleAppendPhrase('notes', ph)}
                    >
                      + {ph}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="학생의 집중도, 학습 태도, 다음 수업 준비물 또는 학부모 상담 메모를 기록하세요..."
                value={formData.notes || ''}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                onFocus={ensureFieldFocus}
                onClick={ensureFieldFocus}
                onMouseDown={ensureFieldFocus}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
