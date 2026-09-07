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

  // Deterrent against common browser inspection/devtools shortcuts. This cannot
  // provide real secrecy: users can always disable JS or inspect network/source.
  document.addEventListener('keydown',(e)=>{
    const k=String(e.key||'').toLowerCase();
    const blocked=e.key==='F12'||
      (e.ctrlKey&&e.shiftKey&&['i','j','c','k','m','s','e'].includes(k))||
      (e.ctrlKey&&['u','s','p'].includes(k))||
      (e.metaKey&&e.altKey&&['i','j','c','u'].includes(k));
    if(blocked){e.preventDefault();e.stopImmediatePropagation();return false;}
  },true);

  ['contextmenu','selectstart','dragstart'].forEach(type=>{
    document.addEventListener(type,e=>{e.preventDefault();e.stopImmediatePropagation();},true);
  });
})();
