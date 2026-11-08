/* Optional audio processing for NOVA CUT 9.0 FFmpeg. Defaults are inert. */
'use strict';
const AUDIO_MODES=new Set(['off','voice','music']);
function getAudioFilter(mode){
 if(!AUDIO_MODES.has(mode))throw Error('Niepoprawny tryb oczyszczania audio.');
 if(mode==='voice')return 'highpass=f=85,lowpass=f=10500,afftdn=nf=-48:nr=12';
 if(mode==='music')return 'afftdn=nf=-55:nr=8';
 return '';
}
module.exports={getAudioFilter,AUDIO_MODES};
