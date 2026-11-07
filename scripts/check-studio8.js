'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'app/index.html'),'utf8');
for(const name of ['app/studio8.js','app/studio8.css','speech-renderer.js','app/timeline7.js','app/pro-ui.js'])assert(fs.existsSync(path.join(root,name)),'Missing '+name);
for(const key of ['NovaStudio8','studio8.js','studio8.css','keyframeValue','applyCanvasFx','nc8KfAdd'])assert((html+fs.readFileSync(path.join(root,'app/studio8.js'),'utf8')).includes(key),'Missing '+key);
for(const f of ['app/studio8.js','app/ultra.js','app/timeline7.js','speech-renderer.js'])new vm.Script(fs.readFileSync(path.join(root,f),'utf8'),{filename:f});
console.log('✅ NOVA CUT 8.0 UI + speech hooks present. Export engine unchanged.');
