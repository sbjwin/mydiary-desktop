/**
 * MyDiary Desktop 코어 무결성 자동 테스트 러너 (Lightweight Test Suite)
 * Node.js 내장 node:test 및 node:assert 모듈을 활용하여 무거운 외부 의존성 없이
 * 데이터베이스 1:1 호환, Cascade Delete, XML 방어, 유틸리티 함수의 무결성을 1초 내에 검증합니다.
 */

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

// Mock localStorage 구현 (In-Memory Map 기반)
class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

// Node 전역에 Mock localStorage 및 window 환경 설정
global.localStorage = new MockLocalStorage();
if (typeof global.window === 'undefined') {
  global.window = {
    focus: () => {},
    dispatchEvent: () => {},
  };
}

describe('MyDiary Desktop 코어 무결성 검증 (Core Integrity Test Suite)', async () => {
  // 모듈 동적 로드 (ESM)
  const fileUtils = await import('../src/utils/fileUtils.js');
  const phoneUtils = await import('../src/utils/phoneUtils.js');
  const dateUtils = await import('../src/utils/dateUtils.js');
  const dbModule = await import('../src/database/Database.js');
  const { Database, normalizeStudent } = dbModule;

  describe('1. 텍스트 및 XML 방어 이스케이프 (fileUtils)', () => {
    it('HWPX/DOCX XML 특수문자 5종(&, <, >, ", \')을 올바르게 이스케이프해야 한다', () => {
      const input = '<div class="student" data-note=\'A&B\'>홍길동 & 김철수</div>';
      const escaped = fileUtils.escapeXml(input);
      assert.strictEqual(
        escaped,
        '&lt;div class=&quot;student&quot; data-note=&apos;A&amp;B&apos;&gt;홍길동 &amp; 김철수&lt;/div&gt;'
      );
    });

    it('null 또는 undefined 입력 시 크래시 없이 빈 문자열을 반환해야 한다', () => {
      assert.strictEqual(fileUtils.escapeXml(null), '');
      assert.strictEqual(fileUtils.escapeXml(undefined), '');
      assert.strictEqual(fileUtils.escapeHtml(null), '');
      assert.strictEqual(fileUtils.escapeHtml(undefined), '');
    });
  });

  describe('2. 전화번호 및 날짜 유틸리티 무결성 (phoneUtils & dateUtils)', () => {
    it('formatPhoneInfo가 유효한 입력에 대해 문자열을 보존해야 한다', () => {
      assert.strictEqual(phoneUtils.formatPhoneInfo('010-1234-5678'), '010-1234-5678');
      assert.strictEqual(phoneUtils.formatPhoneInfo(null), '');
      assert.strictEqual(phoneUtils.formatPhoneInfo(undefined), '');
    });

    it('getMondayOfWeek가 특정 일자의 월요일(YYYY-MM-DD)을 정확히 계산해야 한다', () => {
      // 2026년 10월 21일 수요일 -> 월요일은 2026-10-19
      const monday = dateUtils.getMondayOfWeek('2026-10-21');
      assert.strictEqual(monday, '2026-10-19');

      // 일요일(2026-10-25)의 월요일도 2026-10-19여야 함
      const mondayFromSunday = dateUtils.getMondayOfWeek('2026-10-25');
      assert.strictEqual(mondayFromSunday, '2026-10-19');
    });

    it('getTodayDateString이 YYYY-MM-DD 규격을 준수해야 한다', () => {
      const today = dateUtils.getTodayDateString();
      assert.match(today, /^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('3. 데이터베이스 정규화 및 모바일 하위 호환성 (Database)', () => {
    beforeEach(() => {
      global.localStorage.clear();
    });

    it('terms가 누락된 구버전 학생 데이터를 1차 수강으로 정상 정규화해야 한다', () => {
      const legacyStudent = {
        id: 'legacy-1',
        name: '구버전학생',
        created_at: '2026-03-01T09:00:00Z',
      };
      const mockRecords = [
        { student_id: 'legacy-1', class_date: '2026-03-15' },
        { student_id: 'legacy-1', class_date: '2026-03-05' },
      ];

      const normalized = normalizeStudent(legacyStudent, mockRecords);
      assert.strictEqual(normalized.current_term_number, 1);
      assert.strictEqual(normalized.first_enrolled_date, '2026-03-05'); // 첫 수업일 기준 추론
      assert.strictEqual(normalized.status, 'active');
      assert.strictEqual(Array.isArray(normalized.terms), true);
      assert.strictEqual(normalized.terms.length, 1);
      assert.strictEqual(normalized.terms[0].term_number, 1);
      assert.strictEqual(normalized.terms[0].start_date, '2026-03-05');
    });

    it('모바일 백업 JSON 1:1 완벽 왕복(Round-Trip) 가져오기 및 내보내기 검증', async () => {
      const mobileBackupSample = {
        students: [
          {
            id: 'stu-001',
            name: '김모바일',
            phone: '010-1111-2222',
            status: 'active',
            terms: [{ term_number: 1, start_date: '2026-09-01', status: 'active' }],
          },
        ],
        records: [
          {
            id: 'rec-001',
            student_id: 'stu-001',
            class_date: '2026-09-02',
            class_time: '14:00',
            content: '모바일 연동 수업 테스트',
          },
        ],
        weeklyPlans: {
          '2026-09-01': {
            scheduleItems: [
              { date: '2026-09-02', time: '14:00', studentId: 'stu-001' },
            ],
          },
        },
      };

      // 1. 가져오기
      await Database.importAllData(mobileBackupSample);

      // 2. 개별 조회 검증
      const loadedStudents = await Database.getAllStudents();
      assert.strictEqual(loadedStudents.length, 1);
      assert.strictEqual(loadedStudents[0].name, '김모바일');

      const loadedRecords = await Database.getAllRecords();
      assert.strictEqual(loadedRecords.length, 1);
      assert.strictEqual(loadedRecords[0].content, '모바일 연동 수업 테스트');

      // 3. 내보내기 검증
      const exportedJsonStr = await Database.exportAllData();
      const parsedExport = JSON.parse(exportedJsonStr);
      assert.strictEqual(parsedExport.students.length, 1);
      assert.strictEqual(parsedExport.students[0].id, 'stu-001');
      assert.strictEqual(parsedExport.records.length, 1);
      assert.strictEqual(parsedExport.records[0].id, 'rec-001');
      assert.ok(parsedExport.timestamp, '타임스탬프 필드 포함 여부');
    });

    it('학생 삭제 시 하위 일지도 함께 삭제되는 Cascade Delete를 보장해야 한다', async () => {
      const testData = {
        students: [
          { id: 'target-stu', name: '삭제대상학생', terms: [{ term_number: 1, start_date: '2026-10-01' }] },
          { id: 'remain-stu', name: '보존학생', terms: [{ term_number: 1, start_date: '2026-10-01' }] },
        ],
        records: [
          { id: 'rec-1', student_id: 'target-stu', class_date: '2026-10-02' },
          { id: 'rec-2', student_id: 'target-stu', class_date: '2026-10-05' },
          { id: 'rec-3', student_id: 'remain-stu', class_date: '2026-10-02' },
        ],
        weeklyPlans: {},
      };

      await Database.importAllData(testData);

      // target-stu 학생 삭제 실행
      await Database.deleteStudent('target-stu');

      // 검증: 학생 목록에서 target-stu 제거 확인
      const remainingStudents = await Database.getAllStudents();
      assert.strictEqual(remainingStudents.length, 1);
      assert.strictEqual(remainingStudents[0].id, 'remain-stu');

      // 검증: records 목록에서 target-stu의 일지 rec-1, rec-2가 Cascade 삭제되고 rec-3만 보존됨을 확인
      const remainingRecords = await Database.getAllRecords();
      assert.strictEqual(remainingRecords.length, 1);
      assert.strictEqual(remainingRecords[0].id, 'rec-3');
      assert.strictEqual(remainingRecords[0].student_id, 'remain-stu');
    });
  });
});
