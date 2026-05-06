const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  showNotification: (title, body) => {
    ipcRenderer.send('show-notification', { title, body });
  },
  showNotificationWindow: (message) => {
    ipcRenderer.send('show-notification-window', message);
  }
});