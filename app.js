/* A series has one product code and price, with strap-specific colour variants. */
const CONTACT_URL = siteSettings.contactUrl || '';
document.querySelector('.brand-wordmark').textContent = siteSettings.brandName || 'JUXIANG';


const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = amount => !window.JXPriceAccess?.valid() ? 'Contact us to view price / 联系客服查看价格' : !Number.isFinite(amount) ? 'Price on request / 价格待询' : new Intl.NumberFormat('en-US', {style:'currency', currency:'USD', maximumFractionDigits:0}).format(amount);
const brandAliases = {
  'Richard Mille':'理查德 理查德米勒 里查德 RM', Rolex:'劳力士 勞力士', Cartier:'卡地亚 卡地亞', 'Vacheron Constantin':'江诗丹顿 江詩丹頓 vc',
  'Audemars Piguet':'爱彼 愛彼 ap', IWC:'万国 萬國 沙夫豪森', 'Patek Philippe':'百达翡丽 百達翡麗 pp', Omega:'欧米茄 歐米茄', Piaget:'伯爵 piaget', Longines:'浪琴 浪琴表 longines', Blancpain:'宝珀 寶珀 blancpain', 'Jaeger-LeCoultre':'积家 積家 jlc jaeger lecoultre'
};
const bandLabels = {metal:'Metal bracelet / 金属表链', rubber:'Rubber strap / 橡胶表带', leather:'Leather strap / 皮革表带', textile:'Textile strap / 织物表带'};
const bandAliases = {metal:'金属表带 金属表链 钢带 钢链 鋼帶 鋼鏈',rubber:'橡胶 胶带 膠帶 橡膠',leather:'皮带 皮質 皮质 皮革',textile:'织物 織物 帆布 尼龙 尼龍'};
const familyAliases = {
 'Golden Ellipse':'金椭圆 椭圆', Calatrava:'卡拉卓华 卡拉卓娃', Celestial:'星空 天文', Complications:'复杂功能 复杂款',
 Tonneau:'酒桶形 理查德 镂空', Constellation:'星座', Speedmaster:'超霸', Seamaster:'海马',
  DolceVita:'黛绰维纳 黛綽維納 长方形', PrimaLuna:'心月', Lyre:'律雅', 'Présence':'瑰丽 瑰麗 presence', HydroConquest:'康卡斯 康卡斯潜水', Spirit:'先行者', Flyback:'飞返 飛返', 'Master Collection':'名匠 大师', 'Fifty Fathoms':'五十噚 五十寻', Bathyscaphe:'深潜器 深潛器', 'Master Ultra Thin':'超薄大师 超薄大師 积家月相', Moonphase:'月相',
  Nautilus:'鹦鹉螺 鸚鵡螺', Aquanaut:'手雷', Portugieser:'葡萄牙 葡计 葡七', Portofino:'柏涛菲诺 柏濤菲諾',
  Pilot:'飞行员 飛行員 大飞 马克', Ingenieur:'工程师 工程師', Submariner:'潜航者 水鬼', Datejust:'日志 日誌',
  'Day-Date':'星期日历', Daytona:'迪通拿', 'Yacht-Master':'游艇名仕', 'GMT-Master':'格林尼治',
  'Oyster Perpetual':'蚝式恒动 蠔式恆動', Milgauss:'米尔高斯 闪电针', 'Ballon Bleu':'蓝气球 藍氣球',
  Santos:'山度士', Tank:'坦克', Overseas:'纵横四海 縱橫四海', Patrimony:'传承 傳承', 'Royal Oak':'皇家橡树 皇家橡樹',
  'Moon Phase':'月相', Chronograph:'计时 計時', 'Travel Time':'旅行时间 两地时', 'Aqua Terra':'海马 海馬',
  Worldtimer:'世界时 世界時 地球', 'Planet Ocean':'海马 海馬 海洋宇宙', 'Diver 300M':'海马 海馬 潜水300 波纹', 'De Ville':'蝶飞 碟飞 碟飛'
};
const normalizeSearch = value => String(value || '').normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}]/gu,'');
function matchesSearch(p, term, variant) {
  if (!term.trim()) return true;
  const code = normalizeSearch(term);
  if (/^jx[\s_-]*\d+(?:[\s:_-]*v\d+)?$/i.test(term.trim())) return variant && /v\d+$/i.test(term.trim()) ? normalizeSearch(p.id+'-'+variant.key)===code : normalizeSearch(p.id).startsWith(code);
  const aliases = Object.entries(familyAliases).filter(([k]) => p.family.includes(k)).map(([,v]) => v).join(' ');
  const variants = variant ? [variant] : p.variants;
  const haystack = normalizeSearch([p.id,p.brand,brandAliases[p.brand],p.family,p.nameZh,p.bandName,p.bandNameZh,bandAliases[p.band],aliases,...[p.brand,p.family,p.name,p.bandName,...variants.map(v=>v.label)].map(s=>window.JXI18n?.translate(s)||s),...variants.flatMap(v=>[v.label,v.labelZh])].join(' '));
  return term.trim().split(/\s+/).every(word => haystack.includes(normalizeSearch(word)));
}
function matchingColour(p) { return Math.max(0, p.variants.findIndex(v => matchesSearch(p, searchTerm, v))); }
const photoFiles = new Map(), selectedColors = new Map();
let activeBrand='All', activeSeries='All', activeBand='All', activeColor='All', searchTerm='', currentPage=1;
// Individual colour cards keep the original product and variant keys intact.
const seriesName=p=>p.baseFamily||p.family.split(' — ')[0];
const catalogBrands=['Rolex','Patek Philippe','Vacheron Constantin','Omega','Richard Mille','Piaget'];
const catalogCompare=new Intl.Collator('en',{numeric:true,sensitivity:'base'}).compare;
const brandRank=b=>{const i=catalogBrands.indexOf(b);return i<0?catalogBrands.length:i;};
function finishGroup(v){
 const parts=v.label.split(' · ');
 // These are existing appearance labels, never verified metal specifications.
 const finish=parts.find(s=>/^(?:silver|rose|yellow|gold|warm|dark|black)(?:[- ]tone)?(?: case| bracelet)?$/i.test(s)||/^(?:rose|yellow)?\s*two-tone$/i.test(s));
 return finish?finish.toLowerCase().replace(/-/g,' '):'unspecified';
}
const dialRules=[["black",/black|黑|墨/iu],["white",/white|白/iu],["blue",/blue|navy|turquoise|teal|蓝|藍|青/iu],["green",/green|olive|绿|綠/iu],["grey",/gr[ae]y|slate|灰/iu],["silver",/silver|银|銀/iu],["gold",/gold|champagne|香槟|香檳|金/iu],["pink",/pink|rose|粉|玫瑰/iu],["brown",/brown|chocolate|taupe|beige|棕|咖|褐|米/iu],["red",/red|burgundy|红|紅/iu],["orange",/orange|橙|橘/iu],["yellow",/yellow|黄|黃/iu],["purple",/purple|violet|紫/iu]];
function classifyDial(v){var en=v.label||'',zh=v.labelZh||'',m=en.match(/([^·]*?)\bdial\b/i),z=zh.match(/([^·]*?)(?:盘|盤)/);var first=en.split('·')[0].trim();var text=m?m[1]:z?z[1]:!/(strap|bracelet|case|bezel|tone)/i.test(first)?first:'';var colors=dialRules.filter(([,re])=>re.test(text)).map(([key])=>key);if(/rainbow|multicolou?r|彩|多色/i.test(text))colors.push('multicolour');if(!colors.length&&/skeleton|openworked|镂空|鏤空/i.test(text))colors.push('skeleton');if(!colors.length&&/light|浅|淺/i.test(text))colors.push('light');if(!colors.length&&/dark|深/i.test(text))colors.push('dark');return [...new Set(colors.length?colors:['unconfirmed'])]}
const dialColorNames={"black":"Black dial","white":"White dial","blue":"Blue dial","green":"Green dial","grey":"Grey dial","silver":"Silver dial","gold":"Gold / champagne dial","pink":"Pink dial","brown":"Brown dial","red":"Red dial","orange":"Orange dial","yellow":"Yellow dial","purple":"Purple dial","multicolour":"Multicolour dial","skeleton":"Openworked dial","light":"Light dial","dark":"Dark dial","unconfirmed":"Other / unconfirmed"};

