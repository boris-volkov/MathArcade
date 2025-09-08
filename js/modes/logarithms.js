let level = 1;

// Integer ranges that scale with level (for classic integer exponents)
function maxBase(lv) { return Math.min(3 + lv, 9); }
function maxPosExp(lv)  { return Math.min(2 + lv, 6); }
function maxNegExp(lv)  { return Math.min(1 + Math.floor(lv / 2), 3); }

function ri(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function frac(n, d) { return { n, d }; }
function simplifyFrac({ n, d }) {
  const g = (a,b)=> b===0?Math.abs(a):g(b,a%b);
  const g0 = g(Math.abs(n), Math.abs(d));
  return { n: n/g0, d: d/g0 };
}

function rootLatex(base, q) {
  return q === 2 ? `\\sqrt{${base}}` : `\\sqrt[${q}]{${base}}`;
}

function powLatex(base, expLx) {
  return `{${base}}^{${expLx}}`;
}

function classicVariant() {
  const b = ri(2, maxBase(level));
  const cMin = -maxNegExp(level);
  const cMax = maxPosExp(level);
  const c = ri(cMin, cMax);
  const a = Math.pow(b, c);

  // Avoid hiding 'a' when a is fractional (c < 0)
  let choices = ['a', 'b', 'c'];
  if (c < 0) choices = choices.filter(x => x !== 'a');
  if (c === 0) choices = choices.filter(x => x !== 'b');
  const hide = choices[ri(0, choices.length - 1)];

  const aTxt = (c < 0 && hide !== 'a') ? `1/${Math.pow(b, -c)}` : String(a);
  const aLx  = (c < 0 && hide !== 'a') ? `\\frac{1}{${Math.pow(b, -c)}}` : String(a);

  const aT = hide === 'a' ? 'x' : aLx;
  const bT = hide === 'b' ? 'x' : String(b);
  const cT = hide === 'c' ? 'x' : String(c);

  const text  = `log_${hide === 'b' ? 'x' : b}(${hide === 'a' ? 'x' : aTxt}) = ${hide === 'c' ? 'x' : c}`;
  const latex = `\\log_{${bT}}(${aT}) = ${cT}`;
  const answer = hide === 'a' ? a : hide === 'b' ? b : c;
  return { text, latex, answer };
}

// Fractional exponent variant: show c = p/q (possibly), but never ask the user for c.
// We hide only the base here so the answer is integer.
function fracExpVariant() {
  const b = ri(2, Math.max(4, maxBase(level))); // small base
  const q = ri(2, Math.min(4, 2 + Math.floor(level/2))); // root index 2..4
  const p = ri(1, Math.min(5, 1 + level));               // small numerator
  const F = simplifyFrac(frac(p, q));

  const hide = 'b'; // ensure integer answer only

  // a = b^{p/q} -> show as q-th root of b^p
  const powTxt = `${b}^${F.n}`;
  const aTxt = F.d === 1 ? `${Math.pow(b, F.n)}` : `${F.d}rt(${powTxt})`;
  const aLx = (F.d === 1)
    ? String(Math.pow(b, F.n))
    : rootLatex(powLatex(b, F.n), F.d);

  const cTxt = (F.d === 1) ? `${F.n}` : `${F.n}/${F.d}`;
  const cLx  = (F.d === 1) ? `${F.n}` : `\\frac{${F.n}}{${F.d}}`;

  const aT = aLx;
  const bT = 'x';
  const cT = cLx; // fractional exponent is shown, not asked

  const text  = `log_${'x'}(${aTxt}) = ${cTxt}`;
  const latex = `\\log_{${bT}}(${aT}) = ${cT}`;
  const answer = b; // user inputs the (integer) base
  return { text, latex, answer };
}

// Fractional exponent with hidden 'a': choose base as a perfect q-th power so a = b^{p/q} is integer.
function fracExpHideAVariant() {
  const q = ri(2, Math.min(4, 2 + Math.floor(level/2))); // root index
  const t = ri(2, Math.min(7, 3 + level));               // base root (kept small)
  const p = ri(1, Math.min(5, 1 + Math.floor(level/2))); // numerator
  const F = simplifyFrac(frac(p, q));

  const b = Math.pow(t, q);   // perfect q-th power (e.g., 9)
  const a = Math.pow(t, p);   // integer (e.g., 3)
  const hide = 'a';           // ask for a (integer)

  const aTxt = 'x';
  const aLx  = 'x';
  const bTxt = String(b);
  const bLx  = String(b);
  const cTxt = (F.d === 1) ? `${F.n}` : `${F.n}/${F.d}`;
  const cLx  = (F.d === 1) ? `${F.n}` : `\\frac{${F.n}}{${F.d}}`;

  const text  = `log_${bTxt}(${aTxt}) = ${cTxt}`;
  const latex = `\\log_{${bLx}}(${aLx}) = ${cLx}`;
  const answer = a; // integer answer
  return { text, latex, answer };
}

// Root base variant: b = q-th root of t, with a = t^m so c = m*q (integer answer).
function rootBaseVariant() {
  const t = ri(2, Math.min(9, 3 + level));
  const q = ri(2, Math.min(4, 2 + Math.floor(level/2)));
  const m = ri(1, Math.min(5, 1 + Math.floor(level/2)));
  const a = Math.pow(t, m);
  const c = m * q; // integer answer

  const hide = 'c'; // ask for c only so answer stays integer

  const bTxt = q === 2 ? `sqrt(${t})` : `${q}rt(${t})`;
  const bLx  = rootLatex(String(t), q);
  const aTxt = String(a);
  const aLx  = String(a);

  const aT = aLx;
  const bT = bLx;
  const cT = 'x';

  const text  = `log_${bTxt}(${aTxt}) = x`;
  const latex = `\\log_{${bT}}(${aT}) = ${cT}`;
  const answer = c;
  return { text, latex, answer };
}

function generateQuestion() {
  // Weight variants by level: start classic-heavy, then mix in more variety
  const roll = Math.random();
  let variant;
  if (level < 3) {
    variant = roll < 0.85 ? 'classic' : 'rootBase';
  } else if (level < 6) {
    // introduce both fractional variants lightly
    if (roll < 0.55) variant = 'classic';
    else if (roll < 0.7) variant = 'rootBase';
    else if (roll < 0.85) variant = 'fracExp';
    else variant = 'fracExpHideA';
  } else {
    // more variety at higher levels
    if (roll < 0.40) variant = 'classic';
    else if (roll < 0.60) variant = 'rootBase';
    else if (roll < 0.80) variant = 'fracExp';
    else variant = 'fracExpHideA';
  }

  if (variant === 'fracExp') return fracExpVariant();
  if (variant === 'fracExpHideA') return fracExpHideAVariant();
  if (variant === 'rootBase') return rootBaseVariant();
  return classicVariant();
}

generateQuestion.getLevel = () => level;
generateQuestion.bumpUp   = () => { level++; console.log('[Level]', level); };
generateQuestion.bumpDown = () => { level = Math.max(1, level - 1); console.log('[Level]', level); };

export default { generateQuestion };
