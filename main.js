"use strict";
const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const { renderProject, cancelRender } = require('./native-renderer');
const {transcribeOffline} = require('./speech-renderer');
const {probeMedia} = require('./media-inspector');
const {prepareMp4Preview,cancelActivePreview,cleanupPreviewFiles} = require('./mp4-preview');
const {analyzeMedia}=require('./mega-engine');
let lastExportPath = null;

// NOVA CUT 8.4 - start-up self-diagnostics.
// The old version showed an empty window if app/index.html was absent.
let win = null;
let showingError = false;
const smokeCheck = process.argv.includes('--startup-check');
let checkingEditor=false;
let startupResultPath = process.env.NOVACUT_STARTUP_RESULT || '';
function markStartup(ok, detail){
  if(!smokeCheck) return;
  try {if(startupResultPath)fs.writeFileSync(startupResultPath, JSON.stringify({ok,detail,at:new Date().toISOString()},null,2),'utf8');} catch {}
  setTimeout(()=>app.exit(ok?0:1),120);
}

app.setAppUserModelId('com.novacut.editor');
if (process.argv.includes('--disable-gpu') || process.env.NOVACUT_DISABLE_GPU === '1') {
  app.disableHardwareAcceleration();
}

function log(message) {
  try {
    const file = path.join(app.getPath('userData'), 'novacut-startup.log');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.appendFileSync(file, '[' + new Date().toISOString() + '] ' + String(message) + '\n');
  } catch (error) { console.error('Cannot write log:', error); }
}
const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function showError(title, details) {
  const output = path.join(app.getPath('userData'), 'novacut-startup.log');
  log(title + ': ' + details);
  markStartup(false,title + ': ' + details);
  if (!win || win.isDestroyed() || showingError) return;
  showingError = true;
  const html = `<!doctype html><html lang="pl"><meta charset="utf-8"><title>NOVA CUT - problem z uruchomieniem</title><style>body{background:#09111d;color:#e9f3ff;font:16px system-ui;padding:35px;max-width:850px;margin:auto}h1{color:#56eaca}.box{border:1px solid #46546c;border-radius:14px;padding:20px;background:#1b283b}pre{white-space:pre-wrap;overflow-wrap:anywhere;color:#ffd3b5}kbd{background:#253957;padding:3px 7px}</style><h1>🎬 NOVA CUT - diagnostyka uruchomienia</h1><div class="box"><h2>${escapeHtml(title)}</h2><pre>${escapeHtml(details)}</pre><p>Plik diagnostyczny:</p><pre>${escapeHtml(output)}</pre><p>Sprawdź, czy w projekcie GitHub istnieje <kbd>app/index.html</kbd> oraz czy pliki zostały pobrane i spakowane we właściwej strukturze katalogów.</p><p>Możesz również uruchomić wersję portable z parametrem <kbd>--disable-gpu</kbd> (pomaga przy niektórych sterownikach grafiki).</p><p>Naciśnij <kbd>Ctrl+Shift+I</kbd>, aby zobaczyć narzędzia programisty.</p></div></html>`;
  win.loadURL('data:text/html;charset=UTF-8,' + encodeURIComponent(html)).catch(e => log('Cannot render error page: ' + e.message));
}
function createWindow() {
  showingError = false;
  win = new BrowserWindow({
    width: 1480, height: 910, minWidth: 960, minHeight: 650,
    backgroundColor: '#09080c', title: 'NOVA CUT 10.0 - EDITOR MAX',
    icon: path.join(__dirname,'assets','novacut.ico'),
    autoHideMenuBar: true, show: !smokeCheck,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, contextIsolation: true, sandbox: false,
      webSecurity: true
    }
  });
  log('Electron ' + process.versions.electron + ' | packaged: ' + app.isPackaged + ' | dir: ' + __dirname);
  win.webContents.on('did-fail-load', (_event, code, description, url, isMainFrame) => {
    if (isMainFrame !== false && code !== -3 && !showingError) showError('Nie udało się otworzyć edytora', `${description} (${code})\n${url}`);
  });
  win.webContents.on('preload-error', (_event, preloadPath, error) => log('Preload error in ' + preloadPath + ': ' + (error?.stack || error)));
  win.webContents.on('render-process-gone', (_event, details) => showError('Proces edytora przestał działać', 'Przyczyna: ' + JSON.stringify(details) + '\nSpróbuj uruchomić aplikację z --disable-gpu.'));
  win.webContents.on('console-message', (_event, level, message, lineNumber, sourceId) => {
    if (level >= 2) log(`Renderer console level ${level}: ${message} at ${sourceId}:${lineNumber}`);
  });
  win.webContents.on('did-finish-load', () => {
    if (showingError || !checkingEditor) return;
    win.webContents.executeJavaScript(`(() => ({
      title: document.title,
      length: document.body?.innerText?.trim()?.length || 0,
      canvas: !!document.getElementById('canvas'),
      timeline: !!document.getElementById('timelineInner'),
      loaded: window.__NOVA_BOOTSTRAPPED === true,
      timeline7: window.__NOVA_TIMELINE7_READY === true,
      ultra: window.__NOVA_ULTRA_READY === true,
      ultraTools: !!document.getElementById('ultraToolbar'),
      jsError: window.__NOVA_LAST_ERROR || ''
    }))()`, true).then(data=>{
      log('Editor health-check: '+JSON.stringify(data));
      if (!data.canvas || !data.timeline || data.length < 150 || !data.loaded || !data.ultra || !data.ultraTools){
        showError('Edytor nie uruchomił się prawidłowo',
          'Status: '+JSON.stringify(data,null,2)+'\n\nPlik app/index.html został odczytany, lecz aplikacja nie zakończyła inicjalizacji.');
      } else {
        checkingEditor=false;
        markStartup(true,'Edytor i oś czasu uruchomione: '+data.title);
      }
    }).catch(e=>showError('Błąd diagnostyki interfejsu', String(e.stack||e)));
  });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://') && !url.startsWith('data:text/html')) event.preventDefault();
  });
  const command = cmd => { if(win && !win.isDestroyed()) win.webContents.send('nova:command',cmd); };
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {label:'Plik',submenu:[
      {label:'Dodaj film lub zdjęcie',accelerator:'CmdOrCtrl+O',click:()=>command('media')},
      {label:'Dodaj MP4',accelerator:'CmdOrCtrl+Shift+M',click:()=>command('mp4')},
      {label:'Dodaj audio',accelerator:'CmdOrCtrl+Shift+O',click:()=>command('audio')},
      {label:'Zapisz projekt JSON',accelerator:'CmdOrCtrl+S',click:()=>command('save')},
      {type:'separator'},
      {label:'Eksport MP4 (Windows)',accelerator:'CmdOrCtrl+E',click:()=>command('export')},
      {label:'Sprawdź jakość filmu',accelerator:'CmdOrCtrl+Shift+Q',click:()=>command('quality')},
      {type:'separator'}, {role:'quit',label:'Zakończ'}
    ]},
    {label:'Widok',submenu:[
      {label:'Odśwież edytor',accelerator:'CmdOrCtrl+R',click:()=>win.webContents.reload()},
      {label:'Narzędzia programisty',accelerator:'CmdOrCtrl+Shift+I',click:()=>win.webContents.toggleDevTools()},
      {label:'Narzędzia programisty (F12)',accelerator:'F12',click:()=>win.webContents.toggleDevTools()},
      {role:'togglefullscreen',label:'Pełny ekran'}
    ]},
    {label:'Pomoc',submenu:[
      {label:'Otwórz folder diagnostyki',click:()=>shell.openPath(app.getPath('userData'))},
      {label:'Pokaż ścieżkę edytora',click:()=>dialog.showMessageBox(win,{type:'info',title:'NOVA CUT',message:'Ścieżka do edytora:',detail:path.join(__dirname,'app','index.html')})}
    ]}
  ]));
  const editor = path.join(__dirname,'app','index.html');
  if (!fs.existsSync(editor)) {
    showError('Brakuje pliku edytora app/index.html', 'Instalacja jest niekompletna. W repozytorium GitHub powinien istnieć plik app/index.html. Odbuduj aplikację po dodaniu tego pliku.\nSzukana lokalizacja: ' + editor);
    return;
  }
  log('Loading editor: '+editor+' ('+fs.statSync(editor).size+' bytes)');
  checkingEditor = true;
  win.loadFile(editor).catch(error => { if (!showingError) showError('Błąd wczytywania edytora', String(error.stack || error)); });
}
app.whenReady().then(() => {
  createWindow();
  app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0) createWindow()});
}).catch(e => log('Electron initialization error: '+(e.stack||e)));
app.on('window-all-closed',()=>{if(process.platform!=='darwin') app.quit()});
ipcMain.handle('nova:native-render',async(event,{job,files})=>{
  if(!job || job.app!=='NOVA CUT') return {error:'Nieprawidłowy projekt'};
  const save=await dialog.showSaveDialog(BrowserWindow.fromWebContents(event.sender),{
    title:'Zapisz gotowy film MP4', defaultPath:'NOVA-CUT-'+(job?.render?.quality||'1080p')+'.mp4',
    filters:[{name:'Film MP4',extensions:['mp4']}],properties:['createDirectory','showOverwriteConfirmation']
  });
  if(save.canceled||!save.filePath)return {cancelled:true};
  const send=x=>{if(!event.sender.isDestroyed())event.sender.send('nova:render-progress',x)};
  try {
    const result=await renderProject({job,files,out:save.filePath,onProgress:send});
    lastExportPath=result.path;
    return {ok:true,path:result.path,codec:result.codec,width:result.width,height:result.height,audio:result.audio,subtitles:!!result.subtitles};
  }catch(e){log('Render error: '+String(e.stack||e));return {error:String(e.message||e)};}
});
ipcMain.handle('nova:cancel-render',()=>{cancelRender();return true});

