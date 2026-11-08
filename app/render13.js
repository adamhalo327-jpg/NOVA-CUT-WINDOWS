/* NOVA CUT 13.0: queue works in background while Windows app is open/minimized. */
(()=>{'use strict';const el=id=>document.getElementById(id),api=window.NovaUltra;if(!api)return;
const pane=el('proToolsPane');if(!pane)return;
const section=document.createElement('section');section.id='nc13Panel';section.innerHTML=`<h3>⚡ ULTRA RENDER ENGINE 13.0</h3>
<label>Akceleracja eksportu<select id="nc13Gpu"><option value="auto">Auto — GPU jeśli działa, inaczej CPU</option><option value="off">CPU — najpewniejszy</option><option value="force">Tylko GPU (nie używaj CPU)</option></select></label>
<label>Profil eksportu<select id="nc13Preset"><option value="uhd">4K UHD</option><option value="sixk">6K</option><option value="eightk">8K</option><option value="tenk">10K eksperymentalnie</option></select></label>
<div id="nc13Status" role="status">Kolejka eksportu działa także przy zminimalizowanym oknie Windows. Zamknięcie aplikacji zatrzymuje renderowanie.</div>
<div><button id="nc13AddQueue" type="button">➕ Dodaj aktualny projekt do kolejki</button><button id="nc13Refresh" type="button">↻ Odśwież kolejkę</button></div>
<ul id="nc13Queue" aria-label="Lista zadań eksportu"></ul>
<p class="muted">GPU wymaga obsługi przez sterownik i kodek. Tryb Auto w razie błędu sprzętowego ponowi eksport na CPU bez obniżania jakości. Wysokie rozdzielczości wymagają dużo pamięci.</p>`;
pane.prepend(section);
let gpu='auto';try{gpu=localStorage.getItem('nova-gpu13')||'auto'}catch{}const select=el('nc13Gpu');select.value=gpu;select.onchange=()=>{gpu=select.value;try{localStorage.setItem('nova-gpu13',gpu)}catch{}};
let items=[];const status=t=>el('nc13Status').textContent=t;
function refresh(){const list=el('nc13Queue');list.replaceChildren();if(!items.length){list.textContent='Brak zadań. Najpierw dodaj film MP4 do projektu.';return;}for(const x of items){const li=document.createElement('li'),strong=document.createElement('strong');strong.textContent=x.label+' · '+x.status+' · '+Math.round((x.progress||0)*100)+'%';const btn=document.createElement('button');btn.textContent='Anuluj';btn.disabled=!['pending','running'].includes(x.status);btn.onclick=async()=>{await window.NovaDesktop.queueCancel(x.id);await update()};li.append(strong,btn);if(x.error){const e=document.createElement('div');e.textContent=x.error;li.append(e);}list.append(li);}}
async function update(){if(!window.NovaDesktop?.queueList)return;const r=await window.NovaDesktop.queueList();if(r?.ok)items=r.items;refresh();}
el('nc13Preset').value=el('quality')?.value||'uhd';el('nc13Preset').onchange=()=>{if(el('quality')){el('quality').value=el('nc13Preset').value;el('quality').dispatchEvent(new Event('change',{bubbles:true}));}status('Ustawiono profil eksportu w istniejącym edytorze: '+el('nc13Preset').selectedOptions[0].text+'.');};
el('nc13AddQueue').onclick=async()=>{const snapshot=window.NovaWindowsJob?.snapshot?.();if(!snapshot?.job)return status('Dodaj klip i oryginalne pliki MP4 na oś czasu.');if(snapshot.files.some(f=>!f.path))return status('Brakuje ścieżki oryginalnego pliku; dodaj media ponownie.');if(!window.NovaDesktop?.queueExport)return status('Kolejka działa tylko na Windows.');snapshot.fileName=window.NovaMovieName131?.get()||'';status('Wybierz plik docelowy MP4 dla kolejnego zadania…');const result=await window.NovaDesktop.queueExport(snapshot);if(result.ok){status('Dodano do kolejki: '+result.id);await update()}else if(result.error)status('Błąd: '+result.error);else status('Nie dodano zadania.');};
el('nc13Refresh').onclick=update;
window.NovaDesktop?.onQueueStatus?.(event=>{if(event.message)status(event.message);update()});
update();window.NovaRender13=Object.freeze({getOptions:()=>({gpu}),refresh:update});window.__NOVA_RENDER13_READY=true;
})();
