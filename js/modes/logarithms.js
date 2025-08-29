let level = 1;

// Keep bases and exponents reasonable; grow with level
function maxBase(lv) { return Math.min(3 + lv, 9); }   // 4,5,6,7,8,9
function maxPosExp(lv)  { return Math.min(2 + lv, 6); }      // positive cap 3..6
function maxNegExp(lv)  { return Math.min(1 + Math.floor(lv / 2), 3); } // allow -1..-3 as level grows

function ri(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generateQuestion() {
  const b = ri(2, maxBase(level));
  const cMin = -maxNegExp(level);
  const cMax = maxPosExp(level);
  let c = ri(cMin, cMax);
  const isNeg = c < 0;
  const absC = Math.abs(c);
  const a = Math.pow(b, c);

  // Choose which symbol to hide with constraints:
  // - If c < 0, do not hide 'a' (fractional answer).
  // - If c === 0 (a === 1), do not hide 'b' (not unique).
  let options = ['a', 'b', 'c'];
  if (isNeg) options = options.filter(x => x !== 'a');
  if (c === 0) options = options.filter(x => x !== 'b');
  const hide = options[ri(0, options.length - 1)];

  // Build display tokens (prefer numeric fraction for negative exponents when showing 'a')
  let aTxt, aLx;
  if (isNeg && hide !== 'a') {
    const pow = Math.pow(b, absC); // e.g., 3^2 = 9
    aTxt = `1/${pow}`;
    aLx  = `\\frac{1}{${pow}}`;
  } else {
    aTxt = String(a);
    aLx  = String(a);
  }

  const aT = hide === 'a' ? 'x' : aLx;
  const bT = hide === 'b' ? 'x' : String(b);
  const cT = hide === 'c' ? 'x' : String(c);

  // Plain-text for fallback, plus LaTeX for KaTeX rendering
  const text = `log_${hide === 'b' ? 'x' : b}(${hide === 'a' ? 'x' : aTxt}) = ${hide === 'c' ? 'x' : c}`;
  const latex = `\\log_{${bT}}(${aT}) = ${cT}`;
  const answer = hide === 'a' ? a : hide === 'b' ? b : c; // 'a' hidden occurs only when c >= 0

  return { text, latex, answer };
}

generateQuestion.getLevel = () => level;
generateQuestion.bumpUp   = () => { level++; console.log('[Level]', level); };
generateQuestion.bumpDown = () => { level = Math.max(1, level - 1); console.log('[Level]', level); };

export default { generateQuestion };
