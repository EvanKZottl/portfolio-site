(() => {
  const viewport = document.querySelector('#project-carousel .carousel-viewport');
  const track = document.querySelector('#project-carousel .carousel-track');
  const leftBtn = document.querySelector('#project-carousel .car-arrow.left');
  const rightBtn = document.querySelector('#project-carousel .car-arrow.right');
  if (!viewport || !track) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fill with clones so width is plenty for seamless loop
  const originals = Array.from(track.children);
  function fillClones(){
    let i = 0;
    const neededWidth = viewport.clientWidth * 2.5;
    while (track.scrollWidth < neededWidth){
      const clone = originals[i % originals.length].cloneNode(true);
      track.appendChild(clone);
      i++;
    }
    track.querySelectorAll('img,a').forEach(el => el.setAttribute('draggable','false'));
  }
  fillClones();

  let x = 0;                 // translateX
  const BASE = reduce ? 0 : 45; // px/sec auto speed
  let base = BASE;
  let boost = 0;             // user speed delta (decays)
  let down = false, dragging = false;
  let lastX = 0, lastT = performance.now();
  const THRESH = 6;          // px before "drag"
  const MAX = 1200;          // max boost magnitude

  function recycle(){
    const slides = Array.from(track.children);
    if (!slides.length) return;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const vpRect = viewport.getBoundingClientRect();
    const first = slides[0], last = slides[slides.length-1];
    if (first.getBoundingClientRect().right < vpRect.left) {
      x += first.getBoundingClientRect().width + gap;
      track.appendChild(first);
    } else if (last.getBoundingClientRect().left > vpRect.right) {
      x -= last.getBoundingClientRect().width + gap;
      track.prepend(last);
    }
  }

  let prev = performance.now();
  function loop(t){
    const dt = Math.min(0.05, (t - prev) / 1000);
    prev = t;
    const v = base + boost;
    x -= v * dt;
    const step = 1 / Math.max(1, window.devicePixelRatio);
    const snapped = Math.round(x / step) * step;
    track.style.transform = `translate3d(${snapped}px,0,0)`;
    recycle();
    if (!down) boost *= 0.9;      // decay when not dragging
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Only when pointer is **down** do we change speed
  track.addEventListener('pointerdown', (e) => {
    down = true; dragging = false; lastX = e.clientX; lastT = performance.now();
    track.setPointerCapture(e.pointerId);
    track.classList.add('grabbing');
  });

  track.addEventListener('pointermove', (e) => {
    if (!down) return;                 // hovering does nothing
    const now = performance.now();
    const dx = e.clientX - lastX;
    const dt = Math.max(1, now - lastT); // ms
    if (!dragging && Math.abs(dx) > THRESH) dragging = true;
    if (dragging){
      // instantaneous px/ms -> px/sec; amplify nonlinearly for "exponential" feel
      const vel = (dx / dt) * 1000;
      const sign = Math.sign(vel);
      const mag = Math.min(MAX, Math.pow(Math.abs(vel) * 250, 1.15));
      boost = -sign * mag;            // negative = move left
      lastX = e.clientX; lastT = now;
      e.preventDefault();
    }
  }, { passive:false });

  function endDrag(e){
    if (!down) return;
    down = false;
    track.releasePointerCapture?.(e.pointerId);
    track.classList.remove('grabbing');
  }
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);

  // Arrow buttons give a nudge
  const nudge = dir => { boost = dir * 500; setTimeout(()=> boost = 0, 180); };
  leftBtn?.addEventListener('click', ()=> nudge(+1));   // view left
  rightBtn?.addEventListener('click', ()=> nudge(-1));  // view right
})();
