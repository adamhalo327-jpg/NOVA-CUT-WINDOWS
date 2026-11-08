"use strict";
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const {resolveTool,unpackPath}=require('../binary-tools');
const oldPath='C:\\Users\\ifoto\\AppData\\Local\\Programs\\NOVA CUT\\resources\\app.asar\\node_modules\\ffprobe-static\\bin\\win32\\x64\\ffprobe.exe';
assert.equal(unpackPath(oldPath).includes('app.asar.unpacked\\node_modules'),true,'Windows path must be outside ASAR');
assert.equal(unpackPath('/opt/NOVA CUT/resources/app.asar/node_modules/ffprobe-static/bin/ffprobe'),'/opt/NOVA CUT/resources/app.asar.unpacked/node_modules/ffprobe-static/bin/ffprobe');
assert.equal(unpackPath('C:\\Nova\\app.asar.unpacked\\ffprobe.exe').includes('unpacked.unpacked'),false);
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'nova132-tools-'));
try{
 fs.mkdirSync(path.join(temp,'tools'),{recursive:true});
 for(const kind of ['ffmpeg','ffprobe'])fs.writeFileSync(path.join(temp,'tools',kind+'.exe'),'fixture');
 assert.equal(resolveTool('ffprobe',{resourcesPath:temp,staticPath:oldPath}),path.join(temp,'tools','ffprobe.exe'));
 assert.equal(resolveTool('ffmpeg',{resourcesPath:temp,staticPath:'/fake/app.asar/ffmpeg.exe'}),path.join(temp,'tools','ffmpeg.exe'));
 assert.throws(()=>resolveTool('invalid',{resourcesPath:temp}),/Nieobsługiwany/);
 assert.throws(()=>resolveTool('ffprobe',{resourcesPath:path.join(temp,'none'),staticPath:'/missing/app.asar/ffprobe.exe'}),/FFprobe/);
}finally{fs.rmSync(temp,{recursive:true,force:true})}
const pkg=require('../package.json');
for(const x of ['binary-tools.js','media-inspector.js','mp4-preview.js'])assert(pkg.build.files.includes(x));
for(const x of ['tools/ffprobe.exe','tools/ffmpeg.exe'])assert(pkg.build.extraResources.some(e=>e.to===x),x+' must be outside app.asar');
const read=n=>fs.readFileSync(path.join(__dirname,'..',n),'utf8');
for(const n of ['media-inspector.js','mp4-preview.js','native-renderer.js','mega-engine.js','ai-power-engine.js','speech-renderer.js'])assert(read(n).includes('binary-tools'),n+' must resolve executables safely');
assert(read('.github/workflows/build-windows.yml').includes('Sprawdz prawdziwy FFprobe'), 'Workflow must test real binaries');
console.log('✓ 13.2: Windows FFprobe ENOENT fix, separate resources/tools, all modules, ASAR path conversion');
