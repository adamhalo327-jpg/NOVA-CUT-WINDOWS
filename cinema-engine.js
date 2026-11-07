"use strict";
// NOVA CUT ULTRA CINEMA. Cinema-inspired proportions, not IMAX-certified.
const RATIOS=Object.freeze({'1.43:1':1.43,'1.90:1':1.90});
const WIDTHS=Object.freeze({standard:1280,high:1920,qhd:2560,uhd:3840,sixk:5760,eightk:7680,tenk:9600});
const even=value=>Math.max(2,Math.round(value/2)*2);
function cinemaDimensions(quality,ratio){
  if(!Object.hasOwn(RATIOS,ratio))return null;
  if(!Object.hasOwn(WIDTHS,quality))throw Error('Nieznany profil rozdzielczości kinowej.');
  const width=WIDTHS[quality],height=even(width/RATIOS[ratio]);
  return {width,height,ratio,quality,pixels:width*height};
}
const LOOKS=Object.freeze({
  natural:'',
  blockbuster:'eq=contrast=1.100:saturation=0.900:brightness=-0.014,colorbalance=rs=-0.025:bs=0.055',
  golden:'eq=contrast=1.055:saturation=1.115,colorbalance=rs=0.055:bs=-0.045',
  monochrome:'hue=s=0,eq=contrast=1.170:brightness=-0.013'
});
function cinemaLookFilter(look){if(!Object.hasOwn(LOOKS,look))throw Error('Nieznany kinowy preset kolorów.');return LOOKS[look]}
function cinemaAudioSettings(sound){if(sound==='studio')return {bitrate:'320k',sampleRate:48000,channels:2,label:'AAC Stereo 48 kHz / 320 kbps'};
  if(sound==='standard'||sound===undefined||sound===null)return {bitrate:'192k',sampleRate:48000,channels:2,label:'AAC Stereo 48 kHz / 192 kbps'};
  throw Error('Nieznane ustawienie kinowego audio.');}
module.exports={RATIOS,WIDTHS,cinemaDimensions,cinemaLookFilter,cinemaAudioSettings};
