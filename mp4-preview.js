'use strict';
// NOVA CUT 8.3: MP4 preview fallback for codecs unsupported by Electron Chromium.
// Never modify the source. FFmpeg renders a temporary low-resolution editing proxy;
// the original absolute path is kept for native Windows export.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const {pathToFileURL}=require('node:url');
const ffmpegStatic=require('ffmpeg-static');
const {probeMedia}=require('./media-inspector');
const active=new Set();
const created=new Set();
const MAX_CONCURRENT=2;
const VIDEO_EXTENSIONS=new Set(['.mp4','.m4v','.mov','.mkv','.webm','.avi','.wmv','.mts','.m2ts','.ts']);
const previewCache=new Map();

function validVideoPath(filePath){
  if(typeof filePath!=='string'||!path.isAbsolute(filePath)||!VIDEO_EXTENSIONS.has(path.extname(filePath).toLowerCase()))throw Error('Wybierz prawidłowy plik wideo MP4, MOV, MKV, WebM lub AVI z dysku.');
  const stat=fs.statSync(filePath);
  if(!stat.isFile()||stat.size<128)throw Error('Plik MP4 jest pusty lub uszkodzony.');
  return stat;
}
const validMp4Path=validVideoPath; // backwards-compatible API
function needsPreviewProxy(details,filePath){
  const ext=path.extname(filePath||'').toLowerCase();
  const codec=String(details?.videoCodec||'').toLowerCase();
  const pix=String(details?.pixelFormat||'').toLowerCase();
  if(!details?.streams?.video)return false;
  if(ext==='.webm')return !['vp8','vp9','av1'].includes(codec);
  if(ext!=='.mp4'&&ext!=='.m4v')return true; // Chromium does not reliably decode MOV/MKV/AVI
  if(codec!=='h264')return true; // HEVC, MPEG-4 Part 2, unusual codecs
  if(pix && !['yuv420p','yuvj420p'].includes(pix))return true; // 10-bit/4:2:2/4:4:4
  return false;
}
async function inspectVideoForPreview(filePath,{ffprobePath}={}){
  validVideoPath(filePath);
  const details=await probeMedia(filePath,{ffprobePath});
  if(!details.streams.video)throw Error('Plik nie zawiera poprawnego strumienia wideo.');
  if(!details.durationSeconds||details.durationSeconds<=0)throw Error('Nie można ustalić długości filmu.');
  return {ok:true,needsProxy:needsPreviewProxy(details,filePath),durationSeconds:details.durationSeconds,codec:details.videoCodec,pixelFormat:details.pixelFormat,resolution:details.resolution,audioCodec:details.audioCodec};
}
function transcode(input,output,{ffmpegPath=ffmpegStatic, timeoutMs=30*60*1000, onProgress=()=>{}}={}){
 return new Promise((resolve,reject)=>{
  if(!ffmpegPath||!fs.existsSync(ffmpegPath))return reject(Error('Brakuje lokalnego FFmpeg. Zainstaluj pełną aplikację NOVA CUT.'));
  const args=['-hide_banner','-nostdin','-y','-v','error','-stats_period','1','-progress','pipe:1','-i',input,
    '-map','0:v:0','-map','0:a:0?','-vf','scale=w=min(1280\\,iw):h=min(720\\,ih):force_original_aspect_ratio=decrease:force_divisible_by=2,fps=24',
    '-c:v','libx264','-preset','veryfast','-crf','29','-pix_fmt','yuv420p','-threads','2',
    '-c:a','aac','-b:a','112k','-ac','2','-movflags','+faststart',output];
  const proc=spawn(ffmpegPath,args,{windowsHide:true,stdio:['ignore','pipe','pipe']});
  active.add(proc);
  let stderr='',finished=false;
  const fail=e=>{if(finished)return;finished=true;clearTimeout(timer);active.delete(proc);try{fs.unlinkSync(output)}catch{}reject(e)};
  const timer=setTimeout(()=>{proc.kill();fail(Error('Podgląd MP4 przekroczył limit przetwarzania. Spróbuj krótszego filmu.'));},timeoutMs);
  proc.stdout.setEncoding('utf8');proc.stdout.on('data',data=>{
    const match=String(data).match(/out_time=(\d+):(\d+):(\d+(?:\.\d+)?)/);
    if(match)try{onProgress(Number(match[1])*3600+Number(match[2])*60+Number(match[3]))}catch{}
  });
  proc.stderr.setEncoding('utf8');proc.stderr.on('data',data=>{stderr=(stderr+data).slice(-4000)});
  proc.on('error',e=>fail(Error('Nie udało się uruchomić FFmpeg: '+e.message)));
  proc.on('close',code=>{
    if(finished)return;
    if(code!==0)return fail(Error('Nie można przygotować podglądu MP4: '+(stderr.trim()||'kod '+code)));
    try{if(fs.statSync(output).size<1024)throw Error('Podgląd nie zawiera obrazu.');}
    catch(e){return fail(e)}
    finished=true;clearTimeout(timer);active.delete(proc);resolve(output);
  });
 });
}
async function prepareVideoPreview(filePath,{cacheDir,ffmpegPath=ffmpegStatic,ffprobePath,onProgress}={}){
 const stat=validVideoPath(filePath);
 if(!cacheDir||!path.isAbsolute(cacheDir))throw Error('Brak bezpiecznego katalogu pamięci podręcznej.');
 const details=await probeMedia(filePath,{ffprobePath});
 if(!details.streams.video)throw Error('Wybrany film nie zawiera ścieżki wideo.');
 if(!details.durationSeconds||details.durationSeconds<=0)throw Error('Nie można ustalić czasu trwania filmu.');
 await fs.promises.mkdir(cacheDir,{recursive:true});
 const key=crypto.createHash('sha256').update(JSON.stringify([path.resolve(filePath),stat.size,stat.mtimeMs])).digest('hex').slice(0,28);
 const previous=previewCache.get(key);
 if(previous&&fs.existsSync(previous)&&fs.statSync(previous).size>1024){
   return {ok:true,previewUrl:pathToFileURL(previous).href,durationSeconds:details.durationSeconds,originalCodec:details.videoCodec,originalResolution:details.resolution,proxy:true,cached:true};
 }
 if(active.size>=MAX_CONCURRENT)throw Error('Dwa podglądy są już przygotowywane. Zaczekaj na zakończenie konwersji.');
 const proxyPath=path.join(cacheDir,'preview-'+key+'.mp4');
 await transcode(filePath,proxyPath,{ffmpegPath,onProgress});
 created.add(proxyPath);previewCache.set(key,proxyPath);
 return {ok:true,previewUrl:pathToFileURL(proxyPath).href,durationSeconds:details.durationSeconds,
   originalCodec:details.videoCodec,originalResolution:details.resolution,proxy:true};
}
const prepareMp4Preview=prepareVideoPreview;

function cancelActivePreview(){for(const proc of active)try{proc.kill()}catch{}}
function cleanupPreviewFiles(){for(const file of created)try{fs.unlinkSync(file)}catch{}created.clear();previewCache.clear()}
module.exports={prepareMp4Preview,prepareVideoPreview,inspectVideoForPreview,needsPreviewProxy,validMp4Path,validVideoPath,cancelActivePreview,cleanupPreviewFiles,transcode};
