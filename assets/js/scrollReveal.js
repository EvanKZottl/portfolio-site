const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const elements = document.querySelectorAll(".reveal");
if (reduceMotion) {
  elements.forEach((el) => el.classList.add("visible"));
} else {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );
  elements.forEach((el) => obs.observe(el));
}

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();
