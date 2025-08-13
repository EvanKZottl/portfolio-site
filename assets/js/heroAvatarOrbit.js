// Orbit around avatar (kept simple; respects reduced motion)
(() => {
  const path = document.querySelector('.orbit-path');
  if (!path) return;
  path.setAttribute('cx', 100);
  path.setAttribute('cy', 100);
  path.setAttribute('r', 88);

  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches){
    path.style.animation = 'none';
    const spark = document.querySelector('.orbit-spark');
    if (spark) spark.style.display = 'none';
  }
})();
