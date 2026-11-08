'use strict';
const { contextBridge, ipcRenderer, webUtils } = require('electron');
contextBridge.exposeInMainWorld('NovaDesktop', Object.freeze({
  filePath(file) { try { return webUtils.getPathForFile(file); } catch { return ''; } },
  render(job, files, fileName='') { return ipcRenderer.invoke('nova:native-render', {job, files, fileName}); },
  cancelRender() { return ipcRenderer.invoke('nova:cancel-render'); },
  importWhisperSmall() { return ipcRenderer.invoke('nova:import-whisper-small'); },
  queueExport(request) {return ipcRenderer.invoke('nova:queue-add',request);},
  queueList() {return ipcRenderer.invoke('nova:queue-list');},
  queueCancel(id) {return ipcRenderer.invoke('nova:queue-cancel',id);},
  onQueueStatus(cb) {const listener=(_event,msg)=>cb(msg);ipcRenderer.on('nova:queue-status',listener);return ()=>ipcRenderer.removeListener('nova:queue-status',listener);},
  detectCrop(request) {return ipcRenderer.invoke('nova:detect-crop',request);},
  suggestSpeakers(request) {return ipcRenderer.invoke('nova:speaker-labels',request);},
  translateCaptions(request) {return ipcRenderer.invoke('nova:translate-captions',request);},
  chooseLut() { return ipcRenderer.invoke('nova:choose-lut'); },
  transcribe(request) { return ipcRenderer.invoke('nova:transcribe', request); },
  inspectImport(filePath) { return ipcRenderer.invoke('nova:inspect-import',{filePath}); },
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
