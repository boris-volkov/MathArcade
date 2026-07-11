// curveShell.js — plots two related curves (A amber, B blue); player taps
// the one the prompt asks for. Modes return:
//   { prompt, curves: [fnA, fnB], correctIndex, domain: [x0, x1] }
// where fnA/fnB are plain JS functions sampled by the shell.

export function setupCurveGame({ generateQuestion, nextDelayMs = 500, flashMs = 220 }) {
  if (typeof generateQuestion !== "function") {
    throw new Error("setupCurveGame requires generateQuestion()");
  }

  const $ = (s, r = document) => r.querySelector(s);

  // Show curve UI
  $('#curve-ui').style.display = '';
  $('#numpad-ui').style.display = 'none';
  $('#numpad').style.display = 'none';
  $('#choice-ui').style.display = 'none';
  $('#circle-ui').style.display = 'none';

  const qEl = $('#question');
  const mount = $('#curveMount');
  const answersEl = $('#curveAnswers');
  const progressBarEl = $('#progressBar');
  const progressFillEl = $('#progressFill');
  const progressTextEl = $('#progressText');
  const statsEl = $('#stats');

  const cssVars = getComputedStyle(document.documentElement);
  const C = {
    amber: cssVars.getPropertyValue('--amber').trim() || '#FFB000',
    blue: cssVars.getPropertyValue('--ray-blue').trim() || '#4a7a9b',
    hair: cssVars.getPropertyValue('--hair-2').trim() || '#3a3a3a',
  };

  // ----- level persistence (same key scheme as the numpad shell) -----
  const params = new URLSearchParams(location.search);
  const mode = (params.get('mode') || '').toLowerCase();
  const SAVE_KEY = `matharcade_level_${mode}`;
  const hasLevels = typeof generateQuestion.bumpUp === 'function'
    && typeof generateQuestion.bumpDown === 'function'
    && typeof generateQuestion.getLevel === 'function';

  if (hasLevels) {
    const saved = parseInt(localStorage.getItem(SAVE_KEY), 10);
    if (Number.isFinite(saved) && saved > 1) {
      for (let i = generateQuestion.getLevel(); i < saved; i++) generateQuestion.bumpUp();
    }
  }
  function saveLevel() {
    try { localStorage.setItem(SAVE_KEY, String(generateQuestion.getLevel())); } catch {}
  }

  // Streak-based leveling: 3 straight correct → level up, 2 straight wrong → level down
  const WIN_STREAK = 3;
  const LOSS_STREAK = 2;
  let winStreak = 0, lossStreak = 0;

  function updateProgress() {
    if (!hasLevels || !progressBarEl) return;
    progressBarEl.style.display = '';
    progressTextEl.textContent = `Level ${generateQuestion.getLevel()}`;
    progressFillEl.style.width = `${(winStreak / WIN_STREAK) * 100}%`;
  }

  // ----- session stats in the top bar -----
  let correct = 0, total = 0, start = performance.now();
  function updateStats() {
    if (statsEl) statsEl.style.display = 'none';
    const barSessionEl = document.getElementById('bar-session');
    if (!barSessionEl) return;
    const elapsed = (performance.now() - start) / 1000;
    const rate = total ? ((correct / elapsed) * 60).toFixed(1) : 0;
    barSessionEl.innerHTML = `<span class="stat-num">${correct}</span>/${total} · <span class="stat-num">${rate}</span>/min`;
  }

  // ----- SVG plot -----
  const svgNS = "http://www.w3.org/2000/svg";
  const W = 360, H = 230, PAD = 12;

  function draw(q) {
    const [x0, x1] = q.domain;
    const N = 140;
    const xs = [], ya = [], yb = [];
    for (let i = 0; i <= N; i++) {
      const x = x0 + (x1 - x0) * i / N;
      xs.push(x);
      ya.push(q.curves[0](x));
      yb.push(q.curves[1](x));
    }
    let yMin = Infinity, yMax = -Infinity;
    for (const arr of [ya, yb]) {
      for (const y of arr) {
        if (Number.isFinite(y)) { yMin = Math.min(yMin, y); yMax = Math.max(yMax, y); }
      }
    }
    if (!(yMax > yMin)) { yMin = -1; yMax = 1; }
    const padY = (yMax - yMin) * 0.12 || 1;
    yMin -= padY; yMax += padY;

    const px = x => PAD + (x - x0) / (x1 - x0) * (W - 2 * PAD);
    const py = y => H - PAD - (y - yMin) / (yMax - yMin) * (H - 2 * PAD);
    const pathOf = arr => arr.map((y, i) => `${i ? 'L' : 'M'}${px(xs[i]).toFixed(1)},${py(y).toFixed(1)}`).join('');

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.classList.add('curve-svg');

    // Axes (only where 0 is inside the visible range)
    function axisLine(x1p, y1p, x2p, y2p) {
      const l = document.createElementNS(svgNS, 'line');
      l.setAttribute('x1', x1p); l.setAttribute('y1', y1p);
      l.setAttribute('x2', x2p); l.setAttribute('y2', y2p);
      l.setAttribute('stroke', C.hair);
      l.setAttribute('stroke-width', '1');
      svg.appendChild(l);
    }
    if (yMin < 0 && yMax > 0) axisLine(0, py(0), W, py(0));
    if (x0 < 0 && x1 > 0) axisLine(px(0), 0, px(0), H);

    // Curves
    const colors = [C.amber, C.blue];
    [ya, yb].forEach((arr, i) => {
      const p = document.createElementNS(svgNS, 'path');
      p.setAttribute('d', pathOf(arr));
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', colors[i]);
      p.setAttribute('stroke-width', '2.5');
      p.setAttribute('stroke-linejoin', 'round');
      p.setAttribute('stroke-linecap', 'round');
      svg.appendChild(p);
    });

    // Letter labels near each curve (A right end, B left end)
    function label(txt, x, y, color) {
      const t = document.createElementNS(svgNS, 'text');
      t.setAttribute('x', x); t.setAttribute('y', y);
      t.setAttribute('fill', color);
      t.setAttribute('font-family', "'IBM Plex Mono', monospace");
      t.setAttribute('font-size', '13');
      t.setAttribute('font-weight', '700');
      t.textContent = txt;
      svg.appendChild(t);
    }
    const iA = N - 8, iB = 8;
    label('A', px(xs[iA]) - 4, Math.min(H - 6, Math.max(14, py(ya[iA]) - 8)), C.amber);
    label('B', px(xs[iB]) - 4, Math.min(H - 6, Math.max(14, py(yb[iB]) - 8)), C.blue);

    mount.innerHTML = '';
    mount.appendChild(svg);
  }

  // ----- answer buttons -----
  answersEl.innerHTML = '';
  const buttons = ['A', 'B'].map((letter, i) => {
    const btn = document.createElement('button');
    btn.className = 'curve-btn ' + (i === 0 ? 'curve-a' : 'curve-b');
    btn.textContent = letter;
    btn.addEventListener('click', () => onPick(i, btn));
    answersEl.appendChild(btn);
    return btn;
  });

  document.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'a') onPick(0, buttons[0]);
    else if (k === 'b') onPick(1, buttons[1]);
  });

  function flash(btn, cls) {
    btn.classList.add(cls);
    setTimeout(() => btn.classList.remove(cls), flashMs);
  }

  // ----- game loop -----
  let current = null;
  let awaitingNext = false;

  function newQuestion() {
    awaitingNext = false;
    current = generateQuestion();
    qEl.textContent = current.prompt;
    draw(current);
    updateProgress();
  }

  function onPick(i, btn) {
    if (awaitingNext || !current) return;
    total++;
    try {
      if (!localStorage.getItem('matharcade_start_date')) localStorage.setItem('matharcade_start_date', new Date().toLocaleDateString('en-US'));
      localStorage.setItem('matharcade_total_answered', (parseInt(localStorage.getItem('matharcade_total_answered'), 10) || 0) + 1);
    } catch {}

    if (i === current.correctIndex) {
      correct++;
      try { localStorage.setItem('matharcade_total_correct', (parseInt(localStorage.getItem('matharcade_total_correct'), 10) || 0) + 1); } catch {}
      flash(btn, 'active');
      awaitingNext = true;
      if (hasLevels) {
        winStreak++;
        lossStreak = 0;
        if (winStreak >= WIN_STREAK) {
          generateQuestion.bumpUp();
          winStreak = 0;
          saveLevel();
        }
      }
      updateStats();
      updateProgress();
      setTimeout(newQuestion, nextDelayMs);
    } else {
      flash(btn, 'wrong');
      if (hasLevels) {
        winStreak = 0;
        lossStreak++;
        if (lossStreak >= LOSS_STREAK) {
          if (generateQuestion.getLevel() > 1) {
            generateQuestion.bumpDown();
            saveLevel();
          }
          lossStreak = 0;
        }
      }
      updateStats();
      updateProgress();
    }
  }

  updateStats();
  newQuestion();
}
