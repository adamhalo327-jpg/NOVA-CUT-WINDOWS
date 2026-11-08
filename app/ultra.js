/* NOVA CUT 6.0 — ULTRA EDITOR, additive desktop tools; original editor remains intact. */
(() => {
  'use strict';
  const api = window.NovaUltra;
  if (!api) { console.error('ULTRA EDITOR: missing editor API'); return; }
  const {S, renderAll, seekTo, pause, notify} = api;
  const $ = id => document.getElementById(id);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const inject = document.createElement('style');
  inject.textContent = `
    .ultra-toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 12px;padding:11px;
      border:1px solid #345c68;border-radius:12px;background:linear-gradient(105deg,#14272c,#19233b)}
    .ultra-toolbar b{color:#79f5d7;margin-right:4px}
    .ultra-toolbar button{white-space:nowrap}
    .ultra-toolbar .ultra-on{border-color:#46e6c8;color:#80ffe5;background:#20463f}
    .ultra-toolbar .ultra-hint{font-size:11px;color:#a6b7ce}
    .ultra-audio{margin:11px 0 14px;padding:12px;border:1px solid #43577a;border-radius:11px;background:#172235}
    .ultra-audio h3{margin:0 0 9px;color:#75e6d2}
    .ultra-audio label{display:grid;gap:5px;font-size:12px;color:#bac8dc}
    .ultra-audio-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .ultra-info{font-size:12px;color:#a6b7ce;margin:8px 0 0}
    #ultraSummary{font-size:12px;color:#a8e9db}
    @media(max-width:760px){.ultra-toolbar{gap:6px}.ultra-audio-grid{grid-template-columns:1fr 1fr}}
  `;
  document.head.append(inject);

  const toolbar = document.createElement('div');
  toolbar.className = 'ultra-toolbar';
  toolbar.id = 'ultraToolbar';
  toolbar.innerHTML = `
    <b>⚡ MONTAŻ ULTRA</b>
    <button class="small" id="ultraUndo" type="button" disabled title="Ctrl+Z">↶ Cofnij</button>
    <button class="small" id="ultraRedo" type="button" disabled title="Ctrl+Y">↷ Ponów</button>
    <button class="small ultra-on" id="ultraSnap" type="button" aria-pressed="true">🧲 Przyciąganie: WŁ.</button>
    <button class="small primary" id="ultraSlideshow" type="button">🖼 Zdjęcia do muzyki</button>
    <span class="ultra-hint">Cofanie zmian · magnetyczne pozycjonowanie · pokaz slajdów</span>
    <span id="ultraSummary" aria-live="polite"></span>
  `;
  const timelineTools = document.querySelector('.timeline .tools');
  if (timelineTools) timelineTools.before(toolbar);

  const fades = document.createElement('div');
  fades.className = 'ultra-audio';
  fades.innerHTML = `
    <h3>🎚 ULTRA AUDIO — PŁYNNE PRZEJŚCIA</h3>
    <div class="ultra-audio-grid">
      <label>Fade-in / wejście (s)<input id="ultraFadeIn" type="number" min="0" max="999" step="0.1" value="0"></label>
      <label>Fade-out / wyjście (s)<input id="ultraFadeOut" type="number" min="0" max="999" step="0.1" value="0"></label>
    </div>
    <p class="ultra-info" id="ultraAudioInfo">Zaznacz klip na ścieżce AUDIO. Płynne wejście i wyjście działa w podglądzie i eksporcie Windows.</p>
  `;
  const volField = $('selectedAudioVolume')?.closest('.field');
  if (volField) volField.after(fades);

  const stateKeys = ['clips','audioClips','texts','stickers','sfx','filters','ratio','vol','musicVol','effectPreset','motionEffect','effectStrength','transitionType','fade'];
  const snapState = () => JSON.stringify(Object.fromEntries(stateKeys.map(k => [k, S[k]])));
  const undoStack = [], redoStack = [];
  let pending = null;
  const historyButtons = () => {
    $('ultraUndo').disabled = !undoStack.length;
    $('ultraRedo').disabled = !redoStack.length;
  };
  function beginEdit() { if (!pending) pending = snapState(); }
  function finishEdit() {
    if (!pending) return;
    const previous = pending;
    pending = null;
    if (previous !== snapState()) {
      undoStack.push(previous);
      if (undoStack.length > 80) undoStack.shift();
      redoStack.length = 0;
    }
    historyButtons();
    updateSummary();
  }
  const deferredFinish = () => setTimeout(finishEdit, 0);
  function restore(data) {
    pause();
    const p = JSON.parse(data);
    for (const k of stateKeys) S[k] = p[k];
    for (const k of ['selClip','selAudio','selText','selSticker']) S[k] = null;
    for (const k of Object.keys(S.filters)) {
      const el=$(k);if(el) el.value=S.filters[k];
      const labelId = {brightness:'brightLabel',contrast:'contrastLabel',saturation:'saturationLabel',grayscale:'grayLabel'}[k];
      if ($(labelId)) $(labelId).textContent=S.filters[k]+'%';
    }
    for (const [name,value] of Object.entries({effectPreset:S.effectPreset,motionEffect:S.motionEffect,effectStrength:S.effectStrength,transitionType:S.transitionType,clipVolume:S.vol*100,musicVolume:S.musicVol*100})) {
      if ($(name)) $(name).value=value;
    }
    if ($('effectStrengthLabel')) $('effectStrengthLabel').textContent = S.effectStrength+'%';
    document.querySelectorAll('#ratioBar button').forEach(el=>el.classList.toggle('primary',el.dataset.ratio===S.ratio));
    S.position=clamp(S.position,0,Math.max(0,...S.clips.map(c=>c.at+(c.end-c.start)/(c.speed||1))));
    renderAll();api.dimensions();seekTo(S.position);updateAudioControls();updateSummary();
  }
  function undo() {
    finishEdit();
    if (!undoStack.length) return;
    redoStack.push(snapState());restore(undoStack.pop());historyButtons();notify('↶ Cofnięto ostatnią zmianę.');
  }
  function redo() {
    finishEdit();
    if (!redoStack.length) return;
    undoStack.push(snapState());restore(redoStack.pop());historyButtons();notify('↷ Przywrócono zmianę.');
  }
  $('ultraUndo').onclick = undo;
  $('ultraRedo').onclick = redo;
  document.addEventListener('keydown', e=>{
    if (!(e.ctrlKey||e.metaKey) || e.altKey || S.exporting) return;
    const tag = document.activeElement?.tagName;
    if (['INPUT','TEXTAREA','SELECT'].includes(tag) && !document.activeElement?.matches('input[type="range"]')) return;
    if (e.key.toLowerCase()==='z') { e.preventDefault();e.shiftKey?redo():undo(); }
    if (e.key.toLowerCase()==='y') { e.preventDefault();redo(); }
  });

  const editButtons = new Set(['split','deleteClip','duplicateClip','clipLeft','clipRight','addOverlay','fitImageAudio','fitImageProject','removeAudio','deleteAudioClip','addText','deleteText','clearProject','fadeBtn']);
  const editInputs = new Set(['trimStart','trimEnd','clipAt','clipSpeed','clipTrack','imageDuration','selectedAudioVolume','clipVolume','musicVolume','textValue','fontSize','textColor','textStart','textEnd','textAnimation','textStyle','brightness','contrast','saturation','grayscale','effectPreset','motionEffect','effectStrength','transitionType']);
  document.addEventListener('pointerdown', e => {
    const target = e.target;
    if (target.closest('.clip,.resize-handle,#canvas') || (target.id && editInputs.has(target.id))) beginEdit();
  }, true);
  document.addEventListener('click', e=>{
    const btn=e.target.closest('button');
    if (btn && (editButtons.has(btn.id) || btn.classList.contains('sfx') || btn.matches('#stickerPalette button,#assetList button,#audioLibrary button,#textList .danger,#stickerList button'))) beginEdit();
    deferredFinish();
    setTimeout(updateAudioControls, 1);
  }, true);
  // Capture a snapshot before existing onclick listeners mutate the project.
  document.addEventListener('click', deferredFinish);
  document.addEventListener('focusin', e=>{if (editInputs.has(e.target.id))beginEdit()},true);
  document.addEventListener('focusout', e=>{if (editInputs.has(e.target.id))deferredFinish()},true);
  document.addEventListener('pointerup',deferredFinish,true);
  document.addEventListener('pointercancel',deferredFinish,true);
  for (const id of ['mediaInput','audioInput']) {
    const inp=$(id),prev=inp?.onchange;
    if (inp && typeof prev === 'function') inp.onchange = async e=>{
      beginEdit();await prev.call(inp,e);finishEdit();updateSummary();
    };
  }

  let snapping = true;
  function snap(t,ignoredId) {
    if (!snapping) return t;
    const positions = [0];
    for (const c of S.clips) if (c.id!==ignoredId) positions.push(c.at,c.at+(c.end-c.start)/(c.speed||1));
    for (const c of S.audioClips) if (c.id!==ignoredId) positions.push(c.at,c.at+c.duration);
    let near = null,dist=.16;
    for (const p of positions) {
      const diff=Math.abs(p-t);
      if (diff<dist) {dist=diff;near=p;}
    }
    return Math.max(0,near===null?Math.round(t*4)/4:near);
  }
  api.snap=snap;
  $('ultraSnap').onclick=()=>{
    snapping=!snapping;
    $('ultraSnap').classList.toggle('ultra-on',snapping);
    $('ultraSnap').setAttribute('aria-pressed',String(snapping));
    $('ultraSnap').textContent='🧲 Przyciąganie: '+(snapping?'WŁ.':'WYŁ.');
    notify(snapping?'Przyciąganie do krawędzi klipów i siatki 0,25 s jest włączone.':'Przyciąganie wyłączone.');
  };

  function slideshow() {
    const photos=S.clips.filter(c=>c.track===0&&S.assets.get(c.assetId)?.kind==='image').sort((a,b)=>a.at-b.at);
    const videos=S.clips.filter(c=>c.track===0&&S.assets.get(c.assetId)?.kind==='video');
    if (!photos.length) {notify('Dodaj najpierw zdjęcia na ścieżkę V1.');return;}
    if (videos.length) {notify('Na V1 są również filmy. Przenieś je na V2 lub usuń przed automatycznym pokazem zdjęć.');return;}
    if (!S.audioClips.length) {notify('Dodaj muzykę lub nagranie audio na oś czasu.');return;}
    const start = Math.min(...S.audioClips.map(c=>c.at));
    const finish = Math.max(...S.audioClips.map(c=>c.at+c.duration));
    const per=(finish-start)/photos.length;
    if (per<.1) {notify('Muzyka jest zbyt krótka względem liczby zdjęć.');return;}
    beginEdit();
    photos.forEach((c,i)=>{
      c.at=+(start+i*per).toFixed(4);
      c.start=0;
      c.speed=1;
      c.end=+(i===photos.length-1?finish-c.at:per).toFixed(4);
    });
    pause();renderAll();seekTo(start);finishEdit();
    notify(`Dopasowano ${photos.length} zdjęć do ${Math.round(finish-start)} s audio. Każde zdjęcie trwa około ${per.toFixed(2)} s.`);
  }
  $('ultraSlideshow').onclick=slideshow;

  function selectedAudio() {return S.audioClips.find(c=>c.id===S.selAudio)||null;}
  function updateAudioControls() {
    const c=selectedAudio();
    for(const id of ['ultraFadeIn','ultraFadeOut']) $(id).disabled=!c;
    if(c){
      $('ultraFadeIn').value=String(c.fadeIn||0);
      $('ultraFadeOut').value=String(c.fadeOut||0);
      $('ultraAudioInfo').textContent=`Wybrano klip audio (${c.duration.toFixed(2)} s). Fade-in i fade-out mogą mieć maks. połowę długości klipu.`;
    }else {
      $('ultraAudioInfo').textContent='Wybierz klip na ścieżce AUDIO, aby ustawić fade-in i fade-out.';
    }
  }
  for (const [id,key] of [['ultraFadeIn','fadeIn'],['ultraFadeOut','fadeOut']]) {
    $(id).onchange=e=>{
      const c=selectedAudio();if(!c)return;
      const val=Number(e.target.value);
      if(!Number.isFinite(val)||val<0){notify('Fade musi być nieujemną liczbą sekund.');updateAudioControls();return;}
      beginEdit();c[key]=+clamp(val,0,c.duration/2).toFixed(2);
      updateAudioControls();finishEdit();notify('Zaktualizowano '+(key==='fadeIn'?'wejście':'wyjście')+' dźwięku.');
    };
  }
  function audioGainAt(c,t) {
    const at=t-c.at,d=Math.max(.001,c.duration);
    if(at<0||at>d)return 0;
    const fi=clamp(Number(c.fadeIn)||0,0,d/2),fo=clamp(Number(c.fadeOut)||0,0,d/2);
    return clamp(Math.min(fi>0?at/fi:1,fo>0?(d-at)/fo:1),0,1);
  }
  api.audioGainAt=audioGainAt;

  function updateSummary() {
    if (!$('ultraSummary')) return;
    const count=S.clips.length,images=S.clips.filter(c=>S.assets.get(c.assetId)?.kind==='image').length;
    $('ultraSummary').textContent=`Klipy: ${count} · Zdjęcia: ${images} · Audio: ${S.audioClips.length}`;
  }
  updateSummary();updateAudioControls();historyButtons();
  window.__NOVA_ULTRA_READY = true;
})();
