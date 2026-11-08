/* NOVA CUT 12.0: real local silence cutting and black-bar crop; optional HTTPS translation. */
(()=>{'use strict';const api=window.NovaUltra,el=id=>document.getElementById(id);if(!api||!el('proInspector'))return;
const S=api.S,panel=document.createElement('section');panel.id='nc12Panel';panel.innerHTML=`
<h3>🤖 AI POWER STUDIO 12.0</h3><p class="nc12-helper">Wykrywanie ciszy i kadru działa lokalnie przez FFmpeg. Grupowanie mówców ma charakter eksperymentalny. Tłumaczenie wymaga wyraźnej zgody i zewnętrznego serwera.</p>
<details open><summary>✂ Inteligentny montaż</summary>
<button id="nc12Silence" type="button">🔇 Wytnij ciszę w zaznaczonym MP4</button>
<button id="nc12Crop" type="button">▣ Automatycznie wykryj czarne pasy i dopasuj kadr</button>
<p class="nc12-helper">Cięcie ciszy dzieli tylko wybrany klip, nie przesuwa automatycznie innych ścieżek. Kadrowanie usuwa czarne pasy, ale nie śledzi twarzy.</p></details>
<details><summary>🎙 Mówcy i animowane napisy</summary>
<button id="nc12Speakers" type="button">🎙 Zasugeruj mówców dla wybranych napisów</button>
<div class="nc12-grid"><label>Animacja napisów<select id="nc12CaptionAnim"><option value="fade">Pojawianie</option><option value="pop">Wyskakiwanie</option><option value="slide">Wjazd od dołu</option><option value="type">Pisanie</option><option value="none">Brak</option></select></label>
<label>Styl napisów<select id="nc12CaptionStyle"><option value="box">Tło kinowe</option><option value="outline">Kontur</option><option value="shadow">Cień</option><option value="neon">Neon</option></select></label></div>
<button id="nc12ApplyCaptions" type="button">✨ Zastosuj animację do napisów</button>
<p class="nc12-helper">Animacje działają w podglądzie oraz eksporcie przeglądarkowym; natywny MP4 obecnie zachowuje edytowalną, przełączalną ścieżkę napisów bez animacji.</p></details>
<details><summary>🌍 Automatyczne tłumaczenie napisów</summary>
<label>Adres zgodnego serwera LibreTranslate (HTTPS lub lokalny 127.0.0.1)<input id="nc12Endpoint" placeholder="https://twoj-serwer.example/translate" type="url" autocomplete="off"></label>
<div class="nc12-grid"><label>Język źródłowy<select id="nc12Source"><option value="auto">Automatycznie</option><option value="pl">Polski</option><option value="en">Angielski</option><option value="de">Niemiecki</option><option value="es">Hiszpański</option></select></label>
<label>Przetłumacz na<select id="nc12Target"><option value="en">Angielski</option><option value="pl">Polski</option><option value="de">Niemiecki</option><option value="es">Hiszpański</option><option value="fr">Francuski</option></select></label></div>
<label style="display:flex;align-items:center;gap:8px;flex-direction:row"><input id="nc12Consent" type="checkbox" style="width:auto">Wyrażam zgodę na przesłanie tekstów napisów do wskazanego serwera.</label>
<button id="nc12Translate" type="button">🌍 Przetłumacz napisy (wymaga serwera)</button>
<p class="nc12-helper">Nie wysyłamy całego filmu; tylko teksty napisów. Serwer musi być skonfigurowany przez użytkownika. Oryginał można odzyskać przez projekt JSON.</p></details>
<div id="nc12Status" role="status">Gotowe do pracy. Najpierw zaznacz MP4 na osi czasu.</div>`;
const parent=el('proToolsPane');parent.prepend(panel);
const status=s=>{el('nc12Status').textContent=s;};
function selected(){return S.clips.find(c=>c.id===S.selClip)||null;}
function source(clip){return clip&&S.assets.get(clip.assetId)}
const activeSource=()=>{const clip=selected(),a=source(clip);if(!clip||!a||a.kind!=='video'||!a.desktopPath){status('Zaznacz na osi czasu film MP4 zaimportowany z Windows.');return null;}if(!window.NovaDesktop){status('Ta funkcja wymaga aplikacji Windows z FFmpeg.');return null;}return {clip,a}};
let busy=false;async function withBusy(fn){if(busy)return;busy=true;for(const b of panel.querySelectorAll('button'))b.disabled=true;try{await fn()}catch(e){status('Błąd: '+String(e.message||e))}finally{busy=false;for(const b of panel.querySelectorAll('button'))b.disabled=false}}
el('nc12Silence').onclick=()=>withBusy(async()=>{const src=activeSource();if(!src)return;status('Wykrywam ciszę na ścieżce MP4…');const data=await window.NovaDesktop.analyzeMedia({filePath:src.a.desktopPath,mode:'silence'});if(!data.ok)throw Error(data.error);
const parts=window.NovaAI12?.silenceSplit?.(src.clip,data.result.intervals)||[];if(parts.length<=1)return status('Nie znaleziono ciszy pozwalającej na bezpieczne podzielenie klipu.');if(parts.length>150)throw Error('Za dużo cięć.');
if(!confirm(`Wykryto ${parts.length} fragmentów mowy. Podzielić zaznaczony klip i usunąć ciszę? Inne ścieżki nie będą przesuwane.`))return status('Anulowano.');
const i=S.clips.indexOf(src.clip);S.clips.splice(i,1,...parts);S.selClip=parts[0].id;api.renderAll();window.NovaStudio8?.saveProject?.(false);status('Usunięto wykryte cisze; pozostało '+parts.length+' fragmentów. Pozostałe ścieżki zachowano.');});
el('nc12Crop').onclick=()=>withBusy(async()=>{const src=activeSource();if(!src)return;status('Analizuję czarne pasy w kadrze…');const data=await window.NovaDesktop.detectCrop({filePath:src.a.desktopPath,startSeconds:Math.max(0,Number(src.clip.start)||0)});if(!data?.ok)throw Error(data?.error||'Brak kadru.');if(!data.crop)return status('Nie wykryto czarnych pasów; materiał pozostaje bez zmian.');src.clip.crop=data.crop;api.renderAll();window.NovaStudio8?.saveProject?.(false);status('Kadr: '+data.crop.width+' × '+data.crop.height+' (x='+data.crop.x+', y='+data.crop.y+'). Oryginał pozostaje bez zmian; FFmpeg zastosuje crop przy eksporcie.');});
el('nc12Speakers').onclick=()=>withBusy(async()=>{const src=activeSource();if(!src)return;const captions=S.texts.filter(t=>t.autoGenerated&&t.sourceClipId===src.clip.id);if(!captions.length)return status('Najpierw wygeneruj napisy z zaznaczonego MP4.');status('Wstępnie grupuję głosy na podstawie cech nagrania…');
const req=captions.map(c=>({start:Number(src.clip.start)+(c.start-src.clip.at)*src.clip.speed,end:Number(src.clip.start)+(c.end-src.clip.at)*src.clip.speed}));const r=await window.NovaDesktop.suggestSpeakers({filePath:src.a.desktopPath,segments:req});if(!r.ok)throw Error(r.error);for(let i=0;i<captions.length;i++){captions[i].speaker=r.speakers[i]||'Mówca 1';}
api.renderAll();status('Wstępnie przypisano mówców do '+captions.length+' fragmentów. To heurystyka głosu, sprawdź i popraw oznaczenia ręcznie.');});
el('nc12ApplyCaptions').onclick=()=>{const captions=S.texts.filter(t=>t.autoGenerated);if(!captions.length)return status('Brak automatycznych napisów na osi czasu.');for(const t of captions){t.animation=el('nc12CaptionAnim').value;t.style=el('nc12CaptionStyle').value;}api.renderAll();status('Ustawiono animację i styl dla '+captions.length+' napisów. Natywne MP4: napisy bez animacji.');};
el('nc12Translate').onclick=()=>withBusy(async()=>{if(!el('nc12Consent').checked)return status('Wymagana zgoda na wysłanie tekstów do wybranego serwera.');if(!window.NovaDesktop?.translateCaptions)return status('Tłumaczenie wymaga Windows.');const captions=S.texts.filter(t=>t.text);if(!captions.length)return status('Najpierw dodaj napisy.');if(!confirm('Teksty '+captions.length+' napisów zostaną przesłane do podanego serwera. Kontynuować?'))return;
status('Trwa tłumaczenie…');const r=await window.NovaDesktop.translateCaptions({url:el('nc12Endpoint').value,source:el('nc12Source').value,target:el('nc12Target').value,texts:captions.map(x=>x.text)});if(!r?.ok)throw Error(r.error);if(r.texts?.length!==captions.length)throw Error('Serwer zwrócił niewłaściwą liczbę napisów.');captions.forEach((c,i)=>{c.originalText??=c.text;c.text=r.texts[i]});api.renderAll();window.NovaStudio8?.saveProject?.(false);status('Przetłumaczono '+captions.length+' napisów. Zapisz projekt, aby zachować wynik.');});
window.NovaAI12=Object.freeze({silenceSplit:(clip,intervals)=>{
 if(!clip||!Number.isFinite(Number(clip.start))||!Number.isFinite(Number(clip.end)))return [];
 const start=Number(clip.start),end=Number(clip.end),speed=Math.max(.25,Math.min(4,Number(clip.speed)||1));let parts=[[start,end]];
 for(const x of [...(intervals||[])].sort((a,b)=>a.start-b.start)){const a=Math.max(start,Number(x.start)||0),b=Math.min(end,Number(x.end)||end);if(b-a<.45)continue;parts=parts.flatMap(([p,q])=>b<=p||a>=q?[[p,q]]:[[p,Math.max(p,a)],[Math.min(q,b),q]].filter(([u,v])=>v-u>.18));}
 let at=Number(clip.at)||0;return parts.map(([u,v],i)=>{const n={...clip,id:clip.id+'-ai12-'+i,start:u,end:v,at};at+=(v-u)/speed;return n;});
}});window.__NOVA_AI12_READY=true;
})();
