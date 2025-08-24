// choiceShell.js – shared UI for multiple-choice / grid-answer games
export function setupChoiceGame({
  title = "Choice Game",
  // returns { questionLatex, answerLatex }
  generateQuestion,
  // array of LaTeX strings for canonical (positive) choices (e.g. "0", "\frac12", "\sqrt{3}", "undef")
  choices,
  // whether to show a negate toggle and how to apply it
  enableNegToggle = true,
  // comparison: (userLatex, correctLatex) => boolean
  isCorrect = (u, c) => u === c,
  nextDelayMs = 300,
  flashMs = 120,
}) {
  if (typeof generateQuestion !== "function") {
    throw new Error("setupChoiceGame requires generateQuestion()");
  }
  if (!Array.isArray(choices) || choices.length === 0) {
    throw new Error("setupChoiceGame requires a non-empty choices array");
  }

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const titleEl    = $("h1");
  const qEl        = $("#question");
  const grid       = $("#answerGrid");
  const feedbackEl = $("#feedback");
  const statsEl    = $("#stats");

  titleEl.textContent = title;

  // ensure negToggle exists (first button is reserved for it)
  let negToggle = $("#negToggle");
  let answerButtons = [];

  function flash(btn) {
    btn.classList.add("active");
    setTimeout(() => btn.classList.remove("active"), flashMs);
  }

  // Build buttons (after neg toggle)
  function buildButtons() {
    // remove older non-toggle buttons
    $$("#answerGrid button").slice(1).forEach(b => b.remove());
    answerButtons = [];

    choices.forEach(ch => {
      const btn = document.createElement("button");
      btn.className = "answerBtn";
      btn.dataset.answer = ch;
      btn.addEventListener("click", () => {
        flash(btn);
        onAnswerClick(ch);
      });
      grid.appendChild(btn);
      answerButtons.push(btn);
    });
  }

  function renderButtons() {
    // render neg toggle label as plain text (already set)
    answerButtons.forEach(btn => {
      btn.innerHTML = "";
      const latex = btn.dataset.answer;
      try { katex.render(latex, btn, { throwOnError: false }); }
      catch { btn.textContent = latex; }
    });
  }

  // Negation helper: prefix '-' unless 'undef' or already negative
  function negateLatex(lx) {
    if (lx === "undef") return "undef";
    if (lx.startsWith("-")) return lx.slice(1);
    return "-" + lx;
  }

  let negateActive = false;
  let correct = 0, total = 0, start = performance.now();
  let currentAnswerLatex = null;

  if (enableNegToggle) {
    negToggle.style.display = "";
    negToggle.addEventListener("click", () => {
      negateActive = !negateActive;
      negToggle.classList.toggle("active", negateActive);
    });
  } else {
    negToggle.style.display = "none";
  }

  function updateStats() {
    const elapsed = (performance.now() - start) / 1000;
    const rate = total ? ((correct / elapsed) * 60).toFixed(1) : 0;
    statsEl.innerHTML = `Correct: ${correct} / Total: ${total}<br>Rate: ${rate} per min`;
  }

  function setQuestion() {
    const { questionLatex, answerLatex } = generateQuestion();
    currentAnswerLatex = answerLatex;
    qEl.innerHTML = "";
    try { katex.render(questionLatex, qEl, { throwOnError: false }); }
    catch { qEl.textContent = questionLatex; }

    feedbackEl.textContent = "";
  }

  function onAnswerClick(choiceLatex) {
    const user = (enableNegToggle && negateActive && choiceLatex !== "undef")
      ? negateLatex(choiceLatex)
      : choiceLatex;

    if (isCorrect(user, currentAnswerLatex)) {
      feedbackEl.textContent = "✓ Correct!";
      feedbackEl.style.color = "#2e7d32";
      correct++; total++;
      updateStats();
      setTimeout(() => {
        setQuestion();
        negateActive = false;
        negToggle.classList.remove("active");
      }, nextDelayMs);
    } else {
      feedbackEl.textContent = "✗ Try again";
      feedbackEl.style.color = "#c62828";
      total++;
      updateStats();
      // keep asking the same question
    }
  }

  buildButtons();
  renderButtons();
  setQuestion();
  updateStats();
}
