/**
 * MyDiary Desktop Backup & Google Drive Service
 * PC 로컬 파일 백업/복원 및 구글 드라이브(appDataFolder) 클라우드 동기화 서비스
 */

import { Database } from '../database/Database';

const GOOGLE_AUTH_KEY = '@mydiary:google_auth';
const BACKUP_FILE_NAME = 'mydiary_backup.json';
const MOCK_STORAGE_KEY = '@mydiary:mock_cloud_storage';

export const GoogleDriveService = {
  // -------------------------------------------------------------
  // Mock(모의) 환경 상태 판별
  // -------------------------------------------------------------
  isMockMode: () => {
    // 1. Vite 환경 변수로 명시적 활성화된 경우
    if (import.meta.env.VITE_USE_MOCK_GOOGLE === 'true') return true;
    // 2. 현재 로그인 세션이 Mock 계정인 경우
    const auth = GoogleDriveService.getAuthState();
    if (auth.isMock) return true;
    // 3. 데스크톱 Electron API가 없는 순수 브라우저(npm run dev) 환경인 경우
    if (!window.electronAPI || !window.electronAPI.googleLogin) return true;
    return false;
  },

  // 가상 구글 드라이브 스토리지에 백업 데이터가 존재하는지 확인
  hasMockCloudBackup: () => {
    return !!localStorage.getItem(MOCK_STORAGE_KEY);
  },

  // -------------------------------------------------------------
  // 1. PC 로컬 파일 백업 및 복원
  // -------------------------------------------------------------

  // PC 로컬 파일로 전체 데이터 백업 (.json 저장)
  exportLocalBackup: async () => {
    try {
      const backupData = {
        version: '0.5.0',
        exportedAt: new Date().toISOString(),
        students: JSON.parse(localStorage.getItem('@mydiary:students') || '[]'),
        records: JSON.parse(localStorage.getItem('@mydiary:records') || '[]'),
        weeklyPlans: JSON.parse(localStorage.getItem('@mydiary:weekly_plans') || '{}'),
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const base64Data = btoa(unescape(encodeURIComponent(jsonStr)));
      const fileName = `mydiary_backup_${new Date().toISOString().slice(0, 10)}.json`;

      if (window.electronAPI && window.electronAPI.saveFile) {
        const res = await window.electronAPI.saveFile(fileName, base64Data, 'json');
        return res;
      } else {
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        return { success: true, fileName };
      }
    } catch (err) {
      console.error('Backup error:', err);
      throw err;
    }
  },

  // PC 로컬 백업 파일(.json) 불러와 복원
  importLocalBackup: async (fileContent) => {
    try {
      const data = typeof fileContent === 'string' ? JSON.parse(fileContent) : fileContent;
      if (!data.students && !data.records && !data.weeklyPlans) {
        throw new Error('유효한 MyDiary 백업 파일이 아닙니다.');
      }

      await Database.importAllData(data);
      return {
        success: true,
        studentsCount: (data.students || []).length,
        recordsCount: (data.records || []).length,
        plansCount: Object.keys(data.weeklyPlans || {}).length,
      };
    } catch (err) {
      console.error('Restore error:', err);
      throw err;
    }
  },

  // -------------------------------------------------------------
  // 2. 구글 계정 인증 및 토큰 관리 (Electron OAuth 2.0 Loopback & Mock)
  // -------------------------------------------------------------

  getAuthState: () => {
    try {
      const raw = localStorage.getItem(GOOGLE_AUTH_KEY);
      if (!raw) return { isLoggedIn: false, user: null, accessToken: null, isMock: false };
      const parsed = JSON.parse(raw);
      return {
        isLoggedIn: !!parsed.accessToken,
        user: parsed.user || null,
        accessToken: parsed.accessToken || null,
        refreshToken: parsed.refreshToken || null,
        isMock: !!parsed.isMock,
      };
    } catch (err) {
      console.error('Failed to get auth state:', err);
      return { isLoggedIn: false, user: null, accessToken: null, isMock: false };
    }
  },

  getValidAccessToken: async () => {
    try {
      const raw = localStorage.getItem(GOOGLE_AUTH_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed.accessToken) return null;

      // Mock 모드 계정인 경우 갱신 없이 가상 토큰 그대로 반환
      if (parsed.isMock) {
        return parsed.accessToken;
      }

      // 만료 확인 (기본 1시간 만료 기준 5분 전이면 갱신 시도)
      const savedAt = parsed.savedAt ? new Date(parsed.savedAt).getTime() : 0;
      const expiresInMs = (parsed.expiresIn || 3600) * 1000;
      const isExpired = Date.now() - savedAt > expiresInMs - 300000;

      if (isExpired && parsed.refreshToken && window.electronAPI?.googleRefresh) {
        const refreshRes = await window.electronAPI.googleRefresh(parsed.refreshToken);
        if (refreshRes && refreshRes.success) {
          parsed.accessToken = refreshRes.accessToken;
          parsed.expiresIn = refreshRes.expiresIn || 3600;
          parsed.savedAt = new Date().toISOString();
          localStorage.setItem(GOOGLE_AUTH_KEY, JSON.stringify(parsed));
          return parsed.accessToken;
        }
      }

      return parsed.accessToken;
    } catch (err) {
      console.error('Failed to get or refresh access token:', err);
      return null;
    }
  },

  signIn: async () => {
    try {
      let res = null;

      // 데스크톱 Electron 환경
      if (window.electronAPI && window.electronAPI.googleLogin) {
        res = await window.electronAPI.googleLogin();
      } else {
        // 웹 브라우저 단독 개발(npm run dev) 환경 시 Mock 계정으로 로그인 시뮬레이션
        await new Promise((r) => setTimeout(r, 400));
        res = {
          success: true,
          isMock: true,
          accessToken: 'mock_web_token_' + Date.now(),
          refreshToken: 'mock_web_refresh_' + Date.now(),
          expiresIn: 3600,
          user: {
            id: 'mock_teacher_web',
            email: 'teacher.mock@mydiary.test',
            name: '홍길동 선생님 (Mock)',
            photo: null,
          },
        };
      }

      if (!res || !res.success) {
        throw new Error(res?.error || '구글 로그인에 실패했습니다.');
      }

      const authData = {
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        expiresIn: res.expiresIn,
        user: res.user,
        isMock: !!res.isMock,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem(GOOGLE_AUTH_KEY, JSON.stringify(authData));
      return authData;
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      throw err;
    }
  },

  signOut: async () => {
    localStorage.removeItem(GOOGLE_AUTH_KEY);
    return { success: true };
  },

  // -------------------------------------------------------------
  // 3. 구글 드라이브 클라우드 백업 및 복원 (appDataFolder & Mock Storage)
  // -------------------------------------------------------------

  // 스마트폰 앱이 업로드한 mydiary_backup.json 다운로드 및 복원
  downloadCloudBackup: async () => {
    try {
      const auth = GoogleDriveService.getAuthState();
      if (!auth.isLoggedIn) {
        throw new Error('구글 계정 로그인이 필요합니다.');
      }

      // [Mock 환경] 가상 구글 드라이브(로컬 스토리지)에서 백업 다운로드 및 복원
      if (auth.isMock || GoogleDriveService.isMockMode()) {
        await new Promise((r) => setTimeout(r, 600)); // 현실적인 다운로드 네트워크 지연 시뮬레이션
        const mockRaw = localStorage.getItem(MOCK_STORAGE_KEY);
        if (!mockRaw) {
          throw new Error(
            '가상 구글 드라이브(Mock Storage)에 백업 파일(mydiary_backup.json)이 존재하지 않습니다.\n' +
            '먼저 [현재 데이터 클라우드 백업]을 클릭하여 가상 드라이브에 백업을 저장하거나,\n' +
            '하단의 [🧪 테스트용 샘플 데이터 자동 생성] 버튼을 눌러 가상 백업 데이터를 준비해 주세요.'
          );
        }

        const parsedData = JSON.parse(mockRaw);
        await Database.importAllData(parsedData);

        return {
          success: true,
          isMock: true,
          fileInfo: {
            id: 'mock_cloud_file_001',
            name: BACKUP_FILE_NAME,
            size: mockRaw.length,
            modifiedTime: new Date().toISOString(),
          },
          studentsCount: (parsedData.students || []).length,
          recordsCount: (parsedData.records || []).length,
          plansCount: Object.keys(parsedData.weeklyPlans || {}).length,
          timestamp: parsedData.timestamp || parsedData.exportedAt || new Date().toISOString(),
        };
      }

      const accessToken = await GoogleDriveService.getValidAccessToken();
      if (!accessToken) {
        throw new Error('유효한 구글 인증 토큰을 가져올 수 없습니다. 다시 로그인해 주세요.');
      }

      // 1. appDataFolder에서 mydiary_backup.json 검색
      const q = encodeURIComponent(`name='${BACKUP_FILE_NAME}' and trashed=false`);
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id,name,size,modifiedTime)`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const searchData = await searchRes.json();
      if (searchData.error) {
        if (searchData.error.code === 401) {
          GoogleDriveService.signOut();
          throw new Error('구글 인증이 만료되었습니다. 다시 로그인해 주세요.');
        }
        throw new Error(`Google API 오류: ${searchData.error.message}`);
      }

      if (!searchData.files || searchData.files.length === 0) {
        throw new Error(
          '구글 드라이브(appDataFolder)에 백업 파일(mydiary_backup.json)이 존재하지 않습니다.\n스마트폰 MyDiary 앱에서 먼저 [구글 드라이브 백업]을 진행하셨는지 확인해 주세요.'
        );
      }

      const backupFile = searchData.files[0];

      // 2. 백업 파일 내용 다운로드
      const downloadRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${backupFile.id}?alt=media`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!downloadRes.ok) {
        throw new Error(`백업 파일 다운로드 실패 (상태 코드: ${downloadRes.status})`);
      }

      const backupDataText = await downloadRes.text();
      const parsedData = JSON.parse(backupDataText);

      // 3. 데이터 무결성 검증 및 로컬 DB 복원
      await Database.importAllData(parsedData);

      return {
        success: true,
        fileInfo: backupFile,
        studentsCount: (parsedData.students || []).length,
        recordsCount: (parsedData.records || []).length,
        plansCount: Object.keys(parsedData.weeklyPlans || {}).length,
        timestamp: parsedData.timestamp,
      };
    } catch (err) {
      console.error('Download cloud backup failed:', err);
      throw err;
    }
  },

  // 데스크톱 데이터를 구글 드라이브 appDataFolder에 업로드
  uploadCloudBackup: async () => {
    try {
      const auth = GoogleDriveService.getAuthState();
      if (!auth.isLoggedIn) {
        throw new Error('구글 계정 로그인이 필요합니다.');
      }

      const backupJsonString = await Database.exportAllData();

      // [Mock 환경] 가상 구글 드라이브(로컬 스토리지)에 백업 업로드 시뮬레이션
      if (auth.isMock || GoogleDriveService.isMockMode()) {
        await new Promise((r) => setTimeout(r, 600)); // 업로드 네트워크 지연 시뮬레이션
        localStorage.setItem(MOCK_STORAGE_KEY, backupJsonString);

        return {
          success: true,
          isMock: true,
          fileId: 'mock_drive_file_' + Date.now(),
          name: BACKUP_FILE_NAME,
          updatedAt: new Date().toISOString(),
        };
      }

      const accessToken = await GoogleDriveService.getValidAccessToken();
      if (!accessToken) {
        throw new Error('유효한 구글 인증 토큰을 가져올 수 없습니다. 다시 로그인해 주세요.');
      }

      // 1. 기존 파일 존재 여부 확인
      const q = encodeURIComponent(`name='${BACKUP_FILE_NAME}' and trashed=false`);
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id,name)`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const searchData = await searchRes.json();
      if (searchData.error) {
        if (searchData.error.code === 401) {
          GoogleDriveService.signOut();
          throw new Error('구글 인증이 만료되었습니다. 다시 로그인해 주세요.');
        }
        throw new Error(`Google API 오류: ${searchData.error.message}`);
      }

      let uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
      let method = 'POST';
      let metadata = { name: BACKUP_FILE_NAME };

      if (searchData.files && searchData.files.length > 0) {
        // 기존 파일 덮어쓰기 (PATCH)
        const fileId = searchData.files[0].id;
        uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
        method = 'PATCH';
      } else {
        // 새 파일 생성 시에만 parents 지정
        metadata.parents = ['appDataFolder'];
      }

      // multipart/related 본문 구성 (RFC 2046 규격 준수: 첫 줄은 빈 줄 없이 --boundary로 시작)
      const boundary = 'mydiary_desktop_backup_boundary';
      const firstDelim = `--${boundary}\r\n`;
      const midDelim = `\r\n--${boundary}\r\n`;
      const closeDelim = `\r\n--${boundary}--`;

      const body =
        firstDelim +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        midDelim +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        backupJsonString +
        closeDelim;

      // 2. 업로드 요청 전송
      const uploadRes = await fetch(uploadUrl, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: body,
      });

      if (!uploadRes.ok) {
        let errDetail = `상태 코드 ${uploadRes.status}`;
        try {
          const errData = await uploadRes.json();
          if (errData.error?.message) {
            errDetail = errData.error.message;
          }
        } catch (_) {
          try {
            const errText = await uploadRes.text();
            if (errText) errDetail = errText.slice(0, 100);
          } catch (_) {}
        }
        throw new Error(`클라우드 백업 업로드 실패: ${errDetail}`);
      }

      const uploadData = await uploadRes.json();
      if (uploadData.error) {
        throw new Error(`클라우드 업로드 오류: ${uploadData.error.message}`);
      }

      return {
        success: true,
        fileId: uploadData.id,
        name: uploadData.name,
        updatedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error('Upload cloud backup failed:', err);
      throw err;
    }
  },

  // -------------------------------------------------------------
  // 4. 공동개발자/기여자를 위한 원클릭 샘플 데이터 생성기 (Mock Seeder)
  // -------------------------------------------------------------
  seedMockData: async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const sampleStudents = [
        {
          id: 'mock_student_1',
          name: '김민우',
          grade: '1',
          classNumber: '3',
          studentNumber: '14',
          gender: '남',
          birthDate: '2010-04-12',
          phone: '010-1234-5678',
          parentPhone: '010-9876-5432',
          note: '수학적 사고력이 뛰어나며 토론 활동에 적극적임.',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'mock_student_2',
          name: '이지은',
          grade: '1',
          classNumber: '3',
          studentNumber: '21',
          gender: '여',
          birthDate: '2010-08-25',
          phone: '010-2345-6789',
          parentPhone: '010-8765-4321',
          note: '미술 및 시각자료 제작에 능숙하고 교우관계가 원만함.',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'mock_student_3',
          name: '박도현',
          grade: '1',
          classNumber: '3',
          studentNumber: '5',
          gender: '남',
          birthDate: '2010-02-18',
          phone: '010-3456-7890',
          parentPhone: '010-7654-3210',
          note: '체육활동과 리더십이 돋보이나 과제 제출 일정 관리 필요.',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'mock_student_4',
          name: '최수아',
          grade: '1',
          classNumber: '3',
          studentNumber: '28',
          gender: '여',
          birthDate: '2010-11-03',
          phone: '010-4567-8901',
          parentPhone: '010-6543-2109',
          note: '조용하고 책임감이 강하며 독서록 작성을 성실히 수행함.',
          createdAt: new Date().toISOString(),
        },
      ];

      const sampleRecords = [
        {
          id: 'mock_rec_1',
          studentId: 'mock_student_1',
          date: today,
          category: '수업태도',
          title: '수학 심화 문제 풀이 주도',
          content: '방정식 단원 모둠 활동 시 어려워하는 급우들에게 개념을 알기 쉽게 설명해 줌.',
          tags: ['수학', '모둠활동', '우수'],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'mock_rec_2',
          studentId: 'mock_student_2',
          date: today,
          category: '창의체험',
          title: '학급 환경미화 포스터 제작',
          content: '학급 규칙 안내 포스터를 감각적인 일러스트로 완성하여 게시판에 부착함.',
          tags: ['미술', '학급활동', '봉사'],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'mock_rec_3',
          studentId: 'mock_student_3',
          date: today,
          category: '생활지도',
          title: '체육대회 반장 역할 수행',
          content: '반 대표로서 급우들을 독려하고 응원 도구를 솔선수범하여 정리함.',
          tags: ['체육', '리더십'],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'mock_rec_4',
          studentId: 'mock_student_4',
          date: today,
          category: '진로상담',
          title: '도서관 진로 희망 도서 탐독',
          content: '환경과학 관련 도서를 읽고 기후 변화 대응 보고서 작성에 큰 흥미를 보임.',
          tags: ['진로', '독서', '환경'],
          createdAt: new Date().toISOString(),
        },
      ];

      const sampleWeeklyPlans = {
        default: {
          title: '1학기 학급 운영 및 수업 지도 계획',
          notes: '모둠별 탐구 프로젝트 발표 준비 및 안전 지도 강화',
        },
      };

      const seedData = {
        version: '0.5.0',
        exportedAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        students: sampleStudents,
        records: sampleRecords,
        weeklyPlans: sampleWeeklyPlans,
      };

      // 1. 로컬 DB에 주입
      await Database.importAllData(seedData);

      // 2. 가상 클라우드 스토리지에도 동일 백업 파일 시뮬레이션 저장
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(seedData));

      return {
        success: true,
        studentsCount: sampleStudents.length,
        recordsCount: sampleRecords.length,
        plansCount: Object.keys(sampleWeeklyPlans).length,
      };
    } catch (err) {
      console.error('Seed mock data failed:', err);
      throw err;
    }
  },
};
