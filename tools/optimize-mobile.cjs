
const fs=require('fs'),vm=require('vm'),path=require('path');
const out='public';const h=fs.readFileSync('index.html','utf8');const cssFiles=[...h.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(m=>m[1].split('?')[0]);
const scrubLogo=s=>s.replace(/data:image\/png;base64,[A-Za-z0-9+/=]+/g,'assets/jx-header-logo.webp');
fs.writeFileSync(out+'/mobile-storefront.css',cssFiles.map(file=>scrubLogo(fs.readFileSync(file,'utf8'))).join('\n'));
const c=vm.createContext({});vm.runInContext(fs.readFileSync('catalog.js','utf8')+';globalThis.result={siteSettings,products,legacyProductLinks,legacyVariantLinks}',c);
fs.mkdirSync(out+'/catalog-details',{recursive:true});
const products=c.result.products.map(p=>{
 const details={id:p.id,description:p.description,sizeReference:p.sizeReference,detailImages:p.detailImages||[],referencePhotos:p.referencePhotos||[],variants:p.variants.map(v=>({key:v.key,detailImages:v.detailImages||[],photos:v.photos||[]}))};
 fs.writeFileSync(out+'/catalog-details/'+p.id+'.json',JSON.stringify(details));
 return {...p,priceUSD:null,detailImages:[],referencePhotos:[],detailsDeferred:true,variants:p.variants.map(v=>({...v,detailImages:[],photos:[]}))};
});

const language=vm.createContext({window:{}});vm.runInContext(fs.readFileSync('locale-catalog-20261114.js','utf8'),language);
fs.mkdirSync(out+'/locale-translations',{recursive:true});
for(const [i,locale]of ['en','zh-CN','es','fr','de','ar'].entries()){
 const rows=language.window.JXFullTranslations.map(row=>[row[0],row[i+1]]);
 fs.writeFileSync(out+'/locale-translations/'+locale+'.js','window.JXLocalePacks=window.JXLocalePacks||{};window.JXLocalePacks['+JSON.stringify(locale)+']='+JSON.stringify(rows)+';');
}
let core='';for(const [name,value]of Object.entries({...c.result,products}))core+='const '+name+'='+JSON.stringify(value)+';\n';
const names=dir=>fs.readdirSync(out+'/assets/'+dir).filter(x=>x.endsWith('.webp')).map(x=>x.slice(0,-5));
core+='window.JXThumbnailIds=new Set('+JSON.stringify(names('thumbs'))+');window.JXHeroIds=new Set('+JSON.stringify(names('hero'))+');window.JXCatalogueBuild='+JSON.stringify(process.env.RENDER_GIT_COMMIT||'mobile-fast-1')+';';
fs.writeFileSync(out+'/catalog.js',core);
fs.writeFileSync(out+'/storefront-core.js',['contact.js','price-access.js','app.js','site-languages-20261114.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n;\n'));
let html=scrubLogo(h).replace(/<link rel="stylesheet" href="[^"]+">/g,'');
html=html.replace('</head>','<link rel="stylesheet" href="mobile-storefront.css?v=mobile-detail-1"><link rel="preload" as="script" href="storefront-core.js?v=mobile-detail-1"></head>');
html=html.replace('href="assets/jx-emblem-light-20261114.png"','href="assets/jx-favicon.png"');
html=html.replace(/(<a[^>]*data-hero-product="([^"]+)"[^>]*data-color="([^"]+)"[^>]*><img[^>]*src=")assets\/[^"]+\.jpg(")/g,(_,prefix,id,key,suffix)=>{const p=c.result.products.find(p=>p.id===id),v=p?.variants.find(v=>v.key===key);return prefix+'assets/'+(v?.image||'')+'.jpg'+suffix;});
let i=0;html=html.replace(/src="assets\/([^"]+)\.jpg"/g,(_,id)=>i++===0?'src="assets/hero/'+id+'.webp"':'data-src="assets/hero/'+id+'.webp"');

// Publish catalogue assets under a build-specific path to avoid stale CDN mixes.
const buildTag=(process.env.RENDER_GIT_COMMIT||'catalogue').replace(/[^a-zA-Z0-9-]/g,'').slice(0,12);
for(const dir of ['catalog-details','locale-translations']){
 fs.mkdirSync(out+'/'+dir+'/'+buildTag,{recursive:true});
 for(const name of fs.readdirSync(out+'/'+dir).filter(n=>/\.(json|js)$/.test(n)))fs.copyFileSync(out+'/'+dir+'/'+name,out+'/'+dir+'/'+buildTag+'/'+name);
}
const catalogueName='catalog.'+buildTag+'.js',coreName='storefront-core.js-'+buildTag+'.js';
fs.copyFileSync(out+'/catalog.js',out+'/'+catalogueName);
const versionedCore=fs.readFileSync(out+'/storefront-core.js','utf8').replaceAll("'catalog-details/'","'catalog-details/"+buildTag+"/'").replaceAll("'locale-translations/'","'locale-translations/"+buildTag+"/'");
fs.writeFileSync(out+'/'+coreName,versionedCore);
html=html.replace(/src="catalog\.js(?:\?[^"]*)?"/g,'src="'+catalogueName+'"').replace(/storefront-core\.js\?[^"]+/g,coreName);

fs.writeFileSync(out+'/index.html',html);
console.log(JSON.stringify({htmlBytes:Buffer.byteLength(html),catalogueBytes:Buffer.byteLength(core),cssBytes:fs.statSync(out+'/mobile-storefront.css').size,scriptBytes:fs.statSync(out+'/storefront-core.js').size,groups:products.length}));
