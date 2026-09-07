/* ChronoPulse browser-side security hardening. This is defense-in-depth, not a replacement for server-side validation. */
(()=>{
  'use strict';
  const ALLOWED_ORIGIN='https://singularityx228.github.io';
  const isDev=location.hostname==='localhost'||location.hostname==='127.0.0.1';

  if(!isDev && location.origin!==ALLOWED_ORIGIN){
    document.documentElement.innerHTML='<body style="background:#090d16;color:#fff;font-family:monospace;display:grid;place-items:center;height:100vh"><h1>Unauthorized origin</h1></body>';
    throw new Error('Unauthorized ChronoPulse origin');
  }

  if(window.top!==window.self){
    try{window.top.location=window.self.location.href;}catch(_){document.documentElement.innerHTML='';}
  }

  window.addEventListener('message',(event)=>{
    if(event.origin!==location.origin) event.stopImmediatePropagation();
  },true);

  window.addEventListener('securitypolicyviolation',(event)=>{
    try{console.warn('[ChronoPulse CSP]',event.violatedDirective,event.blockedURI);}catch(_){ }
  });

  const nativeSetItem=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){
    if(typeof key==='string' && key.length>256) throw new TypeError('Storage key too long');
    if(typeof value==='string' && value.length>1000000) throw new TypeError('Storage value too large');
    return nativeSetItem.call(this,key,value);
  };

  document.addEventListener('dragstart',e=>{ if(e.target && e.target.tagName==='SCRIPT') e.preventDefault(); },true);
})();
