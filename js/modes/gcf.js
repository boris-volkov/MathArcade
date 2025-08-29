import { math } from "../common.js";

let level = 1;

function maxFromLevel(lv) {
  // grow faster, cap higher
  return Math.min(20 + lv * 10, 200);
}

function randInt(lo, hi) {
  // inclusive bounds
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

// Try to generate numbers that share a factor g >= 2 while
// keeping values within the usual [10 .. max+9] range.
function generateWithCommonFactor(max) {
  const upper = max + 9;
  // Limit g so there is reasonable headroom for multiples.
  // Using a modest cap keeps difficulty sensible.
  const capFromRange = Math.floor(upper / 12); // ensure at least ~12 steps of range
  const maxG = Math.max(2, Math.min(12, capFromRange));
  if (maxG < 2) return null;

  const g = randInt(2, maxG);
  const lo = Math.ceil(10 / g);
  const hi = Math.floor(upper / g);
  if (lo > hi) return null;

  const a = g * randInt(lo, hi);
  const b = g * randInt(lo, hi);
  return { a, b };
}

function generateQuestion() {
  const max = maxFromLevel(level);

  // Bias towards pairs with a common factor to reduce "1" answers.
  const BIAS_COMMON = 0.75; // 75% of questions have gcd > 1

  let a, b;
  if (Math.random() < BIAS_COMMON) {
    const pair = generateWithCommonFactor(max);
    if (pair) {
      ({ a, b } = pair);
    } else {
      // Fallback to uniform if we couldn't construct a good pair
      a = Math.floor(Math.random() * max) + 10;
      b = Math.floor(Math.random() * max) + 10;
    }
  } else {
    // Occasionally include coprime pairs for variety
    a = Math.floor(Math.random() * max) + 10; // start at 10 to avoid trivial gcds
    b = Math.floor(Math.random() * max) + 10;
  }

  return { text: `GCF(${a}, ${b})`, answer: math.gcd(a, b) };
}

generateQuestion.getLevel  = () => level;
generateQuestion.bumpUp    = () => { level++; console.log("[GCF Level] →", level); };
generateQuestion.bumpDown  = () => { level = Math.max(1, level - 1); console.log("[GCF Level] →", level); };

export default { generateQuestion };

