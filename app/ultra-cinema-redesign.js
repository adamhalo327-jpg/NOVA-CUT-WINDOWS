/* NOVA CUT 8.4 — ULTRA CINEMA REDESIGN. UI-only navigation; no renderer/export overrides. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const main=$('proMediaPanel'),inspector=$('proInspector'),tools=$('proToolsPane');
 if(!main||!inspector||!tools)return;
 const app=main.closest('.app');
 const menu=document.querySelector('.nc84-more');
 const showMedia=()=>{if(app.classList.contains('pro-media-hidden'))$('proToggleMedia')?.click();};
 const showInspector=()=>{if(app.classList.contains('pro-inspector-hidden'))$('proToggleInspector')?.click();};
 const inspectorSection=id=>{
  showInspector();$('proTabTools')?.click();
  const target=$(id); if(target)requestAnimationFrame(()=>target.scrollIntoView({block:'center',behavior:'smooth'}));
 };
 const mediaSection=id=>{showMedia();const node=$(id);if(node)requestAnimationFrame(()=>node.scrollIntoView({block:'center',behavior:'smooth'}));};
 const actions={
  media:()=>{showMedia();main.scrollTop=0;},
  effects:()=>inspectorSection('effectPreset'),
  transitions:()=>inspectorSection('transitionType'),
  titles:()=>mediaSection('addText'),
  color:()=>inspectorSection('brightness'),
  audio:()=>inspectorSection('selectedAudioVolume'),
  quality:()=>{showInspector();$('proTabQuality')?.click();},
 };
 for(const btn of document.querySelectorAll('[data-nc84-nav]')){
  btn.addEventListener('click',()=>{
   document.querySelectorAll('[data-nc84-nav]').forEach(el=>el.classList.toggle('nc84-nav-active',el===btn));
   actions[btn.dataset.nc84Nav]?.();
  });
 }
 document.querySelectorAll('.nc84-media-filter').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.nc84-media-filter').forEach(b=>{b.classList.toggle('is-active',b===btn);b.setAttribute('aria-pressed',String(b===btn));});
  // Filtering the current rows avoids touching project or timeline state.
  filterAssets();
 }));
 const search=$('nc84MediaSearch');
 const filterAssets=()=>{
  const q=(search?.value||'').toLocaleLowerCase('pl');
  const kind=document.querySelector('.nc84-media-filter.is-active')?.dataset.kind||'all';
  for(const row of $('assetList')?.querySelectorAll('.nc84-media-card')||[]){
   row.hidden=!!(q&&!row.querySelector('.nc84-asset-name')?.textContent.toLocaleLowerCase('pl').includes(q))||(kind!=='all'&&row.dataset.kind!==kind);
  }
 };
 search?.addEventListener('input',filterAssets);
 menu?.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{menu.open=false;}));
 document.addEventListener('keydown',ev=>{
  const editable=ev.target?.closest('input, textarea, select, [contenteditable]');
  if(ev.ctrlKey&&ev.code==='KeyF'&&!editable){ev.preventDefault();showMedia();search?.focus();}
  if(ev.key==='Escape'&&menu?.open)menu.open=false;
 });
 // First launch defaults to the quality inspector, as in the chosen design;
 // later sessions retain existing panel history.
 try{if(!sessionStorage.getItem('nova84-initialized')){
   $('proTabQuality')?.click();sessionStorage.setItem('nova84-initialized','1');
 }}catch{}
 window.NovaCutRedesign=Object.freeze({version:'8.4',go:section=>actions[section]?.()});
})();
