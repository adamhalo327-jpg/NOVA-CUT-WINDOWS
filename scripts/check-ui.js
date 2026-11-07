"use strict";
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'app/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'app/pro-ui.css'),'utf8');
const js=fs.readFileSync(path.join(root,'app/pro-ui.js'),'utf8');
for(const id of ['proTimeline','proViewer','proMediaPanel','proInspector','proTimelineSplitter','proToolsPane','proExportPane','canvas','desktopExport','tracks','mediaInput','audioInput'])
 assert(html.includes('id="'+id+'"'),'Brakuje elementu: '+id);
for(const file of ['pro-ui.css','pro-ui.js','ultra.js','timeline7.css','timeline7.js'])
 assert(html.includes('./'+file),'Brak zaleznosci: '+file);
assert(css.includes('grid-template-rows')&&css.includes('overflow:auto'),'Brak siatki UI');
assert(js.includes('setTab'),'Brak zakladek');
assert(html.includes('NOVA CUT 7.0'),'Wrong version');
console.log('UI 7.0 OK');
