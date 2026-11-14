
const fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process');
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync('catalog.js','utf8')+';globalThis.result={products,siteSettings,legacyProductLinks,legacyVariantLinks}',ctx);
const sourceCommit=process.env.RENDER_GIT_COMMIT||cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
fs.mkdirSync('public',{recursive:true});fs.writeFileSync('public/catalog-data.json',JSON.stringify({schema:1,sourceCommit,...ctx.result}));
console.log('Admin catalogue export ready');
