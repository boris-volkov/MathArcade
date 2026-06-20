import { gcd, ri } from "../utils.js";

let level = 1;

function paramsFromLevel(lv) {
  if (lv <= 2) return { maxV: 6,  maxK: 3 };
  if (lv <= 4) return { maxV: 9,  maxK: 5 };
  if (lv <= 6) return { maxV: 12, maxK: 7 };
  return              { maxV: 15, maxK: 10 };
}

function generateQuestion() {
  const { maxV, maxK } = paramsFromLevel(level);

  // Find a primitive fraction n/d (gcd=1, distinct values, d >= 2)
  let n, d, guard = 0;
  do {
    n = ri(1, maxV);
    d = ri(2, maxV + 1);
    guard++;
  } while ((gcd(n, d) !== 1 || n === d) && guard < 100);

  const k = ri(2, maxK);
  const qN = n * k, qD = d * k;

  return {
    text: `${qN}/${qD}`,
    latex: `\\dfrac{${qN}}{${qD}}`,
    answer: { n, d },
  };
}

generateQuestion.getLevel = () => level;
generateQuestion.bumpUp = () => { level++; };
generateQuestion.bumpDown = () => { level = Math.max(1, level - 1); };

export default { generateQuestion, uiType: "numpad" };
