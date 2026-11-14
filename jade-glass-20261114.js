(() => {
 const header=document.querySelector('header.site-header');if(!header)return;
 // Keep one geometry: scroll anchoring cannot toggle the header around a threshold.
 header.classList.add('is-glass');
 let frame=0,lastHeight=0;
 function measure(){frame=0;const height=Math.round(header.getBoundingClientRect().height);if(height!==lastHeight){lastHeight=height;document.documentElement.style.setProperty('--jx-header-height',height+'px');}}
 function queue(){if(!frame)frame=requestAnimationFrame(measure);}
 window.addEventListener('resize',queue,{passive:true});
 if(window.ResizeObserver)new ResizeObserver(queue).observe(header);
 if(document.fonts)document.fonts.ready.then(queue);
 measure();
})();
