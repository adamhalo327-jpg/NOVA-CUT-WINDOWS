(()=>{
'use strict';
// NOVA CUT 13.2 — seek on the viewer, not just the timeline.
// Keep playback running after a seek; actual frame is redrawn on HTMLVideoElement.seeked.
const api=window.NovaUltra;
const seek=document.getElementById('seek');
const host=document.querySelector('.nc10-scrubber');
if(!api||!seek||!host)return;
const S=api.S;
seek.setAttribute('aria-label','Przewijaj film — kliknij lub przeciągnij w wybrany moment');
seek.title='Kliknij lub przeciągnij, aby przewinąć film. Odtwarzanie będzie kontynuowane.';
const delta=(seconds)=>{
  if(!S.clips.length&&!S.audioClips.length)return api.notify('Najpierw dodaj film na oś czasu.');
  api.seekTo(S.position+seconds);
};
function button(label,description,seconds){
 const b=document.createElement('button');
 b.type='button';b.className='nc132-seek-step';b.textContent=label;b.title=description;
 b.setAttribute('aria-label',description);b.onclick=()=>delta(seconds);return b;
}
const left=button('↶ 5s','Przewiń 5 sekund wstecz',-5),right=button('5s ↷','Przewiń 5 sekund do przodu',5);
const firstClock=host.querySelector('.nc10-clock');
if(firstClock)firstClock.after(left);else host.prepend(left);
seek.after(right);
// Scrub works while paused or playing and does not change the project/export profile.
const seekFromValue=()=>{const last=Math.max(0,...S.clips.map(c=>c.at+(c.end-c.start)/(c.speed||1)),...S.audioClips.map(c=>c.at+c.duration),...S.texts.map(c=>c.end),...S.stickers.map(c=>c.end),...S.sfx.map(c=>c.at+.35));if(!last)return;api.seekTo(last*Number(seek.value)/1000)};
// This supersedes the legacy slider listener (which paused playback on input).
seek.oninput=()=>{if(S.exporting)return;seekFromValue()};
seek.addEventListener('change',()=>{if(!S.exporting)seekFromValue()});
// Accessible precise jumps without hijacking text editing or keyboard shortcuts.
seek.addEventListener('keydown',e=>{
 if(e.key==='Home'){e.preventDefault();api.seekTo(0)}
 if(e.key==='End'){e.preventDefault();api.seekTo(Math.max(0,...S.clips.map(c=>c.at+(c.end-c.start)/(c.speed||1)))-.04)}
});
window.NovaPlayerSeek132={jump:delta,seekFromValue};
})();
