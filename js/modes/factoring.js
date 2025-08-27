// js/modes/factoring.js
// Generates a primitive quadratic Ax^2 + Bx + C (gcd(A,B,C)=1) that factors
// uniquely into two primitive binomials (ux+v)(wx+z). No scalar factor.

let level = 1; // kept for shell compatibility (not used for difficulty here)

// ---------- helpers ----------
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; }
function coprime(a, b) { return gcd(a, b) === 1; }
function ri(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function nz(min, max) { let v; do { v = ri(min, max); } while (v === 0); return v; }

// Primitive binomial (p x + q) where p≠0 and gcd(p,q)=1
function primitiveBinomial(pMin, pMax, qMin, qMax) {
  let p, q;
  do { p = nz(pMin, pMax); q = ri(qMin, qMax); } while (!coprime(p, q));
  return [p, q];
}

// Canonicalize (ux+v)(wx+z):
//  - Make leading coeffs positive (move -1 into constant).
//  - Sort the pair lexicographically so order doesn't create duplicates.
function canonicalize(u, v, w, z) {
  if (u < 0) { u = -u; v = -v; }
  if (w < 0) { w = -w; z = -z; }
  const A = { u, v }, B = { u: w, v: z };
  const key = ({ u, v }) => `${u},${v}`;
  const first = key(A) <= key(B) ? A : B;
  const second = first === A ? B : A;
  return [first.u, first.v, second.u, second.v];
}

function expand(u, v, w, z) {
  return { A: u * w, B: u * z + v * w, C: v * z };
}

// KaTeX-friendly formatting (no trailing equals)
function sign(n) { return n < 0 ? " - " : " + "; }
function formatPoly(A, B, C) {
  const ax2 = (A === 1) ? "x^{2}" : (A === -1 ? "-x^{2}" : `${A}x^{2}`);
  const bx  = (B === 0) ? "" : (B === 1 ? " + x" : (B === -1 ? " - x" : `${sign(B)}${Math.abs(B)}x`));
  const c   = (C === 0) ? "" : `${sign(C)}${Math.abs(C)}`;
  return `${ax2}${bx}${c}`;
}
function binoLatex(u, v) {
  const ux = (u === 1) ? "x" : (u === -1 ? "-x" : `${u}x`);
  const sv = (v === 0) ? "" : (v > 0 ? ` + ${v}` : ` - ${-v}`);
  return `(${ux}${sv})`;
}

// ---------- generator ----------
function generateQuestion() {
  // Tune ranges as desired: keep u,w small; v,z moderate for readable B,C
  // We will loop until we find a primitive trinomial with reasonable bounds.
  let u, v, w, z, A, B, C;

  while (true) {
    // two primitive binomials
    [u, v] = primitiveBinomial(1, 6, -9, 9);
    [w, z] = primitiveBinomial(1, 6, -9, 9);

    ({ A, B, C } = expand(u, v, w, z));

    // enforce primitive trinomial
    if (gcd(gcd(A, B), C) !== 1) continue;

    // keep numbers within bounds to avoid ugly choices
    if (Math.abs(A) > 12 || Math.abs(B) > 60 || Math.abs(C) > 60) continue;

    break;
  }

  // canonicalize factors so the correct answer is unique
  [u, v, w, z] = canonicalize(u, v, w, z);

  // build question
  const questionLatex = formatPoly(A, B, C);

  // correct answer (no scalar)
  const correctLatex = `${binoLatex(u, v)}${binoLatex(w, z)}`;

  // build choices with dedupe
  const seen = new Set([correctLatex]);
  const choices = [correctLatex];

  function addChoice(U, V, W, Z) {
    [U, V, W, Z] = canonicalize(U, V, W, Z);
    const latex = `${binoLatex(U, V)}${binoLatex(W, Z)}`;
    if (!seen.has(latex)) { seen.add(latex); choices.push(latex); }
  }

  // structured plausible distractors (always canonicalize)
  addChoice(u, v + 1, w, z - 1);
  addChoice(u, v - 1, w, z + 1);
  addChoice(u, -v,    w, -z);      // flip constants
  addChoice(w, z,     u, v);       // swap factor order

  // pad to at least 6 with gentle random tweaks that keep readability
  while (choices.length < 6) {
    const dv = ri(-1, 1), dz = ri(-1, 1);
    addChoice(u, v + dv, w, z + dz);
  }

  // shuffle and find correct index
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  const correctIndex = choices.indexOf(correctLatex);

  return { questionLatex, choicesLatex: choices, correctIndex };
}

// ---------- level helpers (for shell compatibility) ----------
generateQuestion.getLevel  = () => level;
generateQuestion.bumpUp    = () => { level++; console.log("[Factoring Level] →", level); };
generateQuestion.bumpDown  = () => { level = Math.max(1, level - 1); console.log("[Factoring Level] →", level); };

export default { generateQuestion };
