// Helpers available to modes
export const math = {
  gcd(a, b) { return b === 0 ? Math.abs(a) : math.gcd(b, a % b); },
  lcm(a, b) { return Math.abs(a * b) / math.gcd(a, b); },
};

// Shared game wiring; takes a mode config {title, generateQuestion, nextDelayMs?, flashMs?}
export function setupGame({ title, generateQuestion, nextDelayMs = 250, flashMs = 150 }) {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const titleEl = $("h1");
  const questionEl = $("#question");
  const answerEl = $("#answer");
  const feedbackEl = $("#feedback");
  const buttons = $$(".numpad button");
  const clearBtn = document.querySelector("#clearBtn");
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    handlePress({ action: "clear" });
  });
}


  let currentAnswer = null;

  function flash(btn) {
    btn.classList.add("active");
    setTimeout(() => btn.classList.remove("active"), flashMs);
  }

  function newQuestion() {
    const { text, answer } = generateQuestion();
    if (typeof generateQuestion.getLevel === "function") {
      console.log("[Level]", generateQuestion.getLevel());
    }
    currentAnswer = answer;
    questionEl.textContent = text;
    answerEl.value = "";
    feedbackEl.textContent = "";
  }
  let streak = 0;
  let fastStreak = 0;
  let lastCorrectAt = performance.now();

  // tune these:
  const STREAK_N = 6;       // bump after 3 correct in a row
  const FAST_MS = 2500;    // consider "fast" if < 2.5s between corrects
  const FAST_N = 2;       // bump after 2 fast corrects in a row


  function checkAnswer() {
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
