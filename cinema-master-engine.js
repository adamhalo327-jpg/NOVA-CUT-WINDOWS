"use strict";
const fs=require('fs'),path=require('path');
function resolveLut(state,root){const name=String(state.lut||'none');
 if(name==='none')return null;
 if(name==='custom'){const p=state.lutPath;if(typeof p!=='string'||!path.isAbsolute(p)||!fs.existsSync(p)||!p.toLowerCase().endsWith('.cube'))throw Error('Wybierz istniejący plik LUT .cube.');if(fs.statSync(p).size>20e6)throw Error('Plik LUT zbyt duży (20 MB).');return p;}
 if(!['blockbuster','amber','noir','teal'].includes(name))throw Error('Nieznany profil LUT.');
 return path.join(root,'assets','luts',name+'.cube');
}
function buildCinemaFilters(state={}){let f=[];const effect=String(state.effect||'none'),strength=Math.max(0,Math.min(100,Number(state.strength)||0)),grain=Math.max(0,Math.min(70,Number(state.grain)||0));
 if(effect==='vignette')f.push(`vignette=angle=${(Math.PI/3+strength/180).toFixed(4)}`);
 else if(effect==='glow')f.push(`gblur=sigma=${(strength/45+.1).toFixed(2)}`);
 else if(effect==='film')f.push('eq=contrast=1.08:saturation=0.94');
 else if(effect==='mono')f.push('hue=s=0,eq=contrast=1.12');
 else if(effect!=='none')throw Error('Nieznany efekt kinowy.');
 if(grain>0)f.push(`noise=alls=${Math.round(grain*.35)}:allf=t+u`);
 return f;
}
module.exports={buildCinemaFilters,resolveLut};
