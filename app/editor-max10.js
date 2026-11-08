/* NOVA CUT 10.0 — EDITOR MAX. Reorganizes the existing controls without cloning
   inputs or replacing event handlers, the project model, MP4 import or FFmpeg. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id), make=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x;};
 const media=$('proMediaPanel'),viewer=$('proViewer'),timeline=$('proTimeline'),inspector=$('proInspector'),tools=$('proToolsPane'),nav=document.querySelector('.nc84-main-nav');
 if(!media||!viewer||!timeline||!inspector||!tools||!window.NovaUltra)return;
 const api=window.NovaUltra;
 document.title='NOVA CUT 10.0 — EDITOR MAX';
 document.body.classList.add('nc10-ready');
 // Main navigation: keep original handlers for all existing nav buttons.
 const navConfig=[['media','▣ Media'],['edit','✂ Montaż'],['effects','✦ Efekty'],['transitions','⇄ Przejścia'],['titles','T Napisy'],['color','◉ Kolor'],['audio','♫ Dźwięk'],['quality','▣ Jakość']];
 const prev=new Map([...nav.querySelectorAll('[data-nc84-nav]')].map(x=>[x.dataset.nc84Nav,x]));
 const editButton=make('button','');editButton.type='button';editButton.dataset.nc10Nav='edit';
 editButton.addEventListener('click',()=>{document.querySelectorAll('.nc84-main-nav button').forEach(x=>x.classList.toggle('nc84-nav-active',x===editButton));openInspector('tools','Transformacja');});
 for(const [id,label] of navConfig){
   const button=id==='edit'?editButton:prev.get(id);if(!button)continue;
   button.textContent=label;nav.append(button);
 }
 const mega=prev.get('mega');if(mega){mega.remove();const menu=document.querySelector('.nc84-dropdown');const btn=make('button','','⚡ Narzędzia MEGA');btn.type='button';menu?.append(btn);btn.onclick=()=>openInspector('tools','AI Studio');}
 const headerMore=document.querySelector('.nc84-more > summary');if(headerMore)headerMore.textContent='⚙ Ustawienia';
 const exportBtn=$('export');if(exportBtn){exportBtn.textContent='⇧ Eksportuj';exportBtn.title='Dotychczasowy eksport projektu';}
 const settings=document.querySelector('.nc84-more');
 // Quick-import actions remain connected to actual file input elements.
 media.querySelector('.nc84-media-heading h2').textContent='▤ Biblioteka mediów';
 const heading=media.querySelector('.nc84-media-heading');
 const plus=make('button','nc10-plus','+');plus.type='button';plus.title='Dodaj filmy lub zdjęcia';plus.setAttribute('aria-label','Importuj media');
 plus.onclick=()=>$('mediaInput')?.click();heading.querySelector('.nc84-media-heading-symbol')?.remove();heading.append(plus);
 const filters=media.querySelector('.nc84-filters');
 for(const b of filters.querySelectorAll('button')){if(b.dataset.kind==='video')b.textContent='▣ Wideo';if(b.dataset.kind==='image')b.textContent='▧ Zdjęcia';}
 const audioFilter=make('button','nc84-media-filter','♫ Audio');audioFilter.type='button';audioFilter.dataset.kind='audio';audioFilter.setAttribute('aria-pressed','false');
 filters.insertBefore(audioFilter,filters.querySelector('[data-kind="image"]'));
 const assetList=$('assetList'),audioLibrary=$('audioLibrary');
 // Original controls are retained (no duplicated IDs or event handlers).
 const extra=make('details','nc10-extra');extra.id='nc10ExtraTools';
 const summary=make('summary','','▤ Dodatkowe media, efekty, napisy i formaty');
 const content=make('div','nc10-extra-body');extra.append(summary,content);
 const topNodes=[...media.children];
 for(const node of topNodes){if(node===heading||node.classList?.contains('nc84-search')||node===filters||node===assetList||node===audioLibrary)continue;content.append(node);}
 const quick=make('div','nc10-quick-import');
 const addMedia=make('button','nc10-main-import','＋ Dodaj media');addMedia.type='button';addMedia.onclick=()=>$('mediaInput')?.click();
 const addMp4=make('button','nc10-secondary-import','▣ Dodaj MP4');addMp4.type='button';addMp4.onclick=()=>$('mp4Input')?.click();
 const addAudio=make('button','nc10-secondary-import','♫ Audio');addAudio.type='button';addAudio.onclick=()=>$('audioInput')?.click();
 quick.append(addMedia,addMp4,addAudio);filters.after(quick);
 media.append(extra);media.insertBefore(audioLibrary,extra);
 // Keep audio entries visible in Audio filter; search never modifies media state.
 const search=$('nc84MediaSearch');
 const updateLibrary=()=>{
  const kind=media.querySelector('.nc84-media-filter.is-active')?.dataset.kind||'all',q=(search?.value||'').toLocaleLowerCase('pl');
  assetList.classList.toggle('nc10-assets-filtered',kind==='audio');
  audioLibrary.classList.toggle('nc10-assets-filtered',kind!=='all'&&kind!=='audio');
  for(const card of assetList.children){
   const title=card.querySelector('.nc84-asset-name')?.textContent||card.textContent||'';
   card.hidden=!!(q&&!title.toLocaleLowerCase('pl').includes(q))||(kind!=='all'&&kind!==card.dataset.kind);
  }
  for(const card of audioLibrary.children){card.hidden=!!(q&&!card.textContent.toLocaleLowerCase('pl').includes(q));}
 };
 filters.addEventListener('click',e=>{const b=e.target.closest('button[data-kind]');if(!b)return;for(const x of filters.querySelectorAll('button[data-kind]')){x.classList.toggle('is-active',x===b);x.setAttribute('aria-pressed',String(x===b));}updateLibrary();});
 search?.addEventListener('input',updateLibrary);
 const observer=new MutationObserver(()=>updateLibrary());observer.observe(assetList,{childList:true});observer.observe(audioLibrary,{childList:true});
 updateLibrary();
 // Use the same real seek input that already drives playhead and preview.
 const oldControl=viewer.querySelector('.control'),oldTime=oldControl?.querySelector('.time'),seek=$('seek');
 const scrub=make('div','nc10-scrubber'),bottom=make('div','nc10-viewer-bottom');
 const now=make('span','nc10-clock'),finish=make('span','nc10-clock');
 now.append($('now'));finish.append($('total'));
 const seekParent=seek?.parentNode;if(seek)seek.remove();
 if(oldTime)oldTime.remove();
 scrub.append(now,seek,finish);
 const viewActions=make('div','nc10-view-actions');
 const screenshot=make('button','','▣');screenshot.type='button';screenshot.title='Zapisz aktualną klatkę jako PNG';
 screenshot.onclick=()=>{try{const c=$('canvas'),a=document.createElement('a');a.download='NOVA-CUT-klatka.png';a.href=c.toDataURL('image/png');a.click();}catch(e){api.notify('Nie można zapisać klatki: '+e.message)}};
 const full=make('button','','⛶');full.type='button';full.title='Pełny ekran';full.onclick=()=>{if(!document.fullscreenElement)viewer.requestFullscreen?.();else document.exitFullscreen?.()};
 viewActions.append(screenshot,full);bottom.append(oldControl,viewActions);
 const stage=viewer.querySelector('.stage');stage?.after(scrub,bottom);
 // The inspector tab bar is now a unified editor menu. Original tabs still exist and work.
 const tabs=make('div','nc10-inspector-nav');
 for(const [id,label,section] of [['tools','⚒ Narzędzia','Podstawowe'],['effects','✦ Efekty','Filtry i LUT'],['color','◉ Kolor','Korekcja kolorów']]){
  const b=make('button','',''+label);b.type='button';b.dataset.nc10Inspector=id;b.classList.toggle('active',id==='tools');
  b.onclick=()=>openInspector('tools',section,id);tabs.append(b);
 }
 inspector.prepend(tabs);
 const names=['Podstawowe','Transformacja','Korekcja kolorów','Filtry i LUT','Przejścia','Prędkość','Audio','Napisy (SRT)','AI Studio'];
 const symbols=['☷','◇','◉','⬡','↔','◷','♫','T','✧'];
 const details=new Map();
 for(let i=0;i<names.length;i++){
  const d=make('details','nc10-accordion');d.dataset.nc10Section=names[i];
  const t=make('summary');t.append(make('span','nc10-ico',symbols[i]),document.createTextNode(names[i]));
  const body=make('div','nc10-accordion-body');d.append(t,body);details.set(names[i],{d,body});
 }
 // Move existing live form nodes and attached handlers into collapsible sections.
 const items=[...tools.children];let current='Podstawowe';
 for(const x of items){
  if(x.tagName==='H2'&&x.textContent.includes('Narzędzia')){x.remove();continue;}
  if(x.id==='nc9MegaPanel'){details.get('AI Studio').body.append(x);continue;}
  if(x.id==='nc8CaptionsPanel'){details.get('AI Studio').body.append(x);continue;}
  if(x.id==='nc8AutoSavePanel'){details.get('Podstawowe').body.append(x);continue;}
  if(x.id==='nc8EffectsPanel'){details.get('Filtry i LUT').body.append(x);continue;}
  if(x.id?.startsWith('nc8')&&x.id.toLowerCase().includes('key')){details.get('Transformacja').body.append(x);continue;}
  if(x.tagName==='H3'){
   const label=x.textContent.toLocaleLowerCase('pl');
   if(label.includes('wybrany klip'))current='Transformacja';
   else if(label.includes('effects studio'))current='Filtry i LUT';
   else if(label.includes('efekty'))current='Korekcja kolorów';
   else if(label.includes('przejścia'))current='Przejścia';
   else if(label.includes('dźwięk'))current='Audio';
   else if(label.includes('wybrany napis'))current='Napisy (SRT)';
   x.remove();continue;
  }
  if(x.id==='photoStretchPanel')current='Transformacja';
  if(x.matches('label.field')&&x.querySelector('#motionEffect,#effectPreset'))current='Filtry i LUT';
  if(x.matches('.field')&&x.querySelector('#selectedAudioVolume,#clipVolume,#musicVolume'))current='Audio';
  if(x.matches('label.field')&&x.querySelector('#transitionType'))current='Przejścia';
  if(x.matches('.field')&&x.querySelector('#brightness,#contrast,#saturation,#grayscale'))current='Korekcja kolorów';
  details.get(current).body.append(x);
 }
 for(const x of details.values())tools.append(x.d);
 // A small shortcut makes SRT accessible without finding its nested MEGA tab.
 const srtShortcut=make('button','small','▤ Importuj / eksportuj SRT');srtShortcut.type='button';srtShortcut.onclick=()=>{
  details.get('AI Studio').d.open=true;$('nc9MegaPanel')?.scrollIntoView({block:'nearest'});
  document.querySelector('[data-nc9-tab="subs"]')?.click();
 };
 details.get('Napisy (SRT)').body.prepend(srtShortcut);
 function openInspector(pane,section,chosen='tools'){
  if(pane==='export')$('proTabExport')?.click();else if(pane==='quality')$('proTabQuality')?.click();else $('proTabTools')?.click();
  tabs.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x.dataset.nc10Inspector===chosen));
  if(section&&details.has(section)){
   const entry=details.get(section);entry.d.open=true;requestAnimationFrame(()=>{entry.d.scrollIntoView({block:'nearest',behavior:'smooth'});});
  }
  settings?.removeAttribute('open');
 }
 const jumpById={media:'',effects:'Filtry i LUT',transitions:'Przejścia',titles:'Napisy (SRT)',color:'Korekcja kolorów',audio:'Audio',mega:'AI Studio',quality:''};
 for(const b of nav.querySelectorAll('[data-nc84-nav]'))b.addEventListener('click',()=>{
  const section=jumpById[b.dataset.nc84Nav];if(section)openInspector('tools',section,b.dataset.nc84Nav==='color'?'color':b.dataset.nc84Nav==='effects'?'effects':'tools');
 });
 const originalExport=$('proExportShortcut');if(originalExport)originalExport.onclick=()=>openInspector('export');
 // Timeline toolbar: every action delegates to its existing, tested control.
 const toolbar=make('div','nc10-toolbar');toolbar.id='nc10Toolbar';
 const mkAction=(label,target,cls='',hint='')=>{const b=make('button',cls,label);b.type='button';b.title=hint||label;b.onclick=()=>$(target)?.click();toolbar.append(b);return b;};
 const importBtn=make('button','nc10-main','＋ Dodaj');importBtn.type='button';importBtn.onclick=()=>$('mediaInput')?.click();toolbar.append(importBtn);
 mkAction('✂ Podziel','split');mkAction('▤ Usuń','deleteClip');mkAction('⧉ Kopiuj','duplicateClip');mkAction('◇ Keyframe','nc8Mark');
 mkAction('↶ Cofnij','ultraUndo');mkAction('↷ Ponów','ultraRedo');
 const zoom=make('div','nc10-timeline-zoom');zoom.append(make('span','','Skala'));
 const zoomOut=make('button','','−'),zoomIn=make('button','','+');zoomOut.type=zoomIn.type='button';zoomOut.onclick=()=>$('tl7ZoomOut')?.click();zoomIn.onclick=()=>$('tl7ZoomIn')?.click();zoom.append(zoomOut,$('zoom'),zoomIn);toolbar.append(zoom);
 const more=make('button','','☷ Więcej');more.type='button';more.title='Dodatkowe funkcje osi czasu: magnetyzm, cofanie, markery, automatyczne napisy, eksport';
 more.onclick=()=>{const flag=timeline.classList.toggle('nc10-show-advanced');more.setAttribute('aria-pressed',String(flag));};toolbar.append(more);
 const tracksToggle=make('button','','▦ Ścieżki');tracksToggle.type='button';tracksToggle.title='Pokaż / ukryj dodatkowe ścieżki napisów i naklejek';
 tracksToggle.onclick=()=>{const flag=timeline.classList.toggle('nc10-more-tracks');tracksToggle.setAttribute('aria-pressed',String(flag));};toolbar.append(tracksToggle);
 timeline.prepend(toolbar);
 // Position of playhead/ruler is already adjusted in core and timeline7 for 186px labels.
 const inner=$('timelineInner'),overlay=$('overlayTrack')?.closest('.trackrow');
 const fxRow=make('div','trackrow nc10-effect-row'),fxLabel=make('div','tracklabel','✦ V3 – Efekty'),fxContent=make('div','trackcontent nc10-effect-content');
 fxContent.title='W tej wersji efekty FFmpeg są globalne — wybierz preset w inspektorze.';
 const refreshFx=()=>{const val=$('effectPreset')?.selectedOptions?.[0]?.textContent||'Bez efektu';fxContent.textContent='✦ '+val+' · efekt globalny';};
 fxContent.onclick=()=>openInspector('tools','Filtry i LUT','effects');fxRow.append(fxLabel,fxContent);
 if(overlay)inner.insertBefore(fxRow,overlay);
 $('captionTrack')?.closest('.trackrow')?.classList.add('nc10-secondary-track');
 $('stickerTrack')?.closest('.trackrow')?.classList.add('nc10-secondary-track');
 for(const [id,label] of [['audioTrack','♫ A1 – Muzyka'],['sfxTrack','♫ A2 – Dźwięk'],['overlayTrack','▧ V2 – Nakładka'],['videoTrack','▣ V1 – Główna']]){
  const row=$(id)?.closest('.trackrow');const el=row?.querySelector('.tl7-title');if(el)el.textContent=label;
 }
 $('effectPreset')?.addEventListener('change',refreshFx);refreshFx();
 // Avoid confusion: quality in the screenshot is illustrative, actual inspected values are from FFprobe.
 const goQuality=make('button','','🔎 QUALITY INSPECTOR');goQuality.type='button';goQuality.onclick=()=>openInspector('quality');
 const dropdown=document.querySelector('.nc84-dropdown');dropdown?.prepend(goQuality);
 const openNative=make('button','','🎬 Ustawienia eksportu Windows');openNative.type='button';openNative.onclick=()=>openInspector('export');dropdown?.prepend(openNative);
 // Finish on actual tools rather than a blank/highly technical legacy Quality tab.
 $('proTabTools')?.click();
 window.__NOVA_EDITOR_MAX10_READY=true;
 window.NovaEditorMax10=Object.freeze({version:'10.0',openInspector,updateLibrary,groups:()=>[...details.keys()]});
})();
