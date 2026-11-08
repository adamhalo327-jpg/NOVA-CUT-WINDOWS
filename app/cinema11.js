/* NOVA CUT 11.0 CINEMA MASTER — accessible controls backed by the native FFmpeg pipeline. */
(()=>{'use strict';
const api=window.NovaUltra,el=id=>document.getElementById(id);
if(!api||!el('proToolsPane'))return;
const state={lut:'none',lutPath:'',stabilize:'off',effect:'none',strength:35,grain:0};
try{const previous=JSON.parse(localStorage.getItem('nova-cinema11')||'null');if(previous&&typeof previous==='object'){for(const key of ['lut','stabilize','effect','strength','grain'])if(Object.hasOwn(previous,key))state[key]=previous[key];}}catch{}
const panel=document.createElement('section');panel.id='nc11Panel';panel.innerHTML=`<h3>🎬 CINEMA MASTER 11.0</h3>
<p class="muted">Kolorowanie, prawdziwe pliki LUT .cube, efekty kinowe i stabilizacja FFmpeg. Podgląd LUT jest przybliżony; dokładne filtry działają przy eksporcie Windows.</p>
<div class="nc11-grid"><label>Profil LUT<select id="nc11Lut"><option value="none">Bez LUT</option><option value="blockbuster">Blockbuster</option><option value="amber">Golden Film</option><option value="noir">Noir</option><option value="teal">Teal & Orange</option><option value="custom">Własny plik .cube…</option></select></label>
<label>Stabilizacja<select id="nc11Stabilize"><option value="off">Wyłączona</option><option value="light">Lekka — deshake</option><option value="strong">Silna — deshake</option></select></label></div>
<button class="nc11-action" id="nc11ChooseLut" type="button">📂 Wczytaj LUT .cube z dysku</button>
<div class="nc11-grid"><label>Efekt kinowy<select id="nc11Effect"><option value="none">Bez efektu</option><option value="vignette">Winieta</option><option value="glow">Soft Glow</option><option value="film">Film Look</option><option value="mono">Film Noir</option></select></label>
<label>Siła efektu <output id="nc11StrengthValue">35%</output><input id="nc11Strength" min="0" max="100" type="range" value="35"></label></div>
<label>Ziarnistość filmu <output id="nc11GrainValue">0%</output><input id="nc11Grain" min="0" max="70" type="range" value="0"></label>
<button class="nc11-action" id="nc11ImportSmall" type="button">🤖 Importuj zaawansowany model Whisper Small (z paczki ZIP)</button>
<div id="nc11Status" role="status">Ustawienia przekazywane do natywnego FFmpeg. Stabilizacja wymaga większej mocy CPU.</div>`;
const target=el('proToolsPane');target.prepend(panel);
const lut=el('nc11Lut'),stab=el('nc11Stabilize'),effect=el('nc11Effect'),str=el('nc11Strength'),grain=el('nc11Grain');
function refresh(){lut.value=state.lut;stab.value=state.stabilize;effect.value=state.effect;str.value=state.strength;grain.value=state.grain;el('nc11StrengthValue').textContent=state.strength+'%';el('nc11GrainValue').textContent=state.grain+'%';try{localStorage.setItem('nova-cinema11',JSON.stringify({...state,lutPath:''}))}catch{};
const canvas=el('canvas');if(canvas){const looks={none:'',blockbuster:'contrast(1.16) saturate(1.07)',amber:'sepia(.17) saturate(1.16) brightness(1.03)',teal:'hue-rotate(-8deg) contrast(1.09)',noir:'grayscale(1) contrast(1.22)',custom:''};const fx={none:'',vignette:'contrast(1.05)',glow:'brightness(1.04)',film:'contrast(1.1) saturate(.91)',mono:'grayscale(1)'};canvas.style.filter=[looks[state.lut],fx[state.effect]].filter(Boolean).join(' ')||'';}}
lut.onchange=()=>{state.lut=lut.value;if(state.lut==='custom'&&!state.lutPath)el('nc11Status').textContent='Wybierz plik LUT .cube, aby użyć własnego profilu.';refresh()};
stab.onchange=()=>{state.stabilize=stab.value;refresh()};effect.onchange=()=>{state.effect=effect.value;refresh()};str.oninput=()=>{state.strength=Number(str.value);refresh()};grain.oninput=()=>{state.grain=Number(grain.value);refresh()};
el('nc11ChooseLut').onclick=async()=>{if(!window.NovaDesktop?.chooseLut){el('nc11Status').textContent='Własny LUT .cube wymaga aplikacji Windows.';return;}const r=await window.NovaDesktop.chooseLut();if(r?.path){state.lutPath=r.path;state.lut='custom';el('nc11Status').textContent='Załadowano: '+r.name;refresh();}else if(r?.error)el('nc11Status').textContent='Błąd: '+r.error;};
el('nc11ImportSmall').onclick=async()=>{if(!window.NovaDesktop?.importWhisperSmall){el('nc11Status').textContent='Import modelu wymaga Windows.';return;}const r=await window.NovaDesktop.importWhisperSmall();if(r?.ok)el('nc11Status').textContent='Zaimportowano Whisper Small Q5 · możesz wybrać go podczas automatycznych napisów.';else if(r?.error)el('nc11Status').textContent='Błąd modelu: '+r.error;};
refresh();window.NovaCinema11=Object.freeze({getState:()=>({...state})});window.__NOVA_CINEMA11_READY=true;
})();
