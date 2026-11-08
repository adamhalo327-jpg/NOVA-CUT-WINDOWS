(function(root, factory){
  const engine = factory();
  if (typeof module === 'object' && module.exports) module.exports = engine;
  root.NovaPlayerQualityEngine = engine;
})(typeof window !== 'undefined' ? window : globalThis, function(){
  'use strict';
  const HEIGHTS = Object.freeze({p240:240,p360:360,p480:480,p720:720,p1080:1080,p1440:1440,p2160:2160});
  function evenFloor(value){return Math.max(2, Math.floor(value / 2) * 2);}
  function calculate(mode, aspectW, aspectH, sourceW, sourceH){
    if (!Object.prototype.hasOwnProperty.call(HEIGHTS, mode)) return null;
    const ratio = Number(aspectW) / Number(aspectH);
    const sw = Number(sourceW), sh = Number(sourceH);
    if (!Number.isFinite(ratio)||ratio<=0||!Number.isFinite(sw)||!Number.isFinite(sh)||sw<=0||sh<=0) return null;
    // Nigdy nie zwiększaj liczby pikseli ponad materiał źródłowy.
    const maxHeightFromSource = Math.min(sh,sw/ratio);
    const height = evenFloor(Math.min(HEIGHTS[mode],maxHeightFromSource,2160));
    const width = evenFloor(height*ratio);
    return {width,height,requested:HEIGHTS[mode],sourceWidth:Math.round(sw),sourceHeight:Math.round(sh),limited:height+1<HEIGHTS[mode]};
  }
  return {HEIGHTS,calculate};
});
