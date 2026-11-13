(() => {
 const root=document.getElementById('introPanel');if(!root)return;
 const slides=[...root.querySelectorAll('.intro-slide')],pause=document.getElementById('introPause'),next=document.getElementById('introNext'),counter=document.getElementById('introIndex');
 if(!slides.length)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let index=0,paused=reduced.matches,hovered=false,focused=false,visible=true,timer;
 function paint(){slides.forEach((s,i)=>{s.classList.toggle('is-active',i===index);s.setAttribute('aria-hidden',String(i!==index));s.inert=i!==index;});counter.textContent=String(index+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-label',paused?'Play introduction / 播放简介':'Pause introduction / 暂停简介');pause.setAttribute('aria-pressed',String(paused));}
 function schedule(){clearTimeout(timer);if(!paused&&!hovered&&!focused&&visible&&!document.hidden)timer=setTimeout(()=>move(),9000);}
 function move(){index=(index+1)%slides.length;paint();schedule();}
 pause.onclick=()=>{paused=!paused;paint();schedule();};next.onclick=move;
 root.addEventListener('mouseenter',()=>{hovered=true;schedule();});root.addEventListener('mouseleave',()=>{hovered=false;schedule();});
 root.addEventListener('focusin',()=>{focused=true;schedule();});root.addEventListener('focusout',e=>{focused=root.contains(e.relatedTarget);schedule();});
 document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',()=>{paused=reduced.matches;paint();schedule();});
 if('IntersectionObserver'in window)new IntersectionObserver(e=>{visible=e[0].isIntersecting;schedule();},{threshold:.2}).observe(root);
 paint();schedule();
})();