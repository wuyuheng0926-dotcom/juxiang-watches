(() => {
 const header=document.querySelector('header.site-header');if(!header)return;
 let frame=0;
 function measure(){document.documentElement.style.setProperty('--jx-header-height',header.getBoundingClientRect().height+'px');}
 function update(){frame=0;header.classList.toggle('is-glass',window.scrollY>80);measure();}
 window.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update)},{passive:true});
 window.addEventListener('resize',update,{passive:true});
 if(window.ResizeObserver)new ResizeObserver(measure).observe(header);
 if(document.fonts)document.fonts.ready.then(update);
 update();
})();