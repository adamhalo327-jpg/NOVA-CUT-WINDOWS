(()=>{
'use strict';
const select=document.getElementById('nc132Quality');
const status=document.getElementById('nc132QualityStatus');
const badge=document.getElementById('nc132QualityBadge');
const core=window.NovaUltra;
const math=window.NovaPlayerQualityEngine;
if(!select||!core||!math||!status||!badge)return;
const allowed = new Set(['auto',...Object.keys(math.HEIGHTS)]);
let mode='auto';
try{const saved=localStorage.getItem('novacut_preview_quality_132');if(allowed.has(saved))mode=saved;}catch{}
select.value=mode;
function currentAsset(){
  const S=core.S,t=S.position;
  const clips=S.clips.filter(c=>t>=c.at&&t<c.at+(c.end-c.start)/Math.max(.25,c.speed||1));
  const c=clips.find(x=>x.track===0)||clips.find(x=>x.track===1)||S.clips[0];
  return c?S.assets.get(c.assetId):S.assets.values().next().value;
}
function sourceDimensions(){const a=currentAsset(),el=a?.el;
  return {width:a?.kind==='image'?el?.naturalWidth:(el?.videoWidth||0),height:a?.kind==='image'?el?.naturalHeight:(el?.videoHeight||0),name:a?.name||'Brak pliku'};
}
function requestedHeight(){return math.HEIGHTS[mode]||0;}
function display(){
  const canvas=document.getElementById('canvas');
  const source=sourceDimensions();
  const h=canvas?.height||0,w=canvas?.width||0;
  const chosen=mode==='auto'?'AUTO':select.selectedOptions[0]?.textContent||mode;
  badge.textContent=mode==='auto'?'AUTO':`${h}p`;
  badge.title=`Rozdzielczość podglądu ${w} × ${h} px (nie dotyczy eksportu MP4)`;
  if(!source.width||!source.height){status.textContent='Jakość podglądu: '+chosen+' · Dodaj film, aby sprawdzić rozdzielczość.';return;}
  const constrained=mode!=='auto'&&h+1<requestedHeight();
  status.textContent=`Podgląd: ${w} × ${h} px${constrained?' (ograniczony do źródła)':''} · Źródło: ${source.width} × ${source.height} px · Eksport osobno`;
}
select.addEventListener('change',()=>{
  const newMode=allowed.has(select.value)?select.value:'auto';
  mode=newMode;
  try{localStorage.setItem('novacut_preview_quality_132',mode)}catch{}
  core.dimensions();display();
  core.notify('🎬 Zmieniono jakość PODGLĄDU na '+(select.selectedOptions[0]?.textContent||'Auto')+'. Eksport MP4 ma niezależne ustawienia.');
});
let lastCanvasSize='';
function refresh(){
 const canvas=document.getElementById('canvas');if(!canvas)return;
 if(mode!=='auto'){
   const a=currentAsset(),el=a?.el;
   const rawW=a?.kind==='image'?el?.naturalWidth:(el?.videoWidth||0);
   const rawH=a?.kind==='image'?el?.naturalHeight:(el?.videoHeight||0);
   const key=`${a?.id||''}:${rawW}x${rawH}:${mode}`;
   if(key!==lastCanvasSize){lastCanvasSize=key;core.dimensions()}
 }
 display();
}
window.NovaPlayerQuality={get mode(){return mode;},requestedHeight,sourceDimensions,refresh};
core.dimensions();display();
setInterval(refresh,650);
})();
