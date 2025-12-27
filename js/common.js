// Helpers available to modes
export const math = {
  gcd(a, b) { return b === 0 ? Math.abs(a) : math.gcd(b, a % b); },
  lcm(a, b) { return Math.abs(a * b) / math.gcd(a, b); },
};

// Shared game wiring; takes a mode config
// { title?, generateQuestion, nextDelayMs?, flashMs?,
//   timing?: { baseMs?:number, perLevelMs?:number, maxMs?:number },
//   targetMs?: number,                   // shorthand for timing.baseMs
//   getTargetMs?: ({level}) => number    // full override if provided
// }
export function setupGame(config) {
  const { title, generateQuestion, nextDelayMs = 250, flashMs = 150 } = config || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // Show numpad UI
  $('#numpad-ui').style.display = '';
  $('#numpad').style.display = '';
  $('#choice-ui').style.display = 'none';
  $('#circle-ui').style.display = 'none';

  // Detect mode from URL to decide which UI to show
  const params = new URLSearchParams(location.search);
  const mode = (params.get('mode') || 'multiplication').toLowerCase();
  const SHOW_LEVEL_FOR = new Set([
    'addition', 'subtraction', 'multiplication', 'division', 'lcm', 'gcf', 'integers',
    // include boolean expressions mode
    'logic',
    // show level for arithmetic expressions as well
    'expressions',
  ]);
  const showLevelUI = SHOW_LEVEL_FOR.has(mode);

  const titleEl = $("h1");
  const questionEl = $("#question");
  const answerEl = $("#answer");
  const feedbackEl = $("#feedback");
  const levelEl = $("#levelIndicator");
  const progressBarEl = $("#progressBar");
  const progressFillEl = $("#progressFill");
  const progressTextEl = $("#progressText");
  const statsEl = $("#stats");
  const buttons = $$(".numpad button");
  const clearBtn = document.querySelector("#clearBtn");
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    handlePress({ action: "clear" });
  });
}


  let currentAnswer = null;
  let lastQuestionKey = null;
  let questionStartAt = performance.now();
  const sessionStartAt = performance.now();
  let correctCount = 0;
  let totalCount = 0;

  function getQuestionKey(q) {
    if (q && typeof q.key === "string" && q.key.length) return q.key;
    if (q && typeof q.latex === "string" && q.latex.length) return `L:${q.latex}`;
    if (q && typeof q.text === "string" && q.text.length) return `T:${q.text}`;
    // Fallback: stringify stable fields if present
    try {
      return JSON.stringify({ t: q?.text ?? null, l: q?.latex ?? null });
    } catch {
      return String(Math.random()); // ensure progress even if unkeyable
    }
  }

  function flash(btn) {
    btn.classList.add("active");
    setTimeout(() => btn.classList.remove("active"), flashMs);
  }

  function newQuestion() {
    // Avoid showing the exact same question twice in a row
    let q = generateQuestion();
    let key = getQuestionKey(q);
    let guard = 0;
    while (lastQuestionKey !== null && key === lastQuestionKey && guard < 5) {
      q = generateQuestion();
      key = getQuestionKey(q);
      guard++;
    }
    lastQuestionKey = key;
    const { text, latex, answer } = q;
    if (typeof generateQuestion.getLevel === "function") {
      console.log("[Level]", generateQuestion.getLevel());
    }
    updateLevelIndicator();
    updateStats();
    currentAnswer = answer;
    // Prefer LaTeX rendering if provided and KaTeX is available
    if (latex && window.katex) {
      questionEl.innerHTML = "";
      try { katex.render(latex, questionEl, { throwOnError: false }); }
      catch { questionEl.textContent = text ?? String(latex); }
    } else {
      questionEl.textContent = text ?? (latex ? String(latex) : "");
    }
    answerEl.value = "";
    feedbackEl.textContent = "";
    questionStartAt = performance.now();
  }
  let streak = 0;
  let fastStreak = 0;
  let lastCorrectAt = performance.now();

  // Time-based leveling parameters (smoothed)
  const DEFAULT_BASE_MS = 5000;      // baseline sweet spot at level 1
  const DEFAULT_PER_LEVEL_MS = 300;  // default +300ms per level above 1
  function getTargetMs() {
    // Full override if mode provides a function
    try {
      if (config && typeof config.getTargetMs === 'function') {
        const lvl = (typeof generateQuestion?.getLevel === 'function') ? Number(generateQuestion.getLevel()) : 1;
        const t = config.getTargetMs({ level: Number.isFinite(lvl) ? lvl : 1 });
        if (Number.isFinite(t)) return t;
      }
    } catch {}

    // Otherwise compose from per-mode timing or fallbacks
    let base = DEFAULT_BASE_MS;
    let perLevel = DEFAULT_PER_LEVEL_MS;
    let maxMs = Infinity;
    try {
      if (config) {
        if (Number.isFinite(config.targetMs)) base = config.targetMs; // shorthand
        if (config.timing && typeof config.timing === 'object') {
          if (Number.isFinite(config.timing.baseMs)) base = config.timing.baseMs;
          if (Number.isFinite(config.timing.perLevelMs)) perLevel = config.timing.perLevelMs;
          if (Number.isFinite(config.timing.maxMs)) maxMs = config.timing.maxMs;
        }
      }
    } catch {}

    let lvl = 1;
    try {
      if (typeof generateQuestion?.getLevel === 'function') {
        const v = Number(generateQuestion.getLevel());
        if (Number.isFinite(v)) lvl = v;
      }
    } catch {}

    let t = base + Math.max(0, (lvl - 1)) * perLevel;
    if (Number.isFinite(maxMs)) t = Math.min(t, maxMs);
    return t;
  }
  const EMA_ALPHA = 0.35;    // weight of the latest dt in EMA
  const PROGRESS_GAIN = 0.2; // max speed bonus per answer (1/5 level)
  const BASE_PROGRESS = 0.1; // base progress per correct answer (1/10 level)
  const START_MIN_TOTAL = 6; // wait for a few answers before adapting
  const COOLDOWN_Q = 2;      // min questions between level changes

  // Smoothed adaptive state
  let totalAnswered = 0;     // number of correct answers given
  let emaDt = null;          // exponential moving average of dt
  let progress = 0;          // fractional progress toward next level change
  let lastChangeAtTotal = -9999; // index of totalAnswered when last level changed

  function updateLevelIndicator() {
    if (!progressBarEl || !progressFillEl || !progressTextEl) {
      console.log("[Progress] Elements not found:", { progressBarEl, progressFillEl, progressTextEl });
      return;
    }
    // Toggle visibility based on mode
    const show = showLevelUI;
    progressBarEl.style.display = show ? '' : 'none';
    if (!show) return; // don't populate when hidden
    try {
      const hasFn = typeof generateQuestion.getLevel === "function";
      if (hasFn) {
        const lvl = generateQuestion.getLevel();
        if (Number.isFinite(lvl)) {
          progressTextEl.textContent = `Level ${lvl}`;
          const widthPercent = Math.max(0, Math.min(100, progress * 100));
          progressFillEl.style.width = `${widthPercent}%`;
          console.log(`[Progress] Level ${lvl}, progress ${progress.toFixed(2)}, width ${widthPercent}%`);
          return;
        }
      }
      // If not applicable, show nothing
      progressTextEl.textContent = "";
      progressFillEl.style.width = "0%";
    } catch (err) {
      console.error("[Progress] Error:", err);
      progressTextEl.textContent = "";
      progressFillEl.style.width = "0%";
    }
  }

  function updateStats() {
    if (!statsEl) return;
    // Stats visible only for non-level modes (algebra/trig)
    const showStats = !showLevelUI;
    statsEl.style.display = showStats ? '' : 'none';
    if (!showStats) return;
    const minutes = Math.max(0.001, (performance.now() - sessionStartAt) / 60000);
    const rate = correctCount / minutes; // correct per minute
    const rateDisp = rate < 10 ? rate.toFixed(1) : Math.round(rate);
    // Match unit circle formatting: include total and line break
    statsEl.innerHTML = `Correct: ${correctCount}/${totalCount}<br>Rate: ${rateDisp} per min`;
  }


  function checkAnswer_old() {
    const guess = parseInt(answerEl.value, 10);
    if (!Number.isFinite(guess)) return;

    if (guess === currentAnswer) {
      feedbackEl.textContent = "✅ Correct!";

      // --- NEW: time + streak-based leveling ---
      const now = performance.now();
      streak++;

      if (typeof generateQuestion.bumpUp === "function") {
        const dt = now - lastCorrectAt;
        if (dt < FAST_MS) {
          fastStreak++;
        } else {
          fastStreak = 0;
        }
        if (streak >= STREAK_N || fastStreak >= FAST_N) {
          generateQuestion.bumpUp();
          streak = 0;
          fastStreak = 0;
        }
        console.log(`[Speed] dt=${dt.toFixed(0)}ms  streak=${streak}  fast=${fastStreak}`);
      }
      lastCorrectAt = now;
      // --- END NEW ---

      setTimeout(newQuestion, nextDelayMs);
    } else {
      feedbackEl.textContent = "↩️ Try again!";
      streak = 0;       // reset on miss
      fastStreak = 0;   // reset on miss
      // (rest unchanged)

      answerEl.classList.add("wrong");
      setTimeout(() => answerEl.classList.remove("wrong"), 150);
    }
  }

  // New time-based leveling checkAnswer (smoothed)
  function checkAnswer() {
    const guess = parseInt(answerEl.value, 10);
    if (!Number.isFinite(guess)) return;

    if (guess === currentAnswer) {
      // Visual-only success flash; no text
      feedbackEl.textContent = "";
      answerEl.classList.add("correct");
      setTimeout(() => answerEl.classList.remove("correct"), 150);

      const now = performance.now();
      const dt = now - questionStartAt; // time spent on this question

      // increment stats for correct answers (for algebra/trig views)
      correctCount++;
      totalCount++;
      updateStats();

      if (typeof generateQuestion.bumpUp === "function") {
        // Update EMA and progress; use cooldown and gating to smooth changes
        totalAnswered++;
        emaDt = (emaDt == null) ? dt : (emaDt * (1 - EMA_ALPHA) + dt * EMA_ALPHA);

        // Always add base progress for correct answers
        progress += BASE_PROGRESS;

        if (totalAnswered >= START_MIN_TOTAL) {
          const TARGET_MS = getTargetMs();
          let timeInc = ((TARGET_MS - emaDt) / TARGET_MS) * PROGRESS_GAIN;
          // Cap bonuses at PROGRESS_GAIN (1/5 level) and penalties at half base
          timeInc = Math.max(-BASE_PROGRESS * 0.5, Math.min(PROGRESS_GAIN, timeInc));
          progress += timeInc;

          console.log(`[Pace] dt=${dt.toFixed(0)}ms ema=${emaDt.toFixed(0)} base=${BASE_PROGRESS.toFixed(2)} time=${timeInc.toFixed(2)} prog=${progress.toFixed(2)}`);
        }

        // Enforce question-count cooldown between level changes
        const canChange = (totalAnswered - lastChangeAtTotal) >= COOLDOWN_Q;

        if (progress >= 1 && canChange) {
          generateQuestion.bumpUp();
          updateLevelIndicator();
          progress -= 1;
          lastChangeAtTotal = totalAnswered;
        }
      }

      setTimeout(newQuestion, nextDelayMs);
    } else {
      // Visual-only error flash; no text
      feedbackEl.textContent = "";
      // Clear previous attempt on wrong answer
      answerEl.value = "";
      answerEl.classList.add("wrong");
      setTimeout(() => answerEl.classList.remove("wrong"), 150);
      // count attempt for stats and refresh (for modes that show stats)
      totalCount++;
      updateStats();
    }
  }
  // Shared action handler (used by both pointer and keyboard)
