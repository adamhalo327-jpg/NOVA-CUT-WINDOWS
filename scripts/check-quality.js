'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const root=path.resolve(__dirname,'..');
const originalLoad=Module._load;
Module._load=function(name,parent,isMain){if(name==='ffprobe-static')return {path:'/no-ffprobe-placeholder'};return originalLoad.apply(this,arguments);};
const {qualityClass,rate,interpretProbe,probeMedia}=require('../media-inspector');
Module._load=originalLoad;
assert.equal(rate('30000/1001')>29.96,true);
assert.equal(rate('0/0'),0);
assert.equal(qualityClass(9600,5400),'10K lub więcej');
assert.equal(qualityClass(9600,6714),'10K lub więcej');
assert.equal(qualityClass(3840,2022),'4K');
assert.equal(qualityClass(7680,5370),'8K');
assert.equal(qualityClass(1920,1080),'Full HD / 1080p');
const fixture={streams:[
 {codec_type:'video',width:9600,height:5400,codec_name:'hevc',profile:'Main',avg_frame_rate:'24000/1001',color_transfer:'smpte2084',pix_fmt:'yuv420p10le'},
 {codec_type:'audio',codec_name:'aac',channels:2,sample_rate:'48000'}
],format:{duration:'5.03',bit_rate:'80000000',format_long_name:'QuickTime / MOV',size:'55000000'}};
const analyzed=interpretProbe(fixture,{size:55000000},'/tmp/Film 10K.mp4');
assert.equal(analyzed.name,'Film 10K.mp4');assert.equal(analyzed.resolution,'9600 × 5400');
assert.equal(analyzed.quality,'10K lub więcej');assert.equal(analyzed.hdr,true);
assert.equal(analyzed.fps,23.98);assert.equal(analyzed.audioCodec,'AAC');assert.equal(analyzed.bitrateMbps,80);
assert.equal(interpretProbe({streams:[{codec_type:'audio',codec_name:'mp3'}],format:{}},null,'test.mp3').quality,'Tylko dźwięk');
assert.throws(()=>interpretProbe({format:{}},null,'bad'),/metadanych/i);
const html=fs.readFileSync(path.join(root,'app/index.html'),'utf8');
const ui=fs.readFileSync(path.join(root,'app/quality-inspector.js'),'utf8');
const pro=fs.readFileSync(path.join(root,'app/pro-ui.js'),'utf8');
for(const name of ['proQualityPane','proTabQuality','qualityChoose','qualityLast','qualityResults','qualityStatus','qualityFileInput'])assert(html.includes('id="'+name+'"'),'Missing quality element '+name);
for(const snippet of ['quality-inspector.js','quality-inspector.css','window.NovaQualityInspector','inspectMedia'])assert((html+ui+fs.readFileSync(path.join(root,'preload.js'),'utf8')).includes(snippet),'Missing quality binding '+snippet);
assert(pro.includes("setTab('quality')"));
assert(fs.readFileSync(path.join(root,'main.js'),'utf8').includes("ipcMain.handle('nova:inspect-media'"));
assert(JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).build.files.includes('media-inspector.js'));
const invalid=()=>probeMedia('relative-path.mp4',{ffprobePath:'/usr/bin/ffprobe'});
invalid().then(()=>{throw Error('Should reject relative path')},e=>assert.match(e.message,/ścieżka/i)).then(()=>console.log('✓ Quality inspector: FFprobe parser, 10K, Cinema, FPS, HDR, audio, UI, Electron IPC'));
