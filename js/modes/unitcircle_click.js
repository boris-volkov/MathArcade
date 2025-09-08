let level = 1;

// Union of 12-point (30°) grid and 45° points.
// We index positions by m in [0..23] with angle = 2π m / 24.
// Allowed positions: m % 2 === 0 (all 30° multiples) OR m % 3 === 0 (all 45° multiples).

function simplifyFrac(n, d) {
  const g = (a,b)=> b===0?Math.abs(a):g(b,a%b);
  const gg = g(Math.abs(n), Math.abs(d));
  return { n: n/gg, d: d/gg };
}

function angleLatexFromM(m) {
  if (m === 0) return "0";
  const f = simplifyFrac(m, 12);
  const num = f.n === 1 ? "\\pi" : `${f.n}\\pi`;
  if (f.d === 1) return `${num}`;
  return `\\frac{${num}}{${f.d}}`;
}

function pickM() {
  const allowed = [];
  for (let m = 0; m < 24; m++) {
    if ((m % 2 === 0) || (m % 3 === 0)) allowed.push(m);
  }
  return allowed[Math.floor(Math.random() * allowed.length)];
}

function generateQuestion() {
  const m = pickM();
  const latex = angleLatexFromM(m);
  return { questionLatex: latex, answerIndex: m };
}

generateQuestion.getLevel = () => level;
generateQuestion.bumpUp   = () => { level++; console.log('[UnitCircle Click Level]', level); };
generateQuestion.bumpDown = () => { level = Math.max(1, level - 1); console.log('[UnitCircle Click Level]', level); };

export default { generateQuestion };
