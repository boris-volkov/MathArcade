let level = 1; // not used, but keep interface consistent

function generateQuestion() {
  // pick random numbers from -20..20, avoid 0+0
  const a = Math.floor(Math.random() * 41) - 20; // -20..20
  const b = Math.floor(Math.random() * 41) - 20;
  if (a === 0 && b === 0) return generateQuestion();

  const op = Math.random() < 0.5 ? "+" : "-";

  const text = `${a} ${op} ${b} =`;
  const answer = (op === "+") ? a + b : a - b;

  console.log(`[Integers] ${text} ${answer}`);
  return { text, answer };
}

generateQuestion.getLevel  = () => level;     // stub, not used
generateQuestion.bumpUp    = () => {};        // no-op
generateQuestion.bumpDown  = () => {};        // no-op

export default { generateQuestion };
