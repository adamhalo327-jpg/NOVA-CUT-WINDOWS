'use strict';
const path=require('node:path');
function safeTitle(value){let title=String(value||'').normalize('NFC').replace(/[<>:"/\\|?*\x00-\x1F\x7F]/g,'-').replace(/\s+/g,' ').trim();title=title.replace(/\.(mp4|webm|mov|mkv)$/i,'').replace(/[. ]+$/g,'');if(/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(title))title='film-'+title;return title.slice(0,90).replace(/[. ]+$/g,'');}
function suggestedExportName(input,quality='1080p'){const title=safeTitle(input)||'NOVA-CUT-13.1-'+safeTitle(quality||'1080p');return title+'.mp4';}
module.exports={safeTitle,suggestedExportName};
