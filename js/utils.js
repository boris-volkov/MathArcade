export function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  return b === 0 ? a : gcd(b, a % b);
}

export function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

export function ri(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function simplifyFrac(n, d) {
  const g = gcd(Math.abs(n), Math.abs(d));
  return { n: n / g, d: d / g };
}

/* ---------- Question auto-fit ----------
   Long problems should shrink to stay on one line rather than wrap. We measure
   the rendered question, scale the font down to fit the console width, and only
   allow a wrap once we hit the floor size (--q-min-size). KaTeX breaks inline
   math at top-level operators/relations, so that last-resort wrap lands in a
   sensible place. */

const FIT_FLOOR_RATIO = 0.45;   // fallback floor when --q-min-size is unset
let fitTarget = null;
let fitListening = false;

function fitWrapper(el) {
  let span = el.firstElementChild;
  if (!span || !span.classList.contains("q-fit")) {
    span = document.createElement("span");
    span.className = "q-fit";
    while (el.firstChild) span.appendChild(el.firstChild);
    el.appendChild(span);
  }
  return span;
}

export function fitQuestion(el) {
  if (!el) return;
  fitTarget = el;
  if (!fitListening) {
    fitListening = true;
    let queued = false;
    const refit = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; fitQuestion(fitTarget); });
    };
    window.addEventListener("resize", refit);
    window.addEventListener("orientationchange", refit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refit);
  }

  const span = fitWrapper(el);
  el.style.fontSize = "";
  span.style.whiteSpace = "";
  span.style.maxWidth = "";

  const cs = getComputedStyle(el);
  const base = parseFloat(cs.fontSize);
  const avail = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  if (!(base > 0) || !(avail > 0)) return;

  const width = () => Math.max(span.scrollWidth, span.getBoundingClientRect().width);
  const needed = width();
  if (needed <= avail) return;   // fits on one line already

  const declaredMin = parseFloat(cs.getPropertyValue("--q-min-size"));
  const floor = declaredMin > 0 ? declaredMin : base * FIT_FLOOR_RATIO;
  const scaled = base * (avail / needed) * 0.99;   // 1% breathing room
  el.style.fontSize = Math.max(floor, scaled) + "px";

  // Too long even at the floor size — let it wrap.
  if (width() > avail) {
    span.style.whiteSpace = "normal";
    span.style.maxWidth = "100%";
  }
}
