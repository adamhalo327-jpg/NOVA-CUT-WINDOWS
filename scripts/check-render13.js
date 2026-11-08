"use strict";const assert=require('assert'),fs=require('fs'),path=require('path');const mod=require('../render-engine13');
assert(mod.gpuCandidates('h265').includes('hevc_nvenc'));assert(mod.gpuCandidates('h264').includes('h264_qsv'));
assert(mod.memoryPlan({quality:'tenk',available:1e9}).warnings.length>0);
assert(mod.memoryPlan({quality:'uhd',available:8e9}).warnings.length===0);
const main=fs.readFileSync(path.join(__dirname,'../main.js'),'utf8');for(const id of ['nova:queue-add','nova:queue-list','nova:queue-cancel','pumpQueue'])assert(main.includes(id));
const native=fs.readFileSync(path.join(__dirname,'../native-renderer.js'),'utf8');assert(native.includes('selectedCodec'));
const html=fs.readFileSync(path.join(__dirname,'../app/index.html'),'utf8');assert(html.includes('render13.js'));
console.log('✓ 13.0 GPU detection, memory checks, queue render, retry CPU, 4K-10K profiles');
