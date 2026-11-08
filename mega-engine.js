/* NOVA CUT 9.0 - offline tools; no uploads or shell invocation. */
'use strict';
const fs=require('fs');
const path=require('path');
const {spawn}=require('child_process');
const {getAudioFilter}=require('./mega-render');
const binary=()=>{const p=require('ffmpeg-static');const file=(p.path||p).replace('app.asar'+path.sep,'app.asar.unpacked'+path.sep);if(!fs.existsSync(file))throw Error('Nie znaleziono FFmpeg.');return file;};
function analyzeMedia({filePath,mode='scenes',threshold}={}){
 return new Promise((resolve,reject)=>{
  if(typeof filePath!=='string'||!path.isAbsolute(filePath)||!fs.existsSync(filePath)||!fs.statSync(filePath).isFile())return reject(Error('Wybierz istniejący plik z dysku.'));
  if(!['scenes','silence'].includes(mode))return reject(Error('Nieznana analiza.'));
  const bin=process.env.NOVACUT_TEST_FFMPEG || binary();const scene=Math.max(.1,Math.min(.8,Number(threshold)||.35));
  const args=mode==='scenes'?['-hide_banner','-nostdin','-ss','0','-i',filePath,'-an','-vf',`select=gt(scene\\,${scene}),showinfo`,'-frames:v','100','-f','null','-']:
   ['-hide_banner','-nostdin','-i',filePath,'-vn','-af','silencedetect=noise=-34dB:d=0.45','-f','null','-'];
  const child=spawn(bin,args,{windowsHide:true,stdio:['ignore','ignore','pipe']});let stderr='',finished=false;
  const timeout=setTimeout(()=>{child.kill();},90000);
  const fail=err=>{if(finished)return;finished=true;clearTimeout(timeout);reject(err)};
  child.stderr.on('data',data=>{stderr+=(data.toString());if(stderr.length>5e6){child.kill();fail(Error('Analiza przekroczyła limit logu.'));}});
  child.on('error',fail);child.on('close',code=>{
   if(finished)return;finished=true;clearTimeout(timeout);
   if(code!==0)return reject(Error('Nie udało się przeanalizować pliku. FFmpeg: '+stderr.slice(-750)));
   if(mode==='scenes'){
    const found=[...stderr.matchAll(/pts_time:([0-9.]+)/g)].map(m=>Number(m[1])).filter(Number.isFinite);
    resolve({mode,times:[...new Set(found.map(t=>Math.round(t*1000)/1000))].slice(0,100),checkedFile:path.basename(filePath)});
   }else{
    const starts=[...stderr.matchAll(/silence_start:\s*(-?[0-9.]+)/g)].map(m=>Number(m[1]));
    const ends=[...stderr.matchAll(/silence_end:\s*([0-9.]+)/g)].map(m=>Number(m[1]));
    resolve({mode,intervals:starts.map((start,i)=>({start:Math.max(0,start),end:ends[i]??null})).filter(x=>x.end===null||x.end>x.start).slice(0,100),checkedFile:path.basename(filePath)});
   }
  });
 });
}
module.exports={analyzeMedia};
