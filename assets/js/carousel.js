(() => {
  const viewport = document.querySelector('#project-carousel .carousel-viewport');
  const track = viewport?.querySelector('.carousel-track');
  if (!viewport || !track) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // measure originals and clone until track width >= 3× viewport width
  const originals = Array.from(track.children);
  const LOOP_W = track.scrollWidth;
  let total = track.scrollWidth;
  while (total < viewport.clientWidth * 3) {
    originals.forEach(node => track.appendChild(node.cloneNode(true)));
    total = track.scrollWidth;
  }

  // prevent native dragging/select glitches
  track.querySelectorAll('a, img').forEach(el => el.setAttribute('draggable','false'));

  // start in middle copy
  viewport.scrollLeft = LOOP_W;

  const BASE = reduce ? 0 : 40; // px/sec
  let boost = 0;
  let down = false;
  let dragStart = 0;
  let lastX = 0;
  let lastPT = 0; // last pointer time
  let dragging = false;
  const THRESH = 6;
  let lastFrame = performance.now();

  function loop(now) {
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    let next = viewport.scrollLeft + (BASE + boost) * dt;

    // keep scroll in middle set
    if (next >= LOOP_W * 1.5) next -= LOOP_W;
    else if (next <= LOOP_W * 0.5) next += LOOP_W;

    viewport.scrollLeft = Math.round(next);
    if (!down) boost *= 0.9;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  viewport.addEventListener('pointerdown', e => {
    down = true;
    dragging = false;
    dragStart = lastX = e.clientX;
    lastPT = performance.now();
    viewport.setPointerCapture(e.pointerId);
    track.classList.add('grabbing');
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!down) return;
    const now = performance.now();
    const dx = e.clientX - lastX;
    if (!dragging && Math.abs(e.clientX - dragStart) > THRESH) dragging = true;
    if (dragging) {
      const dt = Math.max(1, now - lastPT);
      const vel = (dx / dt) * 1000; // px/sec
      const sign = Math.sign(vel);
      const mag = Math.pow(Math.abs(vel) * 300, 1.1);
      boost = -sign * Math.min(2000, mag);
      lastX = e.clientX;
      lastPT = now;
      e.preventDefault();
    }
  }, { passive:false });

  const end = (e) => {
    if (!down) return;
    down = false;
    viewport.releasePointerCapture?.(e.pointerId);
    track.classList.remove('grabbing');
  };
  viewport.addEventListener('pointerup', end);
  viewport.addEventListener('pointercancel', end);
})();
