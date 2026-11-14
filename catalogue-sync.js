
(() => {
'use strict';
const BACKEND='https://juxiang-render-admin.fleecycroissant1.chatgpt.site';
window.JXAssetUrl=id=>id?.startsWith('admin-')?BACKEND+'/media/'+encodeURIComponent(id)+'.jpg':'/assets/'+encodeURIComponent(id)+'.jpg';
window.JXThumbUrl=id=>window.JXThumbnailIds?.has(id)?'/assets/thumbs/'+encodeURIComponent(id)+'.webp':window.JXAssetUrl(id);
window.JXHeroUrl=id=>window.JXHeroIds?.has(id)?'/assets/hero/'+encodeURIComponent(id)+'.webp':window.JXAssetUrl(id);
const baseProducts=JSON.parse(JSON.stringify(products));
window.JUXIANG_CATALOGUE_READY=false;
const errorBox=document.createElement('div');errorBox.setAttribute('role','status');errorBox.style.cssText='position:fixed;bottom:20px;left:20px;right:20px;z-index:9999;background:#123e32;color:#fff6d9;padding:18px;border:1px solid #c0a86b;border-radius:8px;text-align:center';
errorBox.textContent='Updating the collection… / 正在读取最新商品…';document.body.append(errorBox);
function merge(p,o){if(!o)return p;const variants=p.variants.map(v=>({...v,...(o.variants.find(x=>x.key===v.key)||{})}));for(const v of o.variants)if(!variants.some(x=>x.key===v.key))variants.push(v);return {...p,...o,variants,detailsDeferred:Array.isArray(o.detailImages)?false:p.detailsDeferred}}
function apply(snapshot,updateHero=true){
 if(snapshot.schema!==1||!Array.isArray(snapshot.products))throw Error('Invalid catalogue');
 const patches=new Map(snapshot.products.map(x=>[x.id,x.data]));
 const next=baseProducts.map(p=>merge(p,patches.get(p.id))).map(p=>({...p,priceUSD:null,variants:p.variants.filter(v=>!v.adminDeleted&&!v.adminUnpublished)})).filter(p=>p.variants.length);
 products.splice(0,products.length,...next);
 const track=document.querySelector('.hero-track'),dots=document.querySelector('.hero-dots');
 if(track&&updateHero){const choices=[];for(const slide of [...track.children]){const link=slide.querySelector('a'),p=products.find(p=>p.id===slide.dataset.product);if(!p)continue;const v=p.variants.find(v=>v.key===link.dataset.color&&!v.catalogHidden)||p.variants.find(v=>!v.catalogHidden);if(p&&v&&!choices.some(x=>x.p.id===p.id))choices.push({p,v});}
 for(const p of products){if(choices.length>=10)break;if(choices.some(x=>x.p.id===p.id))continue;const v=p.variants.find(v=>!v.catalogHidden);if(v)choices.push({p,v});}
 const template=track.firstElementChild?.cloneNode(true);track.replaceChildren();dots?.replaceChildren();
 choices.forEach(({p,v},i)=>{const s=template.cloneNode(true);s.dataset.product=p.id;s.setAttribute('aria-label',(i+1)+' of '+choices.length);const a=s.querySelector('a');a.dataset.heroProduct=p.id;a.dataset.color=v.key;a.href='/?design='+p.id+'&color='+v.key;a.setAttribute('aria-label',p.brand+' · '+p.family+' — View details');const image=a.querySelector('img');if(i===0){image.src=window.JXHeroUrl(v.image);image.fetchPriority='high';delete image.dataset.src;}else{image.removeAttribute('src');image.dataset.src=window.JXHeroUrl(v.image);image.loading='lazy';}image.alt=p.brand+' '+p.family;a.querySelector('strong').textContent=p.brand+' · '+(p.baseFamily||p.family);track.append(s);if(dots){const b=document.createElement('button');b.type='button';b.dataset.slide=String(i);b.setAttribute('aria-label','Show photograph '+(i+1));b.setAttribute('aria-pressed',String(i===0));dots.append(b)}});
 if(!choices.length)document.getElementById('heroCarousel').hidden=true;
 }
 window.JUXIANG_CATALOGUE_READY=true;window.JUXIANG_CATALOGUE_SEQUENCE=snapshot.sequence;
}
const urls=JSON.parse(document.getElementById('catalogue-scripts').textContent);

window.JXPriceAccess={valid:()=>false,isKey:value=>/^JXK(?:-|$)/i.test(String(value).trim()),redeem:async()=>{let note=document.getElementById('priceAccessStatus');if(!note){note=document.createElement('p');note.id='priceAccessStatus';document.getElementById('catalogSearch').append(note)}note.hidden=false;note.textContent='Price verification is temporarily unavailable. Please retry. / 价格验证暂时不可用，请稍后重试。';return false}};
const CACHE='juxiang.catalogue-snapshot.v1';
function clean(s){if(s?.schema!==1||!Array.isArray(s.products))throw Error('Invalid catalogue');return {...s,products:s.products.map(x=>({...x,data:{...x.data,priceUSD:null}}))};}
function fallback(){let saved;try{saved=clean(JSON.parse(localStorage.getItem(CACHE)||'null'))}catch{}const published=clean(window.JXCatalogueSnapshot||{schema:1,sequence:0,products:[]});return saved&&saved.sequence>=published.sequence?saved:published;}
async function snapshot(){const controller=new AbortController();let timer;try{const response=await Promise.race([fetch(BACKEND+'/api/public',{cache:'no-store',credentials:'omit',signal:controller.signal}),new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('Timeout'))},3000)})]);if(!response.ok)throw Error('Catalogue unavailable');const s=clean(await response.json());try{localStorage.setItem(CACHE,JSON.stringify(s))}catch{}window.JUXIANG_CATALOGUE_SOURCE='live';return s;}catch{window.JUXIANG_CATALOGUE_SOURCE='saved';return fallback();}finally{clearTimeout(timer)}}

