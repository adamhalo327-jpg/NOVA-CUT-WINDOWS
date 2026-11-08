/* NOVA CUT 9.0 - saved readability preference; UI presentation only. */
(()=>{'use strict';
 const select=document.getElementById('nc9UISize');if(!select)return;
 const choices=new Set(['normal','comfortable','large']);const key='nova9-ui-size';
 const apply=value=>{const mode=choices.has(value)?value:'comfortable';document.body.dataset.nc9Ui=mode;select.value=mode;try{localStorage.setItem(key,mode)}catch{}return mode};
 let prior='comfortable';try{prior=localStorage.getItem(key)||'comfortable'}catch{}
 apply(prior);select.addEventListener('change',()=>apply(select.value));
 window.NovaCutReadability=Object.freeze({apply,get:()=>document.body.dataset.nc9Ui});
})();
