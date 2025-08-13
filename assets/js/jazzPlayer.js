(() => {
  const btn = document.getElementById('jazz-toggle');
  const audio = document.getElementById('bg-jazz');
  if (!btn || !audio) return;

  audio.loop = true; audio.volume = 0.35;

  const setUI = (playing) => {
    btn.textContent = playing ? '⏸' : '▶';
    btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
  };

  btn.addEventListener('click', async () => {
    try{
      if (audio.paused){ await audio.play(); setUI(true); }
      else { audio.pause(); setUI(false); }
    }catch(err){
      // Autoplay policies require user gesture; we’re already in a click
      console.warn('Audio blocked or missing:', err);
    }
  });
})();
