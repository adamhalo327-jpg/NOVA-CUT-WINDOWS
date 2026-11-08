"use strict";const assert=require('assert'),fs=require('fs'),path=require('path');const eng=require('../ai-power-engine');
assert.equal(eng.translationUrl('https://example.com').pathname,'/translate');assert.throws(()=>eng.translationUrl('http://external.example.com'));assert.equal(eng.translationUrl('http://127.0.0.1:5000/translate').protocol,'http:');
const cli=fs.readFileSync(path.join(__dirname,'../app/ai12.js'),'utf8');for(const token of ['nc12Silence','nc12Crop','nc12Speakers','nc12Translate','silenceSplit','nc12CaptionAnim'])assert(cli.includes(token));
const ren=fs.readFileSync(path.join(__dirname,'../native-renderer.js'),'utf8');assert(ren.includes('crop=${cw}:${ch}:${cx}:${cy}'));
console.log('✓ 12.0 AI: consent-based translation, speaker suggestions, silence cuts, crop, animated caption UI');
