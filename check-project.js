"use strict";
const fs=require('fs'),path=require('path'),vm=require('vm');
const base=path.resolve(__dirname,'..');
const required=['package.json','main.js','preload.js','native-renderer.js','app/index.html','assets/novacut.ico','.github/workflows/build-windows.yml'];
let ok=true;
for(const name of required){const full=path.join(base,name);if(!fs.existsSync(full)){console.error('❌ BRAKUJE: '+name);ok=false;}else console.log('✓ '+name+' ('+fs.statSync(full).size+' bajtów)');}
if(ok){const html=fs.readFileSync(path.join(base,'app/index.html'),'utf8');
 if(!html.includes('NOVA CUT')||!html.includes('id="canvas"')||html.length<50000){console.error('❌ app/index.html nie zawiera kompletnego edytora');ok=false;}
 const m=html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);if(!m){console.error('❌ Brak kodu JavaScript w app/index.html');ok=false;}
 else try{new vm.Script(m[1],{filename:'app/index.html'});console.log('✓ Składnia JS edytora jest poprawna');}catch(e){console.error(e.message);ok=false;}
}
if(!ok){console.error('\nBUDOWANIE ZATRZYMANE. Wgraj pełne pliki projektu, zachowując folder app/index.html.');process.exit(1)}
console.log('✅ Projekt jest gotowy do budowania.');
