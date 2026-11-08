/* NOVA CUT 8.3 — QUALITY INSPECTOR PRO. Only real metadata; never a quality-upscaling claim. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const choose=$('qualityChoose'),last=$('qualityLast'),fileInput=$('qualityFileInput');
 const status=$('qualityStatus'),results=$('qualityResults');
 if(!choose||!last||!fileInput||!status||!results)return;
 const desktop=!!window.NovaDesktop?.inspectMedia;
 const text=(a,b)=>{
   const key=document.createElement('div'),value=document.createElement('div');
   key.className='quality-key';value.className='quality-value';key.textContent=a;value.textContent=b??'—';
   return [key,value];
 };
 const bytes=n=>Number.isFinite(Number(n))&&n>=0?`${(Number(n)/1048576).toLocaleString('pl-PL',{maximumFractionDigits:2})} MiB`:'—';
 const seconds=n=>Number.isFinite(Number(n))&&n>0?`${Number(n).toLocaleString('pl-PL',{maximumFractionDigits:2})} s`:'—';
 const setStatus=(message,kind='info')=>{status.textContent=message;status.dataset.kind=kind};
 function display(info){
   results.replaceChildren();
   const badge=document.createElement('div');badge.className='quality-badge';badge.textContent=info.quality||'Nieznana rozdzielczość';
   const file=document.createElement('div');file.className='quality-file';file.textContent=info.name||'Plik bez nazwy';
   const grid=document.createElement('div');grid.className='quality-grid';
   const rows=[
     ['Rozdzielczość',info.resolution],['Liczba klatek / FPS',info.fps?`${info.fps} FPS`:'Niedostępne'],
     ['Kodek wideo',info.videoCodec||'Niedostępne'],['Bitrate całkowity',info.bitrateMbps!=null?`${info.bitrateMbps} Mb/s`:'Niedostępne'],
     ['Czas trwania',seconds(info.durationSeconds)],['Wielkość pliku',bytes(info.fileSizeBytes)],
     ['Kontener',info.format||'Niedostępne'],['Kodek audio',info.audioCodec||'Brak / niedostępne'],
     ['Kanały audio',info.audioChannels?String(info.audioChannels):'Brak / niedostępne'],
     ['Audio Hz',info.audioSampleRate?`${info.audioSampleRate} Hz`:'Brak / niedostępne'],
     ['HDR (PQ/HLG)',info.hdr==null?'Niedostępne':info.hdr?'Tak':'Nie'],
     ['Metoda',info.source||'Nieznana']
   ];
   rows.forEach(([a,b])=>grid.append(...text(a,b)));
   results.append(badge,file,grid);
   results.classList.remove('hide');
   setStatus('✓ Analiza gotowa. To rzeczywiste parametry zapisane w pliku.', 'success');
 }
 async function runDesktop(mode){
   setStatus('Analizuję film lokalnie przez FFprobe…');
   choose.disabled=last.disabled=true;
   try {
     const r=await window.NovaDesktop.inspectMedia(mode);
     if(r?.cancelled){setStatus('Nie wybrano pliku.');return;}
     if(!r?.ok)throw Error(r?.error||'Nieznany błąd analizy.');
     display(r.info);
   }catch(e){setStatus('Nie udało się zbadać filmu: '+e.message,'error');}
   finally{choose.disabled=false;last.disabled=false;}
 }
 function inspectBrowser(file){
   if(!file)return;
   setStatus('Odczytuję podstawowe informacje w przeglądarce…');
   const url=URL.createObjectURL(file),video=document.createElement('video');
   let complete=false;
   const cleanup=()=>{URL.revokeObjectURL(url);video.removeAttribute('src');video.load();};
   const done=(error)=>{if(complete)return;complete=true;if(error){setStatus('Przeglądarka nie odczytała tego filmu. Użyj Windows EXE z FFprobe.','error');}else{
     const w=video.videoWidth,h=video.videoHeight;
     let quality='Niższa rozdzielczość';
     const edge=Math.max(w,h);
     if(edge>=9600)quality='10K lub więcej';else if(edge>=7680)quality='8K';else if(edge>=5760)quality='6K';else if(edge>=3840)quality='4K';else if(edge>=2560)quality='2K / QHD';else if(edge>=1920)quality='Full HD';else if(edge>=1280)quality='HD';
     display({name:file.name,resolution:`${w} × ${h}`,quality,durationSeconds:video.duration,fileSizeBytes:file.size,source:'Przeglądarka — analiza ograniczona',fps:null,videoCodec:null,bitrateMbps:null,format:file.type||'Nieznany',hdr:null});
     setStatus('Ograniczony odczyt w przeglądarce. Pełne dane FPS / kodeka / bitrate sprawdzisz w EXE Windows.','success');
   }cleanup()};
   video.preload='metadata';video.onloadedmetadata=()=>done(false);video.onerror=()=>done(true);video.src=url;
 }
 if(desktop){
   choose.onclick=()=>runDesktop('choose');last.onclick=()=>runDesktop('last');
 }else{
   choose.onclick=()=>fileInput.click();
   last.disabled=true;last.title='Dostępne w aplikacji Windows z FFprobe.';
 }
 fileInput.onchange=()=>{const file=fileInput.files?.[0];if(file)inspectBrowser(file);fileInput.value='';};
 window.NovaQualityInspector={inspectLast:()=>desktop?runDesktop('last'):null,open:()=>{$('proTabQuality')?.click();}};
})();
