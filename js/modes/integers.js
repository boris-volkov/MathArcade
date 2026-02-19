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
  // Pick symmetric integers in [-max, max], avoid trivial/undesired patterns.
  // Specifically skip plain positive addition prompts like "3 + 8".
  let a = 0;
  let b = 0;
  let op = "+";
  do {
    a = ri(-max, max);
    b = ri(-max, max);
    op = Math.random() < 0.5 ? "+" : "-";
    if (a === 0 && b === 0) a = 1; // nudge away from 0 +/- 0
  } while (op === "+" && a > 0 && b > 0);

  const text = `${a} ${op} ${b}`;
  const answer = (op === "+") ? a + b : a - b;

  console.log(`[Integers] L${level} max=${max} :: ${text} = ${answer}`);
  return { text, answer };
}

generateQuestion.getLevel  = () => level;
generateQuestion.bumpUp    = () => { level++; console.log("[Integers Level] +", level); };
generateQuestion.bumpDown  = () => { level = Math.max(1, level - 1); console.log("[Integers Level] -", level); };

export default { generateQuestion, targetMs: 5000, uiType: "numpad" };
