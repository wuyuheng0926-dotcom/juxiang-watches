const fs=require('fs'),vm=require('vm'),path=require('path');const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const context=vm.createContext({window:{}});vm.runInContext(read('catalog.js')+';globalThis.data={products,siteSettings,legacyProductLinks,legacyVariantLinks}',context);vm.runInContext(read('locale-catalog-20261114.js'),context);
const oldRows=context.window.JXFullTranslations,dict=new Map(),extra=new Map();
const clean=s=>String(s||'').replace(/\s*[—–·|/-]?\s*(?:Unconfirmed|待确认|待確認|未经证实|未經證實|未经确认|未确认|未證實|未证实|Sin confirmar|Non confirmé|Unbestätigt|غير مؤكد)\s*/gi,' ').replace(/\s+([—–·])/g,' $1').replace(/([—–·])\s*([—–·])/g,'$1').replace(/^[\s—–·/]+|[\s—–·/]+$/g,'').replace(/\s{2,}/g,' ').trim();
for(const row of oldRows){const a=row.slice(1);dict.set(row[0],a);dict.set(a[0],a)}
for(const row of oldRows){const a=row.slice(1).map(s=>String(s).split(/\s*[·•]\s*|\s+[—–]\s+/));if(a.every(x=>x.length===a[0].length))for(let i=0;i<a[0].length;i++)if(a[0][i].length>2&&!dict.has(a[0][i]))dict.set(a[0][i],a.map(x=>x[i]));}
function lines(f){return read(f).replace(/^\uFEFF/,'').split(/\r?\n/).filter(Boolean).map(s=>s.split('|'));}
for(const row of lines('product-terms.txt')){if(row.length!==6)throw Error('Term width '+row[0]);dict.set(row[0],row)}
const profile=new Map(lines('product-profiles.txt').map(([key,...texts])=>[key,texts]));
const colors={Black:['黑色','negro','noir','Schwarz','أسود'],White:['白色','blanco','blanc','Weiß','أبيض'],Blue:['蓝色','azul','bleu','Blau','أزرق'],Green:['绿色','verde','vert','Grün','أخضر'],Grey:['灰色','gris','gris','Grau','رمادي'],Silver:['银色','plateado','argenté','Silberfarben','فضي اللون'],'Silver-tone':['银色','plateado','argenté','Silberfarben','فضي اللون'],'Silver tone':['银色','plateado','argenté','Silberfarben','فضي اللون'],'Silver-colour':['银色','plateado','argenté','Silberfarben','فضي اللون'],'Rose tone':['玫瑰金色','oro rosa, tono','or rose, teinte','Roségoldfarben','بلون الذهب الوردي'],'Rose-tone':['玫瑰金色','tono oro rosa','teinte or rose','Roségoldfarben','بلون الذهب الوردي'],'Rose-colour':['玫瑰金色','tono oro rosa','teinte or rose','Roségoldfarben','بلون الذهب الوردي'],'Gold-tone':['金色','dorado','doré','Goldfarben','ذهبي اللون'],'Yellow-tone':['黄色金属色','dorado amarillo','doré jaune','Gelbgoldfarben','ذهبي أصفر اللون'],'Yellow tone':['黄色金属色','dorado amarillo','doré jaune','Gelbgoldfarben','ذهبي أصفر اللون'],Yellow:['黄色','amarillo','jaune','Gelb','أصفر'],Purple:['紫色','morado','violet','Violett','بنفسجي'],Brown:['棕色','marrón','brun','Braun','بني'],'Dark brown':['深棕色','marrón oscuro','brun foncé','Dunkelbraun','بني داكن'],'Dark grey':['深灰色','gris oscuro','gris foncé','Dunkelgrau','رمادي داكن'],'Dark green':['深绿色','verde oscuro','vert foncé','Dunkelgrün','أخضر داكن'],'Dark olive':['深橄榄色','oliva oscuro','olive foncé','Dunkeloliv','زيتي داكن'],'Blue-grey':['蓝灰色','gris azulado','bleu-gris','Blaugrau','رمادي مزرق'],Lime:['荧光绿','verde lima','vert citron','Limettengrün','أخضر ليموني'],Olive:['橄榄色','oliva','olive','Oliv','زيتي'],Rainbow:['彩虹色','multicolor','arc-en-ciel','Regenbogenfarben','ألوان قوس قزح'],Dark:['深色','oscuro','sombre','Dunkel','داكن'],Light:['浅色','claro','clair','Hell','فاتح'],Warm:['暖色','cálido','chaud','Warm','دافئ'],'Warm tone':['暖色','tono cálido','teinte chaude','Warmton','بلون دافئ']};
const component={dial:['表盘','Esfera','Cadran','Zifferblatt','ميناء'],case:['表壳','Caja','Boîtier','Gehäuse','علبة'],bracelet:['表链','Brazalete','Bracelet','Armband','سوار'],strap:['表带','Correa','Bracelet','Armband','سوار'],subdials:['副盘','Subesferas','Compteurs','Hilfszifferblätter','موانئ فرعية'],accents:['细节','Detalles','Détails','Akzente','تفاصيل'],'case and bracelet':['表壳及表链','Caja y brazalete','Boîtier et bracelet','Gehäuse und Armband','علبة وسوار'],'case and bezel':['表壳及表圈','Caja y bisel','Boîtier et lunette','Gehäuse und Lünette','علبة وإطار']};
const missing=new Set();
function tr(input,depth=0){const s=clean(input);if(!s)return Array(6).fill('');if(depth>8)throw Error('Recursion '+s);
 // Split descriptive family names before looking up old machine-translated whole titles.
 const parts=s.split(/\s+[—–]\s+|\s*[·•]\s*/);if(parts.length>1){const translated=parts.map(x=>tr(x,depth+1));return Array.from({length:6},(_,i)=>translated.map(x=>x[i]).join(' · '));}
 if(/-style$/i.test(s)){const base=tr(s.replace(/-style$/i,''),depth+1);return [base[0]+' style',base[1]+'风格','Estilo '+base[2],'Style '+base[3],base[4]+'-Stil','طراز '+base[5]];}
 if(dict.has(s))return dict.get(s).map(clean).map((v,i)=>i===2?v.replace(/Brazalete plateada/g,'Brazalete plateado').replace(/pulsera metálica/g,'Brazalete metálico'):v);
 if(colors[s])return[s,...colors[s]];
 for(const [color,values]of Object.entries(colors).sort((a,b)=>b[0].length-a[0].length)){
  if(!s.startsWith(color+' '))continue;const tail=s.slice(color.length+1);
  if(component[tail])return[s,...values.map((v,i)=>component[tail][i]+(i===0?'：':': ')+v)];
  if(tail.startsWith('decorated ')){const rest=tr(color+' '+tail.slice(10),depth+1);return rest.map((x,i)=>i===0?s:[x+'装饰款',x+' decorado',x+' décoré',x+' verziert',x+' مزخرف'][i-1]);}
 }
 const aliases={'Silver-tone metal bracelet':'Silver-tone bracelet','Black rubber strap':'Rubber strap','White date dial':'White dial','Green date dial':'Green dial','Silver and rose-tone bracelet':'Two-tone bracelet','Dark bracelet':'Black strap','Diver-style dial':'Diver-style dial'};
 if(aliases[s]&&aliases[s]!==s)return tr(aliases[s],depth+1);
 missing.add(s);return Array(6).fill(s);
}
function remember(source,values){if(!source)return;extra.set(source,[source,...values]);}
const pick=p=>{const f=clean(p.baseFamily||p.family).toLowerCase();if(/day-date/.test(f))return'daydate';if(/datejust/.test(f))return'datejust';if(/gmt/.test(f))return'gmt';if(/daytona|speedmaster|chronograph/.test(f)&&!/^portugieser|portofino|aquatimer|pilot|royal oak/.test(f))return'chrono';if(/yacht/.test(f))return'nautical';if(/submariner|sea-dweller|deepsea|aquatimer|seamaster.*(?:300|diver|planet)/.test(f))return'diver';if(/aqua terra/.test(f))return'minimal';if(/overseas/.test(f))return'over seas';if(/222/.test(f))return'222';if(/nautilus/.test(f))return'nautilus';if(/aquanaut/.test(f))return'aquanaut';if(/ellipse/.test(f))return'ellipse';if(/celestial/.test(f))return'astronomy';if(/complications/.test(f))return'complication';if(p.brand==='Richard Mille'||/tonneau|malte/.test(f))return'architecture';if(/offshore/.test(f))return'offshore';if(/royal oak/.test(f))return'royaloak';if(/pilot/.test(f))return'pilot';if(/portugieser/.test(f))return'portugieser';if(/tank|rectangular/.test(f))return'tank';if(/ballon/.test(f))return'ballon';if(/santos/.test(f))return'santos';if(/panth[eè]re|gala|heures|baignoire|rendez/.test(f))return'jewel';if(/constellation/.test(f))return'constellation';if(/altiplano|patrimony|oyster|air-king/.test(f))return'minimal';return'classic';};
let snapshot={products:[]};if(fs.existsSync(root+'/public/catalogue-snapshot.js')){const cx=vm.createContext({window:{}});vm.runInContext(read('public/catalogue-snapshot.js'),cx);snapshot=cx.window.JXCatalogueSnapshot;}else if(fs.existsSync(root+'/public-before.json'))snapshot=JSON.parse(read('public-before.json'));
const patches=new Map(snapshot.products.map(x=>[x.id,x.data]));
const products=context.data.products.map(p=>{const o=patches.get(p.id);if(!o)return p;const variants=p.variants.map(v=>({...v,...o.variants.find(x=>x.key===v.key)}));for(const v of o.variants)if(!variants.some(x=>x.key===v.key))variants.push(v);return{...p,...o,variants}});
const entries={};
for(const p of products){
 const fam=tr(p.family),name=tr(p.name),base=tr(p.baseFamily||clean(p.family).split(' — ')[0]);
 let design=p.designDetails||clean(p.family).split(' — ').slice(1).join(' · ');const detail=tr(design),band=tr(p.bandName),style=profile.get(pick(p));if(!style||style.length!==6)throw Error('Missing profile '+p.id);
 const desc=Array.from({length:6},(_,i)=>[base[i]+'.',style[i],design?['Visible design details: ','可见设计细节：','Detalles visibles: ','Détails visibles : ','Sichtbare Designdetails: ','تفاصيل التصميم الظاهرة: '][i]+detail[i]+'.':'',p.bandName?['Strap styling: ','表带风格：','Estilo de correa: ','Style du bracelet : ','Armbandgestaltung: ','طابع السوار: '][i]+band[i]+'.':''].filter(Boolean).join(' '));
 entries[p.id]={description:desc[0],previous:p.description};
 for(const term of [p.brand,clean(p.baseFamily||'')])if(dict.has(term))remember(term,tr(term));
 for(const [key,values]of [['family',fam],['name',name],['baseFamily',base],['designDetails',detail],['bandName',band]]){remember(clean(p[key]),values);remember(p[key],values);if(p[key+'Zh']){remember(p[key+'Zh'],values);remember(clean(p[key+'Zh']),values);}}
 remember(desc[0],desc);
 for(const v of p.variants){const values=tr(v.label);remember(v.label,values);remember(v.labelZh,values);for(const im of [...v.detailImages||[]]){const text=im.caption||im.label;if(text&&dict.has(text))remember(text,tr(text));}}
}
for(const p of products){
 const media=[...p.detailImages||[],...p.referencePhotos||[],...p.variants.flatMap(v=>v.detailImages||[])];
 for(const source of [p.sizeReference,...media.flatMap(im=>[im.label,im.labelZh,im.caption,im.alt])].filter(Boolean)){
  if(source==='Unconfirmed / 待确认'){remember(source,['Not verified','未核实','Sin verificar','Non vérifié','Nicht verifiziert','غير متحقق منه']);continue;}
  const canonical=source.replace(/\s*\/\s*[\u3400-\u9fff].*$/u,'');remember(source,dict.has(source)?dict.get(source):tr(canonical));
 }
}
// Keep all catalogue labels, including generic detail-image labels, available in every locale.
for(const [source,values]of dict)if(['Rolex','Vacheron Constantin','Patek Philippe','Audemars Piguet','Richard Mille','Omega','IWC','Jaeger-LeCoultre','Cartier','Piaget','Product detail','Product details','Selected photograph','Metal bracelet','Leather strap','Rubber strap','Textile strap'].includes(source))remember(source,values);
const runtime='(()=>{const entries='+JSON.stringify(entries).replace(/</g,'\\u003c')+';const clean='+clean.toString()+';window.JXEnrichProducts=list=>{for(const p of list){for(const key of ["family","baseFamily","name","nameZh","designDetails","designDetailsZh"])if(p[key])p[key]=clean(p[key]);const entry=entries[p.id];if(entry&&(p.description===entry.previous||p.description===entry.description||/Seller-supplied photographs|user-supplied photographs|Choose a colour and swipe|^Explore .*supplied photographs/.test(p.description||"")))p.description=entry.description;}return list;};})();';
fs.mkdirSync(root+'/public',{recursive:true});fs.writeFileSync(root+'/public/product-copy.js',runtime);fs.writeFileSync(root+'/public/product-copy-translations.json',JSON.stringify([...extra.values()]));fs.writeFileSync(root+'/translation-audit.json',JSON.stringify({groups:products.length,variants:products.reduce((n,p)=>n+p.variants.length,0),rows:extra.size,missing:[...missing].sort()},null,2));console.log(JSON.stringify({groups:products.length,translationRows:extra.size,missingTerms:missing.size}));
if(missing.size){console.error([...missing].sort().join('\n'));process.exitCode=1;}
