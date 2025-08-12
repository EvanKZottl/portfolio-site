const track = document.querySelector(".carousel-track");
if (track) {
  // duplicate slides for endless loop
  track.innerHTML += track.innerHTML;
  let pos = 0;
  let defaultSpeed = 0.4;
  let speed = defaultSpeed;
  let raf;
  let paused = false;

  function step() {
    if (!paused) {
      pos -= speed;
      const width = track.scrollWidth / 2;
      if (-pos >= width) pos = 0;
      track.style.transform = `translateX(${pos}px)`;
    }
    raf = requestAnimationFrame(step);
  }
  step();

  function easeBack() {
    const easing = () => {
      speed += (defaultSpeed - speed) * 0.05;
      if (Math.abs(speed - defaultSpeed) < 0.01) speed = defaultSpeed;
      if (speed !== defaultSpeed) requestAnimationFrame(easing);
    };
    easing();
  }

  let startX, lastX, lastTime;
  const onPointerMove = (e) => {
    if (startX === null) return;
    const x = e.clientX;
    const now = performance.now();
    const dx = x - lastX;
    const dt = now - lastTime;
    pos += dx;
    track.style.transform = `translateX(${pos}px)`;
    speed = (-dx / dt) * 16; // approx px per frame
    lastX = x;
    lastTime = now;
  };

  track.addEventListener("pointerdown", (e) => {
    paused = true;
    startX = lastX = e.clientX;
    lastTime = performance.now();
    track.setPointerCapture(e.pointerId);
    track.addEventListener("pointermove", onPointerMove);
  });

  track.addEventListener("pointerup", (e) => {
    startX = null;
    track.removeEventListener("pointermove", onPointerMove);
    paused = false;
    easeBack();
  });

  track.addEventListener("mouseenter", () => {
    paused = true;
  });
  track.addEventListener("mouseleave", () => {
    paused = false;
  });
}
