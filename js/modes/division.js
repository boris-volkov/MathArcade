let level = 1;

// Start strictly within 12x12 facts through level 10.
// After that, expand slowly: +1 to the table size every 2 levels, capped.
function maxFactorFromLevel(lv) {
  if (lv <= 10) return 12;
  const extra = Math.floor((lv - 10) / 2); // gentle ramp
  return Math.min(12 + extra, 30);         // cap to keep answers manageable
}

function ri(n) { return Math.floor(Math.random() * n) + 1; }

function generateQuestion() {
  const maxF = maxFactorFromLevel(level);
  const b = ri(maxF);   // divisor within the current table size
  const q = ri(maxF);   // quotient (answer) within the same size
  const a = b * q;      // dividend so division is exact

  const text = `${a} / ${b}`; // ASCII slash for clarity
  const answer = q;
  console.log(`[Div] L${level} table<=${maxF} :: ${text}`);
  return { text, answer };
}

generateQuestion.getLevel = () => level;
generateQuestion.bumpUp   = () => { level++; console.log("[Level] +", level); };
generateQuestion.bumpDown = () => { level = Math.max(1, level - 1); console.log("[Level] -", level); };

export default { generateQuestion, targetMs: 5000, uiType: "numpad" };
