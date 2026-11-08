"use strict";
const fs=require('fs'),os=require('os'),path=require('path'),{spawnSync}=require('child_process');
function binary(pkg,fallback){try{const p=require(pkg);return typeof p==='string'?p:p.path}catch{return fallback}}
const ffmpeg=binary('ffmpeg-static','ffmpeg'),ffprobe=binary('ffprobe-static','ffprobe');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'nova-subtitle-test-'));
function run(cmd,args){const r=spawnSync(cmd,args,{encoding:'utf8',windowsHide:true,maxBuffer:1024*1024});if(r.error||r.status!==0)throw Error((r.stderr||r.error?.message||'FFmpeg failure').slice(-1000));return r.stdout}
try{
 const {makeSrt}=require('../subtitle-engine');
 const srt=path.join(dir,'test.srt'),mp4=path.join(dir,'test.mp4');
 fs.writeFileSync(srt,'\ufeff'+makeSrt([{start:.1,end:.9,text:'Test polskich napisów'}]));
 run(ffmpeg,['-y','-hide_banner','-loglevel','error','-f','lavfi','-i','color=c=black:s=320x180:r=24:d=1.2','-f','lavfi','-i','sine=frequency=440:duration=1.2','-i',srt,'-map','0:v','-map','1:a','-map','2:0','-c:v','mpeg4','-c:a','aac','-c:s','mov_text','-t','1.2',mp4]);
 const result=JSON.parse(run(ffprobe,['-v','error','-show_entries','stream=codec_type,codec_name','-of','json',mp4]));
 for(const type of ['video','audio','subtitle'])if(!result.streams.some(s=>s.codec_type===type))throw Error('Missing '+type+' track');
 if(!result.streams.some(s=>s.codec_name==='mov_text'))throw Error('mov_text unsupported');
 console.log('OK: FFmpeg MP4, AAC, mov_text, subtitle stream');
}finally{fs.rmSync(dir,{recursive:true,force:true})}
