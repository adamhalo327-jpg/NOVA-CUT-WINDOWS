'use strict';
const { contextBridge, ipcRenderer, webUtils } = require('electron');
contextBridge.exposeInMainWorld('NovaDesktop', Object.freeze({
  filePath(file) { try { return webUtils.getPathForFile(file); } catch { return ''; } },
  render(job, files) { return ipcRenderer.invoke('nova:native-render', {job, files}); },
  cancelRender() { return ipcRenderer.invoke('nova:cancel-render'); },
  transcribe(request) { return ipcRenderer.invoke('nova:transcribe', request); },
  onProgress(callback) {
    const handler = (_event, msg) => callback(msg);
    ipcRenderer.on('nova:render-progress', handler);
    return () => ipcRenderer.removeListener('nova:render-progress', handler);
  },
  onCommand(callback) {
    const handler = (_event, command) => callback(command);
    ipcRenderer.on('nova:command', handler);
    return () => ipcRenderer.removeListener('nova:command', handler);
  }
}));
