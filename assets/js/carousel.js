(() => {
  const viewport = document.querySelector('.carousel-viewport');
  const track = document.querySelector('.carousel-track');
  const leftBtn = document.querySelector('.car-arrow.left');
  const rightBtn = document.querySelector('.car-arrow.right');
  if (!viewport || !track) return;

  // Duplicate slides to avoid gaps and enable seamless recycling
  const MIN_FILL = 2.2; // track width >= 2.2 * viewport width
  function fillClones(){
    const vpw = viewport.getBoundingClientRect().width;
    let tw = track.scrollWidth;
    const originals = Array.from(track.children);
    while (tw < vpw * MIN_FILL) {
      originals.forEach(el => track.appendChild(el.cloneNode(true)));
      tw = track.scrollWidth;
    }
    // disable dragging images
    track.querySelectorAll('img,a').forEach(el => el.setAttribute('draggable','false'));
  }
  fillClones();

  let x = 0;                    // current translateX
  let base = 40;                // px/sec auto speed
  let boost = 0;                // user-added speed from drag
  let down = false, dragging = false;
  let lastX = 0, lastT = performance.now();
  const THRESH = 5;             // px before we consider it a drag
  const MAX = 900;              // max |speed| px/sec

  function recycle(){
    // Move first slide to end when fully off left; and vice versa on reverse
    const slides = Array.from(track.children);
    if (!slides.length) return;

    const first = slides[0];
    const last  = slides[slides.length - 1];

    const firstRect = first.getBoundingClientRect();
    const lastRect  = last.getBoundingClientRect();
    const vpRect    = viewport.getBoundingClientRect();

    if (firstRect.right < vpRect.left) {
      x += firstRect.width + parseFloat(getComputedStyle(track).gap || 0);
      track.appendChild(first);
    } else if (lastRect.left > vpRect.right) {
      x -= lastRect.width + parseFloat(getComputedStyle(track).gap || 0);
      track.prepend(last);
    }
  }

  let prev = performance.now();
  function loop(t){
    const dt = Math.min(0.05, (t - prev) / 1000);
    prev = t;

    // total velocity
    const v = base + boost;
    x -= v * dt;
    track.style.transform = `translate3d(${x}px,0,0)`;

    recycle();

    // decay boost when not dragging
    if (!down) boost *= 0.92;

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Pointer events: ONLY modify boost when button is down and movement happens
  track.addEventListener('pointerdown', (e) => {
    down = true; dragging = false; lastX = e.clientX; lastT = performance.now();
    track.setPointerCapture(e.pointerId);
    track.classList.add('grabbing');
  });

  track.addEventListener('pointermove', (e) => {
    if (!down) return;
    const now = performance.now();
    const dx = e.clientX - lastX;
    const dt = Math.max(1, now - lastT);         // ms
    if (!dragging && Math.abs(dx) > THRESH) dragging = true;

    if (dragging) {
      // instantaneous velocity (px/ms) -> px/sec
      const vel = (dx / dt) * 1000;
      // nonlinear mapping: amplify with power curve but keep sign
      const sign = Math.sign(vel);
      const mag = Math.min(MAX, Math.pow(Math.abs(vel) * 220, 1.15));
      boost = -sign * mag; // negative because positive moves left
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

  // Pause base auto when hovering/focusing the carousel (but keep boost on drag)
  viewport.addEventListener('mouseenter', () => base = 0);
  viewport.addEventListener('mouseleave', () => base = 40);
  viewport.addEventListener('focusin', () => base = 0);
  viewport.addEventListener('focusout', () => base = 40);

  // Arrow buttons give a momentary push
  function nudge(dir){ // dir: -1 left, +1 right
    boost = dir * 420; // quick push that decays
    setTimeout(()=> boost = 0, 180);
  }
  leftBtn?.addEventListener('click', ()=> nudge(+1));  // move right
  rightBtn?.addEventListener('click', ()=> nudge(-1)); // move left
})();