function handlePress({ digit = null, action = null }) {
  if (digit !== null) {
    answerEl.value = (answerEl.value === "0") ? digit : (answerEl.value + digit);
  } else if (action === "clear") {
    answerEl.value = "";
  } else if (action === "back") {
    answerEl.value = answerEl.value.slice(0, -1);
  } else if (action === "neg") {
    if (answerEl.value.startsWith("-")) {
      answerEl.value = answerEl.value.slice(1);
    } else {
      answerEl.value = "-" + answerEl.value;
    }
  } else if (action === "enter") {
    checkAnswer();
  }
}


  // Pointer/touch: instant
  buttons.forEach(btn => {
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault(); // avoid ghost clicks
      flash(btn);
      const d = btn.dataset.digit;
      const action = btn.dataset.action;
      handlePress({
        digit: d !== undefined ? d : null,
        action: action || null
      });
    }, { passive: false });
  });

  // Keyboard: call the same handler (no .click())
  document.addEventListener("keydown", (e) => {
    const k = e.key;

    if (/^\d$/.test(k)) {
      // flash the matching button for feedback
      const btn = buttons.find(b => b.dataset.digit === k);
      if (btn) flash(btn);
      handlePress({ digit: k });
      return;
    }

    if (k === "Enter") {
      const btn = buttons.find(b => b.dataset.action === "enter");
      if (btn) flash(btn);
      handlePress({ action: "enter" });
      return;
    }

    if (k === "Backspace") {
      const btn = buttons.find(b => b.dataset.action === "back");
      if (btn) flash(btn);
      e.preventDefault();
      handlePress({ action: "back" });
      return;
    }

    if (k.toLowerCase() === "c") {
      const btn = buttons.find(b => b.dataset.action === "clear");
      if (btn) flash(btn);
      handlePress({ action: "clear" });
    }

    if (k === "-") {
    const btn = buttons.find(b => b.dataset.action === "neg");
    if (btn) flash(btn);
    handlePress({ action: "neg" });
    return;
  }
  });

  newQuestion();
}
