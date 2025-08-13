const hero = document.querySelector('.hero');
if (hero) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  canvas.id = 'hero-pattern';
  hero.prepend(canvas);
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = hero.clientWidth;
    canvas.height = hero.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let offset = 0;
  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(31,111,74,0.35)';
    ctx.lineWidth = 1;
    const grid = 40;
    for (let x = (-offset % grid); x < w; x += grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = (-offset % grid); y < h; y += grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }
  function loop() {
    offset += 0.2;
    draw();
    requestAnimationFrame(loop);
  }
  draw();
  if (!reduce) requestAnimationFrame(loop);
}
