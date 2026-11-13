// Contact destination is managed through the authenticated editor.
const CONTACT_URL = siteSettings.contactUrl || '';
document.querySelector('.brand').firstChild.textContent=siteSettings.brandName || 'JUXIANG';
document.querySelector('.hero h1').textContent=siteSettings.heroTitle || 'Presence. In every moment.';
document.querySelector('.hero .intro').textContent=siteSettings.heroIntro || 'Explore our watch collection.';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const $=id=>document.getElementById(id);
const photoFiles=new Map();
let activeBrand='All',activeSeries='All';

let restoringNavigation = false, ignoredDetailCloses = 0;
history.replaceState({ ...history.state, juxiang: true, depth: 0 }, '', location.href);
function saveScroll() {
  history.replaceState({ ...history.state, scrollY: window.scrollY }, '', location.href);
}
function navigateTo(url, mode = 'push', detailEntry = false) {
  if (restoringNavigation) return;
  if (url === location.pathname + location.search + location.hash) return;
  saveScroll();
  const depth = history.state?.depth || 0;
  const state = { juxiang: true, depth: mode === 'push' ? depth + 1 : depth, detailEntry, scrollY: window.scrollY };
  history[mode === 'push' ? 'pushState' : 'replaceState'](state, '', url);
}
function closeDetailQuietly() {
  if ($('detail').open) { ignoredDetailCloses++; $('detail').close(); }
}
function syncCatalogControls() {
  const input = $('productSearch');
  if (input) input.value = searchTerm;
  document.querySelectorAll('[data-brand]').forEach(b => {
    b.classList.toggle('active', b.dataset.brand === activeBrand);
    b.setAttribute('aria-pressed', String(b.dataset.brand === activeBrand));
  });
  seriesButtons(); render();
}
function goHome() {
  closeDetailQuietly();
  document.querySelectorAll('dialog[open]').forEach(d => d.close());
  activeBrand = 'All'; activeSeries = 'All'; searchTerm = '';
  syncCatalogControls();
  navigateTo(location.pathname + '#home');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function goBack() {
  const modal = document.querySelector('dialog[open]');
  if (modal) { modal.close(); return; }
  if (history.state?.juxiang && history.state.depth > 0) history.back();
  else goHome();
}
function restoreNavigation() {
  restoringNavigation = true;
  closeDetailQuietly();
  document.querySelectorAll('dialog[open]').forEach(d => d.close());
  const params = new URLSearchParams(location.search);
  searchTerm = params.get('q') || '';
  activeBrand = products.some(p => p.brand === params.get('brand')) ? params.get('brand') : 'All';
  activeSeries = products.some(p => p.family === params.get('series') && (activeBrand === 'All' || p.brand === activeBrand)) ? params.get('series') : 'All';
  syncCatalogControls();
  const id = params.get('design');
  if (id) showProduct(id, false);
  restoringNavigation = false;
  requestAnimationFrame(() => {
    if (typeof history.state?.scrollY === 'number') window.scrollTo({top:history.state.scrollY,behavior:'instant'});
    else document.querySelector(location.hash === '#home' || !location.hash ? '.hero' : location.hash)?.scrollIntoView();
  });
}
window.addEventListener('popstate', restoreNavigation);


const brandSearchAliases = {
  'Rolex':'劳力士 勞力士 rolex',
  'Cartier':'卡地亚 卡地亞 cartier',
  'Vacheron Constantin':'江诗丹顿 江詩丹頓 vc',
  'Audemars Piguet':'爱彼 愛彼 ap',
  'IWC':'万国 萬國 万国表 沙夫豪森 iwc schaffhausen',
  'Patek Philippe':'百达翡丽 百達翡麗 pp patek philippe',
  'Omega':'欧米茄 歐米茄 omega 欧记'
};
const familySearchAliases = {
  'Aqua Terra':'海马 海馬 海马150 柚木', 'Worldtimer':'世界时 世界時 地球',
  'Planet Ocean':'海马 海馬 海洋宇宙', 'Diver 300M':'海马 海馬 潜水300 潛水300 波纹 波紋',
  'De Ville':'碟飞 碟飛', 'GMT':'两地时 兩地時',
  'Nautilus':'鹦鹉螺 鸚鵡螺', 'Aquanaut':'手雷 海底探险者',
  'Portugieser':'葡萄牙 葡计 葡七', 'Portofino':'柏涛菲诺 柏濤菲諾',
  'Pilot':'飞行员 飛行員 大飞 马克', 'Ingenieur':'工程师 工程師',
  'Submariner':'潜航者 水鬼', 'Datejust':'日志 日誌', 'Day-Date':'星期日历',
  'Daytona':'迪通拿', 'Yacht-Master':'游艇名仕', 'GMT-Master':'格林尼治',
  'Ballon Bleu':'蓝气球 藍氣球', 'Santos':'山度士', 'Tank':'坦克',
  'Overseas':'纵横四海 縱橫四海', 'Patrimony':'传承 傳承',
  'Royal Oak':'皇家橡树 皇家橡樹', 'Moon Phase':'月相',
  'Chronograph':'计时 計時', 'Travel Time':'旅行时间 两地时'
};
const normalizeSearch = value => String(value || '').normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\u3400-\u9fff]/g,'');
function matchesSearch(p, term) {
  if (!term.trim()) return true;
  const aliases = Object.entries(familySearchAliases).filter(([key]) => p.family.includes(key)).map(([,value]) => value).join(' ');
  const fields = [p.id,p.name,p.nameZh,p.brand,p.family,p.tone,p.category,brandSearchAliases[p.brand],aliases,...(p.features || [])];
  const haystack = normalizeSearch(fields.join(' '));
  const code = normalizeSearch(term);
  if (/^[a-z]+[\s_-]*\d+$/i.test(term.trim())) return normalizeSearch(p.id).startsWith(code);
  return term.trim().split(/\s+/).every(word => haystack.includes(normalizeSearch(word)));
}
let searchTerm = new URLSearchParams(location.search).get('q') || '';

