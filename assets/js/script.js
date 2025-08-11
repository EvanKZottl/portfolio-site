const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
const t = document.getElementById('themeToggle');
if (t) {
  let dark = true;
  t.addEventListener('click', () => {
    dark = !dark;
    document.documentElement.style.filter = dark ? '' : 'invert(1) hue-rotate(180deg)';
    t.textContent = dark ? '☾' : '☀';
  });
}
