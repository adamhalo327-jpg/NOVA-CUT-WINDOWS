"use strict";
const os=require('os'), fs=require('fs'), path=require('path');
const GiB=1024**3;
const W=9600,H=5400;
function diskFreeBytes(destination){
  try { const stats=fs.statfsSync(path.dirname(path.resolve(destination)),{bigint:true}); return Number(stats.bavail*stats.bsize) }
  catch {return null}
}
function assess10K({freeRamBytes=os.freemem(),totalRamBytes=os.totalmem(),freeDiskBytes=null,duration=0,bitrateMbps=120,fps=30,encoders='',requestedCodec='auto',width=W,height=H}){
  const errors=[],warnings=[];
  const codec=String(requestedCodec||'auto');
  if(['h264','vp8','vp9'].includes(codec))errors.push('Ten kodek nie jest zalecany do MP4 10K. Wybierz Automatyczny (HEVC/AV1) lub H.265.');
  const has265=/\blibx265\b/.test(encoders),hasAV1=/\blibaom-av1\b/.test(encoders);
  let encoder=null;
  if(codec==='h265')encoder=has265?'libx265':null;
  else if(codec==='auto')encoder=has265?'libx265':hasAV1?'libaom-av1':null;
  if(!encoder&&!['h264','vp8','vp9'].includes(codec))errors.push('Ten FFmpeg nie udostępnia kodera HEVC (libx265) ani AV1 (libaom-av1) dla MP4 10K.');
  const mem=Number(freeRamBytes);
  if(Number.isFinite(mem)) {
    const pixels=Number(width)*Number(height);
    const multiplier=Math.max(1,Number.isFinite(pixels)?pixels/(W*H):1);
    const minimum=8*GiB*multiplier,recommended=16*GiB*multiplier;
    if(mem<minimum)errors.push('Za mało wolnej pamięci RAM dla próbnego eksportu '+width+'×'+height+'. Minimum: '+(minimum/GiB).toFixed(1)+' GiB wolnej RAM.');
    else if(mem<recommended)warnings.push('Duży format może potrzebować ponad '+(recommended/GiB).toFixed(1)+' GiB wolnej pamięci RAM.');
  } else warnings.push('Nie udało się sprawdzić wolnej pamięci RAM.');
  if(Number.isFinite(totalRamBytes)&&totalRamBytes<16*GiB)warnings.push('Komputer ma mniej niż 16 GiB łącznej pamięci RAM.');
  const dur=Number(duration),rate=Number(bitrateMbps);
  if(!Number.isFinite(dur)||dur<=0||dur>86400)errors.push('Nieprawidłowy czas projektu.');
  if(!Number.isFinite(rate)||rate<0.5||rate>300)errors.push('Bitrate musi wynosić 0,5–300 Mbps.');
  const predictedBytes=Number.isFinite(dur)&&Number.isFinite(rate)?Math.ceil(dur*(rate+0.2)*1e6/8):0;
  const reserveBytes=Math.max(2*GiB,Math.ceil(predictedBytes*1.5+GiB));
  if(freeDiskBytes===null || !Number.isFinite(Number(freeDiskBytes)))warnings.push('Nie mogę sprawdzić miejsca na dysku. Upewnij się, że dostępne jest minimum '+(reserveBytes/GiB).toFixed(1)+' GiB.');
  else if(Number(freeDiskBytes)<reserveBytes)errors.push('Za mało miejsca na dysku: potrzeba około '+(reserveBytes/GiB).toFixed(1)+' GiB wolnego miejsca.');
  if(Number(fps)>30)warnings.push('60 FPS w 10K szczególnie obciąża procesor i pamięć RAM.');
  if(encoder==='libx265')warnings.push('10K/HEVC wykracza poza możliwości wielu standardowych odtwarzaczy i profili sprzętowych. Odtwarzanie nie jest gwarantowane.');
  if(encoder==='libaom-av1')warnings.push('10K/AV1 będzie kodowane programowo, co może trwać bardzo długo.');
  return {ok:errors.length===0,errors,warnings,encoder,width,height,predictedBytes,reserveBytes};
}
module.exports={assess10K,diskFreeBytes,GiB};
