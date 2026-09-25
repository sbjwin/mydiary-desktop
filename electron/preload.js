const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  saveFile: (defaultFileName, base64Data, filterType) =>
    ipcRenderer.invoke('save-file-dialog', { defaultFileName, base64Data, filterType }),
  saveHwpxFile: (defaultFileName, base64Data) =>
    ipcRenderer.invoke('save-file-dialog', { defaultFileName, base64Data, filterType: 'hwpx' }),
  exportPdf: (htmlContent, defaultFileName) =>
    ipcRenderer.invoke('export-pdf', { htmlContent, defaultFileName }),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  googleLogin: () => ipcRenderer.invoke('google-auth-login'),
  googleRefresh: (refreshToken) => ipcRenderer.invoke('google-auth-refresh', refreshToken),
  focusWindow: () => ipcRenderer.invoke('focus-window'),
  onOpenHelp: (callback) => {
    const handler = (event, tab) => callback(tab);
    ipcRenderer.on('open-help', handler);
    return () => ipcRenderer.removeListener('open-help', handler);
  },
});
