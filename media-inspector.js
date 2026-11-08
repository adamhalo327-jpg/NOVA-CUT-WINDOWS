'use strict';
/* NOVA CUT 8.3 — read technical metadata only; never transcode or alter source files. */
const fs = require('fs');
const path = require('path');
const {spawn} = require('child_process');
const ffprobeStatic = require('ffprobe-static');
const FFP = ffprobeStatic.path;
const MAX_OUTPUT = 2 * 1024 * 1024;
const PROBE_TIMEOUT = 20000;

function numeric(x){const n=Number(x);return Number.isFinite(n) && n>0?n:0;}
function rate(r){
 if(typeof r==='number')return numeric(r);
 const p=String(r||'').split('/');
 const top=numeric(p[0]),den=p.length>1?numeric(p[1]):1;
 return den>0?top/den:0;
}
function qualityClass(width,height){
 const long=Math.max(numeric(width),numeric(height)),short=Math.min(numeric(width),numeric(height));
 if(long>=9600)return '10K lub więcej';
 if(long>=7680)return '8K';
 if(long>=5760)return '6K';
 if(long>=3840)return '4K';
 if(long>=2560)return '2K / QHD';
 if(long>=1920)return 'Full HD / 1080p';
 if(long>=1280)return 'HD / 720p';
 if(long>=720)return 'SD / niższa HD';
 return (long&&short)?'Niska rozdzielczość':'Nieznana';
}
function interpretProbe(probe, stat, filePath){
 if(!probe || !Array.isArray(probe.streams))throw Error('Nie otrzymano prawidłowych metadanych z FFprobe.');
 const video=probe.streams.find(x=>x.codec_type==='video' && numeric(x.width) && numeric(x.height));
 const audio=probe.streams.find(x=>x.codec_type==='audio');
 if(!video && !audio)throw Error('Plik nie zawiera obsługiwanej ścieżki wideo ani audio.');
 const format=probe.format||{};
 const fps=video?(rate(video.avg_frame_rate)||rate(video.r_frame_rate)):0;
 const duration=numeric(format.duration)||numeric(video?.duration)||numeric(audio?.duration);
 const bitrate=numeric(format.bit_rate);
 const hasVideo=!!video;
 const width=hasVideo?Math.round(numeric(video.width)):0;
 const height=hasVideo?Math.round(numeric(video.height)):0;
 const bytes=stat && Number.isFinite(stat.size)?stat.size:numeric(format.size);
 const result={
   name:path.basename(String(filePath||'film')),
   width,height,
   resolution:hasVideo?`${width} × ${height}`:'Brak obrazu',
   quality:hasVideo?qualityClass(width,height):'Tylko dźwięk',
   fps:fps?Math.round(fps*100)/100:null,
   videoCodec:hasVideo?(String(video.codec_name||'Nieznany').toUpperCase()):null,
   profile:hasVideo?String(video.profile||''):null,
   pixelFormat:hasVideo?String(video.pix_fmt||''):null,
   bitrateMbps:bitrate?Math.round(bitrate/10000)/100:null,
   durationSeconds:duration?Math.round(duration*100)/100:null,
   fileSizeBytes:bytes,
   format:String(format.format_long_name||format.format_name||'Nieznany'),
   audioCodec:audio?String(audio.codec_name||'Nieznany').toUpperCase():null,
   audioChannels:audio?numeric(audio.channels)||null:null,
   audioSampleRate:audio?numeric(audio.sample_rate)||null:null,
   hdr:!!(video && ['smpte2084','arib-std-b67'].includes(String(video.color_transfer||'').toLowerCase())),
   colorTransfer:video?String(video.color_transfer||''):null,
   videoBitrateMbps:video&&numeric(video.bit_rate)?Math.round(numeric(video.bit_rate)/10000)/100:null,
   rotation:video?.side_data_list?.find(x=>Number.isFinite(Number(x.rotation)))?.rotation||0,
   streams:{video:!!video,audio:!!audio},
   source:'FFprobe (odczyt metadanych, bez zmian w pliku)'
 };
 return result;
}
function probeMedia(filePath, {timeout=PROBE_TIMEOUT, ffprobePath=FFP}={}){
 return new Promise((resolve,reject)=>{
   if(typeof filePath!=='string' || !path.isAbsolute(filePath))return reject(Error('Nieprawidłowa ścieżka pliku.'));
   let stat;
   try{stat=fs.statSync(filePath);if(!stat.isFile())throw Error('To nie jest plik.');}
   catch(e){return reject(Error('Nie udało się otworzyć pliku: '+e.message));}
   if(!ffprobePath || !fs.existsSync(ffprobePath))return reject(Error('Brakuje FFprobe w instalacji. Zainstaluj ponownie pełną wersję NOVA CUT.'));
   const args=['-v','error','-show_format','-show_streams','-of','json','-i',filePath];
   const proc=spawn(ffprobePath,args,{windowsHide:true,stdio:['ignore','pipe','pipe']});
   let out='',err='',ended=false;
   const fail=e=>{if(ended)return;ended=true;clearTimeout(timer);reject(e)};
   const timer=setTimeout(()=>{proc.kill();fail(Error('Analiza przekroczyła limit 20 sekund. Sprawdź, czy plik jest prawidłowy.'));},timeout);
   proc.stdout.setEncoding('utf8');
   proc.stdout.on('data',data=>{
     out+=data;
     if(out.length>MAX_OUTPUT){proc.kill();fail(Error('Plik zwrócił zbyt duże metadane.'))}
   });
   proc.stderr.on('data',data=>{err=(err+String(data)).slice(-2000)});
   proc.on('error',e=>fail(Error('FFprobe nie mógł zbadać pliku: '+e.message)));
   proc.on('close',code=>{
     if(ended)return;
     if(code!==0)return fail(Error('Nie udało się odczytać metadanych filmu: '+(err.trim()||`kod ${code}`)));
     try{const result=interpretProbe(JSON.parse(out),stat,filePath);ended=true;clearTimeout(timer);resolve(result);}
     catch(e){fail(Error('Nieprawidłowe metadane: '+e.message))}
   });
 });
}
module.exports={probeMedia,interpretProbe,qualityClass,rate};
