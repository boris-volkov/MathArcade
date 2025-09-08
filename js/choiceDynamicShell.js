// js/choiceDynamicShell.js
export function setupDynamicChoiceGame({
  // returns: { questionLatex, choicesLatex: string[], correctIndex: number }
  generateQuestion,
  nextDelayMs = 250,
  flashMs = 120,
}) {
  if (typeof generateQuestion !== "function") {
    throw new Error("setupDynamicChoiceGame requires generateQuestion()");
  }

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const qEl        = $("#question");
  const grid       = $("#answerGrid");
  const feedbackEl = $("#feedback");
  const statsEl    = $("#stats");

  let correct = 0, total = 0, start = performance.now();
  let currentCorrectIndex = -1;
  let lastQuestionKey = null;

  function flash(btn) {
    btn.classList.add("active");
    setTimeout(() => btn.classList.remove("active"), flashMs);
  }

  function katexRender(target, latex) {
    target.innerHTML = "";
    try { katex.render(latex, target, { throwOnError: false }); }
    catch { target.textContent = latex; }
  }

  function updateStats() {
    const elapsed = (performance.now() - start) / 1000;
    const rate = total ? ((correct / elapsed) * 60).toFixed(1) : 0;
    statsEl.innerHTML = `Correct: ${correct}/${total}<br>Rate: ${rate} per min`;
  }

  function buildForQuestion() {
    // Avoid repeating the same question back-to-back
    let q = generateQuestion();
    let key = q?.questionLatex ?? "";
    let guard = 0;
    while (lastQuestionKey !== null && key === lastQuestionKey && guard < 5) {
      q = generateQuestion();
      key = q?.questionLatex ?? "";
      guard++;
    }
    lastQuestionKey = key;
    const { questionLatex, choicesLatex, correctIndex } = q;
    if (typeof generateQuestion.getLevel === "function") {
      console.log("[Level]", generateQuestion.getLevel());
    }
    currentCorrectIndex = correctIndex;

    // render question
    katexRender(qEl, questionLatex);

    // rebuild choices
    $$("#answerGrid button").forEach(b => b.remove());
    choicesLatex.forEach((lx, i) => {
      const btn = document.createElement("button");
      btn.className = "answerBtn";
      btn.addEventListener("click", () => {
        flash(btn);
        onChoice(i);
      });
      grid.appendChild(btn);
      katexRender(btn, lx);
    });

    feedbackEl.textContent = "";
  }

  function onChoice(i) {
    total++;
    if (i === currentCorrectIndex) {
      correct++;
      feedbackEl.textContent = "✓ Correct!";
      feedbackEl.style.color = "#2e7d32";
      updateStats();
      setTimeout(buildForQuestion, nextDelayMs);
    } else {
      feedbackEl.textContent = "✗ Try again";
      feedbackEl.style.color = "#c62828";
      updateStats();
    }
  }

  updateStats();
  buildForQuestion();
}
