/**
 * MyDiary Desktop Backup & Google Drive Service
 * PC 로컬 파일 백업/복원 및 클라우드 동기화 서비스
 */

export const GoogleDriveService = {
  // 1. PC 로컬 파일로 전체 데이터 백업 (.json 저장)
  exportLocalBackup: async () => {
    try {
      const backupData = {
        version: '0.1.0',
        exportedAt: new Date().toISOString(),
        students: JSON.parse(localStorage.getItem('@mydiary:students') || '[]'),
        records: JSON.parse(localStorage.getItem('@mydiary:records') || '[]'),
        weeklyPlans: JSON.parse(localStorage.getItem('@mydiary:weekly_plans') || '[]'),
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const base64Data = btoa(unescape(encodeURIComponent(jsonStr)));
      const fileName = `mydiary_backup_${new Date().toISOString().slice(0, 10)}.json`;

      if (window.electronAPI && window.electronAPI.saveFile) {
        const res = await window.electronAPI.saveFile(fileName, base64Data, 'json');
        if (res.success) {
          alert(`백업 파일이 안전하게 저장되었습니다.\n경로: ${res.filePath}`);
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
    }
  },

  // 2. PC 로컬 백업 파일(.json) 불러와 복원
  importLocalBackup: (fileContent) => {
    try {
      const data = typeof fileContent === 'string' ? JSON.parse(fileContent) : fileContent;
      if (!data.students && !data.records) {
        throw new Error('유효한 MyDiary 백업 파일이 아닙니다.');
      }

      if (data.students) localStorage.setItem('@mydiary:students', JSON.stringify(data.students));
      if (data.records) localStorage.setItem('@mydiary:records', JSON.stringify(data.records));
      if (data.weeklyPlans) localStorage.setItem('@mydiary:weekly_plans', JSON.stringify(data.weeklyPlans));

      alert('데이터가 성공적으로 복원되었습니다. 페이지를 새로고침합니다.');
      window.location.reload();
    } catch (err) {
      console.error('Restore error:', err);
      alert('백업 복원 실패: ' + err.message);
    }
  },

  // 3. 구글 드라이브 동기화 준비 (OAuth 2.0 Web Flow 지원)
  uploadBackup: async (backupJsonString) => {
    console.log('Google Drive backup requested');
    // 데스크톱 브라우저/OAuth 세션 연동
  },

  downloadLatestBackup: async () => {
    console.log('Google Drive restore requested');
  },
};