function render(){const list=products.filter(p=>(activeBrand==='All'||p.brand===activeBrand)&&(activeSeries==='All'||p.family===activeSeries)&&matchesSearch(p,searchTerm));$('resultCount').textContent=list.length+' photo entries'+(searchTerm.trim()?' · Search / 搜索：'+searchTerm.trim():''); $('searchEmpty').hidden=list.length!==0; $('clearSearch').hidden=!searchTerm;  $('products').replaceChildren(...list.map(p=>{const b=document.createElement('button');b.className='product';b.setAttribute('aria-label','Explore '+p.name);b.innerHTML=`<div class="product-art"><img src="assets/${esc(p.image)}.jpg" alt="Uploaded watch photograph ${esc(p.id)}" loading="lazy"><small>${esc(p.id)} / UPLOADED PHOTO</small></div><div class="product-info"><p>${esc(p.brand.toUpperCase())} · ${esc(p.category.toUpperCase())}</p><h3>${esc(p.family)}</h3><span class="product-code">Product code / 编号：${esc(p.id)}</span><span class="name-zh">${esc(p.nameZh)}</span><span>${esc(p.tone)}</span><span class="card-size">Family size reference: ${esc(p.sizeReference)}</span><p class="identification">Visual identification · actual size unmeasured</p><span class="arrow">↗</span></div>`;b.onclick=()=>showProduct(p.id);return b}));}
function showProduct(id,recordHistory=true){const p=products.find(x=>x.id===id);if(!p)return;$('detailBody').innerHTML=`<div class="detail-layout"><img src="assets/${esc(p.image)}.jpg" alt="${esc(p.name)} uploaded watch photograph"><div><p class="eyebrow">PRODUCT CODE / 产品编号：${esc(p.id)}</p><h2>${esc(p.family)}</h2><p class="detail-chinese">${esc(p.nameZh)}</p><p class="eyebrow">${esc(p.tone)}</p><p>${esc(p.description)}</p><h3 class="feature-heading">Design highlights</h3><ul class="feature-list">${p.features.map(f=>`<li>${esc(f)}</li>`).join('')}</ul><div class="spec"><strong>Product code / 产品编号</strong><span class="sku-value">${esc(p.id)}</span></div><div class="spec"><strong>Identification</strong><span>Provisional visual family comparison${p.multi?' · multiple watches in photo':''}</span></div><div class="spec"><strong>Official family size reference</strong><span>${esc(p.sizeReference)}</span></div><div class="spec"><strong>Actual photographed watch size</strong><span>Not measured — request confirmation</span></div><div class="spec"><strong>Reference / movement / materials</strong><span>Not verified</span></div><div class="spec"><strong>Price & availability</strong><span>Request a confirmed quote</span></div><p class="size-note">Family sizes describe official ${esc(p.brand)} models for comparison only. They do not confirm the size, generation, authenticity or specifications of the photographed item. Earlier generations may differ.</p><p class="muted">User-supplied photograph. Brand markings remain as photographed; no affiliation, authorised retailer status or authenticity is claimed. Confirm the actual item before ordering.</p><a class="button" href="${esc(buildContactUrl(CONTACT_URL,makeEnquiryText(productEnquiryFields(p,location.origin))))}" target="_blank" rel="noopener noreferrer">WHATSAPP ENQUIRY ↗</a><button class="button share-photo" id="productShare" disabled>PREPARING PHOTO…</button><a class="text-link" href="/assets/${esc(p.image)}.jpg" download="${esc(p.id)}.jpg">Download photo ↓</a><p class="share-hint">To send the actual photo: choose WhatsApp in your phone’s share menu, then select our chat (+86 199 2235 3655). The enquiry link includes the photo URL.</p><p id="productShareStatus" class="share-hint" role="status"></p><button class="text-link" id="productEnquire">Add enquiry details ↗</button></div></div>`;$('productEnquire').onclick=()=>{closeDetailQuietly();updateUrl(undefined,'replace');openEnquiry(p.id+' '+p.name,'Retail')};$('detail').showModal();if(recordHistory)updateUrl(id);readyPhotoButton(p,$('productShare'),$('productShareStatus'),()=>productEnquiryFields(p,location.origin));}
function openEnquiry(selection,type){$('selection').value=selection;$('type').value=type;$('quantity').value=1;$('copyStatus').textContent='';$('copyFallback').hidden=true;$('enquiry').showModal();updateContactLink();updateEnquiryPhoto();}
function updateUrl(design,mode='push'){const q=new URLSearchParams();if(searchTerm.trim())q.set('q',searchTerm.trim());if(activeBrand!=='All')q.set('brand',activeBrand);if(activeSeries!=='All')q.set('series',activeSeries);if(design)q.set('design',design);navigateTo(location.pathname+(q.size?'?'+q.toString():'')+'#collection',mode,!!design);}
function seriesButtons(){const host=$('seriesFilters');host.replaceChildren();const families=[...new Set(products.filter(p=>activeBrand==='All'||p.brand===activeBrand).map(p=>p.family))];['All',...families].forEach(f=>{const b=document.createElement('button');b.textContent=f==='All'?'All series':f;b.classList.toggle('active',f===activeSeries);b.setAttribute('aria-pressed',String(f===activeSeries));b.onclick=()=>{activeSeries=f;seriesButtons();render();updateUrl()};host.append(b)})}
const brandHost=document.querySelector('.brand-filters');brandHost.replaceChildren();['All',...new Set(products.map(p=>p.brand))].forEach(brand=>{const b=document.createElement('button');b.dataset.brand=brand;b.textContent=brand==='All'?'All brands':brand;brandHost.append(b)});
document.querySelectorAll('[data-brand]').forEach(b=>b.onclick=()=>{activeBrand=b.dataset.brand;activeSeries='All';document.querySelectorAll('[data-brand]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});seriesButtons();render();updateUrl()});
$('enquiryForm').onsubmit=async e=>{e.preventDefault();const text=makeEnquiryText(enquiryFields());try{await navigator.clipboard.writeText(text);$('copyStatus').textContent='Enquiry copied. Keep it for later — no message has been sent.'}catch{$('copyFallback').hidden=false;$('copyFallback').value=text;$('copyFallback').select();$('copyStatus').textContent='Select and copy the text below. No message has been sent.'}};
$('detail').addEventListener('close',()=>{if(ignoredDetailCloses){ignoredDetailCloses--;return;}if(!new URLSearchParams(location.search).has('design'))return;if(history.state?.detailEntry)history.back();else updateUrl(undefined,'replace');});document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));$('year').textContent=new Date().getFullYear();const query=new URLSearchParams(location.search);if(products.some(p=>p.brand===query.get('brand')))activeBrand=query.get('brand');if(products.some(p=>p.family===query.get('series')&&(activeBrand==='All'||p.brand===activeBrand)))activeSeries=query.get('series');document.querySelectorAll('[data-brand]').forEach(b=>{b.classList.toggle('active',b.dataset.brand===activeBrand);b.setAttribute('aria-pressed',String(b.dataset.brand===activeBrand))});seriesButtons();render();const selected=query.get('design');if(selected)showProduct(selected,false);

document.querySelectorAll('[data-close-dialog]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
document.querySelector('[data-open-privacy]').onclick=()=>$('privacy').showModal();
document.querySelectorAll('[data-enquiry]').forEach(b=>b.onclick=()=>openEnquiry(b.dataset.enquiry==='Wholesale'?'Wholesale partnership':'General enquiry',b.dataset.enquiry));

function enquiryProduct(){return products.find(p=>$('selection').value.startsWith(p.id+' '));}
function enquiryFields(){const fields={type:$('type').value,selection:$('selection').value,country:$('country').value,quantity:$('quantity').value,notes:$('notes').value};const p=enquiryProduct();return p?productEnquiryFields(p,location.origin,fields):fields;}
function updateContactLink(){$('enquiryCode').value=enquiryProduct()?.id||'General enquiry / 未选择具体产品';const href=buildContactUrl(CONTACT_URL,makeEnquiryText(enquiryFields()));$('externalContact').hidden=!href;if(href)$('externalContact').href=href;}
$('enquiryForm').addEventListener('input',()=>{updateContactLink();updateEnquiryPhoto();});
document.querySelectorAll('[data-direct-contact]').forEach(a=>{const href=buildContactUrl(CONTACT_URL,makeEnquiryText({type:'Retail / Wholesale',selection:'General enquiry'}));a.hidden=!href;if(href)a.href=href;});

function preloadPhoto(p){if(!photoFiles.has(p.image)){const promise=fetch('/assets/'+p.image+'.jpg').then(async response=>{if(!response.ok)throw new Error('Photo unavailable');const blob=await response.blob();return new File([blob],p.id+'-JUXIANG.jpg',{type:'image/jpeg'});}).catch(error=>{photoFiles.delete(p.image);throw error});photoFiles.set(p.image,promise)}return photoFiles.get(p.image);}
async function readyPhotoButton(p,button,status,fields){button.disabled=true;button.textContent='PREPARING PHOTO…';button.dataset.image=p.image;let file;try{file=await preloadPhoto(p)}catch{if(button.dataset.image!==p.image)return;button.textContent='PHOTO UNAVAILABLE';status.textContent='Please use the product photo link or try again.';return}if(button.dataset.image!==p.image)return;button.disabled=false;const supported=!!(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]}));button.textContent=supported?'SHARE PRODUCT PHOTO ↗':'DOWNLOAD PRODUCT PHOTO ↓';button.onclick=async()=>{if(supported){try{await navigator.share({files:[file],title:p.name,text:makeEnquiryText(fields())});status.textContent='Share menu closed. Check WhatsApp to confirm the photo was sent.';}catch(error){status.textContent=error.name==='AbortError'?'Sharing cancelled. Nothing was sent by this website.':'Photo sharing is unavailable. Download the photo and attach it in our WhatsApp chat.';}}else{const a=document.createElement('a');a.href='/assets/'+p.image+'.jpg';a.download=p.id+'-JUXIANG.jpg';a.click();status.textContent='Attach the downloaded photo in our WhatsApp chat (+86 199 2235 3655).';}};}
let enquiryPhotoId='';
function updateEnquiryPhoto(){const p=enquiryProduct();$('enquiryPhoto').hidden=!p;if(!p){enquiryPhotoId='';$('enquiryShare').dataset.image='';return}if(enquiryPhotoId===p.id)return;enquiryPhotoId=p.id;$('enquiryPhotoImage').src='/assets/'+p.image+'.jpg';$('enquiryPhotoImage').alt=p.name;$('enquiryDownload').href='/assets/'+p.image+'.jpg';$('enquiryDownload').download=p.id+'.jpg';$('enquiryShareStatus').textContent='';readyPhotoButton(p,$('enquiryShare'),$('enquiryShareStatus'),enquiryFields);}

