(() => {
  const root = document.getElementById('heroCarousel');
  if (!root) return;
  const track = root.querySelector('.hero-track');
  const slides = [...track.children];
  const dots = [...root.querySelectorAll('[data-slide]')];
  const ids = ["JX012","JX081","JX028","JX042","JX035","JX020"];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 1, timer, settling, dragging = null, busy = false;
  let paused = reduced.matches, hovered = false, focused = false, visible = true;
  const first = slides[0].cloneNode(true), last = slides.at(-1).cloneNode(true);
  for (const clone of [first, last]) {
    clone.setAttribute('aria-hidden', 'true');
    clone.removeAttribute('aria-label');
    clone.querySelector('img').loading = 'eager';
  }
  track.prepend(last); track.append(first);
  function logical() { return (index - 1 + slides.length) % slides.length; }
  function paint(animate = true) {
    track.style.transition = animate && !reduced.matches ? '' : 'none';
    track.style.transform = 'translateX(' + (-index * 100) + '%)';
    const n = logical();
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === n)));
    slides.forEach((slide, i) => slide.setAttribute('aria-hidden', String(i !== n)));
    root.querySelector('.hero-photo-code').textContent = ids[n] + ' / 0' + (n + 1) + ' — 06';
    const next = slides[(n + 1) % slides.length].querySelector('img');
    next.loading = 'eager';
  }
  function finish() {
    clearTimeout(settling);
    if (index === 0) index = slides.length;
    if (index === slides.length + 1) index = 1;
    paint(false); busy = false;
  }
  function schedule() {
    clearTimeout(timer);
    if (!paused && !hovered && !focused && visible && !document.hidden && !dragging)
      timer = setTimeout(() => move(1), 4500);
  }
  function move(step, target, manual = false) {
    if (busy) return;
    busy = true;
    index = target === undefined ? index + step : target + 1;
    paint();
    if (manual) root.querySelector('.hero-carousel-status').textContent = 'Photograph ' + (logical() + 1) + ' of 6: ' + ids[logical()];
    settling = setTimeout(finish, reduced.matches ? 0 : 720);
    schedule();
  }
  track.addEventListener('transitionend', e => { if (e.target === track && e.propertyName === 'transform') finish(); });
  root.querySelector('.hero-prev').onclick = () => move(-1, undefined, true);
  root.querySelector('.hero-next').onclick = () => move(1, undefined, true);
  dots.forEach((dot, i) => dot.onclick = () => move(0, i, true));
  const pause = root.querySelector('.hero-pause');
  function pauseLabel() { pause.textContent = paused ? '▶' : 'Ⅱ'; pause.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow'); }
  pause.onclick = () => { paused = !paused; pauseLabel(); schedule(); };
  root.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  root.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  root.addEventListener('focusin', () => { focused = true; schedule(); });
  root.addEventListener('focusout', e => { focused = root.contains(e.relatedTarget); schedule(); });
  root.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); move(e.key === 'ArrowLeft' ? -1 : 1, undefined, true); } });
  root.addEventListener('pointerdown', e => {
    if (e.target.closest('button') || !e.isPrimary || e.button !== 0) return;
    dragging = { x: e.clientX, y: e.clientY, id: e.pointerId };
    root.setPointerCapture(e.pointerId); schedule();
  });
  function release(e, cancelled = false) {
    if (!dragging || e.pointerId !== dragging.id) return;
    const dx = e.clientX - dragging.x, dy = e.clientY - dragging.y;
    dragging = null;
    if (root.hasPointerCapture(e.pointerId)) root.releasePointerCapture(e.pointerId);
    if (!cancelled && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) move(dx < 0 ? 1 : -1, undefined, true);
    schedule();
  }
  root.addEventListener('pointerup', e => release(e));
  root.addEventListener('pointercancel', e => release(e, true));
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', () => { paused = reduced.matches; pauseLabel(); schedule(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, { threshold: .15 }).observe(root);
  paint(false); pauseLabel(); schedule();
})();
