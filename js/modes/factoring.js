// js/modes/factoring.js
// Utilities
function randInt(lo, hi) {
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}
function nonzero(lo, hi) {
  let v = 0;
  while (v === 0) v = randInt(lo, hi);
  return v;
}
function formatPoly(A, B, C) {
  // Build a KaTeX string for Ax^2 + Bx + C with nice sign handling, hiding 1-coeffs
  const ax2 = (A === 1) ? "x^{2}" : (A === -1 ? "-x^{2}" : `${A}x^{2}`);
  const bx  = (B === 0) ? "" : (B === 1 ? " + x" : (B === -1 ? " - x" : (B > 0 ? ` + ${B}x` : ` - ${-B}x`)));
  const c   = (C === 0) ? "" : (C > 0 ? ` + ${C}` : ` - ${-C}`);
  return `${ax2}${bx}${c}`;
}
function formatBinomial(a, b) {
  // (ax + b) with a=±1 displayed as x/ -x; sign of b handled
  const ax = (a === 1) ? "x" : (a === -1 ? "-x" : `${a}x`);
  const sb = (b === 0) ? "" : (b > 0 ? ` + ${b}` : ` - ${-b}`);
  return `(${ax}${sb})`;
}
function polyFromFactors(a, b, c, d) {
  // (ax + b)(cx + d) => A=ac, B=ad+bc, C=bd
  const A = a * c;
  const B = a * d + b * c;
  const C = b * d;
  return { A, B, C };
}
function distinctTuple(t, list) {
  return !list.some(u => u[0] === t[0] && u[1] === t[1] && u[2] === t[2] && u[3] === t[3]);
}

export default {
  // generateQuestion returns { questionLatex, choicesLatex[], correctIndex }
  generateQuestion() {
    // Make a valid factorization from small integers
    // Choose a,c small nonzero; b,d in a moderate range
    let a = nonzero(1, 3);
    let c = nonzero(1, 3);
    let b = nonzero(-9, 9);
    let d = nonzero(-9, 9);

    // Keep coefficients in a reasonable range
    let { A, B, C } = polyFromFactors(a, b, c, d);
    let guard = 0;
    while ((Math.abs(A) > 12 || Math.abs(B) > 60 || Math.abs(C) > 60) && guard < 200) {
      a = nonzero(1, 3);
      c = nonzero(1, 3);
      b = nonzero(-9, 9);
      d = nonzero(-9, 9);
      ({ A, B, C } = polyFromFactors(a, b, c, d));
      guard++;
    }

    const questionLatex = `${formatPoly(A, B, C)}`;

    // Correct tuple
    const correctTuple = [a, b, c, d];

    // Build distractors by mutating (a,b,c,d) in ways that keep A and/or C plausible
    const choices = [correctTuple];
    const tryAdd = (t) => {
      if (distinctTuple(t, choices)) choices.push(t);
    };

    // Common wrong patterns
    tryAdd([a, d, c, b]);                // swap inner constants
    tryAdd([a, -b, c, -d]);              // flip both constants' signs
    tryAdd([c, b, a, d]);                // swap a<->c
    tryAdd([a, b + (b > 0 ? -1 : 1), c, d]); // nudge b
    tryAdd([a, b, c, d + (d > 0 ? -1 : 1)]); // nudge d
    tryAdd([a, b, -c, -d]);              // pull a leading minus into the second factor

    // If fewer than 6, pad with random tweaks that keep |A|,|B|,|C| sane
    while (choices.length < 6) {
      const ta = a * (Math.random() < 0.5 ? 1 : -1);
      const tc = c * (Math.random() < 0.5 ? 1 : -1);
      const tb = b + randInt(-2, 2);
      const td = d + randInt(-2, 2);
      const t  = [ta || 1, tb || 1, tc || 1, td || 1];
      const { A: A2, B: B2, C: C2 } = polyFromFactors(...t);
      if (Math.abs(A2) <= 12 && Math.abs(B2) <= 60 && Math.abs(C2) <= 60 && distinctTuple(t, choices)) {
        choices.push(t);
      }
    }

    // Shuffle and find correct index
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    const correctIndex = choices.findIndex(
      t => t[0] === correctTuple[0] && t[1] === correctTuple[1] && t[2] === correctTuple[2] && t[3] === correctTuple[3]
    );

    // Convert tuples to KaTeX strings
    const choicesLatex = choices.map(([aa, bb, cc, dd]) => {
      const left  = formatBinomial(aa, bb);
      const right = formatBinomial(cc, dd);
      return `${left}${right}`;
    });

    return { questionLatex, choicesLatex, correctIndex };
  }
};
