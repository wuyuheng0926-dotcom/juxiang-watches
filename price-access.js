
(() => {
'use strict';
const API='https://juxiang-render-admin.fleecycroissant1.chatgpt.site';
let session=null,deadline=0,timer=null,poll=null,working=false;
const isKey=value=>/^JXK(?:-|$)/i.test(String(value).trim());
const valid=()=>!!session&&Date.now()<deadline;
const storageKey='jx.price-access.v1';
const status=document.createElement('div');status.id='priceAccessStatus';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.style.cssText='margin:12px 0;padding:12px 14px;border:1px solid #bba36380;background:#174b3b;color:#f4e8c9;font:13px/1.7 system-ui;border-radius:5px';
document.getElementById('catalogSearch').append(status);
function message(text){status.textContent=text}
function paint(){if(!valid()){status.replaceChildren();const a=document.createElement('a');a.href=siteSettings.contactUrl;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Contact us for a one-time price key / 联系客服获取一次性价格密钥';a.style.color='inherit';status.append(a);return;}const minutes=Math.max(1,Math.ceil((deadline-Date.now())/60000));message('Prices unlocked · '+minutes+' min remaining / 价格已解锁，剩余约 '+minutes+' 分钟');}
function update(prices){for(const p of products)p.priceUSD=valid()&&Number.isFinite(prices?.[p.id])?prices[p.id]:null;window.dispatchEvent(new Event('jx-prices-change'));paint()}
function lock(text){session=null;deadline=0;clearTimeout(timer);clearInterval(poll);try{sessionStorage.removeItem(storageKey)}catch{}update({});if(text)message(text)}
function accept(data,token){session={token,expiresAt:data.expiresAt};deadline=Date.now()+Math.max(0,data.expiresAt-data.serverNow);try{sessionStorage.setItem(storageKey,JSON.stringify(session))}catch{}clearTimeout(timer);timer=setTimeout(()=>lock('Price access expired. Contact us for a new key. / 查看权限已到期，请联系客服获取新密钥。'),Math.max(0,deadline-Date.now()));update(data.prices);clearInterval(poll);poll=setInterval(()=>{paint();if(document.visibilityState!=='hidden')refresh()},60000)}
async function request(path,options={}){const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);let r;try{r=await fetch(API+path,{credentials:'omit',cache:'no-store',...options,signal:controller.signal})}finally{clearTimeout(timeout)}const data=await r.json();if(!r.ok){const e=Error(data.error||'Unable to unlock prices / 无法解锁价格');e.status=r.status;throw e}return data}
async function refresh(){if(!session)return;if(!valid()){lock('Price access expired / 价格查看权限已到期');return}try{const token=session.token;const data=await request('/api/prices',{headers:{Authorization:'Bearer '+token}});if(session?.token===token)accept(data,token)}catch(e){if(e.status===401)lock(e.message);else message('Connection unavailable; access still expires automatically. / 连接暂时不可用，现有查看权限仍会按时到期。')}}
async function redeem(code){if(working)return false;working=true;message('Checking price key… / 正在验证价格密钥…');try{const data=await request('/api/redeem',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code:String(code).trim()})});accept(data,data.token);return true}catch(e){message(e.name==='AbortError'?'Connection timed out. Please retry. / 连接超时，请重试。':e.message);return false}finally{working=false}}
async function restore(){let saved;try{saved=JSON.parse(sessionStorage.getItem(storageKey)||'null')}catch{}if(!saved?.token||!/^[a-f0-9]{64}$/.test(saved.token)){lock();return}session=saved;deadline=saved.expiresAt;await refresh()}
window.JXPriceAccess={isKey,valid,redeem,lock,refresh};
window.addEventListener('pageshow',()=>{if(session)refresh();else update({})});document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='hidden'){if(valid())refresh();else lock()}});
restore();
})();
