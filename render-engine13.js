"use strict";const os=require('os');const {spawnSync}=require('child_process');
function gpuCandidates(codec){const h265=codec==='h265';return h265?['hevc_nvenc','hevc_qsv','hevc_amf']:['h264_nvenc','h264_qsv','h264_amf'];}
function detectGPU(ffmpeg,codec,mode='auto'){if(mode==='off')return null;const r=spawnSync(ffmpeg,['-hide_banner','-encoders'],{encoding:'utf8',timeout:12000,windowsHide:true});if(r.status!==0)throw Error('Nie udało się odczytać kodeków FFmpeg.');
 const candidates=gpuCandidates(codec).filter(c=>r.stdout.includes(c));for(const encoder of candidates){const test=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-f','lavfi','-i','color=s=320x180:r=24:d=.1','-frames:v','1','-c:v',encoder,'-f','null','-'],{encoding:'utf8',timeout:15000,windowsHide:true});if(test.status===0)return encoder;}
 if(mode==='force')throw Error('Nie znaleziono dostępnego kodera GPU z działającym sterownikiem. Wybierz Auto lub CPU.');return null;}
function memoryPlan({quality,available=os.freemem()}={}){const min={uhd:700e6,sixk:1.5e9,eightk:3e9,tenk:8*1024**3}[quality]||300e6;const warnings=[];
 if(available<min)warnings.push('Dostępna pamięć RAM ('+(available/1e9).toFixed(1)+' GB) może być zbyt mała dla '+quality+'.');
 return {ok:quality!=='tenk'||available>=8*1024**3,minimum:min,available,warnings};}
module.exports={gpuCandidates,detectGPU,memoryPlan};
