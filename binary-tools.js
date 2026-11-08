"use strict";
// NOVA CUT 13.2 - guaranteed real executable paths outside Electron ASAR.
// child_process.spawn cannot execute .exe files inside app.asar, even if fs.existsSync reports true.
const fs = require('node:fs');
const path = require('node:path');

const TOOL_NAMES = Object.freeze({ffprobe:'ffprobe-static',ffmpeg:'ffmpeg-static'});
function unpackPath(value){
  if(typeof value!=='string')return '';
  return value.replace(/([\\/])app\.asar(?=[\\/])/gi,'$1app.asar.unpacked');
}
function validExecutable(value){
  if(typeof value!=='string'||!value)return false;
  try {return fs.statSync(value).isFile();}catch{return false;}
}
function resolveTool(kind,{resourcesPath=process.resourcesPath,staticPath}={}){
  if(!Object.hasOwn(TOOL_NAMES,kind))throw Error('Nieobsługiwany silnik wideo.');
  const candidates=[];
  // electron-builder extraResources: copied to resources/tools during Windows build.
  if(resourcesPath)candidates.push(path.join(resourcesPath,'tools',kind+'.exe'));
  let loaded=staticPath;
  if(loaded===undefined){try {loaded=require(TOOL_NAMES[kind]);}catch{loaded=null;}}
  const raw=typeof loaded==='string'?loaded:loaded?.path;
  if(typeof raw==='string'&&raw){
    const real=unpackPath(raw);
    if(real!==raw)candidates.push(real); // prefer app.asar.unpacked, never attempt spawn in app.asar
    else if(!/[\\/]app\.asar[\\/]/i.test(raw))candidates.push(raw);
  }
  for(const file of candidates)if(validExecutable(file))return file;
  const explanation=kind==='ffprobe'?'FFprobe (odczyt parametrów filmu)':'FFmpeg (podgląd i eksport)';
  throw Error('Nie znaleziono '+explanation+' w instalacji NOVA CUT. Oczekiwano: '+
    (candidates.length?candidates.join(' albo '):'pliku silnika w katalogu resources/tools')+
    '. Zainstaluj najnowszą pełną wersję aplikacji.');
}
module.exports={resolveTool,unpackPath,validExecutable};
