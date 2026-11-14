const fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process');
(async()=>{
 const ctx=vm.createContext({});vm.runInContext(fs.readFileSync('catalog.js','utf8')+';globalThis.result={products:products.map(p=>({...p,priceUSD:null})),siteSettings,legacyProductLinks,legacyVariantLinks}',ctx);
 const sourceCommit=process.env.RENDER_GIT_COMMIT||cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);let snapshot;
 try{const r=await fetch('https://juxiang-render-admin.fleecycroissant1.chatgpt.site/api/public',{cache:'no-store',signal:controller.signal});if(!r.ok)throw Error('Catalogue snapshot unavailable');snapshot=await r.json();if(snapshot.schema!==1||!Array.isArray(snapshot.products))throw Error('Invalid catalogue snapshot');}finally{clearTimeout(timer)}
 const clean=x=>Array.isArray(x)?x.map(clean):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,k==='priceUSD'?null:clean(v)])):x;
 fs.mkdirSync('public',{recursive:true});fs.writeFileSync('public/catalog-data.json',JSON.stringify({schema:1,sourceCommit,...ctx.result}));
 fs.writeFileSync('public/catalogue-snapshot.js','window.JXCatalogueSnapshot='+JSON.stringify(clean(snapshot)).replace(/</g,'\\u003c')+';');
 console.log('Admin catalogue export and no-price offline snapshot ready');
})().catch(e=>{console.error(e.message);process.exit(1)});
