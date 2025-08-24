// Helpers available to modes
export const math = {
  gcd(a, b) { return b === 0 ? Math.abs(a) : math.gcd(b, a % b); },
  lcm(a, b) { return Math.abs(a * b) / math.gcd(a, b); },
};

// Shared game wiring; takes a mode config {title, generateQuestion, nextDelayMs?, flashMs?}
export function setupGame({ title, generateQuestion, nextDelayMs = 100, flashMs = 150 }) {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const titleEl    = $("h1");
  const questionEl = $("#question");
  const answerEl   = $("#answer");
  const feedbackEl = $("#feedback");
  const buttons    = $$(".numpad button");

  titleEl.textContent = title || "Math Game";

  let currentAnswer = null;

  function flash(btn) {
    btn.classList.add("active");
    setTimeout(() => btn.classList.remove("active"), flashMs);
  }

  function newQuestion() {
    const { text, answer } = generateQuestion();
    currentAnswer = answer;
    questionEl.textContent = text;
    answerEl.value = "";
    feedbackEl.textContent = "";
  }

  function checkAnswer() {
  const guess = parseInt(answerEl.value, 10);
  if (!Number.isFinite(guess)) return;

  if (guess === currentAnswer) {
    feedbackEl.textContent = "✅ Correct!";
    setTimeout(newQuestion, nextDelayMs);   // only advance on correct
  } else {
    feedbackEl.textContent = "↩️ Try again!";
    // optional: a tiny visual nudge
    answerEl.classList.add("wrong");
    setTimeout(() => answerEl.classList.remove("wrong"), 150);
    // keep the same question; do NOT call newQuestion and do NOT show the answer
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
});

  newQuestion();
}
