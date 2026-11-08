/* NOVA CUT 6.1 — changes presentation only. Do not override renderer or export handlers. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const app=$('proTimeline')?.closest('.app');
 if(!app)return;
 const tools=$('proToolsPane'),exportPane=$('proExportPane'),qualityPane=$('proQualityPane');
 const bTools=$('proTabTools'),bExport=$('proTabExport'),bQuality=$('proTabQuality');
 const setTab=name=>{
   const which=['export','quality'].includes(name)?name:'tools';
   tools.classList.toggle('hide',which!=='tools');
   exportPane.classList.toggle('hide',which!=='export');
   qualityPane.classList.toggle('hide',which!=='quality');
   bTools.classList.toggle('selected',which==='tools');
   bExport.classList.toggle('selected',which==='export');
   bQuality.classList.toggle('selected',which==='quality');
   bTools.setAttribute('aria-selected',String(which==='tools'));
   bExport.setAttribute('aria-selected',String(which==='export'));
   bQuality.setAttribute('aria-selected',String(which==='quality'));
   bTools.setAttribute('aria-controls','proToolsPane');
   bExport.setAttribute('aria-controls','proExportPane');
   bQuality.setAttribute('aria-controls','proQualityPane');
   app.classList.remove('pro-inspector-hidden');
   $('proToggleInspector')?.setAttribute('aria-pressed','false');
   try {sessionStorage.setItem('nova61-tab',which)} catch {}
 };
 bTools.addEventListener('click',()=>setTab('tools'));
 bExport.addEventListener('click',()=>setTab('export'));
 bQuality.addEventListener('click',()=>setTab('quality'));
 $('proOpenExport').addEventListener('click',()=>setTab('export'));
 $('proExportShortcut').addEventListener('click',()=>setTab('export'));
 $('export')?.addEventListener('click',()=>setTab('export'),{capture:true});
 $('desktopExport')?.addEventListener('click',()=>setTab('export'),{capture:true});
 const toggle=(className,buttonId)=>{
   const hidden=app.classList.toggle(className);
   $(buttonId)?.setAttribute('aria-pressed',String(hidden));
   return hidden;
 };
 $('proToggleMedia').addEventListener('click',()=>toggle('pro-media-hidden','proToggleMedia'));
 $('proToggleInspector').addEventListener('click',()=>toggle('pro-inspector-hidden','proToggleInspector'));
 const handle=$('proTimelineSplitter');
 const maxSize=()=>Math.max(175,app.clientHeight-180);
 const applySize=pixels=>{
   const next=Math.max(175,Math.min(maxSize(),pixels));
   app.style.setProperty('--pro-timeline-size',`${Math.round(next)}px`);
   handle.setAttribute('aria-valuenow',`${Math.round(next)}`);
   return next;
 };
 let dragging=null;
 handle.addEventListener('pointerdown',ev=>{
   if(ev.button!==0)return;
   ev.preventDefault();
   dragging={y:ev.clientY,height:$('proTimeline').getBoundingClientRect().height};
   handle.setPointerCapture(ev.pointerId);
 });
 handle.addEventListener('pointermove',ev=>{
   if(!dragging)return;
   applySize(dragging.height+(dragging.y-ev.clientY));
 });
 const finish=()=>{if(!dragging)return;dragging=null;
   try {localStorage.setItem('nova61-timeline-size',Math.round($('proTimeline').getBoundingClientRect().height))}catch{}
 };
 handle.addEventListener('pointerup',finish);
 handle.addEventListener('pointercancel',finish);
 handle.addEventListener('keydown',ev=>{
   if(!['ArrowUp','ArrowDown','Home'].includes(ev.key))return;
   ev.preventDefault();
   if(ev.key==='Home'){app.style.removeProperty('--pro-timeline-size');return;}
   const height=$('proTimeline').getBoundingClientRect().height;
   applySize(height+(ev.key==='ArrowUp'?24:-24));finish();
 });
 $('proResetLayout').addEventListener('click',()=>{
   app.classList.remove('pro-media-hidden','pro-inspector-hidden');
   app.style.removeProperty('--pro-timeline-size');
   $('proToggleMedia').setAttribute('aria-pressed','false');
   $('proToggleInspector').setAttribute('aria-pressed','false');
   setTab('tools');
   try {localStorage.removeItem('nova61-timeline-size')}catch{}
 });
 document.addEventListener('keydown',ev=>{
   if(ev.ctrlKey&&ev.shiftKey&&ev.code==='KeyQ'){
     ev.preventDefault();setTab('quality');
   }else if(ev.ctrlKey&&ev.shiftKey&&ev.code==='KeyE'){
     ev.preventDefault();setTab('export');
   }else if(ev.key==='F6'&&!ev.ctrlKey){
     ev.preventDefault();$('tracks')?.focus();
   }
 });
 $('tracks')?.setAttribute('tabindex','0');
 try {
   const saved=Number(localStorage.getItem('nova61-timeline-size'));
   if(Number.isFinite(saved)&&saved>=175)applySize(saved);
   setTab(sessionStorage.getItem('nova61-tab')==='export'?'export':'tools');
 }catch {setTab('tools')}
 window.NovaProfessionalUI=Object.freeze({version:'6.1',setTab,reset:()=>$('proResetLayout').click()});
})();
