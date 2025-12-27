let level = 1;

function maxFromLevel(lv) {
  return lv * 5;
}

function generateQuestion() {
  const max = maxFromLevel(level);
  let a = Math.floor(Math.random() * max) + 1;
  let b = Math.floor(Math.random() * max) + 1;

  // Ensure non-negative answers through level 10
  if (level <= 10 && a < b) {
    const t = a; a = b; b = t;
  }

  const text = `${a} - ${b}`;
  const answer = a - b;
  console.log(`[Sub] L${level} max=${max} :: ${text}`);
  return { text, answer };
}

generateQuestion.getLevel = () => level;
generateQuestion.bumpUp   = () => { level++; console.log("[Level] +", level); };
generateQuestion.bumpDown = () => { level = Math.max(1, level - 1); console.log("[Level] -", level); };

export default { generateQuestion, targetMs: 5000, uiType: "numpad" };
