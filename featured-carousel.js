(() => {
'use strict';
let dispose=()=>{};
function initialize(){
 dispose();const root=document.getElementById('heroCarousel');if(!root)return;
 const track=root.querySelector('.hero-track');track.querySelectorAll('[data-carousel-clone]').forEach(x=>x.remove());
 const slides=[...track.children],dots=[...root.querySelectorAll('[data-slide]')];if(!slides.length){root.hidden=true;return}root.hidden=false;
 const controller=new AbortController(),signal=controller.signal,on=(el,type,fn)=>el?.addEventListener(type,fn,{signal});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let index=slides.length>1?1:0,timer,settling,dragging=null,busy=false,suppressClickUntil=0,paused=reduced.matches,hovered=false,focused=false,visible=true,observer;
 function loadSlide(s){const img=s?.querySelector('img');if(img?.dataset.src){img.src=img.dataset.src;delete img.dataset.src;img.loading='eager'}}
 if(slides.length>1){const first=slides[0].cloneNode(true),last=slides.at(-1).cloneNode(true);for(const clone of [first,last]){clone.dataset.carouselClone='true';clone.setAttribute('aria-hidden','true');clone.inert=true;clone.querySelector('a').tabIndex=-1;clone.removeAttribute('aria-label');}track.prepend(last);track.append(first);}
 const logical=()=>slides.length>1?(index-1+slides.length)%slides.length:0;
 function paint(animate=true){track.style.transition=animate&&!reduced.matches?'':'none';track.style.transform='translateX('+(-index*100)+'%)';const n=logical();dots.forEach((d,i)=>d.setAttribute('aria-pressed',String(i===n)));slides.forEach((s,i)=>{s.setAttribute('aria-hidden',String(i!==n));s.querySelector('a').tabIndex=i===n?0:-1});const code=root.querySelector('.hero-photo-code');if(code)code.textContent=(slides[n].dataset.product||'JUXIANG')+' / '+String(n+1).padStart(2,'0')+' — '+String(slides.length).padStart(2,'0');loadSlide(slides[n]);loadSlide(track.children[index]);if(!navigator.connection?.saveData&&slides.length>1)loadSlide(slides[(n+1)%slides.length]);}
 function finish(){clearTimeout(settling);if(slides.length>1){if(index===0)index=slides.length;if(index===slides.length+1)index=1;}paint(false);busy=false;}
 function schedule(){clearTimeout(timer);if(slides.length>1&&!paused&&!hovered&&!focused&&visible&&!document.hidden&&!dragging)timer=setTimeout(()=>move(1),4500);}
 function move(step,target,manual=false){if(busy||slides.length<2)return;busy=true;index=target===undefined?index+step:target+1;paint();if(manual){const live=root.querySelector('.hero-carousel-status');if(live)live.textContent='Photograph '+(logical()+1)+' of '+slides.length+': '+(slides[logical()].dataset.product||'JUXIANG');}settling=setTimeout(finish,reduced.matches?0:720);schedule();}
 on(track,'transitionend',e=>{if(e.target===track&&e.propertyName==='transform')finish()});
 const prev=root.querySelector('.hero-prev'),next=root.querySelector('.hero-next'),pause=root.querySelector('.hero-pause');for(const b of [prev,next,pause])if(b)b.hidden=slides.length<2;
 on(prev,'click',()=>move(-1,undefined,true));on(next,'click',()=>move(1,undefined,true));dots.forEach((d,i)=>on(d,'click',()=>move(0,i,true)));
 function pauseLabel(){if(pause){pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-label',paused?'Play slideshow':'Pause slideshow')}}on(pause,'click',()=>{paused=!paused;pauseLabel();schedule()});
 on(root,'mouseenter',()=>{hovered=true;schedule()});on(root,'mouseleave',()=>{hovered=false;schedule()});on(root,'focusin',()=>{focused=true;schedule()});on(root,'focusout',e=>{focused=root.contains(e.relatedTarget);schedule()});on(root,'keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowLeft'?-1:1,undefined,true)}});
 on(root,'pointerdown',e=>{if(e.target.closest('button')||!e.isPrimary||e.button!==0)return;dragging={x:e.clientX,y:e.clientY,id:e.pointerId};schedule()});
 on(root,'pointermove',e=>{if(!dragging||e.pointerId!==dragging.id)return;const dx=e.clientX-dragging.x,dy=e.clientY-dragging.y;if(Math.abs(dx)>12&&Math.abs(dx)>Math.abs(dy)*1.2&&!root.hasPointerCapture(e.pointerId))root.setPointerCapture(e.pointerId)});
 function release(e,cancelled=false){if(!dragging||e.pointerId!==dragging.id)return;const dx=e.clientX-dragging.x,dy=e.clientY-dragging.y;if(cancelled||Math.abs(dx)>12||Math.abs(dy)>12)suppressClickUntil=Date.now()+500;dragging=null;if(root.hasPointerCapture(e.pointerId))root.releasePointerCapture(e.pointerId);if(!cancelled&&Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2)move(dx<0?1:-1,undefined,true);schedule();}
 on(root,'pointerup',e=>release(e));on(root,'pointercancel',e=>release(e,true));on(root,'click',e=>{if(Date.now()<suppressClickUntil){e.preventDefault();e.stopPropagation();return}const a=e.target.closest('[data-hero-product]');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;if(typeof window.showProduct==='function'){e.preventDefault();window.showProduct(a.dataset.heroProduct,true,a.dataset.color)}});
 on(document,'visibilitychange',schedule);on(reduced,'change',()=>{paused=reduced.matches;pauseLabel();schedule()});if('IntersectionObserver'in window){observer=new IntersectionObserver(e=>{visible=e[0].isIntersecting;schedule()},{threshold:.15});observer.observe(root)}
 dispose=()=>{clearTimeout(timer);clearTimeout(settling);controller.abort();observer?.disconnect();};paint(false);pauseLabel();schedule();
}
window.JXInitHeroCarousel=initialize;window.addEventListener('jx:hero-updated',initialize);initialize();
})();
