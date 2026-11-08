/* NOVA CUT 14.0 — familiar pro desktop workspace with genuine NOVA CUT controls.
   Move existing live nodes: never replace source inputs, project timeline or native renderer. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id),
       el=(tag,cls='',text)=>{const x=document.createElement(tag);x.className=cls;if(text!==undefined)x.textContent=text;return x;};
 const api=window.NovaUltra,main=document.querySelector('main.app'),header=document.querySelector('header.nc84-header'),
       media=$('proMediaPanel'),viewer=$('proViewer'),inspector=$('proInspector'),timeline=$('proTimeline'),nav=document.querySelector('.nc84-main-nav');
 if(!api||!main||!header||!media||!viewer||!inspector||!timeline||!nav)return;
 document.body.classList.add('nc14-ready');
 document.title='NOVA CUT 14.0 — STUDIO DESKTOP';
 const chip=header.querySelector('.nc84-brand-wrap .chip');if(chip)chip.textContent='14.0';
 const dropdown=header.querySelector('.nc84-dropdown'),more=header.querySelector('.nc84-more > summary');if(more)more.textContent='☰ Menu';
 // Project label is editable; it is not a fake autosave or a separate project format.
 const project=el('div','nc14-project'),symbol=el('span','nc14-project-icon','▣');
 const projectName=el('input');projectName.id='nc14ProjectName';projectName.setAttribute('aria-label','Nazwa projektu NOVA CUT');
 projectName.setAttribute('title','Nazwa robocza projektu. Użyj Menu → Zapisz projekt JSON, aby zapisać montaż.');
 projectName.maxLength=80;projectName.type='text';projectName.spellcheck=false;
 try{projectName.value=localStorage.getItem('novacut_project_title_14')||'Projekt bez nazwy';}catch{projectName.value='Projekt bez nazwy';}
 const local=el('span','nc14-local-label','PROJEKT LOKALNY');project.append(symbol,projectName,local);
 const actions=header.querySelector('.pro-header-actions');header.insertBefore(project,actions);
 projectName.addEventListener('change',()=>{projectName.value=projectName.value.trim()||'Projekt bez nazwy';try{localStorage.setItem('novacut_project_title_14',projectName.value)}catch{}});
 projectName.addEventListener('keydown',e=>{if(e.key==='Enter')projectName.blur();});
 // Library category strip. Tab names/icons are original and include working bindings.
 const strip=el('div','nc14-library-top');media.prepend(strip);strip.append(nav);
 const old=[...nav.querySelectorAll('button[data-nc84-nav]')],byId=new Map(old.map(b=>[b.dataset.nc84Nav,b]));
 const tabLabels={media:['▣','Media'],audio:['♫','Audio'],titles:['T','Tekst'],effects:['✧','Efekty'],transitions:['⇄','Przejścia'],color:['◈','Filtry'],quality:['◉','Jakość'],edit:['✂','Montaż']};
 function decorate(b,icon,label){b.replaceChildren(el('span','nc14-tabicon',icon),el('span','nc14-tabtext',label));b.title=label;}
 const sticker=el('button');sticker.type='button';sticker.dataset.nc14Nav='stickers';decorate(sticker,'★','Naklejki');
 sticker.addEventListener('click',()=>{
  chooseTab(sticker);const extra=$('nc10ExtraTools');if(extra)extra.open=true;
  media.querySelector('#stickerPalette')?.scrollIntoView({block:'nearest',behavior:'smooth'});
 });
 const adjust=el('button');adjust.type='button';adjust.dataset.nc14Nav='adjust';decorate(adjust,'☷','Dopasuj');
 adjust.onclick=()=>{chooseTab(adjust);window.NovaEditorMax10?.openInspector('tools','Korekcja kolorów','color');};
 for(const b of old)b.remove();
 const names=['media','audio','titles','effects','transitions','color'];
 const ordered=[byId.get('media'),byId.get('audio'),byId.get('titles'),sticker,byId.get('effects'),byId.get('transitions'),byId.get('color'),adjust];
 for(const b of ordered){if(!b)continue;if(b.dataset.nc84Nav){const [ico,label]=tabLabels[b.dataset.nc84Nav];decorate(b,ico,label)}nav.append(b)}
 // Preserve access to all original features in Menu.
 for(const id of ['edit','quality']){const b=byId.get(id);if(!b)continue;const [ico,label]=tabLabels[id];decorate(b,ico,label);dropdown?.append(b);b.classList.add('nc14-hidden-tool');}
 const mega=byId.get('mega');if(mega)dropdown?.append(mega);
 // Early add-ons inject extra tools directly into the old navigation. Put them in Menu.
 for(const other of [...nav.querySelectorAll('button')]){
   if(!ordered.includes(other)){dropdown?.append(other);other.classList.add('nc14-legacy-menu-action');}
 }
 const tools=nav.querySelectorAll('button');
 function chooseTab(b){for(const t of tools)t.classList.toggle('nc84-nav-active',t===b);}
 for(const b of tools){if(b!==sticker&&b!==adjust)b.addEventListener('click',()=>chooseTab(b));}
 // Media/audio/text quick navigation stays connected to imported assets and real controls.
 byId.get('media')?.addEventListener('click',()=>$('proMediaPanel')?.querySelector('[data-kind="all"]')?.click());
 byId.get('audio')?.addEventListener('click',()=>{$('proMediaPanel')?.querySelector('[data-kind="audio"]')?.click();$('nc10ExtraTools')?.setAttribute('open','');});
 byId.get('titles')?.addEventListener('click',()=>{$('nc10ExtraTools')?.setAttribute('open','');$('addText')?.scrollIntoView({block:'nearest'});});
 media.querySelector('.nc84-media-heading')?.querySelector('h2')?.replaceChildren(document.createTextNode('Importowane materiały'));
 const importBtn=media.querySelector('.nc10-quick-import .nc10-main-import');if(importBtn)importBtn.textContent='＋ Importuj';
 // Player name displays the selected real media, never artificial footage.
 const vHead=el('div','nc14-view-title'),vTitle=el('span','','Odtwarzacz'),vRight=el('div','nc14-view-title-right');
 const vStatus=el('span','','Brak filmu'),size=el('span','','Podgląd');vRight.append(vStatus,size);vHead.append(vTitle,vRight);viewer.prepend(vHead);
 const stage=viewer.querySelector('.stage');
 const placeholder=stage?.querySelector('.placeholder');if(placeholder){const strong=placeholder.querySelector('strong');if(strong)strong.textContent='Zacznij tworzyć';placeholder.lastChild.textContent='Przeciągnij film na oś czasu lub kliknij Importuj.';}
 // Inspector tabs do not duplicate fields: they open the existing live accordions.
 const inspectHead=el('div','nc14-inspector-head'),inspectTitle=el('strong','','Szczegóły'),inspectMeta=el('span','nc14-inspector-meta','Projekt');
 inspectHead.append(inspectTitle,inspectMeta);inspector.prepend(inspectHead);
 const oldInspector=inspector.querySelector('.nc10-inspector-nav');oldInspector.replaceChildren();
 function panel(label,section,alias='tools'){
  const b=el('button','',''+label);b.type='button';b.dataset.nc14Section=section;
  b.addEventListener('click',()=>{
   for(const other of oldInspector.querySelectorAll('button'))other.classList.toggle('active',other===b);
   window.NovaEditorMax10?.openInspector('tools',section,alias);
   // The 10.0 panel changes its own active styling; our 14.0 tabs show the chosen category.
   for(const other of oldInspector.querySelectorAll('button'))other.classList.toggle('active',other===b);
  });
  oldInspector.append(b);return b;
 }
 const videoTab=panel('Wideo','Transformacja');panel('Audio','Audio');panel('Prędkość','Transformacja');panel('Animacja','Filtry i LUT');panel('Korekta','Korekcja kolorów','color');videoTab.classList.add('active');
 const info=el('div','nc14-details-info');info.id='nc14SelectedInfo';
 const div=$('proToolsPane');
 if(div){
   // Newer engines insert their complex forms directly into Tools; group without cloning.
   const existing=[...div.children].filter(x=>!x.classList.contains('nc10-accordion'));
   if(existing.length){
     const advanced=el('details','nc10-accordion nc14-advanced-pane');
     const summary=el('summary','','⚙ Zaawansowane narzędzia i AI');
     const body=el('div','nc10-accordion-body');advanced.append(summary,body);
     for(const node of existing)body.append(node);
     div.append(advanced);
   }
   div.prepend(info);
   const transform=div.querySelector('[data-nc10-section="Transformacja"]');if(transform)transform.open=true;
 }
 // Timeline title + existing edit tools, presets and all original tracks.
 const lineTitle=el('div','nc14-timeline-title'),lineLabel=el('span','','Oś czasu'),lineHint=el('small','','Wybierz klip, aby zmienić jego parametry');
 lineTitle.append(lineLabel,lineHint);timeline.prepend(lineTitle);
 const trackBtn=timeline.querySelector('.nc10-toolbar button:last-child');if(trackBtn&&/Ścieżki/.test(trackBtn.textContent)){trackBtn.textContent='▦ Warstwy';}
 // Keep useful information fresh after import, playback, track selection and seeks.
 let lastInfo='';
 function sync(){
  const S=api.S,selected=S.clips.find(c=>c.id===S.selClip)||S.audioClips.find(c=>c.id===S.selAudio);
  const asset=selected?(S.assets.get(selected.assetId)||S.audioAssets.get(selected.assetId)):null;
  const current=S.clips.find(c=>S.position>=c.at&&S.position<c.at+(c.end-c.start)/(c.speed||1))||S.clips[0];
  const playback=current?S.assets.get(current.assetId):null;
  const name=playback?.name||S.assets.values().next().value?.name||'Brak filmu';
  if(vStatus.textContent!==name)vStatus.textContent=name;
  const c=$('canvas');const res=c?`${c.width} × ${c.height}`:'';
  if(size.textContent!==res)size.textContent=res;
  const title=asset?.name||'';
  const desc=selected?['Zaznaczony klip',title,'Początek',`${Number(selected.at||0).toFixed(2)} s`,'Ścieżka',selected.track===1?'V2':selected.track===0?'V1':'Audio','Prędkość',`${Number(selected.speed||1).toFixed(2)} ×`]:
    ['Projekt',projectName.value,'Filmy',String(S.assets.size),'Klipy wideo',String(S.clips.length),'Audio',String(S.audioClips.length)];
  const key=desc.join('|');if(key!==lastInfo){lastInfo=key;info.replaceChildren();for(let i=0;i<desc.length;i+=2){info.append(el('span','',desc[i]),el('strong','',desc[i+1]));}}
  inspectMeta.textContent=selected?'Klip':'Projekt';
 }
 sync();const updater=setInterval(sync,500);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
 window.NovaCapcutStyle14={sync,projectName,release(){clearInterval(updater)}};
 window.__NOVA_CAPCUT14_READY=true;
})();
