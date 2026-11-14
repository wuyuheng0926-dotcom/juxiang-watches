
(() => {
'use strict';
const BACKEND='https://juxiang-render-admin.fleecycroissant1.chatgpt.site';
window.JXAssetUrl=id=>id?.startsWith('admin-')?BACKEND+'/media/'+encodeURIComponent(id)+'.jpg':'/assets/'+encodeURIComponent(id)+'.jpg';
window.JUXIANG_CATALOGUE_READY=false;
const errorBox=document.createElement('div');errorBox.setAttribute('role','status');errorBox.style.cssText='position:fixed;bottom:20px;left:20px;right:20px;z-index:9999;background:#123e32;color:#fff6d9;padding:18px;border:1px solid #c0a86b;border-radius:8px;text-align:center';
errorBox.textContent='Updating the collection… / 正在读取最新商品…';document.body.append(errorBox);
function merge(p,o){if(!o)return p;const variants=p.variants.map(v=>({...v,...(o.variants.find(x=>x.key===v.key)||{})}));for(const v of o.variants)if(!variants.some(x=>x.key===v.key))variants.push(v);return {...p,...o,variants}}
function apply(snapshot){
 if(snapshot.schema!==1||!Array.isArray(snapshot.products))throw Error('Invalid catalogue');
 const patches=new Map(snapshot.products.map(x=>[x.id,x.data]));
 const next=products.map(p=>merge(p,patches.get(p.id))).map(p=>({...p,priceUSD:null,variants:p.variants.filter(v=>!v.adminDeleted&&!v.adminUnpublished)})).filter(p=>p.variants.length);
 products.splice(0,products.length,...next);
 const track=document.querySelector('.hero-track'),dots=document.querySelector('.hero-dots');
 if(track){const choices=[];for(const slide of [...track.children]){const link=slide.querySelector('a'),p=products.find(p=>p.id===slide.dataset.product);if(!p)continue;const v=p.variants.find(v=>v.key===link.dataset.color&&!v.catalogHidden)||p.variants.find(v=>!v.catalogHidden);if(p&&v&&!choices.some(x=>x.p.id===p.id))choices.push({p,v});}
 for(const p of products){if(choices.length>=10)break;if(choices.some(x=>x.p.id===p.id))continue;const v=p.variants.find(v=>!v.catalogHidden);if(v)choices.push({p,v});}
 const template=track.firstElementChild?.cloneNode(true);track.replaceChildren();dots?.replaceChildren();
 choices.forEach(({p,v},i)=>{const s=template.cloneNode(true);s.dataset.product=p.id;s.setAttribute('aria-label',(i+1)+' of '+choices.length);const a=s.querySelector('a');a.dataset.heroProduct=p.id;a.dataset.color=v.key;a.href='/?design='+p.id+'&color='+v.key;a.setAttribute('aria-label',p.brand+' · '+p.family+' — View details');const image=a.querySelector('img');image.src=window.JXAssetUrl(v.image);image.alt=p.brand+' '+p.family;a.querySelector('strong').textContent=p.brand+' · '+(p.baseFamily||p.family);track.append(s);if(dots){const b=document.createElement('button');b.type='button';b.dataset.slide=String(i);b.setAttribute('aria-label','Show photograph '+(i+1));b.setAttribute('aria-pressed',String(i===0));dots.append(b)}});
 if(!choices.length)document.getElementById('heroCarousel').hidden=true;
 }
 window.JUXIANG_CATALOGUE_READY=true;window.JUXIANG_CATALOGUE_SEQUENCE=snapshot.sequence;
}
const urls=JSON.parse(document.getElementById('catalogue-scripts').textContent);
async function scripts(){for(const src of urls){if(src.startsWith('featured-carousel')&&!document.querySelector('.hero-track')?.children.length)continue;await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=()=>reject(Error('Script unavailable'));document.body.append(s)})}}
async function start(){try{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),18000);let r;try{r=await fetch(BACKEND+'/api/public',{cache:'no-store',credentials:'omit',signal:controller.signal})}finally{clearTimeout(timer)}if(!r.ok)throw Error('Catalogue unavailable');apply(await r.json());await scripts();errorBox.remove();}catch(e){errorBox.replaceChildren();const span=document.createElement('span');span.textContent='Collection temporarily unavailable. Please retry. / 商品目录暂时未能加载，请重试。 ';const button=document.createElement('button');button.textContent='Retry / 重试';button.style.cssText='padding:8px 16px;background:#d5c08b;color:#123e32;border:0;cursor:pointer';button.onclick=()=>location.reload();errorBox.append(span,button);console.error('Catalogue loading failed',e.name);}}
start();
})();
