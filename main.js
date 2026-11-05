'use strict';
const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const { renderProject, cancelRender } = require('./native-renderer');
let win = null;
app.setAppUserModelId('com.novacut.editor');
function createWindow() {
  win = new BrowserWindow({
    width: 1480, height: 910, minWidth: 960, minHeight: 650,
    backgroundColor: '#080b12', title: 'NOVA CUT 5.2 — Windows',
    icon: path.join(__dirname,'assets','novacut.ico'),
    autoHideMenuBar: true,
    webPreferences: {preload:path.join(__dirname,'preload.js'),nodeIntegration:false,contextIsolation:true,sandbox:false,webSecurity:true}
  });
  win.loadFile(path.join(__dirname,'app','index.html'));
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  win.webContents.on('will-navigate',(event,url)=>{
    if (!url.startsWith('file://')) event.preventDefault();
  });
  const command = (cmd) => win?.webContents.send('nova:command',cmd);
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {label:'Plik',submenu:[
      {label:'Dodaj film lub zdjęcie',accelerator:'CmdOrCtrl+O',click:()=>command('media')},
      {label:'Dodaj audio',accelerator:'CmdOrCtrl+Shift+O',click:()=>command('audio')},
      {label:'Zapisz projekt JSON',accelerator:'CmdOrCtrl+S',click:()=>command('save')},
      {type:'separator'},
      {label:'Eksport MP4 (Windows)',accelerator:'CmdOrCtrl+E',click:()=>command('export')},
      {type:'separator'},
      {role:'quit',label:'Zakończ'}
    ]},
    {label:'Widok',submenu:[{role:'reload',label:'Odśwież'},{role:'togglefullscreen',label:'Pełny ekran'},{role:'toggleDevTools',label:'Narzędzia programisty'}]}
  ]));
}
app.whenReady().then(()=>{
  createWindow();
  app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0) createWindow()});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin') app.quit()});
ipcMain.handle('nova:native-render',async(event,{job,files})=>{
  if (!job || job.app !== 'NOVA CUT') return {error:'Nieprawidłowy projekt'};
  const save = await dialog.showSaveDialog(BrowserWindow.fromWebContents(event.sender),{
    title:'Zapisz gotowy film MP4', defaultPath:'NOVA-CUT-'+(job?.render?.quality||'1080p')+'.mp4',
    filters:[{name:'Film MP4',extensions:['mp4']}],properties:['createDirectory','showOverwriteConfirmation']
  });
  if(save.canceled||!save.filePath)return {cancelled:true};
  const send = x=>{if(!event.sender.isDestroyed())event.sender.send('nova:render-progress',x)};
  try {
    const result = await renderProject({job,files,out:save.filePath,onProgress:send});
    return {ok:true,path:result.path,codec:result.codec,width:result.width,height:result.height,audio:result.audio};
  }catch(e){return {error:String(e.message||e)};}
});
ipcMain.handle('nova:cancel-render',()=>{cancelRender();return true});
