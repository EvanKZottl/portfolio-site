const track = document.querySelector('.carousel-track');
if (track) {
  let pos = 0;
  const defaultSpeed = 0.4;
  let speed = defaultSpeed;
  let paused = false;
  const gap = parseFloat(getComputedStyle(track).gap) || 0;

  function recycle() {
    let first = track.firstElementChild;
    let last = track.lastElementChild;
    let firstWidth = first.offsetWidth + gap;
    let lastWidth = last.offsetWidth + gap;
    while (pos <= -firstWidth) {
      track.appendChild(first);
      pos += firstWidth;
      first = track.firstElementChild;
      firstWidth = first.offsetWidth + gap;
    }
    while (pos >= 0) {
      track.prepend(last);
      pos -= lastWidth;
      last = track.lastElementChild;
      lastWidth = last.offsetWidth + gap;
    }
  }

  function step() {
    if (!paused) pos -= speed;
    recycle();
    track.style.transform = `translateX(${pos}px)`;
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  function easeBack() {
    const easing = () => {
      speed += (defaultSpeed - speed) * 0.05;
      if (Math.abs(speed - defaultSpeed) < 0.01) speed = defaultSpeed;
      if (speed !== defaultSpeed) requestAnimationFrame(easing);
    };
    easing();
  }

  let startX = null;
  let lastX = 0;
  let lastTime = 0;

  const onPointerMove = (e) => {
    if (startX === null) return;
    const x = e.clientX;
    const now = performance.now();
    const dx = x - lastX;
    const dt = now - lastTime;
    pos += dx;
    recycle();
    track.style.transform = `translateX(${pos}px)`;
    speed = (-dx / dt) * 16;
    lastX = x;
    lastTime = now;
  };

  track.addEventListener('pointerdown', (e) => {
    paused = true;
    startX = lastX = e.clientX;
    lastTime = performance.now();
    track.setPointerCapture(e.pointerId);
    track.addEventListener('pointermove', onPointerMove);
  });

  track.addEventListener('pointerup', () => {
    startX = null;
    track.removeEventListener('pointermove', onPointerMove);
    paused = false;
    easeBack();
  });

  track.addEventListener('mouseenter', () => {
    paused = true;
  });
  track.addEventListener('mouseleave', () => {
    paused = false;
  });
}
