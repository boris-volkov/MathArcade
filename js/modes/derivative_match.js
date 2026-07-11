// derivative_match.js — two curves are plotted; one is the derivative of
// the other. The player taps the derivative. Each family returns closures
// for f and f' plus a plotting domain; the shell samples them.

import { ri } from "../utils.js";

let level = 1;

function pick(arr) { return arr[ri(0, arr.length - 1)]; }
function rf(min, max) { return min + Math.random() * (max - min); }
function rsign() { return Math.random() < 0.5 ? -1 : 1; }

// x^(p/q) for integer p, q — real-valued where it exists:
// even q → undefined (NaN) for x < 0; odd q → signed real root.
function rpow(x, p, q) {
  if (q % 2 === 0) {
    if (x < 0) return NaN;
    return Math.pow(x, p / q);
  }
  const s = (x < 0 && p % 2 !== 0) ? -1 : 1;
  return s * Math.pow(Math.abs(x), p / q);
}

// f = c·(x−h)^(p/q), f' = c·(p/q)·(x−h)^((p−q)/q). The exponent parity
// decides the feature at x = h: cusp, vertical tangent, or domain edge.
function powerPair([p, q], hMin = -1.2, hMax = 1.2) {
  const c = rsign() * rf(0.8, 1.6);
  const h = rf(hMin, hMax);
  return {
    f: x => c * rpow(x - h, p, q),
    fp: x => c * (p / q) * rpow(x - h, p - q, q),
    domain: [-3, 3],
    yClip: [-4, 4],
  };
}

const FAMILIES = {
  // f' drops a degree — visually distinct shapes
  quad() {
    const a = rsign() * rf(0.3, 1), b = rf(-2, 2), c = rf(-2, 2);
    return { f: x => a * x * x + b * x + c, fp: x => 2 * a * x + b, domain: [-3, 3] };
  },
  cubic() {
    const a = rsign() * rf(0.15, 0.4), b = rsign() * rf(0.5, 2), c = rf(-1, 1);
    return { f: x => a * x ** 3 + b * x + c, fp: x => 3 * a * x * x + b, domain: [-3, 3] };
  },
  quartic() {
    const a = rsign() * rf(0.05, 0.12), b = -Math.sign(a) * rf(0.5, 1.5);
    return { f: x => a * x ** 4 + b * x * x, fp: x => 4 * a * x ** 3 + 2 * b * x, domain: [-3, 3] };
  },
  // same shape shifted a quarter period — must read slopes, not shapes
  sine() {
    const A = rf(0.8, 1.6), k = level >= 4 ? pick([1, 2]) : 1;
    return { f: x => A * Math.sin(k * x), fp: x => A * k * Math.cos(k * x), domain: [-Math.PI, Math.PI] };
  },
  cosine() {
    const A = rf(0.8, 1.6), k = level >= 4 ? pick([1, 2]) : 1;
    return { f: x => A * Math.cos(k * x), fp: x => -A * k * Math.sin(k * x), domain: [-Math.PI, Math.PI] };
  },
  gaussian() {
    const A = rsign() * rf(1, 2), s = rf(0.7, 1.2);
    const s2 = s * s;
    return {
      f: x => A * Math.exp(-x * x / (2 * s2)),
      fp: x => -A * (x / s2) * Math.exp(-x * x / (2 * s2)),
      domain: [-3, 3],
    };
  },
  // f' = a·f: a scaled twin of itself — the hardest read
  expx() {
    const a = rsign() * pick([rf(0.45, 0.7), rf(1.4, 1.8)]);
    return { f: x => Math.exp(a * x), fp: x => a * Math.exp(a * x), domain: [-2, 2] };
  },
  damped() {
    const k = pick([2, 3]);
    return {
      f: x => Math.exp(-x * x / 2) * Math.sin(k * x),
      fp: x => Math.exp(-x * x / 2) * (k * Math.cos(k * x) - x * Math.sin(k * x)),
      domain: [-3, 3],
    };
  },
  // even/odd exponent: f has a cusp, f' a two-sided vertical asymptote
  cuspEvenOdd() {
    return powerPair(pick([[2, 3], [2, 5], [4, 5]]));
  },
  // odd/odd, p < q: f has a vertical tangent, f' a one-signed spike
  vertOddOdd() {
    return powerPair(pick([[1, 3], [1, 5], [3, 5]]));
  },
  // odd/odd, p > q: f looks smooth but f' has the cusp
  cuspDeriv() {
    return powerPair(pick([[5, 3], [7, 5]]));
  },
  // odd/even: even root — both curves only exist for x ≥ h
  halfDomain() {
    return powerPair(pick([[1, 2], [3, 2]]), -2, 0.5);
  },
};

function familiesForLevel(lv) {
  if (lv <= 1) return ['quad', 'cubic'];
  if (lv <= 2) return ['quad', 'cubic', 'quartic'];
  if (lv <= 3) return ['sine', 'cosine', 'cuspEvenOdd', 'halfDomain'];
  if (lv <= 4) return ['sine', 'cosine', 'vertOddOdd', 'cuspEvenOdd', 'halfDomain'];
  if (lv <= 5) return ['gaussian', 'cuspDeriv', 'vertOddOdd', 'cuspEvenOdd'];
  return ['sine', 'cosine', 'gaussian', 'damped', 'expx', 'cuspEvenOdd', 'vertOddOdd', 'cuspDeriv', 'halfDomain'];
}

function generateQuestion() {
  const fam = FAMILIES[pick(familiesForLevel(level))]();
  const flip = Math.random() < 0.5;
  return {
    prompt: 'which curve is the derivative?',
    curves: flip ? [fam.fp, fam.f] : [fam.f, fam.fp],
    correctIndex: flip ? 0 : 1,
    domain: fam.domain,
    yClip: fam.yClip,
  };
}

generateQuestion.getLevel = () => level;
generateQuestion.bumpUp = () => { level++; };
generateQuestion.bumpDown = () => { level = Math.max(1, level - 1); };

export default { generateQuestion, uiType: "curve" };
