"use strict";
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8');
const html=read('app/index.html'),css=read('app/readability9.css'),js=read('app/readability9.js');
for(const v of ['id="nc9UISize"','./readability9.css','./readability9.js','id="addMp4Btn"','id="desktopExport"'])assert(html.includes(v),'Missing '+v);
assert(css.includes('#proTimeline #timelineInner{min-width:100%!important}'));
assert(js.includes('nova9-ui-size')&&js.includes('NovaCutReadability'));
console.log('✓ NOVA CUT 9.0 readability and full-width tracks / MP4 import / Windows export retained');
