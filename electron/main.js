const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 880,
    minWidth: 1024,
    minHeight: 700,
    title: 'MyDiary Desktop',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';

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
