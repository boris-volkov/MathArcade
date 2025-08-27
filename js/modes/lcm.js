import { math } from "../common.js";

let level = 1;

function maxFromLevel(lv) {
  // start small, ramp slowly, cap reasonably
  return Math.min(1 + lv * 3, 100);  
}

function generateQuestion() {
  const max = maxFromLevel(level);
  const a = Math.floor(Math.random() * max) + 2; // avoid 1 (too trivial)
  const b = Math.floor(Math.random() * max) + 2;
  return { text: `LCM(${a}, ${b})`, answer: math.lcm(a, b) };
}

generateQuestion.getLevel  = () => level;
generateQuestion.bumpUp    = () => { level++; console.log("[LCM Level] →", level); };
generateQuestion.bumpDown  = () => { level = Math.max(1, level - 1); console.log("[LCM Level] →", level); };

export default { generateQuestion };
