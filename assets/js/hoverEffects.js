const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduce) {
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("pointerenter", () => {
      btn.classList.add("shake");
    });
    btn.addEventListener("animationend", () => {
      btn.classList.remove("shake");
    });
  });
}
