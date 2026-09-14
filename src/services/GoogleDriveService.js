/**
 * MyDiary Desktop Backup & Google Drive Service
 * PC 로컬 파일 백업/복원 및 구글 드라이브(appDataFolder) 클라우드 동기화 서비스
 */

import { Database } from '../database/Database';

const GOOGLE_AUTH_KEY = '@mydiary:google_auth';
const BACKUP_FILE_NAME = 'mydiary_backup.json';

export const GoogleDriveService = {
  // -------------------------------------------------------------
  // 1. PC 로컬 파일 백업 및 복원
  // -------------------------------------------------------------

  // PC 로컬 파일로 전체 데이터 백업 (.json 저장)
  exportLocalBackup: async () => {
    try {
      const backupData = {
        version: '0.2.0',
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
        if (res.success) {
          alert(`백업 파일이 안전하게 저장되었습니다.\n저장 경로: ${res.filePath}`);
          return res;
        }
      } else {
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Backup error:', err);
      alert('백업 파일 생성 중 오류가 발생했습니다: ' + err.message);
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
      alert('데이터가 성공적으로 복원되었습니다. 페이지를 새로고침합니다.');
      window.location.reload();
    } catch (err) {
      console.error('Restore error:', err);
      alert('백업 복원 실패: ' + err.message);
      throw err;
    }
  },

  // -------------------------------------------------------------
  // 2. 구글 계정 인증 및 토큰 관리 (Electron OAuth 2.0 Loopback)
  // -------------------------------------------------------------

  getAuthState: () => {
    try {
      const raw = localStorage.getItem(GOOGLE_AUTH_KEY);
      if (!raw) return { isLoggedIn: false, user: null, accessToken: null };
      const parsed = JSON.parse(raw);
      return {
        isLoggedIn: !!parsed.accessToken,
        user: parsed.user || null,
        accessToken: parsed.accessToken || null,
      };
    } catch (err) {
      console.error('Failed to get auth state:', err);
      return { isLoggedIn: false, user: null, accessToken: null };
    }
  },

  signIn: async () => {
    try {
      if (!window.electronAPI || !window.electronAPI.googleLogin) {
        throw new Error('데스크톱 앱 환경에서만 구글 드라이브 로그인이 지원됩니다.');
      }

      const res = await window.electronAPI.googleLogin();
      if (!res || !res.success) {
        throw new Error(res?.error || '구글 로그인에 실패했습니다.');
      }

      const authData = {
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        expiresIn: res.expiresIn,
        user: res.user,
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
  // 3. 구글 드라이브 클라우드 백업 및 복원 (appDataFolder)
  // -------------------------------------------------------------

  // 스마트폰 앱이 업로드한 mydiary_backup.json 다운로드 및 복원
  downloadCloudBackup: async () => {
    try {
      const auth = GoogleDriveService.getAuthState();
      if (!auth.isLoggedIn || !auth.accessToken) {
        throw new Error('구글 계정 로그인이 필요합니다.');
      }

      // 1. appDataFolder에서 mydiary_backup.json 검색
      const q = encodeURIComponent(`name='${BACKUP_FILE_NAME}' and trashed=false`);
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id,name,size,modifiedTime)`,
        {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
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
          headers: { Authorization: `Bearer ${auth.accessToken}` },
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
      if (!auth.isLoggedIn || !auth.accessToken) {
        throw new Error('구글 계정 로그인이 필요합니다.');
      }

      const backupJsonString = await Database.exportAllData();

      // 1. 기존 파일 존재 여부 확인
      const q = encodeURIComponent(`name='${BACKUP_FILE_NAME}' and trashed=false`);
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id,name)`,
        {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
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

      // multipart/related 문자열 구성 (스마트폰 MyDiary와 동일 포맷)
      const boundary = 'mydiary_desktop_backup_boundary';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelim = `\r\n--${boundary}--`;

      const body =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        backupJsonString +
        closeDelim;

      // 2. 업로드 요청 전송
      const uploadRes = await fetch(uploadUrl, {
        method,
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: body,
      });

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
};
