import React, { useState, useEffect } from 'react';
import { Database, getTodayDateString } from '../database/Database';
import { exportDiaryToHwpx } from '../services/HwpxExportService';
import { generateClassRecordsHtml } from '../services/PrintService';
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  Save,
  Plus,
  Trash2,
  FileDown,
  Printer,
  Search,
  CheckCircle,
} from 'lucide-react';

const COMMON_COURSES = ['국어', '수학', '사회', '과학', '영어', '독서논술', '창의체험'];

export const ClassDiaryTab = ({ initialParams }) => {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

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

  const loadData = async () => {
    const allStudents = await Database.getAllStudents();
    const allRecords = await Database.getAllRecords();
    setStudents(allStudents);
    setRecords(allRecords);

    if (initialParams?.studentId) {
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
  };

  const handleSave = async () => {
    if (!formData.studentId) {
      alert('학생을 선택해 주세요.');
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

      if (selectedRecordId) {
        await Database.updateClassRecord(selectedRecordId, recordPayload);
        alert('수업 일지가 수정되었습니다.');
      } else {
        const newRec = await Database.addClassRecord(recordPayload);
        setSelectedRecordId(newRec.id);
        alert('새 수업 일지가 등록되었습니다.');
      }
      await loadData();
    } catch (err) {
      alert('저장 실패: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedRecordId) return;
    if (!confirm('정말 이 수업 일지를 삭제하시겠습니까?')) return;

    try {
      await Database.deleteClassRecord(selectedRecordId);
      alert('삭제되었습니다.');
      handleNewDiary();
      await loadData();
    } catch (err) {
      alert('삭제 실패: ' + err.message);
    }
  };

  // HWPX 한글 문서 저장
  const handleExportHwpx = async () => {
    const student = students.find((s) => s.id === formData.studentId);
    if (!student) {
      alert('학생 정보를 찾을 수 없습니다.');
      return;
    }

    const diaryForHwpx = {
      date: formData.classDate,
      title: `${student.name} 학생 ${formData.course || '수업'} 일지`,
      content: `[수업 시간] ${formData.classTime}\n[과정/교재] ${formData.course}\n\n■ 학습 진도 및 지도 내용\n${formData.content || '(내용 없음)'}\n\n■ 과제 및 숙제\n${formData.homework || '(없음)'}\n\n■ 수업 태도 및 특이사항\n${formData.notes || '(특이사항 없음)'}`,
    };

    await exportDiaryToHwpx(student, diaryForHwpx);
  };

  // 인쇄 / PDF 출력
  const handlePrint = () => {
    const student = students.find((s) => s.id === formData.studentId);
    if (!student) return;

    const currentRecord = {
      class_date: formData.classDate,
      class_time: formData.classTime,
      course: formData.course,
      content: `${formData.content}\n\n[과제]: ${formData.homework || '없음'}\n[특이사항]: ${formData.notes || '없음'}`,
    };

    const html = generateClassRecordsHtml(student, [currentRecord], formData.classDate);
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 400);
    }
  };

  // 필터링된 일지 목록
  const filteredRecords = records.filter((r) => {
    if (selectedStudentId && r.student_id !== selectedStudentId) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const matchCourse = (r.course || '').toLowerCase().includes(q);
      const matchContent = (r.content || '').toLowerCase().includes(q);
      const matchDate = (r.class_date || '').includes(q);
      return matchCourse || matchContent || matchDate;
    }
    return true;
  });

  const currentStudent = students.find((s) => s.id === formData.studentId);

  return (
    <div className="tab-container class-diary-tab">
      {/* 좌측: 일지 목록 사이드 패널 */}
      <div className="diary-list-sidebar">
        <div className="diary-sidebar-header">
          <div className="student-filter-select-box">
            <User size={14} className="text-primary" />
            <select
              className="form-select sm"
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                setFormData((prev) => ({ ...prev, studentId: e.target.value }));
                setSelectedRecordId(null);
              }}
            >
              <option value="">전체 학생 일지 보기</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.school_grade || s.grade || '재원'})
                </option>
              ))}
            </select>
          </div>

          <div className="search-input-box">
            <Search size={14} className="text-muted" />
            <input
              type="text"
              placeholder="일지 검색 (과목, 날짜, 내용)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>

          <button className="btn-primary full-width" onClick={handleNewDiary}>
            <Plus size={15} /> 새 일지 작성
          </button>
        </div>

        <div className="diary-records-scroll">
          {filteredRecords.length === 0 ? (
            <div className="empty-notice">기록된 수업 일지가 없습니다.</div>
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

      {/* 우측: 정식 수업 일지 폼 */}
      <div className="diary-editor-panel">
        <div className="editor-top-actions">
          <div className="editor-title-area">
            <h2>{selectedRecordId ? '수업 일지 상세 및 수정' : '새 수업 일지 작성'}</h2>
            {currentStudent && (
              <span className="target-student-badge">
                {currentStudent.name} ({currentStudent.school_grade || currentStudent.grade || '일반'})
              </span>
            )}
          </div>

          <div className="btn-group">
            <button className="btn-secondary" onClick={handleExportHwpx}>
              <FileDown size={15} /> 한글 문서(HWPX) 저장
            </button>
            <button className="btn-secondary" onClick={handlePrint}>
              <Printer size={15} /> 인쇄 / 미리보기
            </button>
            {selectedRecordId && (
              <button className="btn-danger" onClick={handleDelete}>
                <Trash2 size={15} /> 삭제
              </button>
            )}
            <button className="btn-primary" onClick={handleSave}>
              <Save size={15} /> 저장하기
            </button>
          </div>
        </div>

        <div className="diary-form-body">
          {/* 기본 메타데이터 그리드 (학생, 날짜, 시간, 과목) */}
          <div className="form-row-grid">
            <div className="form-group">
              <label className="form-label">대상 학생 *</label>
              <select
                className="form-select"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, classDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">수업 시간 *</label>
              <input
                type="text"
                className="form-input"
                placeholder="예: 14:00"
                value={formData.classTime}
                onChange={(e) => setFormData({ ...formData, classTime: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">과정 / 교재 *</label>
              <input
                type="text"
                className="form-input"
                placeholder="예: 초등 수학 5-1 디딤돌"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              />
            </div>
          </div>

          {/* 주요 텍스트 입력 영역 */}
          <div className="form-group">
            <label className="form-label">
              <BookOpen size={14} /> 학습 진도 및 상세 지도 내용
            </label>
            <textarea
              className="form-textarea"
              rows={6}
              placeholder="오늘 진행한 학습 진도, 개념 설명, 문제 풀이 결과 등을 상세히 기록하세요..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="form-row-grid-2">
            <div className="form-group">
              <label className="form-label">📝 과제 및 숙제 안내</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="다음 시간까지 완료할 문제집 페이지, 복습 과제 등을 입력하세요..."
                value={formData.homework}
                onChange={(e) => setFormData({ ...formData, homework: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">💡 수업 태도 및 특이사항 / 학부모 전달사항</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="학생의 집중도, 학습 태도, 다음 수업 준비물 또는 학부모 상담 메모를 기록하세요..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
