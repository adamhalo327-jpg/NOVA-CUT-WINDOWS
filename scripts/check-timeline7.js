"use strict";
const fs=require('fs'),vm=require('vm'),path=require('path');
const base=path.resolve(__dirname,'..');
for(const item of ['app/timeline7.css','app/timeline7.js']){
 const content=fs.readFileSync(path.join(base,item),'utf8');
 if(content.length<2000)throw Error('Brak kompletnego pliku '+item);
 if(item.endsWith('.js'))new vm.Script(content,{filename:item});
 console.log('✓ '+item+' ('+content.length+' znaków)');
}
const html=fs.readFileSync(path.join(base,'app/index.html'),'utf8');
for(const expected of ['10.1 · AUTO SUBTITLES','<script src="./timeline7.js"></script>','href="./timeline7.css"']){
 if(!html.includes(expected))throw Error('Brakuje elementu 7.0: '+expected)
}
if(!html.includes('NovaTimeline7?.canMoveTo'))throw Error('Brak zabezpieczenia przenoszenia do zablokowanej ścieżki');
console.log('✓ TIMELINE 7.0: inicjalizacja i kontrola plików OK');
