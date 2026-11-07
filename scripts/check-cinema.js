"use strict";
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {cinemaDimensions,cinemaLookFilter,cinemaAudioSettings}=require('../cinema-engine');
const {assess10K,GiB}=require('../render-guard');
const html=fs.readFileSync(path.join(__dirname,'../app/index.html'),'utf8');
const renderer=fs.readFileSync(path.join(__dirname,'../native-renderer.js'),'utf8');
assert(html.includes('scale=isCinema()?Math.min(W/w,H/h):Math.max(W/w,H/h)'),'Cinema viewer must match native letterboxing');
for(const [quality,ratio,w,h] of [
 ['uhd','1.90:1',3840,2022],['uhd','1.43:1',3840,2686],
 ['eightk','1.90:1',7680,4042],['eightk','1.43:1',7680,5370],
 ['tenk','1.90:1',9600,5052],['tenk','1.43:1',9600,6714]]){
 const dims=cinemaDimensions(quality,ratio);assert.equal(dims.width,w);assert.equal(dims.height,h);
 assert.equal(dims.height%2,0);
}
assert.equal(cinemaDimensions('uhd','source'),null);
assert.throws(()=>cinemaDimensions('bad','1.90:1'));
assert.equal(cinemaAudioSettings('studio').bitrate,'320k');
assert.equal(cinemaAudioSettings('standard').bitrate,'192k');
assert.match(cinemaLookFilter('blockbuster'),/colorbalance/);
assert.throws(()=>cinemaLookFilter('made-up'));
for(const snippet of ['id="cinemaPanel"','id="cinemaLook"','id="cinemaSound"','data-ratio="1.43:1"','data-ratio="1.90:1"','id="cinemaPreset4k"','id="cinemaPreset8k"','id="cinemaPreset10k"','cinema:{look:S.cinemaLook,sound:S.cinemaSound}','cinemaCssLook(S.cinemaLook)'])assert(html.includes(snippet),'Missing UI binding: '+snippet);
for(const snippet of ['cinemaDimensions(quality,ratio)','cinemaLookFilter(job.cinema?.look','cinemaAudioSettings(job.cinema?.sound','audioOutput.bitrate','st.width===width&&st.height===height'])assert(renderer.includes(snippet),'Native renderer missing: '+snippet);
const encoders='libx265 libaom-av1';
const allowed=assess10K({width:9600,height:6714,freeRamBytes:40*GiB,totalRamBytes:64*GiB,freeDiskBytes:20*GiB,duration:10,bitrateMbps:120,fps:24,encoders,requestedCodec:'auto'});
assert.equal(allowed.ok,true,allowed.errors.join(' '));assert.equal(allowed.height,6714);
const blocked=assess10K({width:9600,height:6714,freeRamBytes:8*GiB,totalRamBytes:16*GiB,freeDiskBytes:20*GiB,duration:10,bitrateMbps:120,fps:24,encoders,requestedCodec:'auto'});
assert.equal(blocked.ok,false);assert.match(blocked.errors.join(' '),/pamięci RAM/i);
console.log('OK: ULTRA CINEMA 1.43/1.90, 4K/8K/10K sizing, looks, AAC, guard, HTML and native renderer');
