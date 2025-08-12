const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

const carousel = document.querySelector('.projects-carousel');
if (carousel) {
  carousel.innerHTML += carousel.innerHTML;
  let scrollPos = 0;
  function autoScroll() {
    scrollPos += 0.2;
    if (scrollPos >= carousel.scrollWidth / 2) scrollPos = 0;
    carousel.scrollLeft = scrollPos;
    requestAnimationFrame(autoScroll);
  }
  autoScroll();

  let isDown = false;
  let startX;
  let startScroll;

  carousel.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX;
    startScroll = carousel.scrollLeft;
  });

  ['mouseleave', 'mouseup'].forEach(evt =>
    carousel.addEventListener(evt, () => { isDown = false; })
  );

  carousel.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const x = e.pageX;
    const walk = x - startX;
    scrollPos = carousel.scrollLeft = startScroll - walk;
  });
}

