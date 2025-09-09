import { math } from "../common.js";

let level = 1;

function maxFromLevel(lv) {
  // Ramp faster with level; allow larger ranges as level climbs
  if (lv <= 3) return 15;       // small 2–15
  if (lv <= 6) return 35;       // 2–35
  if (lv <= 9) return 60;       // 2–60
  if (lv <= 12) return 120;     // 2–120
  return Math.min(300, 60 + lv * 20);
}

function randInt(lo, hi) { // inclusive
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

// Build a product of small primes to create numbers with richer prime factors
function productOfSmallPrimes(max) {
  const primes = [2, 3, 5, 7, 11, 13];
  const picks = randInt(2, 3); // choose 2–3 primes
  let n = 1;
  for (let i = 0; i < picks; i++) {
    const p = primes[randInt(0, Math.min(primes.length - 1, 4 + (level > 10 ? 2 : 0)))];
    if (n * p > max) break;
    n *= p;
  }
  // If we failed to build a product > 1, fall back to a random integer
  if (n <= 1) n = randInt(2, Math.max(2, max));
  return n;
}

function generateQuestion() {
  const max = maxFromLevel(level);
  // Add a third number earlier to boost difficulty growth
  const useThree = (level >= 9) || (level >= 6 && Math.random() < 0.5);
  const count = useThree ? 3 : 2;

  const BIAS_PRIMEY = 0.6; // tilt toward prime-rich numbers
  const nums = [];
  for (let i = 0; i < count; i++) {
    if (Math.random() < BIAS_PRIMEY) nums.push(productOfSmallPrimes(max));
    else nums.push(randInt(2, max));
  }

  const text = `LCM(${nums.join(", ")})`;
  const answer = nums.reduce((acc, x) => math.lcm(acc, x));
  return { text, answer };
}

generateQuestion.getLevel  = () => level;
generateQuestion.bumpUp    = () => { level++; console.log("[LCM Level] →", level); };
generateQuestion.bumpDown  = () => { level = Math.max(1, level - 1); console.log("[LCM Level] →", level); };

export default { generateQuestion };

