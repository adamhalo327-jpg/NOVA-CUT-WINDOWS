/* NOVA CUT 13.1 — one movie name for Windows, queue and browser exports. */
(()=>{'use strict';
const field=document.getElementById('nc131MovieName'),preview=document.getElementById('nc131NamePreview');if(!field)return;
const forbidden=/[<>:"/\\|?*\x00-\x1F\x7F]/g;
function safeTitle(value){let text=String(value||'').normalize('NFC').replace(forbidden,'-').replace(/\s+/g,' ').trim();text=text.replace(/\.(mp4|webm|mov|mkv)$/i,'').replace(/[. ]+$/g,'');if(/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(text))text='film-'+text;return text.slice(0,90).replace(/[. ]+$/g,'');}
const get=()=>safeTitle(field.value);
function downloadName(ext,fallback){const title=get();return title?title+'.'+(ext==='webm'?'webm':'mp4'):fallback;}
function redraw(){const name=get();preview.textContent=name?'Nazwa eksportu: '+name+'.mp4':'Nazwa domyślna: NOVA-CUT-13.1.mp4';}
try{field.value=localStorage.getItem('nova131-export-filename')||''}catch{}
field.addEventListener('input',()=>{try{localStorage.setItem('nova131-export-filename',field.value)}catch{}redraw()});
field.addEventListener('blur',()=>{if(field.value!==get())field.value=get();redraw()});redraw();
window.NovaMovieName131=Object.freeze({get,downloadName,safeTitle});
})();
