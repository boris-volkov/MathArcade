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
  const statsEl = $("#stats");

  const SIZE = 360; // internal coordinate system (scales via viewBox)
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  // Make the circle nearly edge-to-edge, leaving margin for dot/stroke
  const MARGIN = 14; // px in SVG coords
  const r = (SIZE / 2) - MARGIN;
  const N = 12; // standard positions (π/6 increments)

  // Build SVG
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.classList.add("circle-svg");

  const ring = document.createElementNS(svgNS, "circle");
  ring.setAttribute("cx", String(cx));
  ring.setAttribute("cy", String(cy));
  ring.setAttribute("r", String(r));
  ring.setAttribute("fill", "none");
  ring.setAttribute("stroke", "#635c5c");
  ring.setAttribute("stroke-width", "2");
  svg.appendChild(ring);

  // Map rays by unified 24-step index for highlighting
  const raysByM24 = new Map();

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
    const stroke = isQuadrantal ? "#4caf50" : "#5a80a3";
    const baseOpacity = isQuadrantal ? "0.28" : "0.18";
    const baseWidth = "2";
    line.setAttribute("stroke", stroke);
    line.setAttribute("stroke-opacity", baseOpacity);
    line.setAttribute("stroke-width", baseWidth);
    line.setAttribute("stroke-linecap", "round");
    line.style.pointerEvents = "none"; // visual only
    const m24 = (k * 2) % 24;
    line.dataset.m24 = String(m24);
    line.dataset.baseOpacity = baseOpacity;
    line.dataset.baseWidth = baseWidth;
    raysByM24.set(m24, line);
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
    c.setAttribute("r", String(12));
    // Color scheme: multiples of 90° (k%3==0) green; others (30° multiples) blue.
    // Note: 45° multiples not on 12-point grid except quadrantal; we reserve red for future overlay.
    const isQuadrantal = (k % 3) === 0;
    const fill = isQuadrantal ? "#1e5a1e" : "#262e3a";       // deep green vs deep blue-gray
    const stroke = isQuadrantal ? "#4caf50" : "#5a80a3";     // green vs blue
    c.setAttribute("fill", fill);
    // Make dots fully opaque by default
    c.setAttribute("fill-opacity", "1");
    c.dataset.baseFillOpacity = "1";
    c.dataset.baseFill = fill;
    c.setAttribute("stroke", stroke);
    c.setAttribute("stroke-width", "2");
    c.dataset.baseStroke = stroke;
    c.dataset.baseStrokeOpacity = "1";
    c.dataset.baseStrokeWidth = "2";
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
    // Make this legacy overlay invisible to avoid double borders; kept for compatibility
    c.setAttribute("stroke-opacity", "0");
    c.setAttribute("fill-opacity", "0");
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
    const baseOpacityR = "0.22";
    const baseWidthR = "2";
    ray.setAttribute("stroke-opacity", baseOpacityR);
    ray.setAttribute("stroke-width", baseWidthR);
    ray.setAttribute("stroke-linecap", "round");
    ray.style.pointerEvents = "none";
    const m24r = (k * 3) % 24;
    ray.dataset.m24 = String(m24r);
    ray.dataset.baseOpacity = baseOpacityR;
    ray.dataset.baseWidth = baseWidthR;
    raysByM24.set(m24r, ray);
    svg.appendChild(ray);

    // Clickable dot on top
    const dot = document.createElementNS(svgNS, "circle");
    dot.setAttribute("cx", String(x));
    dot.setAttribute("cy", String(y));
    dot.setAttribute("r", String(11));
    dot.setAttribute("fill", "#3a2626");
    dot.setAttribute("fill-opacity", "1");
    dot.dataset.baseFillOpacity = "1";
    dot.dataset.baseFill = "#3a2626";
    dot.setAttribute("stroke", "#b74e4e");
    dot.setAttribute("stroke-width", "2");
    dot.dataset.baseStroke = "#b74e4e";
    dot.dataset.baseStrokeOpacity = "1";
    dot.dataset.baseStrokeWidth = "2";
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
  let start = performance.now();
  let correct = 0, total = 0;
  let lastKey = null;

  function updateStats() {
    if (!statsEl) return;
    const elapsed = (performance.now() - start) / 1000;
    const rate = total ? ((correct / elapsed) * 60).toFixed(1) : 0;
    statsEl.innerHTML = `Correct: ${correct}/${total}<br>Rate: ${rate} per min`;
  }

  let highlightedRay = null;
  let highlightedDot = null;

  function resetHighlight() {
    if (highlightedRay) {
      const baseOp = highlightedRay.dataset.baseOpacity || "0.2";
      const baseW = highlightedRay.dataset.baseWidth || "2";
      highlightedRay.setAttribute("stroke-opacity", baseOp);
      highlightedRay.setAttribute("stroke-width", baseW);
      highlightedRay = null;
    }
    if (highlightedDot) {
      const baseFillOp = highlightedDot.dataset.baseFillOpacity || "0.7";
      const baseStrokeW = highlightedDot.dataset.baseStrokeWidth || "2";
      const baseFill = highlightedDot.dataset.baseFill || highlightedDot.getAttribute("fill") || "#333";
      const baseStroke = highlightedDot.dataset.baseStroke || highlightedDot.getAttribute("stroke") || "#999";
      const baseStrokeOp = highlightedDot.dataset.baseStrokeOpacity || "1";
      highlightedDot.setAttribute("fill", baseFill);
      highlightedDot.setAttribute("fill-opacity", baseFillOp);
      highlightedDot.setAttribute("stroke", baseStroke);
      highlightedDot.setAttribute("stroke-opacity", baseStrokeOp);
      highlightedDot.setAttribute("stroke-width", baseStrokeW);
      highlightedDot = null;
    }
  }

  function highlightRay(m24) {
    resetHighlight();
    const ray = raysByM24.get(m24);
    if (!ray) return;
    ray.setAttribute("stroke-opacity", "0.9");
    // keep original width, only brighten via opacity
    highlightedRay = ray;
  }

  function brightenStroke(hex) {
    const h = (hex || "").toLowerCase();
    switch (h) {
      case "#4caf50": return "#81c784"; // green lighten
      case "#5a80a3": return "#90caf9"; // blue lighten
      case "#b74e4e": return "#ef9a9a"; // red lighten
      default: return h || "#ffffff";
    }
  }

  function highlightDot(dotEl) {
    if (!dotEl) return;
    // store base if not present
    if (!dotEl.dataset.baseFillOpacity) dotEl.dataset.baseFillOpacity = dotEl.getAttribute("fill-opacity") || "0.7";
    if (!dotEl.dataset.baseStrokeWidth) dotEl.dataset.baseStrokeWidth = dotEl.getAttribute("stroke-width") || "2";
    if (!dotEl.dataset.baseFill) dotEl.dataset.baseFill = dotEl.getAttribute("fill") || "#333";
    if (!dotEl.dataset.baseStroke) dotEl.dataset.baseStroke = dotEl.getAttribute("stroke") || "#999";
    if (!dotEl.dataset.baseStrokeOpacity) dotEl.dataset.baseStrokeOpacity = dotEl.getAttribute("stroke-opacity") || "1";
    if (highlightedDot && highlightedDot !== dotEl) {
      const baseFillOp = highlightedDot.dataset.baseFillOpacity || "0.7";
      const baseStrokeW = highlightedDot.dataset.baseStrokeWidth || "2";
      const baseFill = highlightedDot.dataset.baseFill || highlightedDot.getAttribute("fill") || "#333";
      const baseStroke = highlightedDot.dataset.baseStroke || highlightedDot.getAttribute("stroke") || "#999";
      const baseStrokeOp = highlightedDot.dataset.baseStrokeOpacity || "1";
      highlightedDot.setAttribute("fill", baseFill);
      highlightedDot.setAttribute("fill-opacity", baseFillOp);
      highlightedDot.setAttribute("stroke", baseStroke);
      highlightedDot.setAttribute("stroke-opacity", baseStrokeOp);
      highlightedDot.setAttribute("stroke-width", baseStrokeW);
    }
    // Brighten by setting fill to the stroke color
    const strokeCol = dotEl.getAttribute("stroke") || dotEl.dataset.stroke || "#fff";
    const brightStroke = brightenStroke(strokeCol);
    dotEl.setAttribute("fill", strokeCol);
    dotEl.setAttribute("fill-opacity", "1");
    dotEl.setAttribute("stroke", brightStroke);
    dotEl.setAttribute("stroke-opacity", "1");
    // keep original stroke width, do not thicken
    highlightedDot = dotEl;
  }

  function setQuestion() {
    let q = generateQuestion();
    let key = `${q.answerIndex}|${q.questionLatex ?? ''}`;
    let guard = 0;
    while (lastKey !== null && key === lastKey && guard < 5) {
      q = generateQuestion();
      key = `${q.answerIndex}|${q.questionLatex ?? ''}`;
      guard++;
    }
    lastKey = key;
    answerIndex = q.answerIndex;
    qEl.innerHTML = "";
    try { katex.render(q.questionLatex, qEl, { throwOnError: false }); }
    catch { qEl.textContent = q.questionLatex; }
    feedbackEl.textContent = "";
    resetHighlight();
    questionStartAt = performance.now();
  }

  const TARGET_MS = 5000;
  const MAX_STEP = 2;

  function onPick(idx) {
    if (idx === answerIndex) {
      feedbackEl.textContent = "Correct!";
      correct++; total++;
      updateStats();
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
      total++;
      updateStats();
    }
  }

  dots.forEach(d => {
    d.addEventListener("click", () => {
      const m = d.dataset.m24 != null ? Number(d.dataset.m24) : Number(d.dataset.index);
      highlightRay(m);
      highlightDot(d);
      onPick(m);
    });
  });

  setQuestion();
  updateStats();
}
