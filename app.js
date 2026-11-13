/* A series has one product code and price, with strap-specific colour variants. */
const CONTACT_URL = siteSettings.contactUrl || '';
document.querySelector('.brand').firstChild.textContent = siteSettings.brandName || 'JUXIANG';
document.querySelector('.hero h1').textContent = siteSettings.heroTitle;
document.querySelector('.hero .intro').textContent = siteSettings.heroIntro;
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = amount => new Intl.NumberFormat('en-US', {style:'currency', currency:'USD', maximumFractionDigits:0}).format(amount);
const brandAliases = {
  Rolex:'劳力士 勞力士', Cartier:'卡地亚 卡地亞', 'Vacheron Constantin':'江诗丹顿 江詩丹頓 vc',
  'Audemars Piguet':'爱彼 愛彼 ap', IWC:'万国 萬國 沙夫豪森', 'Patek Philippe':'百达翡丽 百達翡麗 pp', Omega:'欧米茄 歐米茄'
};
const bandLabels = {metal:'Metal bracelet / 金属表链', rubber:'Rubber strap / 橡胶表带', leather:'Leather strap / 皮革表带', textile:'Textile strap / 织物表带'};
const bandAliases = {metal:'金属表带 金属表链 钢带 钢链 鋼帶 鋼鏈',rubber:'橡胶 胶带 膠帶 橡膠',leather:'皮带 皮質 皮质 皮革',textile:'织物 織物 帆布 尼龙 尼龍'};
const familyAliases = {
  Nautilus:'鹦鹉螺 鸚鵡螺', Aquanaut:'手雷', Portugieser:'葡萄牙 葡计 葡七', Portofino:'柏涛菲诺 柏濤菲諾',
  Pilot:'飞行员 飛行員 大飞 马克', Ingenieur:'工程师 工程師', Submariner:'潜航者 水鬼', Datejust:'日志 日誌',
  'Day-Date':'星期日历', Daytona:'迪通拿', 'Yacht-Master':'游艇名仕', 'GMT-Master':'格林尼治',
  'Oyster Perpetual':'蚝式恒动 蠔式恆動', Milgauss:'米尔高斯 闪电针', 'Ballon Bleu':'蓝气球 藍氣球',
  Santos:'山度士', Tank:'坦克', Overseas:'纵横四海 縱橫四海', Patrimony:'传承 傳承', 'Royal Oak':'皇家橡树 皇家橡樹',
  'Moon Phase':'月相', Chronograph:'计时 計時', 'Travel Time':'旅行时间 两地时', 'Aqua Terra':'海马 海馬',
  Worldtimer:'世界时 世界時 地球', 'Planet Ocean':'海马 海馬 海洋宇宙', 'Diver 300M':'海马 海馬 潜水300 波纹', 'De Ville':'碟飞 碟飛'
};
const normalizeSearch = value => String(value || '').normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\u3400-\u9fff]/g,'');
function matchesSearch(p, term, variant) {
  if (!term.trim()) return true;
  const code = normalizeSearch(term);
  if (/^jx[\s_-]*\d+$/i.test(term.trim())) return normalizeSearch(p.id).startsWith(code);
  const aliases = Object.entries(familyAliases).filter(([k]) => p.family.includes(k)).map(([,v]) => v).join(' ');
  const variants = variant ? [variant] : p.variants;
  const haystack = normalizeSearch([p.id,p.brand,brandAliases[p.brand],p.family,p.nameZh,p.bandName,p.bandNameZh,bandAliases[p.band],aliases,...variants.flatMap(v=>[v.label,v.labelZh])].join(' '));
  return term.trim().split(/\s+/).every(word => haystack.includes(normalizeSearch(word)));
}
function matchingColour(p) { return Math.max(0, p.variants.findIndex(v => matchesSearch(p, searchTerm, v))); }
const photoFiles = new Map(), selectedColors = new Map();
let activeBrand='All', activeSeries='All', activeBand='All', searchTerm='';
let restoringNavigation=false, ignoredDetailCloses=0, detailController, enquirySelection=null;
let detailProduct=null, detailVariant=null;
history.replaceState({...history.state,juxiang:true,depth:0},'',location.href);
function saveScroll() { history.replaceState({...history.state,scrollY:window.scrollY},'',location.href); }
function navigateTo(url, mode='push', detailEntry=false) {
  if (restoringNavigation || url===location.pathname+location.search+location.hash) return;
  saveScroll();
  const depth=history.state?.depth||0;
  history[mode==='push'?'pushState':'replaceState']({juxiang:true,depth:mode==='push'?depth+1:depth,detailEntry,scrollY:window.scrollY},'',url);
}
function updateUrl(design, mode='push', color) {
  const q=new URLSearchParams();
  if(searchTerm.trim())q.set('q',searchTerm.trim());
  if(activeBrand!=='All')q.set('brand',activeBrand);
  if(activeSeries!=='All')q.set('series',activeSeries);
  if(activeBand!=='All')q.set('band',activeBand);
  if(design){q.set('design',design);if(color)q.set('color',color);}
  navigateTo(location.pathname+(q.size?'?'+q:'')+'#collection',mode,!!design);
}
function closeDetailQuietly(){if($('detail').open){ignoredDetailCloses++;$('detail').close();}}
function makeFilter(host,values,selected,onChange,label){
  host.replaceChildren(...values.map(value=>{const b=document.createElement('button');b.type='button';b.textContent=label(value);b.classList.toggle('active',value===selected);b.setAttribute('aria-pressed',String(value===selected));b.onclick=()=>onChange(value);return b;}));
}
function syncControls(){
  $('productSearch').value=searchTerm;
  makeFilter(document.querySelector('.brand-filters'),['All',...new Set(products.map(p=>p.brand))],activeBrand,value=>{activeBrand=value;activeSeries='All';syncControls();render();updateUrl();},v=>v==='All'?'All brands / 全部品牌':v);
  makeFilter($('seriesFilters'),['All',...new Set(products.filter(p=>activeBrand==='All'||p.brand===activeBrand).map(p=>p.family))],activeSeries,value=>{activeSeries=value;syncControls();render();updateUrl();},v=>v==='All'?'All series / 全部系列':v);
  makeFilter($('strapFilters'),['All',...new Set(products.map(p=>p.band))],activeBand,value=>{activeBand=value;syncControls();render();updateUrl();},v=>v==='All'?'All straps / 全部表带':bandLabels[v]);
}
function render(){
  const list=products.filter(p=>(activeBrand==='All'||p.brand===activeBrand)&&(activeSeries==='All'||p.family===activeSeries)&&(activeBand==='All'||p.band===activeBand)&&matchesSearch(p,searchTerm));
  $('resultCount').textContent=list.length+' series / 系列'+(searchTerm.trim()?' · '+searchTerm.trim():'');
  $('searchEmpty').hidden=!!list.length;$('clearSearch').hidden=!searchTerm;
  $('products').replaceChildren(...list.map(p=>{
    const index=matchingColour(p),v=p.variants[index],b=document.createElement('button');b.type='button';b.className='product';
    b.dataset.product=p.id;b.setAttribute('aria-label','Explore '+p.id+' '+p.name);
    b.innerHTML=`<div class="product-art"><img src="assets/${esc(v.image)}.jpg" alt="${esc(p.name)} · ${esc(v.label)}" loading="lazy"><small>${esc(p.id)} / ${p.variants.length} ${p.variants.length===1?'COLOUR':'COLOURS'}</small></div><div class="product-info"><p>${esc(p.brand.toUpperCase())}</p><h3>${esc(p.family)}</h3><span class="name-zh">${esc(p.nameZh)}</span><span class="series-band">${esc(p.bandName)} · ${esc(p.bandNameZh)}</span><div class="series-card-meta"><span class="product-code">${esc(p.id)}</span><strong class="series-price">${money(p.priceUSD)} <small>USD</small></strong></div><div class="colour-preview" aria-hidden="true">${p.variants.slice(0,4).map(c=>`<img src="assets/${esc(c.image)}.jpg" alt="" loading="lazy">`).join('')}<span>${p.variants.length>4?'+'+(p.variants.length-4):p.variants.length+' colour'+(p.variants.length===1?'':'s')} ↗</span></div></div>`;
    b.onclick=()=>showProduct(p.id,true,p.variants[index].key);return b;
  }));
}
function resolveProduct(id,color){
  const alias=legacyProductLinks[id];
  const p=products.find(x=>x.id===(alias?.id||id));
  return p?{p,color:color||alias?.color}:null;
}
function detailsMarkup(p,v){
  const details=[...p.detailImages,...v.detailImages];
  return `<section class="product-details-photos" aria-labelledby="detailsPhotoHeading"><p class="eyebrow">A CLOSER LOOK</p><h3 id="detailsPhotoHeading">Product details / 产品细节</h3>${details.length?`<div class="details-photo-grid">${details.map(d=>`<figure><img src="assets/${esc(d.image)}.jpg" alt="${esc(d.alt||d.caption||p.name)}" loading="lazy">${d.caption?`<figcaption>${esc(d.caption)}</figcaption>`:''}</figure>`).join('')}</div>`:`<div class="detail-photo-space"><span>DETAIL PHOTOGRAPHS</span><p>More details coming soon.<br>产品细节图片即将补充</p><div class="detail-photo-slots" aria-hidden="true"><i></i><i></i><i></i></div></div>`}</section>`;
}
function showProduct(id,recordHistory=true,color){
  const resolved=resolveProduct(id,color);if(!resolved)return;
  const p=resolved.p;const start=Math.max(0,p.variants.findIndex(v=>v.key===(resolved.color||selectedColors.get(p.id))));
  detailController?.abort();detailController=new AbortController();const signal=detailController.signal;
  detailProduct=p;
  $('detailBody').innerHTML=`<div class="detail-layout series-detail-layout"><div class="series-gallery"><div class="colour-gallery" id="colourGallery" role="region" aria-roledescription="carousel" aria-label="Product colours / 产品配色" tabindex="0"><div class="colour-track" id="colourTrack">${p.variants.map((v,i)=>`<div class="colour-slide" role="group" aria-roledescription="slide" aria-label="${i+1} of ${p.variants.length}"><img src="assets/${esc(v.image)}.jpg" alt="${esc(v.label)}" draggable="false" ${i===start?'fetchpriority="high"':'loading="lazy"'}></div>`).join('')}</div><div class="colour-gallery-controls"><button type="button" id="colourPrev" aria-label="Previous colour / 上一个配色">‹</button><span id="colourCounter" aria-live="polite"></span><button type="button" id="colourNext" aria-label="Next colour / 下一个配色">›</button></div></div><p class="gallery-instruction">${p.variants.length>1?'Swipe left or right to explore colours / 左右滑动查看不同配色':'Selected photograph / 当前款式照片'}</p><div class="colour-thumbs" role="group" aria-label="Choose a colour / 选择配色">${p.variants.map(v=>`<button type="button" data-color="${esc(v.key)}" aria-label="Choose colour: ${esc(v.label)}"><img src="assets/${esc(v.image)}.jpg" alt="" loading="lazy"></button>`).join('')}</div></div><div class="series-summary"><p class="eyebrow">${esc(p.brand)} / SERIES CODE · 系列编号</p><span class="detail-series-code">${esc(p.id)}</span><h2>${esc(p.family)}</h2><p class="detail-chinese">${esc(p.nameZh)}</p><p class="detail-price">${money(p.priceUSD)} <span>USD</span></p><div class="spec"><strong>Strap / 表带</strong><span>${esc(p.bandName)} / ${esc(p.bandNameZh)}</span></div><div class="spec selected-colour"><strong>Colour / 配色</strong><span id="selectedColour"></span></div><p class="colour-name-zh" id="selectedColourZh"></p><p>${esc(p.description)}</p><div class="spec"><strong>Official family size reference</strong><span>${esc(p.sizeReference)}</span></div><a class="button" id="detailContact" target="_blank" rel="noopener noreferrer">WHATSAPP ENQUIRY ↗</a><button class="button share-photo" id="productShare" disabled>PREPARING PHOTO…</button><a class="text-link" id="detailDownload" download>Download selected colour ↓</a><p id="productShareStatus" class="share-hint" role="status"></p><button type="button" class="text-link" id="productEnquire">Add enquiry details ↗</button></div></div><div id="detailPhotoArea"></div>${p.referencePhotos.length?`<details class="reference-library"><summary>More supplied photographs / 更多原始照片 (${p.referencePhotos.length})</summary><div class="reference-grid">${p.referencePhotos.map(photo=>`<figure><a href="assets/${esc(photo.image)}.jpg" target="_blank" rel="noopener"><img src="assets/${esc(photo.image)}.jpg" alt="${esc(photo.labelZh)}" loading="lazy"></a><figcaption>${esc(photo.labelZh)}</figcaption></figure>`).join('')}</div></details>`:''}`;
  const track=$('colourTrack');let index=start,frame=0,drag=null;
  function selectColour(n,scroll=true,record=true){
    index=(n+p.variants.length)%p.variants.length;const v=p.variants[index];detailVariant=v;selectedColors.set(p.id,v.key);
    $('selectedColour').textContent=v.label;$('selectedColourZh').textContent=v.labelZh;
    $('colourCounter').textContent=String(index+1).padStart(2,'0')+' / '+String(p.variants.length).padStart(2,'0');
    $('colourPrev').disabled=$('colourNext').disabled=p.variants.length<2;
    document.querySelectorAll('[data-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.color===v.key)));
    $('detailPhotoArea').innerHTML=detailsMarkup(p,v);
    const fields=productEnquiryFields(p,location.origin,{},v);
    $('detailContact').href=buildContactUrl(CONTACT_URL,makeEnquiryText(fields));
    $('detailDownload').href='/assets/'+v.image+'.jpg';$('detailDownload').download=p.id+'-'+v.key+'.jpg';
    $('productShareStatus').textContent='';readyPhotoButton(p,v,$('productShare'),$('productShareStatus'),()=>productEnquiryFields(p,location.origin,{},v));
    if(scroll)track.scrollTo({left:track.clientWidth*index,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    if(record)updateUrl(p.id,'replace',v.key);
  }
  $('colourPrev').onclick=()=>selectColour(index-1);$('colourNext').onclick=()=>selectColour(index+1);
  document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>selectColour(p.variants.findIndex(v=>v.key===b.dataset.color)));
  $('colourGallery').addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();selectColour(index+(e.key==='ArrowLeft'?-1:1));}},{signal});
  track.addEventListener('scroll',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const n=Math.round(track.scrollLeft/track.clientWidth);if(n!==index&&n>=0&&n<p.variants.length)selectColour(n,false);});},{passive:true,signal});
  track.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={x:e.clientX,left:track.scrollLeft};track.classList.add('is-dragging');track.setPointerCapture(e.pointerId);},{signal});
  track.addEventListener('pointermove',e=>{if(!drag)return;track.scrollLeft=drag.left+drag.x-e.clientX;},{signal});
  function release(e){if(!drag)return;const direction=e.clientX-drag.x;const original=Math.round(drag.left/track.clientWidth);drag=null;track.classList.remove('is-dragging');if(track.hasPointerCapture(e.pointerId))track.releasePointerCapture(e.pointerId);selectColour(Math.abs(direction)>40?Math.max(0,Math.min(p.variants.length-1,original+(direction<0?1:-1))):original);}
  track.addEventListener('pointerup',release,{signal});track.addEventListener('pointercancel',release,{signal});
  window.addEventListener('resize',()=>track.scrollTo({left:track.clientWidth*index,behavior:'instant'}),{signal});
  $('productEnquire').onclick=()=>{const v=detailVariant;closeDetailQuietly();updateUrl(undefined,'replace');openEnquiry(p.id+' '+p.name+' · '+v.label,'Retail',{id:p.id,color:v.key});};
  if(!$('detail').open)$('detail').showModal();
  selectColour(start,false,false);track.scrollTo({left:track.clientWidth*start,behavior:'instant'});
  if(recordHistory)updateUrl(p.id,'push',p.variants[start].key);
  else if(resolved.p.id!==id&&!restoringNavigation)updateUrl(p.id,'replace',p.variants[start].key);
}
function readLocation(){
  const q=new URLSearchParams(location.search);searchTerm=q.get('q')||'';
  activeBrand=products.some(p=>p.brand===q.get('brand'))?q.get('brand'):'All';
  activeSeries=products.some(p=>p.family===q.get('series')&&(activeBrand==='All'||p.brand===activeBrand))?q.get('series'):'All';
  activeBand=Object.hasOwn(bandLabels,q.get('band'))?q.get('band'):'All';return q;
}
function restoreNavigation(){
  restoringNavigation=true;closeDetailQuietly();document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  const q=readLocation();syncControls();render();if(q.get('design'))showProduct(q.get('design'),false,q.get('color'));
  restoringNavigation=false;requestAnimationFrame(()=>{if(typeof history.state?.scrollY==='number')window.scrollTo({top:history.state.scrollY,behavior:'instant'});});
}
window.addEventListener('popstate',restoreNavigation);
function goHome(){closeDetailQuietly();document.querySelectorAll('dialog[open]').forEach(d=>d.close());activeBrand=activeSeries=activeBand='All';searchTerm='';syncControls();render();navigateTo(location.pathname+'#home');window.scrollTo({top:0,behavior:'smooth'});}
function goBack(){const modal=document.querySelector('dialog[open]');if(modal){modal.close();return;}if(history.state?.juxiang&&history.state.depth>0)history.back();else goHome();}
$('detail').addEventListener('close',()=>{if(ignoredDetailCloses){ignoredDetailCloses--;return;}if(!new URLSearchParams(location.search).has('design'))return;if(history.state?.detailEntry)history.back();else updateUrl(undefined,'replace');});
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
document.querySelectorAll('[data-close-dialog]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
document.querySelector('[data-open-privacy]').onclick=()=>$('privacy').showModal();
document.querySelectorAll('[data-go-home],header .brand').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();goHome();}));
document.querySelectorAll('[data-go-back]').forEach(b=>b.addEventListener('click',goBack));
document.querySelectorAll('a[href^="#"]:not([data-go-home]):not(.brand)').forEach(a=>a.addEventListener('click',e=>{const target=document.getElementById(a.getAttribute('href').slice(1));if(!target)return;e.preventDefault();navigateTo(location.pathname+location.search+a.getAttribute('href'));target.scrollIntoView({behavior:'smooth'});}));
let searchNavigationTimer;
function runSearch(){searchTerm=$('productSearch').value;activeBrand=activeSeries=activeBand='All';syncControls();render();updateUrl(undefined,searchNavigationTimer?'replace':'push');clearTimeout(searchNavigationTimer);searchNavigationTimer=setTimeout(()=>searchNavigationTimer=null,800);}
$('productSearch').addEventListener('input',runSearch);$('catalogSearch').onsubmit=e=>{e.preventDefault();runSearch();};
$('clearSearch').onclick=$('resetSearch').onclick=()=>{$('productSearch').value='';runSearch();$('productSearch').focus();};
function openEnquiry(selection,type,selected=null){enquirySelection=selected;$('selection').value=selection;$('type').value=type;$('quantity').value=1;$('copyStatus').textContent='';$('copyFallback').hidden=true;$('enquiry').showModal();updateContactLink();updateEnquiryPhoto();}
document.querySelectorAll('[data-enquiry]').forEach(b=>b.onclick=()=>openEnquiry(b.dataset.enquiry==='Wholesale'?'Wholesale partnership':'General enquiry',b.dataset.enquiry));
function enquiryProduct(){return products.find(p=>$('selection').value.startsWith(p.id+' '));}
function enquiryVariant(p){return p.variants.find(v=>v.key===(enquirySelection?.id===p.id?enquirySelection.color:selectedColors.get(p.id)))||p.variants[0];}
function enquiryFields(){const fields={type:$('type').value,selection:$('selection').value,country:$('country').value,quantity:$('quantity').value,notes:$('notes').value};const p=enquiryProduct();return p?productEnquiryFields(p,location.origin,fields,enquiryVariant(p)):fields;}
function updateContactLink(){const p=enquiryProduct();$('enquiryCode').value=p?.id||'General enquiry / 未选择系列';$('enquiryColour').value=p?enquiryVariant(p).labelZh:'';$('enquiryPrice').value=p?money(p.priceUSD)+' USD':'';const href=buildContactUrl(CONTACT_URL,makeEnquiryText(enquiryFields()));$('externalContact').hidden=!href;if(href)$('externalContact').href=href;}
$('enquiryForm').addEventListener('input',()=>{updateContactLink();updateEnquiryPhoto();});
$('enquiryForm').onsubmit=async e=>{e.preventDefault();const text=makeEnquiryText(enquiryFields());try{await navigator.clipboard.writeText(text);$('copyStatus').textContent='Enquiry copied. Review it in WhatsApp before sending.';}catch{$('copyFallback').hidden=false;$('copyFallback').value=text;$('copyFallback').select();$('copyStatus').textContent='Select and copy the text below.';}};
document.querySelectorAll('[data-direct-contact]').forEach(a=>{const href=buildContactUrl(CONTACT_URL,makeEnquiryText({type:'Retail / Wholesale',selection:'General enquiry'}));a.hidden=!href;if(href)a.href=href;});
function preloadPhoto(p,v){if(!photoFiles.has(v.image)){const promise=fetch('/assets/'+v.image+'.jpg').then(async r=>{if(!r.ok)throw Error('Photo unavailable');return new File([await r.blob()],p.id+'-'+v.key+'-JUXIANG.jpg',{type:'image/jpeg'});}).catch(e=>{photoFiles.delete(v.image);throw e;});photoFiles.set(v.image,promise);}return photoFiles.get(v.image);}
async function readyPhotoButton(p,v,button,status,fields){
  const token=p.id+':'+v.key;button.disabled=true;button.textContent='PREPARING PHOTO…';button.dataset.selection=token;let file;
  try{file=await preloadPhoto(p,v);}catch{if(button.dataset.selection!==token)return;button.textContent='PHOTO UNAVAILABLE';status.textContent='Use the download link or try again.';return;}
  if(button.dataset.selection!==token)return;button.disabled=false;
  const supported=!!(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]}));
  button.textContent=supported?'SHARE SELECTED COLOUR ↗':'DOWNLOAD SELECTED COLOUR ↓';
  button.onclick=async()=>{if(supported){try{await navigator.share({files:[file],title:p.name+' · '+v.label,text:makeEnquiryText(fields())});status.textContent='Check WhatsApp to confirm the photo was sent.';}catch(e){status.textContent=e.name==='AbortError'?'Sharing cancelled.':'Download the photo and attach it in WhatsApp.';}}else{const a=document.createElement('a');a.href='/assets/'+v.image+'.jpg';a.download=p.id+'-'+v.key+'.jpg';a.click();status.textContent='Attach the downloaded photo in our WhatsApp chat.';}};
}
let enquiryPhotoKey='';
function updateEnquiryPhoto(){const p=enquiryProduct();$('enquiryPhoto').hidden=!p;if(!p){enquiryPhotoKey='';$('enquiryShare').dataset.selection='';return;}const v=enquiryVariant(p),key=p.id+':'+v.key;if(enquiryPhotoKey===key)return;enquiryPhotoKey=key;$('enquiryPhotoImage').src='/assets/'+v.image+'.jpg';$('enquiryPhotoImage').alt=v.label;$('enquiryDownload').href='/assets/'+v.image+'.jpg';$('enquiryDownload').download=p.id+'-'+v.key+'.jpg';$('enquiryShareStatus').textContent='';readyPhotoButton(p,v,$('enquiryShare'),$('enquiryShareStatus'),enquiryFields);}
$('year').textContent=new Date().getFullYear();
const initialQuery=readLocation();syncControls();render();if(initialQuery.get('design'))showProduct(initialQuery.get('design'),false,initialQuery.get('color'));
history.scrollRestoration='manual';let scrollSaveTimer;window.addEventListener('scroll',()=>{clearTimeout(scrollSaveTimer);scrollSaveTimer=setTimeout(saveScroll,180);},{passive:true});