const catalogEntries=products.flatMap((p,productOrder)=>p.variants.filter(v=>!v.catalogHidden).map((v,variantOrder)=>({p,v,productOrder,variantOrder,series:seriesName(p),finish:finishGroup(v),code:p.id+'-'+v.key}))).sort((a,b)=>
 brandRank(a.p.brand)-brandRank(b.p.brand)||catalogCompare(a.p.brand,b.p.brand)||catalogCompare(a.series,b.series)||
 catalogCompare(a.p.designDetails||a.p.family,b.p.designDetails||b.p.family)||catalogCompare(a.p.band,b.p.band)||
 a.productOrder-b.productOrder||catalogCompare(a.finish,b.finish)||a.variantOrder-b.variantOrder);
let mobileCatalogColumns=3;try{const saved=Number(localStorage.getItem('juxiang.catalogColumns'));if([1,2,3,4].includes(saved))mobileCatalogColumns=saved;}catch{}
document.documentElement.dataset.mobileColumns=mobileCatalogColumns;
function catalogColumns(){return matchMedia('(max-width:767px)').matches?mobileCatalogColumns:matchMedia('(min-width:1100px)').matches?4:matchMedia('(min-width:800px)').matches?3:2;}
function pageSize(){return catalogColumns()*3;}
function filteredProducts(){
 const list=catalogEntries.filter(({p,v,series,code})=>(activeBrand==='All'||p.brand===activeBrand)&&(activeSeries==='All'||series===activeSeries)&&(activeBand==='All'||p.band===activeBand)&&(activeColor==='All'||classifyDial(v).includes(activeColor))&&(normalizeSearch(code)===normalizeSearch(searchTerm)||matchesSearch(p,searchTerm,v)));
 return list;
}
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
  if(activeColor!=='All')q.set('dial',activeColor);
  if(currentPage>1)q.set('page',String(currentPage));
  if(design){q.set('design',design);if(color)q.set('color',color);}
  navigateTo(location.pathname+(q.size?'?'+q:'')+'#collection',mode,!!design);
}
function closeDetailQuietly(){if($('detail').open){ignoredDetailCloses++;$('detail').close();}}
function makeFilter(host,values,selected,onChange,label){
  host.replaceChildren(...values.map(value=>{const b=document.createElement('button');b.type='button';b.textContent=label(value);b.classList.toggle('active',value===selected);b.setAttribute('aria-pressed',String(value===selected));b.onclick=()=>onChange(value);return b;}));
}
function makeCatalogSelect(host,values,selected,onChange,label,title){
 const select=document.createElement('select');select.setAttribute('aria-label',title);
 select.replaceChildren(...values.map(value=>{const option=document.createElement('option');option.value=value;option.textContent=label(value);option.selected=value===selected;return option;}));
 select.onchange=()=>onChange(select.value);host.replaceChildren(select);
}
function syncControls(){
 $('productSearch').value=searchTerm;
 const brandValues=['All',...new Set(catalogEntries.map(e=>e.p.brand))];
 makeFilter(document.querySelector('.brand-filters'),brandValues,activeBrand,value=>{activeBrand=value;activeSeries='All';currentPage=1;syncControls();render();updateUrl();},v=>v==='All'?'All brands / 全部品牌':v+' / '+(brandAliases[v]||'').split(' ')[0]);
 makeCatalogSelect($('mobileBrandFilters'),brandValues,activeBrand,value=>{activeBrand=value;activeSeries='All';currentPage=1;syncControls();render();updateUrl();},v=>v==='All'?'All brands':v,'Brand');
 const seriesValues=[...new Set(catalogEntries.filter(e=>activeBrand==='All'||e.p.brand===activeBrand).map(e=>e.series))].sort(catalogCompare);
 makeCatalogSelect($('seriesFilters'),['All',...seriesValues],activeSeries,value=>{activeSeries=value;currentPage=1;render();updateUrl();},v=>v==='All'?'All series / 全部系列':v+(familyAliases[v]?' / '+familyAliases[v].split(' ')[0]:''),'Series / 系列');
 makeCatalogSelect($('strapFilters'),['All',...new Set(products.map(p=>p.band))],activeBand,value=>{activeBand=value;currentPage=1;render();updateUrl();},v=>v==='All'?'All straps / 全部表带':bandLabels[v],'Strap / 表带');
 const colours=['All',...Object.keys(dialColorNames).filter(c=>catalogEntries.some(e=>classifyDial(e.v).includes(c)))];
 makeCatalogSelect($('dialFilters'),colours,activeColor,value=>{activeColor=value;currentPage=1;render();updateUrl();},v=>v==='All'?'All dial colours':dialColorNames[v],'Dial colour');
}
function selectionPhoto(image,alt,attrs='',panel){
  if(!panel)return '<img src="'+esc(window.JXAssetUrl(image))+'" alt="'+esc(alt)+'" '+attrs+'>';
  const pos=panel.total===1?0:100*panel.index/(panel.total-1);
  return '<span class="selection-photo" role="img" aria-label="'+esc(alt)+'" style="background-image:url('+esc(window.JXAssetUrl(image))+');background-size:auto '+(panel.total*100)+'%;background-position:center '+pos+'%"></span>';
}
function render(){
  const list=filteredProducts(),size=pageSize(),pages=Math.max(1,Math.ceil(list.length/size));
  currentPage=Math.max(1,Math.min(currentPage,pages));
  const offset=(currentPage-1)*size,visible=list.slice(offset,offset+size);
  $('resultCount').textContent=list.length?(offset+1)+'–'+(offset+visible.length)+' / '+list.length+' selections · 款腕表/配色'+(searchTerm.trim()?' · '+searchTerm.trim():''):'0 watches / 未找到腕表';
  $('pageStatus').textContent=list.length?'Page '+currentPage+' of '+pages+' · 第 '+currentPage+' / '+pages+' 页':'';
  $('previousPage').disabled=$('firstPage').disabled=currentPage===1;
 $('lastPage').disabled=currentPage===pages;
 const pageSelect=$('pageSelect');
 if(pageSelect.options.length!==pages)pageSelect.replaceChildren(...Array.from({length:pages},(_,i)=>new Option(String(i+1),String(i+1))));
 pageSelect.value=String(currentPage);pageSelect.disabled=pages===1;
  $('nextPage').disabled=currentPage===pages;
  $('nextPage').textContent='Next page / 下一页 →';
  document.querySelector('.catalog-pagination').hidden=pages===1;
  $('searchEmpty').hidden=!!list.length;$('clearSearch').hidden=!searchTerm;
  $('products').replaceChildren(...visible.map(({p,v,series,code})=>{
    const card=document.createElement('article');card.className='product individual-watch';
    card.dataset.product=p.id;card.dataset.color=v.key;
    card.setAttribute('aria-label',p.brand+' '+series+' '+(v.labelZh||v.label)+' '+code);
    card.innerHTML=`<a class="product-open" href="?design=${encodeURIComponent(p.id)}&amp;color=${encodeURIComponent(v.key)}" aria-label="${esc(p.brand+' '+series+' '+v.label+' '+code)}"><div class="product-art">${selectionPhoto(v.image,p.brand+' '+p.family+' · '+v.label,'loading="lazy"',v.imagePanel)}<small>${esc(code)}</small></div><div class="product-info"><p>${esc(p.brand)}</p><h3>${esc(series)}</h3><span class="name-zh">${esc(p.nameZh)}</span><strong class="watch-colour">${esc(v.labelZh||v.label)}</strong><span class="watch-colour-en">${esc(v.label)}</span><span class="series-band">${esc(p.bandName)} · ${esc(p.bandNameZh)}</span><div class="series-card-meta"><span class="product-code">${esc(code)}</span><strong class="series-price">${money(p.priceUSD)} ${window.JXPriceAccess?.valid()&&Number.isFinite(p.priceUSD)?'<small>USD</small>':''}</strong></div><span class="card-action">View this watch / 查看此款详情 ↗</span></div></a>`;
    card.querySelector('.product-open').onclick=e=>{e.preventDefault();showProduct(p.id,true,v.key);};
    return card;
  }));
}

