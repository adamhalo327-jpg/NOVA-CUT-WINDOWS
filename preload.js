'use strict';
const { contextBridge, ipcRenderer, webUtils } = require('electron');
contextBridge.exposeInMainWorld('NovaDesktop', Object.freeze({
  filePath(file) { try { return webUtils.getPathForFile(file); } catch { return ''; } },
  render(job, files) { return ipcRenderer.invoke('nova:native-render', {job, files}); },
  cancelRender() { return ipcRenderer.invoke('nova:cancel-render'); },
  transcribe(request) { return ipcRenderer.invoke('nova:transcribe', request); },
  prepareMp4(filePath) { return ipcRenderer.invoke('nova:prepare-mp4',{filePath}); },
  onMp4Progress(callback) {
    const handler=(_event,details)=>callback(details);
    ipcRenderer.on('nova:mp4-preview-progress',handler);
    return ()=>ipcRenderer.removeListener('nova:mp4-preview-progress',handler);
  },
  analyzeMedia(request) { return ipcRenderer.invoke('nova:analyze-media',request); },
  inspectMedia(mode='choose') { return ipcRenderer.invoke('nova:inspect-media', {mode}); },
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
