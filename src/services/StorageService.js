/**
 * MyDiary Desktop Storage Service
 * 로컬 스토리지 및 파일 데이터 영속화
 */
const STORAGE_KEY_STUDENTS = 'mydiary_desktop_students';
const STORAGE_KEY_DIARIES = 'mydiary_desktop_diaries';

const DEFAULT_STUDENTS = [
  { id: '1', name: '김민준', grade: '3학년 1반', note: '수학 우수, 적극적인 참여' },
  { id: '2', name: '이서연', grade: '3학년 1반', note: '그림 그리기 취미, 차분한 성격' },
  { id: '3', name: '박도윤', grade: '3학년 1반', note: '독서 활동 활발, 교우 관계 원만' },
];

const DEFAULT_DIARIES = [
  {
    id: 'd1',
    studentId: '1',
    date: '2026-09-14',
    title: '모둠 활동 협동 수업 관찰',
    content: '수학 모둠 탐구 활동에서 조장을 맡아 소외되는 친구 없이 의견을 잘 조율함. 문제 해결 과정에서 창의적인 발상을 제시함.',
  },
  {
    id: 'd2',
    studentId: '1',
    date: '2026-09-11',
    title: '체육 수업 및 생활 태도',
    content: '이어달리기 활동에서 끝까지 최선을 다해 뛰었으며, 경기 후 상대 팀에게도 격려의 박수를 보냄.',
  },
  {
    id: 'd3',
    studentId: '2',
    date: '2026-09-12',
    title: '미술 실습 시간 관찰 기록',
    content: '가을 풍경화 그리기 활동에서 색채 감각이 매우 돋보이며, 세밀한 표현력이 우수함.',
  },
];

export const loadStudents = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    return raw ? JSON.parse(raw) : DEFAULT_STUDENTS;
  } catch (e) {
    console.error('Failed to load students:', e);
    return DEFAULT_STUDENTS;
  }
};

export const saveStudents = (students) => {
  localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
};

export const loadDiaries = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DIARIES);
    return raw ? JSON.parse(raw) : DEFAULT_DIARIES;
  } catch (e) {
    console.error('Failed to load diaries:', e);
    return DEFAULT_DIARIES;
  }
};

export const saveDiaries = (diaries) => {
  localStorage.setItem(STORAGE_KEY_DIARIES, JSON.stringify(diaries));
};
