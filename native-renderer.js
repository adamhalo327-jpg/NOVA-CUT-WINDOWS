'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const {spawn, spawnSync} = require('child_process');
const {assess10K,diskFreeBytes}=require('./render-guard');
const {cinemaDimensions,cinemaLookFilter,cinemaAudioSettings}=require('./cinema-engine');
const {getAudioFilter}=require('./mega-render');
const {makeSrt}=require('./subtitle-engine');
let currentProcess = null;
const SIZES = {standard:1280,high:1920,qhd:2560,uhd:3840,sixk:5760,eightk:7680,tenk:9600};
const BITS = {standard:5,high:10,qhd:18,uhd:35,sixk:58,eightk:100,tenk:120};
const number=(a,f=0)=>Number.isFinite(Number(a))?Number(a):f;
const sec=a=>Math.max(0,number(a)).toFixed(5);
const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
function binary(pkg) {
  const p = require(pkg).path || require(pkg);
  const exe = (typeof p==='string' ? p : p.path).replace('app.asar'+path.sep,'app.asar.unpacked'+path.sep);
  if(!fs.existsSync(exe))throw Error('Brakuje programu '+pkg+' w instalacji.');
  return exe;
}
function run(bin,args){
  const p=spawnSync(bin,args,{encoding:'utf8',maxBuffer:20*1024*1024,windowsHide:true});
  if(p.error||p.status!==0)throw Error('Błąd analizowania materiału: '+(p.stderr||p.error?.message||'ffprobe'));
  return p.stdout;
}
function probe(probeBin,p){
  return JSON.parse(run(probeBin,['-v','error','-show_entries','stream=codec_type,width,height','-show_entries','format=duration','-of','json',p]));
}
function tempo(rate){let r=clamp(number(rate,1),.25,4),parts=[];while(r>2){parts.push(2);r/=2;}while(r<.5){parts.push(.5);r/=.5;}parts.push(r);return parts.map(x=>'atempo='+x.toFixed(6)).join(',');}
function cancelRender(){if(currentProcess && !currentProcess.killed){currentProcess.kill();}}
async function renderProject({job,files,out,onProgress=()=>{}}){
  if(currentProcess)throw Error('Eksport już trwa.');
  if(!job?.clips?.length)throw Error('Dodaj film lub zdjęcie do projektu.');
  const ffmpeg=binary('ffmpeg-static'),ffprobe=binary('ffprobe-static');
  const media=new Map();
  for(const f of files||[]){if(f?.id && typeof f.path==='string' && path.isAbsolute(f.path) && fs.existsSync(f.path)) media.set(f.id,f.path);}
  const allMedia=[...(job.assets||[]),...(job.audioAssets||[])];
  if([...media.values()].some(source=>path.resolve(source).toLowerCase()===path.resolve(out).toLowerCase()))throw Error('Nie nadpisuj pliku źródłowego! Wybierz inną nazwę dla filmu MP4.');
  for(const a of allMedia)if(!media.has(a.id))throw Error('Nie znaleziono pliku '+a.name+'. Dodaj go ponownie do biblioteki.');
  const ratio=job.ratio||'source';
  let w=16,h=9;
  if(ratio==='9:16'){w=9;h=16;}
  else if(ratio==='1:1'){w=1;h=1;}
  else if(ratio==='1.43:1'){w=143;h=100;}
  else if(ratio==='1.90:1'){w=190;h=100;}
  else if(ratio==='source' && job.assets?.length){
    const p=media.get(job.assets[0].id);
    const st=probe(ffprobe,p).streams.find(s=>s.width&&s.height);
    if(st){w=st.width;h=st.height;}
  }
  const quality=Object.hasOwn(SIZES,job.render?.quality)?job.render.quality:'high';
  const scale=SIZES[quality]/Math.max(w,h);
  const cinema=cinemaDimensions(quality,ratio);
  const width=cinema?cinema.width:quality==='tenk'?9600:Math.max(2,Math.round(w*scale/2)*2),height=cinema?cinema.height:quality==='tenk'?5400:Math.max(2,Math.round(h*scale/2)*2);
  const fps=[24,30,60].includes(Number(job.render?.fps))?Number(job.render.fps):30;
  const bitrate=clamp(number(job.render?.bitrateMbps,BITS[quality]),.5,300);
  const clipEnd=c=>number(c.at)+Math.max(.02,(number(c.end)-number(c.start))/clamp(number(c.speed,1),.25,4));
  const duration=Math.max(...job.clips.map(clipEnd),...(job.audioClips||[]).map(a=>number(a.at)+number(a.duration)),...(job.texts||[]).map(a=>number(a.end)),...(job.stickers||[]).map(a=>number(a.end)),...(job.sfx||[]).map(a=>number(a.at)+.4),0);
  if(!Number.isFinite(duration)||duration<=0||duration>86400)throw Error('Nieprawidłowy czas projektu.');
  let tenkPlan=null;
  if(quality==='tenk'){
    const encList=run(ffmpeg,['-hide_banner','-encoders']);
    tenkPlan=assess10K({freeDiskBytes:diskFreeBytes(out),duration,bitrateMbps:bitrate,fps,encoders:encList,requestedCodec:job.render?.codec,width,height});
    if(!tenkPlan.ok)throw Error('Eksport 10K nie może zostać uruchomiony: '+tenkPlan.errors.join(' '));
    onProgress({phase:'checking',progress:0,message:'10K · '+width+'×'+height+'. '+tenkPlan.warnings.join(' ')});
  }
  const filters=[];const inputs=['-f','lavfi','-i',`color=c=black:s=${width}x${height}:r=${fps}:d=${sec(duration)}`];
  filters.push('[0:v]format=yuv420p[vbase]');let last='vbase',idx=1;const audio=[];
  const audioCache=new Map();
  const hasAudio=p=>{if(!audioCache.has(p))audioCache.set(p,probe(ffprobe,p).streams.some(s=>s.codec_type==='audio'));return audioCache.get(p)};
  const getAsset=(a,id)=>a.find(x=>x.id===id);
  const sorted=[...job.clips].sort((a,b)=>number(a.track)-number(b.track)||number(a.at)-number(b.at));
  for(const c of sorted){
    const a=getAsset(job.assets||[],c.assetId),p=media.get(c.assetId);
    if(!a||!p)throw Error('Brak źródła klipu');
    const isImg=a.kind==='image';
    if(isImg)inputs.push('-loop','1','-framerate',String(fps));
    inputs.push('-i',p);
    const at=Math.max(0,number(c.at)),speed=clamp(number(c.speed,1),.25,4),start=Math.max(0,number(c.start));
    const display=Math.min(duration-at,Math.max(.02,(number(c.end)-start)/speed));
    if(display<=0){idx++;continue;}
    const raw=display*speed,tag='v'+idx,next='vstep'+idx;
    const fit10k=(quality==='tenk'||cinema)?`scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`:`scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`;
    filters.push(`[${idx}:v]trim=start=${sec(start)}:duration=${sec(raw)},setpts=(PTS-STARTPTS)/${speed.toFixed(6)}+${at.toFixed(5)}/TB,fps=${fps},${fit10k},setsar=1,format=yuv420p[${tag}]`);
    filters.push(`[${last}][${tag}]overlay=x=0:y=0:eof_action=pass:repeatlast=0:shortest=0:enable='between(t,${at.toFixed(5)},${(at+display).toFixed(5)})'[${next}]`);
    last=next;
    if(!isImg&&number(job.vol,1)>0&&hasAudio(p)){
      const t='a'+idx;
      filters.push(`[${idx}:a]atrim=start=${sec(start)}:duration=${sec(raw)},asetpts=PTS-STARTPTS,${tempo(speed)},volume=${clamp(number(job.vol,1),0,2).toFixed(4)},adelay=${Math.round(at*1000)}:all=1[${t}]`);
      audio.push(t);
    }
    idx++;
  }
  for(const a of job.audioClips||[]){
    const p=media.get(a.assetId);
    if(!p)throw Error('Brak pliku audio');
    inputs.push('-i',p);
    const at=Math.max(0,number(a.at)),start=Math.max(0,number(a.start)),len=Math.min(duration-at,number(a.duration));
    if(len>0){const t='a'+idx,gain=clamp(number(a.volume,.75)*number(job.musicVol,.65),0,2);
      const fi=clamp(number(a.fadeIn,0),0,len/2),fo=clamp(number(a.fadeOut,0),0,len/2);
      const fades=(fi>0?`,afade=t=in:st=0:d=${sec(fi)}`:'')+(fo>0?`,afade=t=out:st=${sec(len-fo)}:d=${sec(fo)}`:'');
      filters.push(`[${idx}:a]atrim=start=${sec(start)}:duration=${sec(len)},asetpts=PTS-STARTPTS,volume=${gain.toFixed(4)}${fades},adelay=${Math.round(at*1000)}:all=1[${t}]`);audio.push(t);}
    idx++;
  }
  for(const a of job.sfx||[]){
    const at=Math.max(0,number(a.at));if(at>=duration)continue;
    const freq={whoosh:920,pop:550,beep:880,impact:120}[a.type]||440;
    const len=Math.min(a.type==='whoosh'?.45:.25,duration-at);
    inputs.push('-f','lavfi','-i',`sine=frequency=${freq}:sample_rate=48000:duration=${sec(len)}`);
    const t='a'+idx;filters.push(`[${idx}:a]volume=0.13,adelay=${Math.round(at*1000)}:all=1[${t}]`);audio.push(t);idx++;
  }
  if(audio.length>1)filters.push(audio.map(t=>'['+t+']').join('')+`amix=inputs=${audio.length}:duration=longest:dropout_transition=0:normalize=0,atrim=duration=${sec(duration)},apad,aresample=48000,aformat=channel_layouts=stereo[outa]`);
  else if(audio.length===1)filters.push(`[${audio[0]}]atrim=duration=${sec(duration)},apad,aresample=48000,aformat=channel_layouts=stereo[outa]`);
  else filters.push(`anullsrc=channel_layout=stereo:sample_rate=48000,atrim=duration=${sec(duration)}[outa]`);
  // Optional 9.0 audio denoise. Disabled for legacy projects and all default exports.
  const megaAudio=getAudioFilter(job.mega9?.denoise||'off');
  if(megaAudio){
    // The existing [outa] output is renamed to [prea], then processed back to [outa].
    const lastAudioIndex=filters.findIndex(x=>x.includes('[outa]'));
    if(lastAudioIndex<0)throw Error('Nie znaleziono miksu audio.');
    filters[lastAudioIndex]=filters[lastAudioIndex].replace('[outa]','[prea]');
    filters.push(`[prea]${megaAudio}[outa]`);
  }
  const f=job.filters||{};
  const cinemaLook=cinemaLookFilter(job.cinema?.look||'natural');
  const audioOutput=cinemaAudioSettings(job.cinema?.sound||'standard');
  filters.push(`[${last}]eq=brightness=${((number(f.brightness,100)-100)/175).toFixed(4)}:contrast=${clamp(number(f.contrast,100)/100,.25,1.75).toFixed(4)}:saturation=${(clamp(number(f.saturation,100)/100,0,2)*(1-clamp(number(f.grayscale,0),0,100)/100)).toFixed(4)}${cinemaLook?','+cinemaLook:''},format=yuv420p[outv]`);
  const enc=run(ffmpeg,['-hide_banner','-encoders']);
  const codecWanted=job.render?.codec;
  const codec=quality==='tenk'?tenkPlan.encoder:(codecWanted==='h265'&&enc.includes('libx265')?'libx265':enc.includes('libx264')?'libx264':enc.includes('mpeg4')?'mpeg4':null);
  if(!codec)throw Error('Zainstalowany FFmpeg nie obsługuje kodowania MP4.');
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'novacut-render-'));
  const script=path.join(tmp,'filters.txt');fs.writeFileSync(script,filters.join(';'),'utf8');
  const captions=makeSrt((job.texts||[]).filter(t=>t.autoGenerated||t.style==='outline'));
  const captionInputIndex=idx;
  if(captions){const srtPath=path.join(tmp,'captions.srt');fs.writeFileSync(srtPath,'\uFEFF'+captions,'utf8');inputs.push('-i',srtPath);}
  const args=['-hide_banner','-y','-nostdin','-loglevel','error','-progress','pipe:1',...inputs,'-filter_complex_script',script,
    '-map','[outv]','-map','[outa]',...(captions?['-map',String(captionInputIndex)+':0','-c:s','mov_text','-metadata:s:s:0','language=pol','-disposition:s:0','default']:[]),'-t',sec(duration),'-r',String(fps),'-pix_fmt','yuv420p',
    '-c:a','aac','-b:a',audioOutput.bitrate,'-ar',String(audioOutput.sampleRate),'-ac',String(audioOutput.channels),'-movflags','+faststart',
    '-c:v',codec,'-b:v',String(Math.round(bitrate*1000000)),'-maxrate',String(Math.round(bitrate*1400000)),
    '-bufsize',String(Math.round(bitrate*2800000))];
  if(codec==='libx264')args.push('-preset','veryfast','-profile:v','high');
  if(quality==='tenk')args.push('-threads','2','-filter_complex_threads','1');
  if(codec==='libaom-av1')args.push('-cpu-used','8','-row-mt','1','-threads','2');
  if(codec==='libx265')args.push('-preset','ultrafast','-tag:v','hvc1');
  args.push(out);
  onProgress({phase:'rendering',progress:0,message:`Render ${width}×${height} · ${fps} FPS · ${codec}`});
  let stderr='',cancelled=false;
  try{
    await new Promise((resolve,reject)=>{
      const child=spawn(ffmpeg,args,{windowsHide:true,stdio:['ignore','pipe','pipe']});currentProcess=child;
      child.stdout.setEncoding('utf8');let buf='';
      child.stdout.on('data',chunk=>{buf+=chunk;const lines=buf.split(/\r?\n/);buf=lines.pop();for(const line of lines){
        if(line.startsWith('out_time=')){
          const parts=line.slice(9).split(':');if(parts.length===3){const val=(Number(parts[0])*3600+Number(parts[1])*60+Number(parts[2]))/duration;onProgress({phase:'rendering',progress:clamp(val,0,.99)})}
        }
      }});
      child.stderr.on('data',chunk=>{stderr=(stderr+chunk.toString()).slice(-5000)});
      child.on('error',reject);
      child.on('close',(code,signal)=>{cancelled=signal!=null;currentProcess=null;if(code===0)resolve();else reject(Error(cancelled?'Eksport anulowany.':(quality==='tenk'?'Render 10K nie powiódł się. Możliwy brak pamięci lub nieobsługiwany profil kodeka. Wybierz 8K/4K albo spróbuj na wydajniejszym komputerze. ':'Błąd FFmpeg: ')+stderr.slice(-1800)))})
    });
    const streams=probe(ffprobe,out).streams;
    if((quality==='tenk'||cinema)&&!streams.some(st=>st.codec_type==='video'&&st.width===width&&st.height===height))throw Error('Film wynikowy nie ma dokładnego formatu '+width+'×'+height+' — eksport nie został zatwierdzony.');
    if(!streams.some(s=>s.codec_type==='video')||!streams.some(s=>s.codec_type==='audio'))throw Error('Brak obrazu lub ścieżki audio w pliku wynikowym.');
    if(captions && !streams.some(st=>st.codec_type==='subtitle'))throw Error('Nie udało się zapisać ścieżki napisów w MP4.');
    if(captions){const sidecar=out.replace(/\.mp4$/i,'')+'.srt';try{fs.writeFileSync(sidecar,'\uFEFF'+captions,'utf8')}catch(e){onProgress({phase:'warning',message:'MP4 ma napisy, lecz dodatkowy plik SRT nie został zapisany: '+e.message})}}
    onProgress({phase:'done',progress:1,message:captions?'Gotowe · MP4 z dźwiękiem AAC i przełączalnymi napisami + SRT':'Gotowe · MP4 z dźwiękiem AAC'});
    return {path:out,codec,width,height,audio:true,subtitles:!!captions};
  }catch(e){if(fs.existsSync(out))try{fs.unlinkSync(out)}catch{};throw e;}
  finally{currentProcess=null;try{fs.rmSync(tmp,{recursive:true,force:true})}catch{}}
}
module.exports={renderProject,cancelRender};
