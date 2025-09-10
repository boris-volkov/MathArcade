let level = 1;

function maxFromLevel(lv) {
  // Start at 10, then +5 per level
  return 10 + (Math.max(1, lv) - 1) * 5;
}

function ri(min, max) { // inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
  const max = maxFromLevel(level);
  // Pick symmetric integers in [-max, max], avoid the trivial 0 +/- 0
  let a = ri(-max, max);
  let b = ri(-max, max);
  if (a === 0 && b === 0) {
    // nudge one value away from 0 to keep it meaningful
    a = 1;
  }

  const op = Math.random() < 0.5 ? "+" : "-";
  const text = `${a} ${op} ${b}`;
  const answer = (op === "+") ? a + b : a - b;

  console.log(`[Integers] L${level} max=${max} :: ${text} = ${answer}`);
  return { text, answer };
}

generateQuestion.getLevel  = () => level;
generateQuestion.bumpUp    = () => { level++; console.log("[Integers Level] +", level); };
generateQuestion.bumpDown  = () => { level = Math.max(1, level - 1); console.log("[Integers Level] -", level); };

export default { generateQuestion };
