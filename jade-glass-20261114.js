(() => {
 const header=document.querySelector('header.site-header');if(!header)return;
 const spacer=document.createElement('div');spacer.className='header-flow-space';spacer.setAttribute('aria-hidden','true');header.before(spacer);
 let compact=false,frame=0;
 function measure(){const active=compact;if(active)header.classList.remove('is-glass');spacer.style.height=header.getBoundingClientRect().height+'px';if(active)header.classList.add('is-glass');}
 function update(){frame=0;const y=Math.max(0,window.scrollY);const next=compact?y>40:y>100;if(next===compact)return;
 if(next){measure();spacer.style.display='block';header.classList.add('is-glass');}else{header.classList.remove('is-glass');spacer.style.display='none';}compact=next;
 }
 function queue(){if(!frame)frame=requestAnimationFrame(update);}
 window.addEventListener('scroll',queue,{passive:true});
 window.addEventListener('resize',()=>{measure();queue();},{passive:true});
 window.addEventListener('pageshow',queue);window.addEventListener('load',()=>{measure();queue();});
 if(document.fonts)document.fonts.ready.then(()=>{measure();queue();});
 measure();update();
})();