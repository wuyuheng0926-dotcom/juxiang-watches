(() => {
 const hero=document.querySelector('.hero-copy');
 if(!hero || !matchMedia('(pointer:fine) and (prefers-reduced-motion:no-preference)').matches)return;
 let frame=0,point;
 hero.addEventListener('pointermove',e=>{
  point={x:e.clientX,y:e.clientY};if(frame)return;
  frame=requestAnimationFrame(()=>{const r=hero.getBoundingClientRect();hero.style.setProperty('--light-x',Math.round((point.x-r.left)/r.width*100)+'%');hero.style.setProperty('--light-y',Math.round((point.y-r.top)/r.height*100)+'%');frame=0;});
 },{passive:true});
 hero.addEventListener('pointerleave',()=>{if(frame)cancelAnimationFrame(frame);frame=0;hero.style.removeProperty('--light-x');hero.style.removeProperty('--light-y');});
})();