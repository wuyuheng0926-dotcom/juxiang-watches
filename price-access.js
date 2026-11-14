
(() => {
'use strict';
const API='https://juxiang-render-admin.fleecycroissant1.chatgpt.site';
let session=null,deadline=0,timer=null,poll=null,working=false;
const normalizeKey=value=>String(value||'').normalize('NFKC').replace(/[\u200b-\u200d\ufeff\s]/g,'').replace(/[\u2010-\u2015\u2212\uff0d]/g,'-').toUpperCase();
const isKey=value=>/^JXK(?:-|$)/.test(normalizeKey(value));
const pendingStorage='jx.price-pending.v1';
let pendingMemory=null;
async function pendingProof(code){
 const bytes=new TextEncoder().encode(code),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
 let p=pendingMemory;try{p=JSON.parse(sessionStorage.getItem(pendingStorage)||'null')||p}catch{}
 if(p?.keyHash===hash&&/^[a-f0-9]{64}$/.test(p.token))return p.token;
 const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');
 pendingMemory={keyHash:hash,token};try{sessionStorage.setItem(pendingStorage,JSON.stringify(pendingMemory))}catch{}return token;
}
function clearPending(){pendingMemory=null;try{sessionStorage.removeItem(pendingStorage)}catch{}}
const valid=()=>!!session&&Date.now()<deadline;
const storageKey='jx.price-access.v1';
const status=document.createElement('p');status.id='priceAccessStatus';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.hidden=true;status.style.cssText='margin:8px 0;color:inherit;font:13px/1.7 system-ui';
document.getElementById('catalogSearch').append(status);
function message(text){status.textContent=text;status.hidden=!text}
function paint(){if(!valid()){status.hidden=true;status.textContent='';return;}const minutes=Math.max(1,Math.ceil((deadline-Date.now())/60000));message('Prices unlocked · '+minutes+' min remaining / 价格已解锁，剩余约 '+minutes+' 分钟');}
function update(prices){for(const p of products)p.priceUSD=valid()&&Number.isFinite(prices?.[p.id])?prices[p.id]:null;window.dispatchEvent(new Event('jx-prices-change'));paint()}
function lock(text){session=null;deadline=0;clearTimeout(timer);clearInterval(poll);try{sessionStorage.removeItem(storageKey)}catch{}update({});if(text)message(text)}
function accept(data,token){session={token,expiresAt:data.expiresAt};deadline=Date.now()+Math.max(0,data.expiresAt-data.serverNow);try{sessionStorage.setItem(storageKey,JSON.stringify(session))}catch{}clearTimeout(timer);timer=setTimeout(()=>lock('Price access expired. Contact us for a new key. / 查看权限已到期，请联系客服获取新密钥。'),Math.max(0,deadline-Date.now()));update(data.prices);clearInterval(poll);poll=setInterval(()=>{paint();if(document.visibilityState!=='hidden')refresh()},60000)}
async function request(path,options={}){
 let last;
 const routes=['/price-api'+path.replace(/^\/api/,''),API+path];
 for(let i=0;i<routes.length;i++){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),i===0?12000:10000);
  try{
   const r=await fetch(routes[i],{credentials:'omit',cache:'no-store',...options,signal:controller.signal});
   const text=await r.text();let data;try{data=JSON.parse(text)}catch{const e=Error('Invalid verification response');e.status=r.status>=400?r.status:502;throw e}
   if(!r.ok){const e=Error(data.error||'Unable to verify price access');e.status=r.status;throw e}
   return data;
  }catch(e){last=e;if(e.status&&![404,405,408,500,502,503,504].includes(e.status))throw e;}
  finally{clearTimeout(timeout)}
 }
 throw last||Error('Verification unavailable');
}
async function refresh(){if(!session)return;if(!valid()){lock('Price access expired / 价格查看权限已到期');return}try{const token=session.token;const data=await request('/api/session',{method:'POST',headers:{'content-type':'text/plain;charset=UTF-8'},body:JSON.stringify({token})});if(session?.token===token)accept(data,token)}catch(e){if(e.status===401)lock(e.message);else message('Connection unavailable; access still expires automatically. / 连接暂时不可用，现有查看权限仍会按时到期。')}}
async function redeem(code){
 if(working)return false;working=true;message('Checking price key… / 正在验证价格密钥…');
 try{
  const normalized=normalizeKey(code);const token=await pendingProof(normalized);
  const data=await request('/api/redeem',{method:'POST',headers:{'content-type':'text/plain;charset=UTF-8'},body:JSON.stringify({code:normalized,token})});
  accept(data,data.token);clearPending();return true;
 }catch(e){
  if([400,403].includes(e.status))clearPending();
  message(e.status?e.message:'Connection failed. Tap Search to retry the same key. / 验证连接暂时失败，请点击搜索重试同一密钥。');
  return false;
 }finally{working=false}
}
async function restore(){let saved;try{saved=JSON.parse(sessionStorage.getItem(storageKey)||'null')}catch{}if(!saved?.token||!/^[a-f0-9]{64}$/.test(saved.token)){lock();return}session=saved;deadline=saved.expiresAt;await refresh()}
window.JXPriceAccess={isKey,valid,redeem,lock,refresh};
window.addEventListener('pageshow',()=>{if(session)refresh();else update({})});document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='hidden'){if(valid())refresh();else lock()}});
restore();
})();
