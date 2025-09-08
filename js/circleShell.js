// circleShell.js — SVG unit circle with clickable points
// Expects a mode default export with { generateQuestion } that returns { questionLatex, answerIndex }

export function setupCircleGame({ generateQuestion, nextDelayMs = 300 }) {
  if (typeof generateQuestion !== "function") {
    throw new Error("setupCircleGame requires generateQuestion()");
  }

  const $ = (s, r = document) => r.querySelector(s);

  const mount = $("#circleMount");
  const qEl = $("#question");
  const feedbackEl = $("#feedback");

  const SIZE = 360; // px
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const r = SIZE * 0.36;
  const N = 12; // standard positions (π/6 increments)

  // Build SVG
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);
  svg.setAttribute("width", String(SIZE));
  svg.setAttribute("height", String(SIZE));
  svg.style.maxWidth = "75vw";
  svg.style.maxHeight = "75vw";

  const ring = document.createElementNS(svgNS, "circle");
  ring.setAttribute("cx", String(cx));
  ring.setAttribute("cy", String(cy));
  ring.setAttribute("r", String(r));
  ring.setAttribute("fill", "none");
  ring.setAttribute("stroke", "#635c5c");
  ring.setAttribute("stroke-width", "2");
  svg.appendChild(ring);

  // Rays from center to each clickable dot (12-point grid)
  for (let k = 0; k < N; k++) {
    const theta = (2 * Math.PI * k) / N;
    const x = cx + r * Math.cos(theta);
    const y = cy - r * Math.sin(theta);
    const isQuadrantal = (k % 3) === 0;
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", String(cx));
    line.setAttribute("y1", String(cy));
    line.setAttribute("x2", String(x));
    line.setAttribute("y2", String(y));
    line.setAttribute("stroke", isQuadrantal ? "#4caf50" : "#5a80a3");
    line.setAttribute("stroke-opacity", isQuadrantal ? "0.35" : "0.25");
    line.setAttribute("stroke-width", "1");
    line.setAttribute("stroke-linecap", "round");
    line.style.pointerEvents = "none"; // visual only
    svg.appendChild(line);
  }

  // Build dots
  const dots = [];
  for (let k = 0; k < N; k++) {
    const theta = (2 * Math.PI * k) / N; // 0 at +x, CCW
    const x = cx + r * Math.cos(theta);
    const y = cy - r * Math.sin(theta);
    const c = document.createElementNS(svgNS, "circle");
    c.setAttribute("cx", String(x));
    c.setAttribute("cy", String(y));
    c.setAttribute("r", String(10));
    // Color scheme: multiples of 90° (k%3==0) green; others (30° multiples) blue.
    // Note: 45° multiples not on 12-point grid except quadrantal; we reserve red for future overlay.
    const isQuadrantal = (k % 3) === 0;
    const fill = isQuadrantal ? "#1e5a1e" : "#262e3a";       // deep green vs deep blue-gray
    const stroke = isQuadrantal ? "#4caf50" : "#5a80a3";     // green vs blue
    c.setAttribute("fill", fill);
    c.setAttribute("stroke", stroke);
    c.setAttribute("stroke-width", "2");
    c.style.cursor = "pointer";
    c.dataset.m24 = String((k * 2) % 24);
    svg.appendChild(c);
    dots.push(c);
  }

  // Overlay 8-point (45°) layer in red for visual guidance (non-interactive)
  const N8 = 8;
  for (let k = 0; k < N8; k++) {
    // Skip quadrantal positions (overlap with green); draw only 45°,135°,225°,315°
    if (k % 2 === 0) continue;
    const theta = (2 * Math.PI * k) / N8;
    const x = cx + r * Math.cos(theta);
    const y = cy - r * Math.sin(theta);
    const c = document.createElementNS(svgNS, "circle");
    c.setAttribute("cx", String(x));
    c.setAttribute("cy", String(y));
    c.setAttribute("r", String(9));
    c.setAttribute("fill", "#3a2626");
    c.setAttribute("stroke", "#b74e4e");
    c.setAttribute("stroke-width", "2");
    c.style.pointerEvents = "none"; // visual only; main clicks use 12-point dots
    svg.appendChild(c);
  }

  // Additional overlay: clickable 45° dots + rays (to include in questions)
  for (let k = 1; k < N8; k += 2) {
    const theta = (2 * Math.PI * k) / N8;
    const x = cx + r * Math.cos(theta);
    const y = cy - r * Math.sin(theta);

    // Ray
    const ray = document.createElementNS(svgNS, "line");
    ray.setAttribute("x1", String(cx));
    ray.setAttribute("y1", String(cy));
    ray.setAttribute("x2", String(x));
    ray.setAttribute("y2", String(y));
    ray.setAttribute("stroke", "#b74e4e");
    ray.setAttribute("stroke-opacity", "0.35");
    ray.setAttribute("stroke-width", "1");
    ray.setAttribute("stroke-linecap", "round");
    ray.style.pointerEvents = "none";
    svg.appendChild(ray);

    // Clickable dot on top
    const dot = document.createElementNS(svgNS, "circle");
    dot.setAttribute("cx", String(x));
    dot.setAttribute("cy", String(y));
    dot.setAttribute("r", String(9));
    dot.setAttribute("fill", "#3a2626");
    dot.setAttribute("stroke", "#b74e4e");
    dot.setAttribute("stroke-width", "2");
    dot.style.cursor = "pointer";
    dot.dataset.m24 = String((k * 3) % 24);
    svg.appendChild(dot);
    dots.push(dot);
  }

  mount.innerHTML = "";
  mount.appendChild(svg);

  // State
  let answerIndex = -1;
  let questionStartAt = performance.now();

  function setQuestion() {
    const q = generateQuestion();
    answerIndex = q.answerIndex;
    qEl.innerHTML = "";
    try { katex.render(q.questionLatex, qEl, { throwOnError: false }); }
    catch { qEl.textContent = q.questionLatex; }
    feedbackEl.textContent = "";
    questionStartAt = performance.now();
  }

  const TARGET_MS = 5000;
  const MAX_STEP = 2;

  function onPick(idx) {
    if (idx === answerIndex) {
      feedbackEl.textContent = "Correct!";
      const dt = performance.now() - questionStartAt;
      if (typeof generateQuestion.bumpUp === "function") {
        let delta = Math.floor((TARGET_MS - dt) / 1000);
        if (delta > MAX_STEP) delta = MAX_STEP;
        if (delta < -MAX_STEP) delta = -MAX_STEP;
        if (delta !== 0) {
          const steps = Math.abs(delta);
          for (let i = 0; i < steps; i++) {
            if (delta > 0) generateQuestion.bumpUp(); else generateQuestion.bumpDown();
          }
        }
      }
      setTimeout(setQuestion, nextDelayMs);
    } else {
      feedbackEl.textContent = "Try again!";
    }
  }

  dots.forEach(d => {
    d.addEventListener("click", () => {
      const m = d.dataset.m24 != null ? Number(d.dataset.m24) : Number(d.dataset.index);
      onPick(m);
    });
  });

  setQuestion();
}
