// Safeguard and reduced-motion respect
(() => {
  const orbit = document.querySelector('.orbit-path');
  if (!orbit) return;
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) orbit.style.animation = 'none';
})();
