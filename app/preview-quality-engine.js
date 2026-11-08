(function(root, factory){
  const engine = factory();
  if (typeof module === 'object' && module.exports) module.exports = engine;
  root.NovaPlayerQualityEngine = engine;
})(typeof window !== 'undefined' ? window : globalThis, function(){
  'use strict';
  const HEIGHTS = Object.freeze({p240:240,p360:360,p480:480,p720:720,p1080:1080,p1440:1440,p2160:2160,p4320:4320,p5400:5400});
  function evenFloor(value){return Math.max(2, Math.floor(value / 2) * 2);}
  function calculate(mode, aspectW, aspectH, sourceW, sourceH){
    if (!Object.prototype.hasOwnProperty.call(HEIGHTS, mode)) return null;
    const ratio = Number(aspectW) / Number(aspectH);
    const sw = Number(sourceW), sh = Number(sourceH);
    if (!Number.isFinite(ratio)||ratio<=0||!Number.isFinite(sw)||!Number.isFinite(sh)||sw<=0||sh<=0) return null;
    // Jakość menu dotyczy tylko płótna podglądu — nie kodeka ani eksportu.
    // Rozmiar nie może przekroczyć rozdzielczości źródła ani budżetu 10K.
    const requested=HEIGHTS[mode];
    const maxSourceHeight=Math.min(sh,sw/ratio);
    const maxCanvasWidth=requested*16/9;
    const maxCanvasPixels=54_000_000; // RGBA 10K: około 198 MiB bez kopii GPU.
    const height=evenFloor(Math.min(requested,maxSourceHeight,maxCanvasWidth/ratio,Math.sqrt(maxCanvasPixels/ratio)));
    const width=evenFloor(height*ratio);
    const constrainedBySource=maxSourceHeight+1<requested;
    const constrainedByBudget=height+1<requested&&!constrainedBySource;
    return {width,height,requested,sourceWidth:Math.round(sw),sourceHeight:Math.round(sh),limited:height+1<requested,reason:constrainedBySource?'source':constrainedByBudget?'canvas':'none',approxRgbaMiB:Math.round(width*height*4/1048576)};
  }
  return {HEIGHTS,calculate};
});
