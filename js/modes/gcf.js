import { math } from "../common.js";

let level = 1;

function maxFromLevel(lv) {
  // grow faster, cap higher
  return Math.min(20 + lv * 10, 200);
}

function generateQuestion() {
  const max = maxFromLevel(level);
  const a = Math.floor(Math.random() * max) + 10; // start at 10 to avoid trivial gcds
  const b = Math.floor(Math.random() * max) + 10;
  return { text: `GCF(${a}, ${b})`, answer: math.gcd(a, b) };
}

generateQuestion.getLevel  = () => level;
generateQuestion.bumpUp    = () => { level++; console.log("[GCF Level] →", level); };
generateQuestion.bumpDown  = () => { level = Math.max(1, level - 1); console.log("[GCF Level] →", level); };

export default { generateQuestion };
