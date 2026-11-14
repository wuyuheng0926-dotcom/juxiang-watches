(()=>{
'use strict';
let ready;
function script(src){return new Promise((resolve,reject)=>{const el=document.createElement('script');el.src=src;el.onload=resolve;el.onerror=()=>{el.remove();reject(Error('Model script unavailable'))};document.head.append(el)})}
async function load(){if(!ready)ready=(async()=>{if(!window.tf)await script('visual-model/tf.min.js');try{await script('visual-model/tf-backend-wasm.min.js');tf.wasm.setWasmPaths('visual-model/');await tf.setBackend('wasm');await tf.ready()}catch{try{await tf.setBackend('webgl');await tf.ready()}catch{await tf.setBackend('cpu');await tf.ready()}}const base=await tf.loadLayersModel('visual-model/model.json');return tf.model({inputs:base.inputs,outputs:base.getLayer('global_average_pooling2d_1').output})})().catch(e=>{ready=null;throw e});return ready;}
function canvas(image,panel,crop=1){const result=document.createElement('canvas');result.width=result.height=224;const ctx=result.getContext('2d',{willReadFrequently:true});let w=image.naturalWidth||image.width,h=image.naturalHeight||image.height,sx=0,sy=0;if(panel){h=h/panel.total;sy=h*panel.index}const cw=w*crop,ch=h*crop;sx+=(w-cw)/2;sy+=(h-ch)/2;ctx.fillStyle='#e8e5de';ctx.fillRect(0,0,224,224);const ratio=Math.min(224/cw,224/ch),dw=cw*ratio,dh=ch*ratio;ctx.drawImage(image,sx,sy,cw,ch,(224-dw)/2,(224-dh)/2,dw,dh);return result;}
async function extract(image,panel){const model=await load(),vectors=[];for(const crop of [1,.75]){const input=canvas(image,panel,crop);const tensor=tf.tidy(()=>model.predict(tf.browser.fromPixels(input).toFloat().div(127.5).sub(1).expandDims()));try{const data=Array.from(await tensor.data());const norm=Math.hypot(...data)||1;vectors.push(data.map(x=>x/norm))}finally{tensor.dispose()}}return{vectors};}
function pack(vector){const max=Math.max(...vector)||1,bytes=Uint8Array.from(vector,x=>Math.round(x/max*255));return btoa(String.fromCharCode(...bytes));}
function unpack(value){const bytes=Uint8Array.from(atob(value),c=>c.charCodeAt(0));let norm=0;for(const x of bytes)norm+=x*x;return{bytes,norm:Math.sqrt(norm)||1};}
function similarity(query,stored){let best=-1;for(const q of query.vectors)for(const s of stored){let dot=0;for(let i=0;i<q.length;i++)dot+=q[i]*s.bytes[i];best=Math.max(best,dot/s.norm)}return best;}
window.JXVision={load,canvas,extract,pack,unpack,similarity};
})();
