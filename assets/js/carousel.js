(() => {
  const track = document.querySelector('.carousel-track');
  if (!track) return;

  let x = 0;                       // current translateX
  let auto = 40;                   // px/sec auto speed
  let userBoost = 0;               // extra speed from drag
  let isDown = false;
  let isDragging = false;
  let lastX = 0;
  const THRESH = 6;                // px before we treat as drag
  const MAX_BOOST = 240;           // clamp
  const DAMP = 0.92;               // ease back to auto speed

  // helpful styles
  track.style.willChange = 'transform';
  track.querySelectorAll('img,a').forEach(el => el.setAttribute('draggable','false'));

  function slides(){ return Array.from(track.children); }
  function widthOf(el){ return el.getBoundingClientRect().width; }
  function totalWidth(){ return slides().reduce((w,el)=>w+widthOf(el),0); }

  function recycleForward(){
    // if the first slide fully left of view, move it to end and adjust x
    const first = slides()[0];
    const fw = widthOf(first);
    const trackLeft = track.getBoundingClientRect().left;
    const firstRight = first.getBoundingClientRect().right;
    if (firstRight < 0) {
      track.appendChild(first);
      x += fw;
    }
  }
  function recycleBackward(){
    const last = slides().at(-1);
    const lw = widthOf(last);
    const trackLeft = track.getBoundingClientRect().left;
    const lastLeft = last.getBoundingClientRect().left;
    if (lastLeft > window.innerWidth) {
      track.prepend(last);
      x -= lw;
    }
  }

  let prevTs = performance.now();
  function tick(ts){
    const dt = Math.min(0.05, (ts - prevTs) / 1000); // safety cap
    prevTs = ts;

    // velocity: base auto + user boost when dragging
    const v = auto + userBoost;
    x -= v * dt; // move left with positive speed
    track.style.transform = `translate3d(${x}px,0,0)`;

    recycleForward();
    recycleBackward();

    // ease user boost back toward 0 when not dragging
    if (!isDown) userBoost *= DAMP;

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Pointer events (only affect speed when button is DOWN)
  track.addEventListener('pointerdown', (e) => {
    isDown = true; isDragging = false; lastX = e.clientX;
    track.setPointerCapture(e.pointerId);
    track.classList.add('grabbing');
  });

  track.addEventListener('pointermove', (e) => {
    if (!isDown) return; // ignore hover-only movement
    const dx = e.clientX - lastX;
    if (!isDragging && Math.abs(dx) > THRESH) isDragging = true;

    if (isDragging) {
      lastX = e.clientX;
      // map drag delta to speed boost; scale factor ~ 12
      userBoost = Math.max(-MAX_BOOST, Math.min(MAX_BOOST, -dx * 12));
      e.preventDefault(); // prevent text selection while dragging
    }
  }, { passive: false });

  function endDrag(e){
    if (!isDown) return;
    isDown = false;
    track.releasePointerCapture?.(e.pointerId);
    track.classList.remove('grabbing');
    // if it wasn't a real drag, let clicks on cards work normally (no cancel)
  }
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);

  // Pause auto while hovering/focusing
  track.addEventListener('mouseenter', () => auto = 0);
  track.addEventListener('mouseleave', () => auto = 40);
  track.addEventListener('focusin', () => auto = 0);
  track.addEventListener('focusout', () => auto = 40);
})();
