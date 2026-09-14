const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

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

// IPC: 외부 링크/메일 열기
ipcMain.handle('open-external', async (event, url) => {
  try {
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
