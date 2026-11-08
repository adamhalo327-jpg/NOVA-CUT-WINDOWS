"use strict";
const fs=require('fs'),path=require('path'),os=require('os'),{spawn}=require('child_process');
function bins(mode='base'){const dir=process.resourcesPath?path.join(process.resourcesPath,'whisper'):path.join(__dirname,'whisper');const dev=path.join(__dirname,'whisper');
 const home=fs.existsSync(path.join(dir,'whisper-cli.exe'))?dir:dev;
 const exe=path.join(home,'whisper-cli.exe'),model=path.join(home,mode==='tiny'?'ggml-tiny.bin':'ggml-base.bin');
 if(!fs.existsSync(exe)||!fs.existsSync(model))throw Error('Brakuje silnika Whisper lub modelu offline. Zainstaluj pełną wersję NOVA CUT 10.0 Windows.');
 return {exe,model};}
function ffmpegExe(){let f=require('ffmpeg-static');if(typeof f!=='string')f=f?.path;if(!f)throw Error('Nie znaleziono FFmpeg');return f.replace('app.asar'+path.sep,'app.asar.unpacked'+path.sep)}
function run(exe,args,cwd){return new Promise((resolve,reject)=>{let errors='';const p=spawn(exe,args,{cwd,windowsHide:true,stdio:['ignore','ignore','pipe']});
 p.stderr.on('data',v=>errors=(errors+v.toString()).slice(-2500));p.on('error',reject);p.on('close',code=>code===0?resolve():reject(Error('Kod '+code+': '+errors.slice(-1200))))})}
function seconds(v){if(typeof v==='number')return v;if(!v)return 0;const s=String(v);if(/^\d+(\.\d+)?$/.test(s))return Number(s);const p=s.replace(',','.').split(':').map(Number);if(p.some(x=>!Number.isFinite(x)))return 0;return p.reduce((acc,x)=>acc*60+x,0)}
async function transcribeOffline({filePath,lang='auto',modelSize='base',startSeconds=0,durationSeconds=0}={}){
 if(!filePath||!path.isAbsolute(filePath)||!fs.existsSync(filePath))throw Error('Brak pliku audio/wideo na dysku.');
 if(!Number.isFinite(+startSeconds)||+startSeconds<0||!Number.isFinite(+durationSeconds)||+durationSeconds<0||+durationSeconds>10800)throw Error('Nieprawidłowy zakres filmu do rozpoznawania (maksymalnie 3 godziny).');
 const {exe,model}=bins(modelSize==='tiny'?'tiny':'base');const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'nova8-whisper-'));
 try{const wav=path.join(tmp,'speech.wav'),prefix=path.join(tmp,'captions');
  await run(ffmpegExe(),['-hide_banner','-loglevel','error','-y','-ss',String(+startSeconds),'-i',filePath,...(+durationSeconds>0?['-t',String(+durationSeconds)]:[]),'-vn','-ac','1','-ar','16000','-c:a','pcm_s16le',wav],tmp);
  const args=['-m',model,'-f',wav,'-oj','-of',prefix,'-t','4'];
  args.push('-l',['pl','en','de','es'].includes(lang)?lang:'auto');
  await run(exe,args,tmp);
  const filename=prefix+'.json';if(!fs.existsSync(filename))throw Error('Whisper nie utworzył pliku napisów JSON.');
  const raw=JSON.parse(fs.readFileSync(filename,'utf8'));
  const segs=Array.isArray(raw.transcription)?raw.transcription:Array.isArray(raw.segments)?raw.segments:[];
  const segments=segs.map(o=>({text:String(o.text||'').trim(),start:Number.isFinite(o.offsets?.from)?o.offsets.from/1000:seconds(o.timestamps?.from??o.start),end:Number.isFinite(o.offsets?.to)?o.offsets.to/1000:seconds(o.timestamps?.to??o.end)})).filter(s=>s.text&&Number.isFinite(s.start)&&Number.isFinite(s.end)&&s.end>s.start);
  if(!segments.length)throw Error('Nie wykryto mowy lub model nie zwrócił segmentów.');
  return {ok:true,segments,language:raw.result?.language||lang};
 }finally{fs.rmSync(tmp,{recursive:true,force:true})}
}
module.exports={transcribeOffline,seconds};