const searchInput = $('productSearch');
searchInput.value = searchTerm;
let searchNavigationTimer;
function runSearch() {
  searchTerm = searchInput.value;
  activeBrand = 'All'; activeSeries = 'All';
  document.querySelectorAll('[data-brand]').forEach(b => {
    b.classList.toggle('active', b.dataset.brand === 'All');
    b.setAttribute('aria-pressed', String(b.dataset.brand === 'All'));
  });
  seriesButtons(); render(); updateUrl(undefined,searchNavigationTimer?'replace':'push');
  clearTimeout(searchNavigationTimer);searchNavigationTimer=setTimeout(()=>{searchNavigationTimer=null;},800);
}
searchInput.addEventListener('input', runSearch);
$('catalogSearch').addEventListener('submit', e => { e.preventDefault(); runSearch(); });
$('clearSearch').onclick = () => { searchInput.value=''; runSearch(); searchInput.focus(); };
$('resetSearch').onclick = () => { searchInput.value=''; runSearch(); searchInput.focus(); };

document.querySelectorAll('[data-go-home],header .brand').forEach(a => a.addEventListener('click',e=>{e.preventDefault();goHome();}));
document.querySelectorAll('[data-go-back]').forEach(b => b.addEventListener('click',goBack));
document.querySelectorAll('a[href^="#"]:not([data-go-home]):not(.brand)').forEach(a=>a.addEventListener('click',e=>{
  const target=document.getElementById(a.getAttribute('href').slice(1));
  if(!target)return;
  e.preventDefault();saveScroll();
  navigateTo(location.pathname+location.search+a.getAttribute('href'));
  target.scrollIntoView({behavior:'smooth'});
}));

history.scrollRestoration = 'manual';
let scrollSaveTimer;
window.addEventListener('scroll',()=>{clearTimeout(scrollSaveTimer);scrollSaveTimer=setTimeout(saveScroll,180);},{passive:true});
