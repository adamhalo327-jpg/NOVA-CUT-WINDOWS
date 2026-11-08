/* NOVA CUT 8.0 — ULTIMATE STUDIO. Seven added features; no export engine replacement. */
(()=>{
'use strict';
const api=window.NovaUltra, $=id=>document.getElementById(id);
if(!api||!$('proTimeline')){console.error('Studio 8: missing NOVA core');return}
const {S,renderAll,notify,seekTo}=api;
const cfg={autoSave:true,effect:'none'};
const state={wave:new Map(),thumb:new Map(),wavePending:new Set(),thumbPending:new Set(),renderingDecor:false};
const saveKey='nova-cut-8-autosave';
const bars=document.createElement('div');bars.id='studio8Bar';
bars.innerHTML=`<span class="brand8">◆ STUDIO SMART</span>
<button type="button" id="nc8Mark">◇ Keyframe</button><button type="button" id="nc8AutoCaptions">📝 Automatyczne napisy</button>
<button type="button" id="nc8SaveNow">💾 Zapisz teraz</button>
<span class="status8" id="nc8Status">Wizualizacja waveformów · miniatury · keyframes · autozapis</span>`;
$('proTimeline').querySelector('.row.spread').after(bars);
const inspector=$('proToolsPane');
const section=document.createElement('div');section.className='nc8-section';section.id='nc8KeyframePanel';
section.innerHTML=`<h3>◆ KLATKI KLUCZOWE · KEYFRAMES</h3>
<p class="nc8-mini">Wybierz klip V1/V2 i ustaw kursor wewnątrz klipu. Wartości są interpolowane między klatkami.</p>
<div class="nc8-form"><label>Skala (%)<input id="nc8Scale" type="number" value="100" min="25" max="400" step="1"></label>
<label>Przezroczystość (%)<input id="nc8Opacity" type="number" value="100" min="0" max="100" step="1"></label>
<label>Przesunięcie X (%)<input id="nc8X" type="number" value="0" min="-100" max="100" step="1"></label>
<label>Przesunięcie Y (%)<input id="nc8Y" type="number" value="0" min="-100" max="100" step="1"></label></div>
<div class="row" style="margin-top:9px"><button class="nc8-button" id="nc8KfAdd">◇ Zapisz klatkę</button>
<button class="small" id="nc8KfRemove">Usuń klatkę</button></div><div class="nc8-state" id="nc8KfStatus">Wybierz klip.</div>
<p class="nc8-mini">Keyframes renderują się w podglądzie i eksporcie przeglądarkowym. Renderer Windows FFmpeg 7.0 nie uwzględnia jeszcze animacji keyframes.</p>`;
inspector.prepend(section);
const effects=document.createElement('div');effects.className='nc8-section';effects.id='nc8EffectsPanel';
effects.innerHTML=`<h3>✨ EFEKTY + PRZEJŚCIA 8.0</h3>
<label class="field">Styl obrazu <select id="nc8Effect"><option value="none">Brak dodatkowego efektu</option><option value="teal">Cinematic Teal</option><option value="gold">Golden Hour</option><option value="vhs">VHS / Scanlines</option><option value="grain">Film Grain</option><option value="vignette">Winieta</option><option value="neon">Cyber Neon</option></select></label>
<label class="field">Przejście 8.0 <select id="nc8Transition"><option value="none">Brak</option><option value="flash">Flash</option><option value="wipe">Wipe</option><option value="cinema">Cinema Bars</option></select></label>
<p class="nc8-mini">Efekty są widoczne na podglądzie i w eksporcie przeglądarkowym. Natywny FFmpeg zachowuje dotychczasowe filtry globalne.</p>`;
inspector.prepend(effects);
const auto=document.createElement('div');auto.className='nc8-section';auto.id='nc8AutoSavePanel';
auto.innerHTML=`<h3>💾 AUTOSAVE + RECOVERY</h3><p class="nc8-mini">Zapis układu, klipów, napisów i ustawień co 15 sekund oraz po zmianach. Pliki audio/wideo nie są kopiowane do zapisu — po odzyskaniu projektu trzeba je ponownie wskazać.</p>
<div class="row"><button class="nc8-button" id="nc8Restore">Przywróć projekt</button><button class="small" id="nc8ClearBackup">Usuń kopię</button></div>
<div class="nc8-state" id="nc8SaveStatus">Autozapis gotowy.</div>`;
inspector.prepend(auto);
const caps=document.createElement('div');caps.className='nc8-section';caps.id='nc8CaptionsPanel';
caps.innerHTML=`<h3>🗣 AUTOMATYCZNE NAPISY (OFFLINE)</h3>
<p class="nc8-mini">Lokalne rozpoznawanie mowy przez Whisper; wybierz klip AUDIO lub wideo zawierające mowę. Wymagana aplikacja Windows z dołączonym modelem AI.</p>
<label class="field">Język <select id="nc8Language"><option value="auto">Wykryj automatycznie</option><option value="pl">Polski</option><option value="en">English</option><option value="de">Deutsch</option><option value="es">Español</option></select></label>
<label class="field">Model offline <select id="nc10WhisperModel"><option value="base">Base · dokładniejszy</option><option value="tiny">Tiny · szybszy, mniej pamięci</option></select></label>
<button class="nc8-button" id="nc8Transcribe">🎤 Rozpoznaj mowę i dodaj napisy</button>
<div class="nc8-state" id="nc8CaptionStatus">Wybierz materiał i kliknij Rozpoznaj.</div>`;
inspector.prepend(caps);
$('nc8Mark').onclick=()=>$('nc8KfAdd').click();$('nc8AutoCaptions').onclick=()=>$('nc8Transcribe').click();$('nc8SaveNow').onclick=()=>saveProject(true);
function selectedClip(){return S.clips.find(c=>c.id===S.selClip)||null}
const within=(x,a,b)=>Math.max(a,Math.min(b,x));
function keyframeValue(clip,position){const frames=Array.isArray(clip.keyframes)?clip.keyframes:[];
 if(!frames.length)return {scale:1,x:0,y:0,opacity:1};
 const local=within(position-clip.at,0,Number.MAX_SAFE_INTEGER);
 const s=[...frames].sort((a,b)=>a.t-b.t);
 let left=s[0],right=s.at(-1);
 if(local<=s[0].t){left=right=s[0]}
 else if(local>=s.at(-1).t){left=right=s.at(-1)}
 else for(let i=1;i<s.length;i++)if(local<=s[i].t){left=s[i-1];right=s[i];break}
 const alpha=left===right?0:within((local-left.t)/(right.t-left.t),0,1);
 const lerp=(key,fallback)=>{const a=Number.isFinite(+left[key])?+left[key]:fallback,b=Number.isFinite(+right[key])?+right[key]:fallback;return a+(b-a)*alpha};
 return {scale:within(lerp('scale',1),.25,4),opacity:within(lerp('opacity',1),0,1),x:within(lerp('x',0),-100,100),y:within(lerp('y',0),-100,100)};
}
const kfInputs=['nc8Scale','nc8Opacity','nc8X','nc8Y'];
function updateKfPanel(){const c=selectedClip(),els=kfInputs.map($);const disabled=!c;
 for(const el of [...els,$('nc8KfAdd'),$('nc8KfRemove')])el.disabled=disabled;
 if(!c){$('nc8KfStatus').textContent='Wybierz klip na V1 lub V2.';return}
 const v=keyframeValue(c,S.position);const vals=[v.scale*100,v.opacity*100,v.x,v.y];els.forEach((el,i)=>{if(document.activeElement!==el)el.value=String(+vals[i].toFixed(2))});
 $('nc8KfStatus').textContent=`Klip: ${(S.assets.get(c.assetId)?.name||c.id)} • klatek: ${(c.keyframes||[]).length} • pozycja: ${Math.max(0,S.position-c.at).toFixed(2)} s`;
}
function saveKf(){const c=selectedClip();if(!c){notify('Wybierz klip na osi.');return}
 const t=within(S.position-c.at,0,Math.max(.02,(c.end-c.start)/(c.speed||1)));
 const [scale,opacity,x,y]=kfInputs.map(id=>Number($(id).value));
 if([scale,opacity,x,y].some(v=>!Number.isFinite(v)))return notify('Nieprawidłowe wartości klatki kluczowej.');
 const f={t:+t.toFixed(3),scale:within(scale/100,.25,4),opacity:within(opacity/100,0,1),x:within(x,-100,100),y:within(y,-100,100)};
 c.keyframes=Array.isArray(c.keyframes)?c.keyframes:[];
 c.keyframes=c.keyframes.filter(a=>Math.abs(a.t-t)>.025);c.keyframes.push(f);c.keyframes.sort((a,b)=>a.t-b.t);
 renderAll();saveProject(false);updateKfPanel();notify('Zapisano klatkę kluczową.');}
$('nc8KfAdd').onclick=saveKf;
$('nc8KfRemove').onclick=()=>{const c=selectedClip();if(!c)return;const t=S.position-c.at;const nearest=(c.keyframes||[]).reduce((best,a)=>!best||Math.abs(a.t-t)<Math.abs(best.t-t)?a:best,null);if(!nearest)return;
 c.keyframes=c.keyframes.filter(x=>x!==nearest);renderAll();updateKfPanel();saveProject(false)};
setInterval(updateKfPanel,300);
function filterString(name,p){const options={teal:`hue-rotate(${Math.round(-8*p)}deg) saturate(${Math.round(100+25*p)}%) contrast(${Math.round(100+10*p)}%)`,gold:`sepia(${Math.round(30*p)}%) saturate(${Math.round(100+45*p)}%)`,neon:`saturate(${Math.round(100+80*p)}%) contrast(${Math.round(100+25*p)}%)`};return options[name]||''}
function applyCanvasFx(ctx,W,H,t,s){const preset=s.effectPreset||'none',effect=['teal','gold','vhs','grain','vignette','neon'].includes(preset)?preset:cfg.effect;
 const intensity=within((s.effectStrength||60)/100,0,1);
 ctx.save();
 if(effect==='vhs'){ctx.fillStyle=`rgba(0,0,0,${.17*intensity})`;for(let y=Math.floor((t*13)%4);y<H;y+=4)ctx.fillRect(0,y,W,1)}
 if(effect==='grain'){const step=Math.max(4,Math.round(W/140));for(let i=0;i<Math.min(8000,W*H/step/step);i++){const x=(i*73+Math.floor(t*24)*991)%W,y=(i*187+Math.floor(t*24)*137)%H;ctx.fillStyle=`rgba(255,255,255,${.15*intensity})`;ctx.fillRect(x,y,step/2,step/2)}}
 if(effect==='vignette'||effect==='teal'||effect==='gold'){const g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.1,W/2,H/2,Math.max(W,H)*.75);g.addColorStop(0,'#0000');g.addColorStop(1,`rgba(0,0,0,${.68*intensity})`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
 if(effect==='neon'){ctx.strokeStyle=`rgba(0,255,240,${.16*intensity})`;ctx.lineWidth=Math.max(2,W*.006);ctx.strokeRect(0,0,W,H)}
 const transition=cfg.transition;
 if(transition&&transition!=='none'){
  const cuts=s.clips.filter(c=>c.track===0).flatMap(c=>[c.at,c.at+(c.end-c.start)/(c.speed||1)]).filter(x=>x>0);
  const closest=cuts.length?Math.min(...cuts.map(x=>Math.abs(x-t))):Infinity;
  if(closest<.35){const k=1-closest/.35;
   if(transition==='flash'){ctx.fillStyle=`rgba(255,255,255,${k*.78})`;ctx.fillRect(0,0,W,H)}
   if(transition==='wipe'){ctx.fillStyle='#090b13';ctx.fillRect(0,0,W*k*.82,H)}
   if(transition==='cinema'){ctx.fillStyle='#03040a';const h=H*.11*k;ctx.fillRect(0,0,W,h);ctx.fillRect(0,H-h,W,h)}
  }
 }
 ctx.restore();
}
$('nc8Effect').onchange=e=>{cfg.effect=e.target.value;S.effectPreset=e.target.value;};
$('nc8Transition').onchange=e=>{cfg.transition=e.target.value;};
// Context-safe thumbnail generation: detached video does not alter the preview player.
async function getThumb(asset){if(state.thumb.has(asset.id))return state.thumb.get(asset.id);
 if(state.thumbPending.has(asset.id))return '';
 state.thumbPending.add(asset.id);try{
  if(asset.kind==='image'){state.thumb.set(asset.id,asset.url);return asset.url}
  if(asset.kind!=='video')return '';
  const v=document.createElement('video');v.preload='auto';v.muted=true;v.playsInline=true;v.src=asset.url;
  await new Promise((res,rej)=>{const timer=setTimeout(()=>rej(Error('timeout')),6500);v.onloadeddata=()=>{clearTimeout(timer);res()};v.onerror=()=>{clearTimeout(timer);rej(Error('no video'))}});
  const c=document.createElement('canvas');c.width=128;c.height=76;const cx=c.getContext('2d');cx.drawImage(v,0,0,128,76);
  v.removeAttribute('src');v.load();const data=c.toDataURL('image/jpeg',.66);state.thumb.set(asset.id,data);return data;
 }catch{return ''}finally{state.thumbPending.delete(asset.id)}}
async function getWave(asset){if(state.wave.has(asset.id))return state.wave.get(asset.id);
 if(state.wavePending.has(asset.id))return null;
 state.wavePending.add(asset.id);try{
  const resp=await fetch(asset.url),arr=await resp.arrayBuffer();if(arr.byteLength>150*1048576)return null;
  const context=new(window.AudioContext||window.webkitAudioContext)();let decoded;
  try{decoded=await context.decodeAudioData(arr)}finally{await context.close().catch(()=>{})}
  const channel=decoded.getChannelData(0);const bins=300,step=Math.max(1,Math.floor(channel.length/bins));const vals=[];
  for(let i=0;i<bins;i++){let peak=0;const st=i*step,to=Math.min(channel.length,st+step);for(let k=st;k<to;k+=Math.max(1,Math.floor(step/100)))peak=Math.max(peak,Math.abs(channel[k]));vals.push(peak)}
  state.wave.set(asset.id,vals);return vals;
 }catch{return null}finally{state.wavePending.delete(asset.id)}}
function wavePath(values,zoom){const count=Math.max(16,Math.min(300,Math.ceil(zoom/2)));let d='';for(let i=0;i<count;i++){
 const idx=Math.min(values.length-1,Math.round(i/count*values.length));const a=Math.max(.015,Math.min(1,values[idx]||.02));const x=i/count*100,y=50-a*40;
 d+=`M${x.toFixed(2)} ${y.toFixed(2)}L${x.toFixed(2)} ${(100-y).toFixed(2)} `;
}return d}
const decorated=new WeakSet();let thumbnailLoop=null;
function decorate(){for(const tile of $('tracks').querySelectorAll('.clip')){
 if(decorated.has(tile))continue;decorated.add(tile);
 const cls=tile.classList;
 const match=cls.contains('audio')?'audio':(cls.contains('caption')||cls.contains('sticker')||cls.contains('sfx')?'other':'video');
 if(match==='other')continue;
 const label=document.createElement('span');label.className='nc8-label';
 for(const node of [...tile.childNodes])if(node.nodeType===Node.TEXT_NODE){label.textContent+=node.textContent;node.remove()}
 if(!label.textContent)label.textContent=tile.textContent.trim();tile.prepend(label);tile.classList.add('nc8-decorated');
  let model=null;
 if(match==='audio')model=S.audioClips.find(x=>x.id===tile.dataset.clipid);
 else model=S.clips.find(x=>x.id===tile.dataset.clipid);
 if(!model){const box=tile.parentNode;const idx=[...box.children].filter(x=>x.classList.contains('clip')).indexOf(tile);
   model=match==='audio'?S.audioClips[idx]:S.clips.filter(c=>c.track===((box.id==='overlayTrack')?1:0))[idx];}
 if(!model)continue;
 const asset=match==='audio'?S.audioAssets.get(model.assetId):S.assets.get(model.assetId);
 if(!asset)continue;
 if(match==='video'){
  const thumbs=document.createElement('div');thumbs.className='nc8-thumbs';tile.prepend(thumbs);
  const repeat=Math.min(12,Math.max(1,Math.floor(tile.getBoundingClientRect().width/80)));
  for(let i=0;i<repeat;i++){const im=document.createElement('img');im.alt='';thumbs.append(im)}
  getThumb(asset).then(src=>{if(!src||!tile.isConnected)return;for(const im of thumbs.querySelectorAll('img'))im.src=src});
  for(const k of model.keyframes||[]){const dot=document.createElement('div');dot.className='nc8-kfdot';const span=Math.max(.01,(model.end-model.start)/(model.speed||1));dot.style.left=within(k.t/span,0,1)*100+'%';tile.append(dot)}
 } else if(match==='audio'){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('preserveAspectRatio','none');svg.classList.add('nc8-wave');
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');svg.append(path);tile.prepend(svg);
  getWave(asset).then(v=>{if(v&&tile.isConnected)path.setAttribute('d',wavePath(v,tile.clientWidth))});
 }
}}
const observer=new MutationObserver(()=>{if(thumbnailLoop)return;thumbnailLoop=requestAnimationFrame(()=>{thumbnailLoop=null;decorate()})});
observer.observe($('tracks'),{childList:true,subtree:true});decorate();
// Save-project snapshots: require relinking media after reload, never stores raw media blobs.
function serialize(){return {app:'NOVA CUT',version:8.3,ratio:S.ratio,cinemaLook:S.cinemaLook,cinemaSound:S.cinemaSound,fade:S.fade,effectPreset:S.effectPreset,motionEffect:S.motionEffect,effectStrength:S.effectStrength,transitionType:S.transitionType,filters:S.filters,vol:S.vol,musicVol:S.musicVol,
 assets:[...S.assets.values()].map(a=>({id:a.id,name:a.name,size:a.size,kind:a.kind,duration:a.duration})),
 audioAssets:[...S.audioAssets.values()].map(a=>({id:a.id,name:a.name,size:a.size,duration:a.duration})),
 clips:S.clips,audioClips:S.audioClips,texts:S.texts,stickers:S.stickers,sfx:S.sfx,studio8:{effect:cfg.effect,transition:cfg.transition}}}
function saveProject(verbose=false){if(!cfg.autoSave)return;if(!verbose&&S.clips.length===0&&S.audioClips.length===0&&!S.assets.size&&!S.audioAssets.size){try{if(JSON.parse(localStorage.getItem(saveKey)||'null')?.project?.clips?.length)return}catch{}}try{localStorage.setItem(saveKey,JSON.stringify({at:Date.now(),project:serialize()}));$('nc8SaveStatus').textContent='Kopia: '+new Date().toLocaleTimeString('pl-PL');if(verbose)notify('Projekt zapisany. Po ponownym otwarciu wskaż pliki źródłowe.')}
 catch(e){$('nc8SaveStatus').textContent='Autozapis niedostępny: '+e.message}}
function restore(){const snapshot=JSON.parse(localStorage.getItem(saveKey)||'null');if(!snapshot?.project)return notify('Nie znaleziono zapisanego projektu.');
 if((S.clips.length||S.audioClips.length)&&!confirm('Zastąpić bieżący projekt ostatnią kopią?'))return;
 const p=snapshot.project;
 api.pause();S.assets.clear();S.audioAssets.clear();S.pending=p.assets||[];S.pendingAudio=p.audioAssets||[];
 S.clips=structuredClone(p.clips||[]);S.audioClips=structuredClone(p.audioClips||[]);S.texts=structuredClone(p.texts||[]);S.stickers=structuredClone(p.stickers||[]);S.sfx=structuredClone(p.sfx||[]);
 S.ratio=p.ratio||'source';S.cinemaLook=p.cinemaLook||'natural';S.cinemaSound=p.cinemaSound||'standard';S.filters=p.filters||{brightness:100,contrast:100,saturation:100,grayscale:0};S.effectPreset=p.effectPreset||'none';S.motionEffect=p.motionEffect||'none';S.transitionType=p.transitionType||'none';S.effectStrength=p.effectStrength||60;
 S.vol=p.vol??1;S.musicVol=p.musicVol??.65;cfg.effect=p.studio8?.effect||'none';cfg.transition=p.studio8?.transition||'none';$('nc8Effect').value=cfg.effect;$('nc8Transition').value=cfg.transition;
 S.position=0;S.selClip=S.selAudio=S.selText=S.selSticker=null;renderAll();api.ratio(S.ratio);notify('Przywrócono montaż. Dodaj ponownie oryginalne pliki, aby odzyskać podgląd i eksport.');$('nc8SaveStatus').textContent='Przywrócono '+new Date(snapshot.at).toLocaleString('pl-PL')}
$('nc8Restore').onclick=()=>{try{restore()}catch(e){notify('Nie można przywrócić: '+e.message)}};
$('nc8ClearBackup').onclick=()=>{if(confirm('Usunąć wyłącznie kopię autozapisu?')){localStorage.removeItem(saveKey);$('nc8SaveStatus').textContent='Kopia usunięta.'}};
setInterval(()=>saveProject(false),15000);
window.addEventListener('beforeunload',()=>saveProject(false));
let lastFingerprint=JSON.stringify({clips:S.clips,audio:S.audioClips,texts:S.texts,stickers:S.stickers,sfx:S.sfx,ratio:S.ratio,fx:S.filters});setInterval(()=>{const fingerprint=JSON.stringify({clips:S.clips,audio:S.audioClips,texts:S.texts,stickers:S.stickers,sfx:S.sfx,ratio:S.ratio,fx:S.filters});if(fingerprint!==lastFingerprint){lastFingerprint=fingerprint;saveProject(false)}},3500);
try{const record=JSON.parse(localStorage.getItem(saveKey)||'null');if(record?.project?.clips?.length)$('nc8SaveStatus').textContent='Wykryto kopię '+new Date(record.at).toLocaleString('pl-PL')+' — kliknij Przywróć projekt.'}catch{}
// Offline speech recognition via bundled whisper.cpp in Electron.
$('nc8Transcribe').onclick=async()=>{
 if(!window.NovaDesktop?.transcribe){$('nc8CaptionStatus').textContent='Automatyczne rozpoznawanie wymaga aplikacji Windows z silnikiem Whisper; w HTML niedostępne.';return}
 const ac=S.audioClips.find(c=>c.id===S.selAudio)||S.audioClips[0]||null;
 const vc=S.clips.find(c=>c.id===S.selClip&&S.assets.get(c.assetId)?.kind==='video')||S.clips.find(c=>S.assets.get(c.assetId)?.kind==='video')||null;
 const c=ac||vc,a=ac?S.audioAssets.get(ac.assetId):vc?S.assets.get(vc.assetId):null;
 if(!a?.desktopPath){$('nc8CaptionStatus').textContent='Dodaj audio lub film z mową i wybierz klip. Plik musi być dostępny na dysku.';return}
 $('nc8Transcribe').disabled=true;$('nc8CaptionStatus').textContent='Przetwarzanie offline… (na CPU może potrwać kilka minut)';
 try{
  const answer=await window.NovaDesktop.transcribe({filePath:a.desktopPath,lang:$('nc8Language').value,modelSize:$('nc10WhisperModel')?.value||'base'});
  if(!answer?.ok)throw Error(answer?.error||'Transkrypcja nie powiodła się');
  const origin=(c.at||0)-(c.start||0);const clipEnd=(c.at||0)+(ac?c.duration:(c.end-c.start)/(c.speed||1));let count=0;
  for(const segment of answer.segments||[]){const start=Math.max(c.at||0,origin+segment.start),end=Math.min(clipEnd,Math.max(start+.18,origin+segment.end)),txt=String(segment.text||'').trim();if(!txt||end<=start)continue;
   const id='auto'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
   S.texts.push({id,text:txt,start,end,x:50,y:82,size:46,color:'#ffffff',animation:'fade',style:'box',autoGenerated:true});count++;
  }
  renderAll();saveProject(false);$('nc8CaptionStatus').textContent=`Gotowe: ${count} napisów (${answer.language||'auto'}). Możesz je edytować w Narzędzia → Napisy.`;
  notify('Utworzono '+count+' automatycznych napisów.');
 }catch(e){$('nc8CaptionStatus').textContent='Błąd: '+String(e.message||e)}finally{$('nc8Transcribe').disabled=false}
};
window.NovaStudio8=Object.freeze({version:'8.0',keyframeValue,applyCanvasFx,filterString,saveProject,restore,getThumb,getWave});
window.__NOVA_STUDIO8_READY=true;
})();
