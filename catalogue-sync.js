
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

const heroTrack=document.querySelector('.hero-track'),heroTemplate=heroTrack?.firstElementChild?.cloneNode(true);
const defaultHero=heroTrack?[...heroTrack.children].map(s=>({id:s.dataset.product,key:s.querySelector('a')?.dataset.color,image:null})):[];
let productRanks=new Map(),heroSignature='';
window.JXSortCatalogueEntries=rows=>rows.sort((a,b)=>(productRanks.get(a.code)??100000)-(productRanks.get(b.code)??100000));
function rebuildHero(){
 const track=document.querySelector('.hero-track'),dots=document.querySelector('.hero-dots');if(!track||!heroTemplate)return;
 const settings=window.JXPresentation,custom=Array.isArray(settings?.heroSlides)&&settings.heroSlides.length>0,rows=custom?settings.heroSlides:defaultHero,choices=[];
 for(const row of rows){const p=products.find(p=>p.id===row.id);if(!p)continue;const v=p.variants.find(v=>v.key===row.key&&!v.catalogHidden)||(!custom&&p.variants.find(v=>!v.catalogHidden));if(v)choices.push({p,v,image:row.image||v.image});}
 if(!custom)for(const p of products){if(choices.length>=10)break;if(choices.some(x=>x.p.id===p.id))continue;const v=p.variants.find(v=>!v.catalogHidden);if(v)choices.push({p,v,image:v.image});}
 const signature=JSON.stringify(choices.map(x=>[x.p.id,x.v.key,x.image,x.p.brand,x.p.baseFamily||x.p.family]));if(signature===heroSignature)return;heroSignature=signature;
 track.replaceChildren();dots?.replaceChildren();choices.forEach(({p,v,image},i)=>{const slide=heroTemplate.cloneNode(true);slide.dataset.product=p.id;slide.removeAttribute('data-carousel-clone');slide.removeAttribute('inert');slide.removeAttribute('aria-hidden');slide.setAttribute('aria-label',(i+1)+' of '+choices.length);const a=slide.querySelector('a');a.tabIndex=0;a.dataset.heroProduct=p.id;a.dataset.color=v.key;a.href='/?design='+encodeURIComponent(p.id)+'&color='+encodeURIComponent(v.key);a.setAttribute('aria-label',p.brand+' · '+p.family+' — View details');const img=a.querySelector('img');img.alt=p.brand+' '+p.family;img.removeAttribute('fetchpriority');if(i===0){img.src=window.JXHeroUrl(image);img.fetchPriority='high';delete img.dataset.src;}else{img.removeAttribute('src');img.dataset.src=window.JXHeroUrl(image);img.loading='lazy';}a.querySelector('strong').textContent=p.brand+' · '+(p.baseFamily||p.family);track.append(slide);if(dots){const b=document.createElement('button');b.type='button';b.dataset.slide=String(i);b.setAttribute('aria-label','Show photograph '+(i+1));b.setAttribute('aria-pressed',String(i===0));dots.append(b);}});
 const carousel=document.getElementById('heroCarousel');if(carousel)carousel.hidden=!choices.length;window.dispatchEvent(new CustomEvent('jx:hero-updated'));
}
function apply(snapshot){
 if(snapshot.schema!==1||!Array.isArray(snapshot.products))throw Error('Invalid catalogue');const patches=new Map(snapshot.products.map(x=>[x.id,x.data]));
 const next=baseProducts.map(p=>merge(p,patches.get(p.id))).map(p=>({...p,priceUSD:null,variants:p.variants.filter(v=>!v.adminDeleted&&!v.adminUnpublished)})).filter(p=>p.variants.length);products.splice(0,products.length,...next);
 window.JXPresentation=snapshot.presentation?.settings||null;const order=window.JXPresentation?.productOrder;productRanks=new Map((Array.isArray(order)?order:[]).map((code,i)=>[code,i]));rebuildHero();
 window.JUXIANG_CATALOGUE_READY=true;window.JUXIANG_CATALOGUE_SEQUENCE=snapshot.sequence;
}
const urls=JSON.parse(document.getElementById('catalogue-scripts').textContent);

window.JXPriceAccess={valid:()=>false,isKey:value=>/^JXK(?:-|$)/i.test(String(value).trim()),redeem:async()=>{let note=document.getElementById('priceAccessStatus');if(!note){note=document.createElement('p');note.id='priceAccessStatus';document.getElementById('catalogSearch').append(note)}note.hidden=false;note.textContent='Price verification is temporarily unavailable. Please retry. / 价格验证暂时不可用，请稍后重试。';return false}};
const CACHE='juxiang.catalogue-snapshot.v1';
function clean(s){if(s?.schema!==1||!Array.isArray(s.products))throw Error('Invalid catalogue');return {...s,products:s.products.map(x=>({...x,data:{...x.data,priceUSD:null}}))};}
function fallback(){let saved;try{saved=clean(JSON.parse(localStorage.getItem(CACHE)||'null'))}catch{}const published=clean(window.JXCatalogueSnapshot||{schema:1,sequence:0,products:[]});return saved&&saved.sequence>=published.sequence?saved:published;}
async function snapshot(){for(const endpoint of ['/price-api/public',BACKEND+'/api/public']){const controller=new AbortController();let timer;try{timer=setTimeout(()=>controller.abort(),3000);const response=await fetch(endpoint,{cache:'no-store',credentials:'omit',signal:controller.signal});if(!response.ok)throw Error('Catalogue unavailable');const s=clean(await response.json());try{localStorage.setItem(CACHE,JSON.stringify(s))}catch{}window.JUXIANG_CATALOGUE_SOURCE='live';return s;}catch{}finally{clearTimeout(timer)}}window.JUXIANG_CATALOGUE_SOURCE='saved';return fallback();}

function loadScript(src,critical=false){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;let wait;s.onload=()=>{clearTimeout(wait);resolve()};s.onerror=()=>{clearTimeout(wait);critical?reject(Error('Core script unavailable')):resolve()};if(!critical)wait=setTimeout(resolve,5000);document.body.append(s)})}
async function scripts(){const core=urls.find(src=>src.startsWith('storefront-core.js'));if(!core)throw Error('Core script missing');await loadScript(core,true);errorBox.remove();Promise.all(urls.filter(src=>src!==core).map(src=>{if(src.startsWith('featured-carousel')&&!document.querySelector('.hero-track')?.children.length)return;return loadScript(src)})).catch(()=>{});}
async function start(){try{
 window.JUXIANG_CATALOGUE_SOURCE='saved';apply(fallback());await scripts();
 snapshot().then(s=>{if(window.JUXIANG_CATALOGUE_SOURCE==='live'&&s.sequence!==window.JUXIANG_CATALOGUE_SEQUENCE){apply(s);window.JXRefreshCatalogue?.();if(window.JXPriceAccess?.valid())window.JXPriceAccess.refresh?.();}}).catch(()=>{});
 }catch(e){errorBox.replaceChildren();const span=document.createElement('span');span.textContent='Please refresh to finish loading the catalogue. / 请刷新完成商品目录加载。 ';const button=document.createElement('button');button.textContent='Retry / 重试';button.onclick=()=>location.reload();errorBox.append(span,button);console.error('Catalogue loading failed',e.name);}}
start();
})();
