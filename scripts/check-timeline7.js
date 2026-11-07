"use strict";
const fs=require('fs'),vm=require('vm'),path=require('path');
const base=path.resolve(__dirname,'..');
for(const name of ['app/timeline7.css','app/timeline7.js']){
 const content=fs.readFileSync(path.join(base,name),'utf8');
 if(content.length<2000)throw Error('Brak kompletnego pliku '+name);
 if(name.endsWith('.js'))new vm.Script(content,{filename:name});
 console.log('OK '+name+' '+content.length+' znakow');
}
const html=fs.readFileSync(path.join(base,'app/index.html'),'utf8');
for(const t of ['7.0 · TIMELINE ULTRA PRO','<script src="./timeline7.js"></script>','href="./timeline7.css"']){
 if(!html.includes(t))throw Error('Brakuje 7.0: '+t);
}
if(!html.includes('NovaTimeline7?.canMoveTo'))throw Error('Brak ochrony sciezek przy przeciaganiu');
console.log('TIMELINE 7.0 OK');
