/**
 * MyDiary Desktop 학생 데이터 공통 유틸리티
 */

/**
 * 학생 객체에서 대표 과목/과정을 추출합니다.
 * @param {Object | null | undefined} student
 * @param {string} [fallback='']
 * @returns {string}
 */
export const getStudentPrimaryCourse = (student, fallback = '') => {
  if (!student) return fallback;
  return (
    student.course ||
    student.subject ||
    (Array.isArray(student.default_schedules) && student.default_schedules[0]?.subject) ||
    fallback
  );
};