function updateHeroLinks(){for(const slide of document.querySelectorAll('.hero-slide')){const link=slide.querySelector('a');const p=products.find(p=>p.id===link?.dataset.heroProduct),v=p?.variants.find(v=>v.key===link.dataset.color&&!v.catalogHidden);if(!link)continue;const image=link.querySelector('img');if(!p||!v){delete link.dataset.heroProduct;slide.dataset.product='JUXIANG';link.href='/#collection';image.src='assets/jx-header-logo.webp';delete image.dataset.src;link.querySelector('strong').textContent='JUXIANG';}else{const url=window.JXHeroUrl(v.image);if(image.dataset.src)image.dataset.src=url;else image.src=url;link.querySelector('strong').textContent=p.brand+' · '+(p.baseFamily||p.family);}}}
function loadScript(src,critical=false){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;let wait;s.onload=()=>{clearTimeout(wait);resolve()};s.onerror=()=>{clearTimeout(wait);critical?reject(Error('Core script unavailable')):resolve()};if(!critical)wait=setTimeout(resolve,5000);document.body.append(s)})}
async function scripts(){const core=urls.find(src=>src.startsWith('storefront-core.js'));if(!core)throw Error('Core script missing');await loadScript(core,true);errorBox.remove();Promise.all(urls.filter(src=>src!==core).map(src=>{if(src.startsWith('featured-carousel')&&!document.querySelector('.hero-track')?.children.length)return;return loadScript(src)})).catch(()=>{});}
async function start(){try{
 window.JUXIANG_CATALOGUE_SOURCE='saved';apply(fallback());await scripts();
 snapshot().then(s=>{if(window.JUXIANG_CATALOGUE_SOURCE==='live'&&s.sequence!==window.JUXIANG_CATALOGUE_SEQUENCE){apply(s,false);updateHeroLinks();window.JXRefreshCatalogue?.();if(window.JXPriceAccess?.valid())window.JXPriceAccess.refresh?.();}}).catch(()=>{});
 }catch(e){errorBox.replaceChildren();const span=document.createElement('span');span.textContent='Please refresh to finish loading the catalogue. / 请刷新完成商品目录加载。 ';const button=document.createElement('button');button.textContent='Retry / 重试';button.onclick=()=>location.reload();errorBox.append(span,button);console.error('Catalogue loading failed',e.name);}}
start();
})();