// NOVA CUT 8.0: Whisper offline speech-to-captions.
ipcMain.handle('nova:transcribe', async(_event,request)=>{try{return await transcribeOffline(request)}catch(e){log('Speech error: '+(e.stack||e));return {ok:false,error:String(e.message||e)}}});


// Read-only QUALITY INSPECTOR PRO; choose from Windows dialog or inspect this session's export.
ipcMain.handle('nova:inspect-media', async (event, request) => {
  try {
    const mode=request?.mode === 'last' ? 'last' : 'choose';
    let filePath;
    if(mode==='last'){
      if(!lastExportPath || !fs.existsSync(lastExportPath))return {ok:false,error:'Nie ma jeszcze wyeksportowanego filmu w tej sesji. Wybierz plik MP4 ręcznie.'};
      filePath=lastExportPath;
    }else{
      const current=BrowserWindow.fromWebContents(event.sender);
      const result=await dialog.showOpenDialog(current,{title:'Sprawdź rzeczywistą jakość filmu',properties:['openFile'],filters:[
        {name:'Wideo i audio',extensions:['mp4','mov','mkv','webm','avi','m4v','wmv','mp3','wav','m4a','flac']},
        {name:'Wszystkie pliki',extensions:['*']}
      ]});
      if(result.canceled||!result.filePaths?.length)return {cancelled:true};
      filePath=result.filePaths[0];
    }
    return {ok:true,info:await probeMedia(filePath)};
  } catch (e){log('Quality inspector: '+String(e.stack||e));return {ok:false,error:String(e.message||e)};}
});

// An MP4 input that Chromium cannot decode is converted to a *temporary preview*, not replaced in the project.
ipcMain.handle('nova:prepare-mp4',async(event,request)=>{
  try {
    const filePath=request?.filePath;
    const current=BrowserWindow.fromWebContents(event.sender);
    if(!current||current.isDestroyed())return {ok:false,error:'Nieaktywne okno edytora.'};
    const cacheDir=path.join(app.getPath('temp'),'nova-cut-mp4-proxies');
    return await prepareMp4Preview(filePath,{cacheDir, onProgress:seconds=>{
      if(!event.sender.isDestroyed())event.sender.send('nova:mp4-preview-progress',{fileName:path.basename(filePath),seconds});
    }});
  }catch(e){log('MP4 proxy error: '+String(e.stack||e));return {ok:false,error:String(e.message||e)};}
});
app.on('before-quit',()=>{cancelActivePreview();cleanupPreviewFiles()});

// Offline scene/silence detection for NOVA CUT 9.0.
ipcMain.handle('nova:analyze-media',async(_event,request)=>{try{return {ok:true,result:await analyzeMedia(request)}}catch(e){log('MEGA analysis: '+String(e));return {ok:false,error:String(e.message||e)}}});