function resolveProduct(id,color){
  const variantAlias = color && legacyVariantLinks[id+':'+color];
  const alias = variantAlias || legacyProductLinks[id];
  const p=products.find(x=>x.id===(alias?.id||id));
  return p?{p,color:variantAlias?.color||color||alias?.color}:null;
}
function detailsMarkup(p,v){
  const details=[...p.detailImages,...v.detailImages];
  return `<section class="product-details-photos" aria-labelledby="detailsPhotoHeading"><p class="eyebrow">A CLOSER LOOK</p><h3 id="detailsPhotoHeading">Product details / 产品细节</h3>${details.length?`<div class="details-photo-grid">${details.map(d=>`<figure><img src="${esc(window.JXAssetUrl(d.image))}" alt="${esc(d.alt||d.caption||p.name)}" loading="lazy">${d.caption?`<figcaption>${esc(d.caption)}</figcaption>`:''}</figure>`).join('')}</div>`:`<div class="detail-photo-space"><span>DETAIL PHOTOGRAPHS</span><p>More details coming soon.<br>产品细节图片即将补充</p><div class="detail-photo-slots" aria-hidden="true"><i></i><i></i><i></i></div></div>`}</section>`;
}
function showProduct(id,recordHistory=true,color){
  const resolved=resolveProduct(id,color);if(!resolved)return;
  const source=resolved.p,requested=source.variants.find(v=>v.key===resolved.color);
  if(resolved.color&&!requested){
    detailController?.abort();
    $('detailBody').innerHTML='<section class="series-summary"><p class="eyebrow">SELECTION UNAVAILABLE</p><h2>此款式已下架 / Selection unavailable</h2><p>Please browse our current collection or contact us for assistance.</p><a class="button" href="/#collection">Browse watches / 浏览腕表</a></section>';
    if(!$('detail').open)$('detail').showModal();
    if(recordHistory)updateUrl(source.id,'push',resolved.color);
    return;
  }
  if(requested?.catalogHidden){
    detailController?.abort();
    const fields=productEnquiryFields(source,location.origin,{},requested);delete fields.imageUrl;
    const href=buildContactUrl(CONTACT_URL,makeEnquiryText(fields));
    $('detailBody').innerHTML='<section class="series-summary"><p class="eyebrow">PHOTO UPDATE / 图片更新中</p><h2>'+esc(source.brand)+'</h2><p>'+esc(source.id+'-'+requested.key+' · '+requested.labelZh)+'</p><p>A clear front photograph is being prepared for this selection. Please contact us to confirm the exact item.<br>此配色正在补充清晰正面照片，请联系我们确认具体款式。</p><a class="button" target="_blank" rel="noopener noreferrer" href="'+esc(href)+'">WHATSAPP ENQUIRY ↗</a></section>';
    if(!$('detail').open)$('detail').showModal();
    if(recordHistory)updateUrl(source.id,'push',requested.key);
    return;
  }
  const p={...source,variants:source.variants.filter(v=>!v.catalogHidden)};if(!p.variants.length)return;const start=Math.max(0,p.variants.findIndex(v=>v.key===(resolved.color||selectedColors.get(p.id))));
  detailController?.abort();detailController=new AbortController();const signal=detailController.signal;
  detailProduct=p;
  $('detailBody').innerHTML=`<div class="detail-layout series-detail-layout"><div class="series-gallery"><div class="colour-gallery" id="colourGallery" role="region" aria-roledescription="carousel" aria-label="Product colours / 产品配色" tabindex="0"><div class="colour-track" id="colourTrack">${p.variants.map((v,i)=>`<div class="colour-slide" role="group" aria-roledescription="slide" aria-label="${i+1} of ${p.variants.length}">${selectionPhoto(v.image,v.label,'draggable="false" '+(i===start?'fetchpriority="high"':'loading="lazy"'),v.imagePanel)}</div>`).join('')}</div><div class="colour-gallery-controls"><button type="button" id="colourPrev" aria-label="Previous colour / 上一个配色">‹</button><span id="colourCounter" aria-live="polite"></span><button type="button" id="colourNext" aria-label="Next colour / 下一个配色">›</button></div></div><p class="gallery-instruction">${p.variants.length>1?'Swipe left or right to explore colours / 左右滑动查看不同配色':'Selected photograph / 当前款式照片'}</p><div class="colour-thumbs" role="group" aria-label="Choose a colour / 选择配色">${p.variants.map(v=>`<button type="button" data-color="${esc(v.key)}" aria-label="Choose colour: ${esc(v.label)}">${selectionPhoto(v.image,'','loading="lazy"',v.imagePanel)}</button>`).join('')}</div></div><div class="series-summary"><p class="eyebrow">${esc(p.brand)} / SERIES CODE · 系列编号</p><span class="detail-series-code" id="detailSelectionCode">${esc(p.id)}</span><h2>${esc(p.family)}</h2><p class="detail-chinese">${esc(p.nameZh)}</p><p class="detail-price">${money(p.priceUSD)} ${window.JXPriceAccess?.valid()&&Number.isFinite(p.priceUSD)?'<span>USD</span>':''}</p><div class="spec"><strong>Strap / 表带</strong><span>${esc(p.bandName)} / ${esc(p.bandNameZh)}</span></div><div class="spec selected-colour"><strong>Colour / 配色</strong><span id="selectedColour"></span></div><p class="colour-name-zh" id="selectedColourZh"></p><p>${esc(p.description)}</p><div class="spec"><strong>Official family size reference</strong><span>${esc(p.sizeReference)}</span></div><a class="button" id="detailContact" target="_blank" rel="noopener noreferrer">WHATSAPP ENQUIRY ↗</a><button class="button share-photo" id="productShare" disabled>PREPARING PHOTO…</button><a class="text-link" id="detailDownload" download>Download selected colour ↓</a><p id="productShareStatus" class="share-hint" role="status"></p><button type="button" class="text-link" id="productEnquire">Add enquiry details ↗</button></div></div><div id="detailPhotoArea"></div>${p.referencePhotos.length?`<details class="reference-library"><summary>More supplied photographs / 更多原始照片 (${p.referencePhotos.length})</summary><div class="reference-grid">${p.referencePhotos.map(photo=>`<figure><a href="${esc(window.JXAssetUrl(photo.image))}" target="_blank" rel="noopener"><img src="${esc(window.JXAssetUrl(photo.image))}" alt="${esc(photo.labelZh)}" loading="lazy"></a><figcaption>${esc(photo.labelZh)}</figcaption></figure>`).join('')}</div></details>`:''}`;
  const track=$('colourTrack');let index=start,frame=0,drag=null;
  function selectColour(n,scroll=true,record=true){
    index=(n+p.variants.length)%p.variants.length;const v=p.variants[index];detailVariant=v;selectedColors.set(p.id,v.key);
    $('detailSelectionCode').textContent=p.id+'-'+v.key;$('selectedColour').textContent=v.label;$('selectedColourZh').textContent=v.labelZh;
    $('colourCounter').textContent=String(index+1).padStart(2,'0')+' / '+String(p.variants.length).padStart(2,'0');
    $('colourPrev').disabled=$('colourNext').disabled=p.variants.length<2;
    $('detailBody').querySelectorAll('[data-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.color===v.key)));
    $('detailPhotoArea').innerHTML=detailsMarkup(p,v);
    const fields=productEnquiryFields(p,location.origin,{},v);
    $('detailContact').href=buildContactUrl(CONTACT_URL,makeEnquiryText(fields));
    $('detailDownload').href=window.JXAssetUrl(v.image);$('detailDownload').download=p.id+'-'+v.key+'.jpg';
    $('productShareStatus').textContent='';readyPhotoButton(p,v,$('productShare'),$('productShareStatus'),()=>productEnquiryFields(p,location.origin,{},v));
    if(scroll)track.scrollTo({left:track.clientWidth*index,behavior:'instant'});
    if(record)updateUrl(p.id,'replace',v.key);
  }
  $('colourPrev').onclick=()=>selectColour(index-1);$('colourNext').onclick=()=>selectColour(index+1);
  $('detailBody').querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>selectColour(p.variants.findIndex(v=>v.key===b.dataset.color)));
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
  const requestedSeries=q.get('series'),oldSeries=products.find(p=>p.family===requestedSeries);
  const broadSeries=oldSeries?seriesName(oldSeries):requestedSeries;
  activeSeries=products.some(p=>seriesName(p)===broadSeries&&(activeBrand==='All'||p.brand===activeBrand))?broadSeries:'All';
  activeBand=Object.hasOwn(bandLabels,q.get('band'))?q.get('band'):'All';activeColor=Object.hasOwn(dialColorNames,q.get('dial'))?q.get('dial'):'All';currentPage=Math.max(1,parseInt(q.get('page'),10)||1);return q;
}
function restoreNavigation(){
  restoringNavigation=true;closeDetailQuietly();document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  const q=readLocation();syncControls();render();if(q.get('design'))showProduct(q.get('design'),false,q.get('color'));
  restoringNavigation=false;requestAnimationFrame(()=>{if(typeof history.state?.scrollY==='number')window.scrollTo({top:history.state.scrollY,behavior:'instant'});});
}
window.addEventListener('popstate',restoreNavigation);
function goHome(){closeDetailQuietly();document.querySelectorAll('dialog[open]').forEach(d=>d.close());activeBrand=activeSeries=activeBand=activeColor='All';searchTerm='';currentPage=1;syncControls();render();navigateTo(location.pathname+'#home');window.scrollTo({top:0,behavior:'smooth'});}
function goBack(){const modal=document.querySelector('dialog[open]');if(modal){modal.close();return;}if(history.state?.juxiang&&history.state.depth>0)history.back();else goHome();}
$('detail').addEventListener('close',()=>{if(ignoredDetailCloses){ignoredDetailCloses--;return;}if(!new URLSearchParams(location.search).has('design'))return;if(history.state?.detailEntry)history.back();else updateUrl(undefined,'replace');});
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
document.querySelectorAll('[data-close-dialog]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
document.querySelector('[data-open-privacy]').onclick=()=>$('privacy').showModal();
document.querySelectorAll('[data-go-home],header .brand').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();goHome();}));
document.querySelectorAll('[data-go-back]').forEach(b=>b.addEventListener('click',goBack));
document.querySelectorAll('a[href^="#"]:not([data-go-home]):not(.brand)').forEach(a=>a.addEventListener('click',e=>{const target=document.getElementById(a.getAttribute('href').slice(1));if(!target)return;e.preventDefault();navigateTo(location.pathname+location.search+a.getAttribute('href'));target.scrollIntoView({behavior:'smooth'});}));
let searchNavigationTimer;
function runSearch(){if(window.JXPriceAccess?.isKey($('productSearch').value))return;currentPage=1;searchTerm=$('productSearch').value;activeBrand=activeSeries=activeBand=activeColor='All';syncControls();render();updateUrl(undefined,searchNavigationTimer?'replace':'push');clearTimeout(searchNavigationTimer);searchNavigationTimer=setTimeout(()=>searchNavigationTimer=null,800);}
$('productSearch').addEventListener('input',runSearch);$('catalogSearch').onsubmit=async e=>{e.preventDefault();if(window.JXPriceAccess?.isKey($('productSearch').value)){const button=$('catalogSearch').querySelector('button[type="submit"]');button.disabled=true;try{if(await window.JXPriceAccess.redeem($('productSearch').value)){$('productSearch').value='';runSearch();}}finally{button.disabled=false}return;}runSearch();$('collection').scrollIntoView({behavior:'smooth'});};
$('clearSearch').onclick=$('resetSearch').onclick=()=>{$('productSearch').value='';runSearch();$('productSearch').focus();};
function openEnquiry(selection,type,selected=null){enquirySelection=selected;$('selection').value=selection;$('type').value=type;$('quantity').value=1;$('copyStatus').textContent='';$('copyFallback').hidden=true;$('enquiry').showModal();updateContactLink();updateEnquiryPhoto();}
document.querySelectorAll('[data-enquiry]').forEach(b=>b.onclick=()=>openEnquiry(b.dataset.enquiry==='Wholesale'?'Wholesale partnership':'General enquiry',b.dataset.enquiry));
function enquiryProduct(){return products.find(p=>$('selection').value.startsWith(p.id+' '));}
function enquiryVariant(p){return p.variants.find(v=>v.key===(enquirySelection?.id===p.id?enquirySelection.color:selectedColors.get(p.id)))||p.variants[0];}
function enquiryFields(){const fields={type:$('type').value,selection:$('selection').value,country:$('country').value,quantity:$('quantity').value,notes:$('notes').value};const p=enquiryProduct();return p?productEnquiryFields(p,location.origin,fields,enquiryVariant(p)):fields;}
function updateContactLink(){const p=enquiryProduct();$('enquiryCode').value=p?p.id+'-'+enquiryVariant(p).key:'General enquiry / 未选择系列';$('enquiryColour').value=p?enquiryVariant(p).labelZh:'';$('enquiryPrice').value=p?money(p.priceUSD)+(window.JXPriceAccess?.valid()&&Number.isFinite(p.priceUSD)?' USD':''):'';const href=buildContactUrl(CONTACT_URL,makeEnquiryText(enquiryFields()));$('externalContact').hidden=!href;if(href)$('externalContact').href=href;}
$('enquiryForm').addEventListener('input',()=>{updateContactLink();updateEnquiryPhoto();});
$('enquiryForm').onsubmit=async e=>{e.preventDefault();const text=makeEnquiryText(enquiryFields());try{await navigator.clipboard.writeText(text);$('copyStatus').textContent='Enquiry copied. Review it in WhatsApp before sending.';}catch{$('copyFallback').hidden=false;$('copyFallback').value=text;$('copyFallback').select();$('copyStatus').textContent='Select and copy the text below.';}};
document.querySelectorAll('[data-direct-contact]').forEach(a=>{const href=buildContactUrl(CONTACT_URL,makeEnquiryText({type:'Retail / Wholesale',selection:'General enquiry'}));a.hidden=!href;if(href)a.href=href;});
function preloadPhoto(p,v){if(!photoFiles.has(v.image)){const promise=fetch(window.JXAssetUrl(v.image)).then(async r=>{if(!r.ok)throw Error('Photo unavailable');return new File([await r.blob()],p.id+'-'+v.key+'-JUXIANG.jpg',{type:'image/jpeg'});}).catch(e=>{photoFiles.delete(v.image);throw e;});photoFiles.set(v.image,promise);}return photoFiles.get(v.image);}
async function readyPhotoButton(p,v,button,status,fields){
  const token=p.id+':'+v.key;button.disabled=true;button.textContent='PREPARING PHOTO…';button.dataset.selection=token;let file;
  try{file=await preloadPhoto(p,v);}catch{if(button.dataset.selection!==token)return;button.textContent='PHOTO UNAVAILABLE';status.textContent='Use the download link or try again.';return;}
  if(button.dataset.selection!==token)return;button.disabled=false;
  const supported=!!(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]}));
  button.textContent=supported?'SHARE SELECTED COLOUR ↗':'DOWNLOAD SELECTED COLOUR ↓';
  button.onclick=async()=>{if(supported){try{await navigator.share({files:[file],title:p.name+' · '+v.label,text:makeEnquiryText(fields())});status.textContent='Check WhatsApp to confirm the photo was sent.';}catch(e){status.textContent=e.name==='AbortError'?'Sharing cancelled.':'Download the photo and attach it in WhatsApp.';}}else{const a=document.createElement('a');a.href=window.JXAssetUrl(v.image);a.download=p.id+'-'+v.key+'.jpg';a.click();status.textContent='Attach the downloaded photo in our WhatsApp chat.';}};
}
let enquiryPhotoKey='';
function updateEnquiryPhoto(){const p=enquiryProduct();$('enquiryPhoto').hidden=!p;if(!p){enquiryPhotoKey='';$('enquiryShare').dataset.selection='';return;}const v=enquiryVariant(p),key=p.id+':'+v.key;if(enquiryPhotoKey===key)return;enquiryPhotoKey=key;$('enquiryPhotoImage').src=window.JXAssetUrl(v.image);$('enquiryPhotoImage').alt=v.label;$('enquiryDownload').href=window.JXAssetUrl(v.image);$('enquiryDownload').download=p.id+'-'+v.key+'.jpg';$('enquiryShareStatus').textContent='';readyPhotoButton(p,v,$('enquiryShare'),$('enquiryShareStatus'),enquiryFields);}
$('year').textContent=new Date().getFullYear();
const initialQuery=readLocation();syncControls();render();if(initialQuery.get('design'))showProduct(initialQuery.get('design'),false,initialQuery.get('color'));
history.scrollRestoration='manual';let scrollSaveTimer;window.addEventListener('scroll',()=>{clearTimeout(scrollSaveTimer);scrollSaveTimer=setTimeout(saveScroll,180);},{passive:true});

