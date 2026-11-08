"use strict";const assert=require('assert'),fs=require('fs'),p=require('path');const e=require('../cinema-master-engine');
assert.deepEqual(e.buildCinemaFilters({effect:'none'}),[]);
assert(e.buildCinemaFilters({effect:'film',grain:42}).some(s=>s.includes('noise=')));
for(const n of ['blockbuster','amber','noir','teal']){const f=e.resolveLut({lut:n},p.join(__dirname,'..'));assert(fs.existsSync(f));assert(fs.readFileSync(f,'ascii').includes('LUT_3D_SIZE 17'));}
assert.throws(()=>e.resolveLut({lut:'../../hacked'},'foo'));const x=fs.readFileSync(p.join(__dirname,'../native-renderer.js'),'utf8');assert(x.includes('deshake=rx=16'));assert(x.includes('lut3d=file=cinema11.cube'));assert(x.includes('extra.length||lut'));console.log('✓ 11.0 Cinema Master: LUT, stabilized video, color FX, grain, native renderer');
