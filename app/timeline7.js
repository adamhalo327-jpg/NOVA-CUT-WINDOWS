/* NOVA CUT 7.0 — TIMELINE ULTRA PRO. Does not replace the video/audio export engines. */
(()=>{
 'use strict';
 const api=window.NovaUltra, $=id=>document.getElementById(id);
 if(!api||!$('proTimeline')||!$('tracks')){console.error('TIMELINE 7: missing core UI');return;}
 const {S,notify,seekTo,pause}=api;
 const trackDefs=[
  {key:'v2',id:'overlayTrack',name:'🎥 V2 · Nakładka'},
  {key:'v1',id:'videoTrack',name:'🎥 V1 · Główna'},
  {key:'audio',id:'audioTrack',name:'🎵 AUDIO'},
  {key:'sfx',id:'sfxTrack',name:'💥 SFX'},
  {key:'text',id:'captionTrack',name:'📝 Napisy'},
  {key:'sticker',id:'stickerTrack',name:'⭐ Naklejki'}
 ];
 const registry=new Map();
 const defaultTrack=()=>({locked:false,hidden:false,collapsed:false,height:52});
 let stored={};
 try{stored=JSON.parse(localStorage.getItem('nova-cut-timeline7')||'{}')}catch{}
 const config=new Map(trackDefs.map(d=>{
  const v=stored[d.key]||{},h=Number(v.height);
  return [d.key,{locked:!!v.locked,hidden:!!v.hidden,collapsed:!!v.collapsed,height:Number.isFinite(h)?Math.max(35,Math.min(120,h)):52}];
 }));
 const persist=()=>{try{localStorage.setItem('nova-cut-timeline7',JSON.stringify(Object.fromEntries(config)))}catch{}};
 const toolbar=document.createElement('div');toolbar.id='tl7Toolbar';toolbar.setAttribute('aria-label','Narzędzia TIMELINE ULTRA PRO');
 toolbar.innerHTML=`<span class="tl7-brand">⚡ NARZĘDZIA ŚCIEŻEK</span>
  <button type="button" id="tl7ZoomOut" title="Zmniejsz skalę (-)">−</button>
  <button type="button" id="tl7ZoomFit" title="Dopasuj szerokość projektu">⇔ Dopasuj</button>
  <button type="button" id="tl7ZoomIn" title="Zwiększ skalę (+)">+</button>
  <span class="tl7-zoom" id="tl7ZoomLabel">48 px/s</span>
  <button type="button" id="tl7FitHeight">↕ Dopasuj ścieżki</button>
  <button type="button" id="tl7MarkerAdd" title="Dodaj znacznik w miejscu kursora (M)">📍 Znacznik</button>
  <button type="button" id="tl7Reset" title="Zresetuj wysokość i blokady ścieżek">↺ Ścieżki</button>
  <span class="tl7-status" id="tl7Status">Blokuj 🔒 / schowaj 👁 / zwiń ⌃ ścieżkę. Ukrycie na osi nie zmienia eksportu.</span>`;
 $('proTimeline').querySelector('.row.spread').after(toolbar);
 const zoomInput=$('zoom'); zoomInput.min='12';zoomInput.max='320';zoomInput.step='1';
 const updateZoomLabel=()=>{$('tl7ZoomLabel').textContent=Math.round(S.zoom)+' px/s';};
 const setZoom=(value,anchor=null)=>{
  const old=Math.max(1,S.zoom||48),val=Math.max(12,Math.min(320,Math.round(value)));
  const box=$('tracks'),head=box.scrollLeft+Math.max(0,box.clientWidth/2)-186;
  const center=anchor===null?Math.max(0,head)/old:anchor;
  zoomInput.value=String(val);zoomInput.dispatchEvent(new Event('input',{bubbles:true}));
  box.scrollLeft=Math.max(0,186+center*val-box.clientWidth/2);updateZoomLabel();
 };
 const duration=()=>Math.max(0,...S.clips.map(c=>c.at+(c.end-c.start)/(c.speed||1)),...S.audioClips.map(c=>c.at+c.duration),...S.texts.map(t=>t.end),...S.stickers.map(t=>t.end));
 const fitZoom=()=>{const w=$('tracks').clientWidth-148;setZoom(Math.min(320,Math.max(12,w/Math.max(1,duration()))),0);$('tracks').scrollLeft=0;};
 $('tl7ZoomIn').onclick=()=>setZoom(S.zoom*1.25);
 $('tl7ZoomOut').onclick=()=>setZoom(S.zoom/1.25);
 $('tl7ZoomFit').onclick=fitZoom;
 zoomInput.addEventListener('input',updateZoomLabel);
 // Ctrl+mouse wheel performs smooth zoom without scrolling the rest of the application.
 $('tracks').addEventListener('wheel',ev=>{
  if(!ev.ctrlKey)return;
  ev.preventDefault();setZoom(S.zoom*(ev.deltaY<0?1.10:0.90));
 },{passive:false});
 function forRow(key){return registry.get(key)?.row||null}
 function applyRow(key){
  const row=forRow(key),st=config.get(key);if(!row||!st)return;
  row.classList.toggle('tl7-locked',st.locked);row.classList.toggle('tl7-hidden-track',st.hidden);row.classList.toggle('tl7-collapsed',st.collapsed);
  row.style.setProperty('--tl7-row-h',st.height+'px');
  for(const action of ['lock','eye','collapse']){
   const b=row.querySelector(`button[data-action="${action}"]`);
   if(b)b.setAttribute('aria-pressed',String(action==='lock'?st.locked:action==='eye'?st.hidden:st.collapsed));
  }
 }
 function editTrack(key,action){const st=config.get(key);if(!st)return;
  if(action==='lock'){st.locked=!st.locked;notify(st.locked?'🔒 Zablokowano ścieżkę '+key+'.':'Odblokowano ścieżkę '+key+'.');}
  if(action==='eye'){st.hidden=!st.hidden;notify('Widoczność ścieżki na osi: '+(st.hidden?'ukryta':'włączona')+'. Eksport filmu nie zmieni się.');}
  if(action==='collapse'){st.collapsed=!st.collapsed;notify('Zmieniono zwijanie ścieżki '+key+'.');}
  applyRow(key);persist();
 }
 for(const def of trackDefs){
  const row=$(def.id)?.closest('.trackrow');if(!row)throw Error('Brak ścieżki '+def.id);
  registry.set(def.key,{row,def});row.dataset.tl7Track=def.key;row.classList.add('tl7-row');
  const label=row.querySelector('.tracklabel');label.textContent='';
  const title=document.createElement('span');title.className='tl7-title';title.textContent=def.name;title.title=def.name;
  const buttons=document.createElement('span');buttons.className='tl7-trackbuttons';
  for(const [action,symbol,labelText] of [['lock','🔓','Zablokuj/odblokuj edycję'],['eye','👁','Ukryj/pokaż klipy tylko na osi czasu'],['collapse','⌃','Zwiń/rozwiń ścieżkę']]){
   const b=document.createElement('button');b.type='button';b.dataset.action=action;b.textContent=symbol;b.title=labelText;b.setAttribute('aria-label',labelText+' '+def.name);
   b.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();editTrack(def.key,action)});buttons.append(b);
  }
  label.append(title,buttons);
  const resize=document.createElement('div');resize.className='tl7-track-resize';resize.title='Przeciągnij, aby zmienić wysokość ścieżki';
  resize.setAttribute('role','separator');resize.setAttribute('aria-label','Zmiana wysokości '+def.name);resize.tabIndex=0;
  resize.addEventListener('pointerdown',ev=>{
   if(ev.button!==0||config.get(def.key).collapsed)return;
   ev.stopPropagation();ev.preventDefault();const startY=ev.clientY,startH=config.get(def.key).height;
   resize.setPointerCapture(ev.pointerId);
   const move=e=>{config.get(def.key).height=Math.round(Math.max(35,Math.min(120,startH+e.clientY-startY)));applyRow(def.key)};
   const finish=()=>{resize.removeEventListener('pointermove',move);resize.removeEventListener('pointerup',finish);resize.removeEventListener('pointercancel',finish);persist();};
   resize.addEventListener('pointermove',move);resize.addEventListener('pointerup',finish);resize.addEventListener('pointercancel',finish);
  });
  resize.addEventListener('keydown',ev=>{if(!['ArrowUp','ArrowDown'].includes(ev.key))return;ev.preventDefault();const st=config.get(def.key);st.height=Math.max(35,Math.min(120,st.height+(ev.key==='ArrowDown'?5:-5)));applyRow(def.key);persist()});
  row.append(resize);applyRow(def.key);
 }
 $('tl7FitHeight').onclick=()=>{
  const height=$('tracks').clientHeight-28;
  const open=[...config.values()].filter(c=>!c.collapsed);
  const fixed=[...config.values()].filter(c=>c.collapsed).length*25;
  const val=Math.max(35,Math.min(120,Math.floor((height-fixed)/Math.max(1,open.length))));
  for(const [key,st] of config){st.height=val;applyRow(key)}persist();notify('Dopasowano wysokość ścieżek: '+val+' px.');
 };
 $('tl7Reset').onclick=()=>{
  for(const [key] of config)config.set(key,defaultTrack());
  for(const [key] of config)applyRow(key);
  persist();notify('Przywrócono domyślne ustawienia ścieżek.');
 };
 // Guard against moving clips into a locked track (core drag completion invokes this).
 function keyForElement(el){
  const row=el?.closest?.('.tl7-row');return row?.dataset?.tl7Track||null;
 }
 function canMoveTo(target){return !config.get(target==='0'?'v1':target==='1'?'v2':target)?.locked;}
 function selectedLocked(){
  if(S.selClip){const c=S.clips.find(x=>x.id===S.selClip);if(c&&config.get(c.track===1?'v2':'v1').locked)return true;}
  if(S.selAudio&&config.get('audio').locked)return true;
  if(S.selText&&config.get('text').locked)return true;
  if(S.selSticker&&config.get('sticker').locked)return true;
  return false;
 }
 // Capture before original editor handlers and the existing Undo system.
 const guard=e=>{
  const clip=e.target.closest?.('.clip');
  const key=clip?keyForElement(clip):null;
  if(key&&config.get(key).locked){e.preventDefault();e.stopImmediatePropagation();notify('🔒 Ścieżka '+key+' jest zablokowana. Odblokuj ją, aby zmieniać klipy.');return;}
  const btn=e.target.closest?.('button');
  const controlled=new Set(['split','deleteClip','duplicateClip','clipLeft','clipRight','addOverlay','fitImageAudio','fitImageProject','removeAudio','deleteAudioClip','deleteText','deleteSticker']);
  if(btn&&controlled.has(btn.id)&&selectedLocked()){
   e.preventDefault();e.stopImmediatePropagation();notify('🔒 Najpierw odblokuj wybraną ścieżkę.');return;
  }
  if(btn?.id==='ultraSlideshow'&&config.get('v1').locked){e.preventDefault();e.stopImmediatePropagation();notify('🔒 Odblokuj V1 przed automatycznym pokazem zdjęć.');return;}
  if(btn?.id==='addText'&&config.get('text').locked){e.preventDefault();e.stopImmediatePropagation();notify('🔒 Odblokuj ścieżkę napisów.');return;}
  if(btn?.classList?.contains('sfx')&&config.get('sfx').locked){e.preventDefault();e.stopImmediatePropagation();notify('🔒 Odblokuj SFX.');return;}
 };
 document.addEventListener('pointerdown',guard,true);
 document.addEventListener('click',guard,true);
 document.addEventListener('change',ev=>{
  const editable=new Set(['trimStart','trimEnd','clipAt','clipSpeed','clipTrack','imageDuration','selectedAudioVolume','textValue','fontSize','textColor','textStart','textEnd','textAnimation','textStyle','ultraFadeIn','ultraFadeOut']);
  if(editable.has(ev.target.id)&&selectedLocked()){ev.preventDefault();ev.stopImmediatePropagation();api.renderAll();notify('🔒 Zablokowano zmianę wybranej ścieżki.');}
 },true);
 // Markers are non-destructive editing guides and do not appear in exported video.
 let markers=[];
 const markerContainer=document.createElement('div');markerContainer.id='tl7Markers';$('timelineInner').append(markerContainer);
 const markerSort=()=>markers.sort((a,b)=>a-b);
 const markerDraw=()=>{
  markerContainer.replaceChildren();
  for(const [i,time] of markers.entries()){
   const b=document.createElement('button');b.type='button';b.textContent='◆';
   b.style.left=(186+time*S.zoom)+'px';b.title='Znacznik '+(i+1)+' · '+time.toFixed(2)+' s (kliknij, by przejść; Alt+klik, aby usunąć)';
   b.addEventListener('click',ev=>{ev.stopPropagation();if(ev.altKey){markers.splice(i,1);markerDraw();saveMarkers();notify('Usunięto znacznik.');}else{pause();seekTo(time)}});
   markerContainer.append(b);
  }
 };
 const saveMarkers=()=>{try{sessionStorage.setItem('nova-cut-timeline7-markers',JSON.stringify(markers))}catch{}};
 try{markers=JSON.parse(sessionStorage.getItem('nova-cut-timeline7-markers')||'[]').filter(Number.isFinite)}catch{}
 const addMarker=()=>{const t=Math.max(0,S.position);if(!markers.some(x=>Math.abs(x-t)<.01)){markers.push(t);markerSort();markerDraw();saveMarkers();notify('📍 Znacznik w '+t.toFixed(2)+' s.')}else notify('Znacznik w tym miejscu już istnieje.')};
 $('tl7MarkerAdd').onclick=addMarker;
 document.addEventListener('keydown',ev=>{
  if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
  if(ev.key==='m'&&!ev.ctrlKey&&!ev.metaKey&&!ev.altKey){ev.preventDefault();addMarker();}
  if(ev.key==='='&&ev.ctrlKey){ev.preventDefault();setZoom(S.zoom*1.15);}
  if(ev.key==='-'&&ev.ctrlKey){ev.preventDefault();setZoom(S.zoom/1.15);}
 });
 const zoomRefresh=new MutationObserver(()=>markerDraw());
 zoomRefresh.observe($('ruler'),{childList:true});
 markerDraw();updateZoomLabel();
 window.NovaTimeline7=Object.freeze({version:'7.0',config,canMoveTo,setZoom,fitZoom,markerCount:()=>markers.length});
 window.__NOVA_TIMELINE7_READY=true;
})();