function goCatalogPage(page){
 const pages=Math.max(1,Math.ceil(filteredProducts().length/pageSize()));
 const next=Math.max(1,Math.min(page,pages));if(next===currentPage)return;
 currentPage=next;render();updateUrl();$('collection').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
}
function changeCatalogPage(step){goCatalogPage(currentPage+step);}
$('firstPage').onclick=()=>goCatalogPage(1);
$('lastPage').onclick=()=>goCatalogPage(Math.ceil(filteredProducts().length/pageSize()));
$('pageSelect').onchange=()=>goCatalogPage(Number($('pageSelect').value));
$('previousPage').onclick=()=>changeCatalogPage(-1);
$('nextPage').onclick=()=>changeCatalogPage(1);
$('catalogLayout').value=String(mobileCatalogColumns);
$('catalogLayout').onchange=()=>{
 const first=(currentPage-1)*pageSize();mobileCatalogColumns=Number($('catalogLayout').value);
 document.documentElement.dataset.mobileColumns=mobileCatalogColumns;
 try{localStorage.setItem('juxiang.catalogColumns',String(mobileCatalogColumns));}catch{}
 lastCatalogSize=pageSize();currentPage=Math.floor(first/lastCatalogSize)+1;render();updateUrl();
};

let lastCatalogSize=pageSize(),catalogResizeTimer;
window.addEventListener('resize',()=>{clearTimeout(catalogResizeTimer);catalogResizeTimer=setTimeout(()=>{
  const nextSize=pageSize();if(nextSize===lastCatalogSize)return;
  const offset=(currentPage-1)*lastCatalogSize;currentPage=Math.floor(offset/nextSize)+1;lastCatalogSize=nextSize;render();updateUrl($('detail').open?detailProduct?.id:undefined,'replace',$('detail').open?detailVariant?.key:undefined);
},180);});

const floatingLayout=document.querySelector('.floating-layout');
if(window.IntersectionObserver){new IntersectionObserver(entries=>{floatingLayout.hidden=!entries[0].isIntersecting;$('floatingSearch').hidden=floatingLayout.hidden;},{threshold:0}).observe($('collection'));}else{floatingLayout.hidden=false;$('floatingSearch').hidden=false;}

$('floatingSearch').onclick=()=>{const search=$('catalogSearch');search.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});$('productSearch').focus({preventScroll:true})};

window.addEventListener('jx-prices-change',()=>{
 render();
 if($('detail').open&&detailProduct&&detailVariant)showProduct(detailProduct.id,false,detailVariant.key);
 if($('enquiry').open)updateContactLink();
});
