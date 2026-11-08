/* NOVA CUT 9.0 feature and backwards compatibility tests. */
'use strict';const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),pkg=require('../package.json');
assert(/^(10\.[01]|11\.0|12\.0|13\.[0123])\.0$/.test(pkg.version), 'Unexpected version '+pkg.version);
assert(read('app/ultra-cinema-redesign.js').includes('nc9MegaPanel'),'Missing MEGA navigation');
const html=read('app/index.html');
for(const id of ['nc9MegaPanel','nc9ClipList','nc9MoveLeft','nc9MoveRight','nc9AnalyzeScenes','nc9AnalyzeSilence','nc9ImportSrt','nc9ExportSrt','nc9Denoise','addMp4Btn','desktopExport','qualityResults','canvas','timelineInner'])assert(html.includes('id="'+id+'"'),'Missing UI: '+id);
for(const name of ['mega9.css','mega9.js','studio8.js','quality-inspector.js','ultra-cinema-redesign.js'])assert(html.includes(name),'Missing UI asset '+name);
assert(read('native-renderer.js').includes('getAudioFilter(job.mega9?.denoise'), 'Default-safe native audio integration missing');
assert(read('main.js').includes("'nova:analyze-media'"),'Electron integration missing');
assert(read('preload.js').includes("'nova:analyze-media'"),'Electron preload missing');
assert.equal(pkg.build.win.icon,'assets/novacut.ico');
assert(fs.statSync(path.join(root,pkg.build.win.icon)).size>3000);
const audio=require('../mega-render');
assert.equal(audio.getAudioFilter('off'),'');assert(audio.getAudioFilter('voice').includes('afftdn'));assert.throws(()=>audio.getAudioFilter('evil'));
assert(read('native-renderer.js').includes('renderProject'), 'Native export removed');
assert(read('app/index.html').includes('window.NovaUltra={'), 'Editor bootstrap removed');
console.log('✓ NOVA CUT 9.0 MEGA / SRT / offline scene analysis / Windows export / icon');
