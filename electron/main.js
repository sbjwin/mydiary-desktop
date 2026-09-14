const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let mainWindow = null;

function createApplicationMenu(isDev) {
  const template = [
    {
      label: '파일 (&F)',
      submenu: [
        { label: '새로고침 (&R)', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.reload() },
        { type: 'separator' },
        { label: '창 닫기 (&W)', role: 'close' },
        { label: '종료 (&X)', role: 'quit' },
      ],
    },
    {
      label: '편집 (&E)',
      submenu: [
        { label: '실행 취소 (&U)', role: 'undo' },
        { label: '다시 실행 (&R)', role: 'redo' },
        { type: 'separator' },
        { label: '잘라내기 (&T)', role: 'cut' },
        { label: '복사 (&C)', role: 'copy' },
        { label: '붙여넣기 (&P)', role: 'paste' },
        { label: '모두 선택 (&A)', role: 'selectAll' },
      ],
    },
    {
      label: '보기 (&V)',
      submenu: [
        { label: '실제 크기', role: 'resetZoom' },
        { label: '확대', role: 'zoomIn' },
        { label: '축소', role: 'zoomOut' },
        { type: 'separator' },
        { label: '전체 화면 토글', role: 'togglefullscreen' },
        ...(isDev ? [{ label: '개발자 도구 토글', role: 'toggleDevTools' }] : []),
      ],
    },
    {
      label: '도움말 (&H)',
      submenu: [
        {
          label: '📖 화면별 사용 가이드',
          accelerator: 'F1',
          click: () => {
            mainWindow?.webContents.send('open-help', 'guide');
          },
        },
        {
          label: '❓ 자주 묻는 질문 (FAQ)',
          click: () => {
            mainWindow?.webContents.send('open-help', 'faq');
          },
        },
        {
          label: '✉️ 개발자 문의 및 지원',
          click: () => {
            shell.openExternal('mailto:sbjwin4271@gmail.com');
          },
        },
        { type: 'separator' },
        {
          label: 'ℹ️ MyDiary Desktop 정보',
          click: () => {
            mainWindow?.webContents.send('open-help', 'about');
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  const icoPath = path.join(__dirname, '../build/icon.ico');
  const pngPath = path.join(__dirname, '../build/icon.png');
  const iconPath = fs.existsSync(icoPath) ? icoPath : (fs.existsSync(pngPath) ? pngPath : null);

  mainWindow = new BrowserWindow({
    width: 1360,
    height: 880,
    minWidth: 1024,
    minHeight: 700,
    title: 'MyDiary Desktop',
    ...(iconPath ? { icon: iconPath } : {}),
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 보안: 새 창(window.open / target="_blank") 생성 차단 및 안전한 외부 링크만 기본 브라우저로 위임
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const parsed = new URL(url);
      if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
        shell.openExternal(url);
      }
    } catch (_) {}
    return { action: 'deny' };
  });

  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
  createApplicationMenu(isDev);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC: 외부 링크/메일 열기 (보안 프로토콜 화이트리스트 검증)
ipcMain.handle('open-external', async (event, url) => {
  try {
    const parsed = new URL(url);
    const allowedProtocols = ['http:', 'https:', 'mailto:'];
    if (!allowedProtocols.includes(parsed.protocol)) {
      return { success: false, error: `보안상 허용되지 않는 프로토콜입니다: ${parsed.protocol}` };
    }
    await shell.openExternal(url);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC: 범용 파일 저장 다이얼로그 (HWPX, DOCX, PDF, JSON 등)
ipcMain.handle('save-file-dialog', async (event, { defaultFileName, base64Data, filterType }) => {
  try {
    let filters = [{ name: '모든 파일 (*.*)', extensions: ['*'] }];
    if (filterType === 'hwpx') {
      filters.unshift({ name: '한글 문서 (*.hwpx)', extensions: ['hwpx'] });
    } else if (filterType === 'docx') {
      filters.unshift({ name: '워드 문서 (*.docx)', extensions: ['docx'] });
    } else if (filterType === 'pdf') {
      filters.unshift({ name: 'PDF 문서 (*.pdf)', extensions: ['pdf'] });
    } else if (filterType === 'json') {
      filters.unshift({ name: 'JSON 백업 파일 (*.json)', extensions: ['json'] });
    }

    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: '파일 저장',
      defaultPath: defaultFileName,
      filters,
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);

    return { success: true, filePath };
  } catch (err) {
    console.error('Error saving file:', err);
    return { success: false, error: err.message };
  }
});

// HWPX 전용 하위 호환
ipcMain.handle('save-hwpx-file', async (event, { defaultFileName, base64Data }) => {
  return await ipcMain.handlers['save-file-dialog'](event, { defaultFileName, base64Data, filterType: 'hwpx' });
});

// ==========================================
// Google OAuth 2.0 Loopback Authentication (Desktop App / PKCE)
// ==========================================
// 데스크톱 앱의 Client ID는 공개 식별자이므로, 패키징된(.exe) 독립 실행 환경을 위해 기본값을 제공합니다.
const DEFAULT_CLIENT_ID = '877273732682-va98800gm7ba2tqvsorv8dp8fusbq7ku.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || DEFAULT_CLIENT_ID;
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'openid',
].join(' ');

ipcMain.handle('google-auth-login', async () => {
  return new Promise((resolve) => {
    try {
      if (!GOOGLE_CLIENT_ID) {
        return resolve({
          success: false,
          error: 'GOOGLE_CLIENT_ID가 설정되어 있지 않습니다.',
        });
      }

      // 1. PKCE code_verifier & code_challenge (S256) 및 CSRF 방어용 state 토큰 생성
      const codeVerifier = crypto.randomBytes(32).toString('base64url');
      const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
      const oauthState = crypto.randomBytes(16).toString('hex');

      // 2. 임시 로컬 루프백 서버 구동 (포트 0 -> 사용 가능한 빈 포트 자동 바인딩)
      const server = http.createServer(async (req, res) => {
        try {
          const reqUrl = new URL(req.url, `http://127.0.0.1:${server.address().port}`);

          // favicon.ico 등 브라우저 부가 요청은 조용히 무시 (204 처리)
          if (reqUrl.pathname === '/favicon.ico' || req.method !== 'GET') {
            res.writeHead(204);
            res.end();
            return;
          }

          const authCode = reqUrl.searchParams.get('code');
          const authError = reqUrl.searchParams.get('error');
          const returnedState = reqUrl.searchParams.get('state');

          // 인증 결과 파라미터(code 또는 error)가 없는 부차적인 요청(프리패치 등)은 무시
          if (!authCode && !authError) {
            res.writeHead(404);
            res.end();
            return;
          }

          if (authError) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end(`
              <!DOCTYPE html>
              <html>
              <head><meta charset="UTF-8"><title>로그인 취소</title><style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#0f172a;color:#f8fafc;}.card{background:#1e293b;padding:40px;border-radius:16px;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,0.5);}h2{color:#f87171;}p{color:#94a3b8;}</style></head>
              <body><div class="card"><h2>❌ 로그인 취소 또는 오류</h2><p>${authError}</p></div></body>
              </html>
            `);
            server.close();
            return resolve({ success: false, error: authError });
          }

          // RFC 6749 보안: CSRF 방어 state 토큰 일치 여부 검증
          if (oauthState && returnedState && returnedState !== oauthState) {
            console.warn(`OAuth state mismatch: expected ${oauthState}, got ${returnedState}`);
            res.writeHead(400, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end(`
              <!DOCTYPE html>
              <html>
              <head><meta charset="UTF-8"><title>보안 오류</title><style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#0f172a;color:#f8fafc;}.card{background:#1e293b;padding:40px;border-radius:16px;text-align:center;}h2{color:#f87171;}p{color:#94a3b8;}</style></head>
              <body><div class="card"><h2>⚠️ 보안 검증 실패</h2><p>OAuth CSRF 보안 토큰이 일치하지 않습니다.</p></div></body>
              </html>
            `);
            server.close();
            return resolve({ success: false, error: 'OAuth CSRF state 검증에 실패했습니다.' });
          }

          if (authCode) {
            // 브라우저에 성공 화면 렌더링
            res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end(`
              <!DOCTYPE html>
              <html>
              <head><meta charset="UTF-8"><title>MyDiary 로그인 성공</title><style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#0f172a;color:#f8fafc;}.card{background:#1e293b;padding:40px;border-radius:16px;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,0.5);}h2{color:#38bdf8;margin-bottom:12px;}p{color:#94a3b8;line-height:1.6;}</style></head>
              <body><div class="card"><h2>✅ MyDiary 로그인 성공</h2><p>구글 계정 인증이 완료되었습니다.<br>이 창을 닫고 <strong>MyDiary 데스크톱 앱</strong>으로 돌아가세요.</p></div><script>setTimeout(() => window.close(), 3000);</script></body>
              </html>
            `);

            // 3. 인가 코드로 액세스 토큰 교환 (RFC 7636 PKCE 표준 - 데스크톱 전용)
            const tokenParams = new URLSearchParams({
              client_id: GOOGLE_CLIENT_ID,
              code: authCode,
              code_verifier: codeVerifier,
              grant_type: 'authorization_code',
              redirect_uri: `http://127.0.0.1:${server.address().port}`,
            });

            const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: tokenParams.toString(),
            });

            const tokenData = await tokenRes.json();
            if (tokenData.error) {
              server.close();
              return resolve({ success: false, error: tokenData.error_description || tokenData.error });
            }

            // 4. 사용자 기본 프로필 정보 조회
            let userInfo = null;
            try {
              const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${tokenData.access_token}` },
              });
              userInfo = await userRes.json();
            } catch (uErr) {
              console.warn('Failed to fetch userinfo:', uErr);
            }

            server.close();
            return resolve({
              success: true,
              accessToken: tokenData.access_token,
              refreshToken: tokenData.refresh_token,
              expiresIn: tokenData.expires_in,
              user: userInfo
                ? {
                    id: userInfo.id,
                    email: userInfo.email,
                    name: userInfo.name,
                    photo: userInfo.picture,
                  }
                : null,
            });
          }
        } catch (serverErr) {
          console.error('OAuth loopback server error:', serverErr);
          server.close();
          resolve({ success: false, error: serverErr.message });
        }
      });

      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        const redirectUri = `http://127.0.0.1:${port}`;

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&response_type=code` +
          `&scope=${encodeURIComponent(GOOGLE_SCOPES)}` +
          `&code_challenge=${encodeURIComponent(codeChallenge)}` +
          `&code_challenge_method=S256` +
          `&state=${encodeURIComponent(oauthState)}` +
          `&access_type=offline` +
          `&prompt=consent`;

        // 기본 시스템 브라우저로 구글 로그인 화면 열기
        shell.openExternal(authUrl);
      });

      // 5분 타임아웃 방어
      setTimeout(() => {
        try {
          server.close();
        } catch (_) {}
        resolve({ success: false, error: '로그인 시간이 초과되었습니다 (타임아웃).' });
      }, 300000);
    } catch (err) {
      console.error('google-auth-login handler failed:', err);
      resolve({ success: false, error: err.message });
    }
  });
});

// IPC: 구글 액세스 토큰 갱신 (리프레시 토큰 활용)
ipcMain.handle('google-auth-refresh', async (event, refreshToken) => {
  try {
    if (!GOOGLE_CLIENT_ID) {
      return { success: false, error: 'GOOGLE_CLIENT_ID가 설정되어 있지 않습니다.' };
    }
    if (!refreshToken) {
      return { success: false, error: '리프레시 토큰이 없습니다.' };
    }

    const refreshParams = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: refreshParams.toString(),
    });

    const data = await res.json();
    if (data.error) {
      return { success: false, error: data.error_description || data.error };
    }

    return {
      success: true,
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    };
  } catch (err) {
    console.error('google-auth-refresh failed:', err);
    return { success: false, error: err.message };
  }
});

