import { math } from "../common.js";
import { ri } from "../utils.js";

let level = 1;

function maxFromLevel(lv) {
  if (lv <= 1)  return 10;
  if (lv <= 2)  return 15;
  if (lv <= 3)  return 20;
  if (lv <= 4)  return 25;
  if (lv <= 5)  return 35;
  if (lv <= 6)  return 45;
  if (lv <= 7)  return 60;
  if (lv <= 8)  return 80;
  if (lv <= 10) return 100;
  if (lv <= 12) return 150;
  return Math.min(400, 150 + (lv - 12) * 20);
}

// Build a product of small primes to create numbers with richer prime factors
function productOfSmallPrimes(max) {
  const primes = [2, 3, 5, 7, 11, 13];
  const picks = ri(2, 3); // choose 2–3 primes
  let n = 1;
  for (let i = 0; i < picks; i++) {
    const p = primes[ri(0, Math.min(primes.length - 1, 4 + (level > 10 ? 2 : 0)))];
    if (n * p > max) break;
    n *= p;
  }
  // If we failed to build a product > 1, fall back to a random integer
  if (n <= 1) n = ri(2, Math.max(2, max));
  return n;
}

function generateQuestion() {
  const max = maxFromLevel(level);
  // Gradually introduce a third number from L5, reaching 80% by L9+
  const threeProb = level <= 4 ? 0 : Math.min(0.8, (level - 4) * 0.15);
  const useThree = Math.random() < threeProb;
  const count = useThree ? 3 : 2;

  const BIAS_PRIMEY = 0.6; // tilt toward prime-rich numbers
  const nums = [];
  for (let i = 0; i < count; i++) {
    if (Math.random() < BIAS_PRIMEY) nums.push(productOfSmallPrimes(max));
    else nums.push(ri(2, max));
  }

  const text = `LCM(${nums.join(", ")})`;
  const answer = nums.reduce((acc, x) => math.lcm(acc, x));
  return { text, answer };
}

generateQuestion.getLevel  = () => level;
generateQuestion.bumpUp    = () => { level++; console.log("[LCM Level] →", level); };
generateQuestion.bumpDown  = () => { level = Math.max(1, level - 1); console.log("[LCM Level] →", level); };

export default { generateQuestion, progressScale: 0.5, uiType: "numpad" };
