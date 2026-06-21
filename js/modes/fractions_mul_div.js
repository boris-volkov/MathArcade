import { gcd, ri } from "../utils.js";

let level = 1;

function pick(arr) { return arr[ri(0, arr.length - 1)]; }

function denomsForLevel(lv) {
  if (lv <= 2) return [2, 3, 4, 5, 6];
  if (lv <= 4) return [2, 3, 4, 5, 6, 8];
  return [2, 3, 4, 5, 6, 8, 10, 12];
}

function genMul(lv) {
  const denoms = denomsForLevel(lv);
  for (let i = 0; i < 60; i++) {
    const d1 = pick(denoms);
    const d2 = pick(denoms);
    const n1 = ri(1, d1);
    const n2 = ri(1, d2);
    const resN = n1 * n2, resD = d1 * d2;
    const g = gcd(resN, resD);
    const ansN = resN / g, ansD = resD / g;
    if (ansD === 1 || ansN > 20 || ansD > 20) continue;
    return {
      text: `${n1}/${d1} × ${n2}/${d2}`,
      latex: `\\dfrac{${n1}}{${d1}} \\times \\dfrac{${n2}}{${d2}}`,
      answer: { n: ansN, d: ansD },
    };
  }
  return null;
}

function genDiv(lv) {
  const denoms = denomsForLevel(lv);
  for (let i = 0; i < 60; i++) {
    const d1 = pick(denoms);
    const d2 = pick(denoms);
    const n1 = ri(1, d1);
    const n2 = ri(1, d2);
    const resN = n1 * d2, resD = d1 * n2;
    const g = gcd(resN, resD);
    const ansN = resN / g, ansD = resD / g;
    if (ansD === 1 || ansN > 20 || ansD > 20) continue;
    return {
      text: `${n1}/${d1} ÷ ${n2}/${d2}`,
      latex: `\\dfrac{${n1}}{${d1}} \\div \\dfrac{${n2}}{${d2}}`,
      answer: { n: ansN, d: ansD },
    };
  }
  return null;
}

function generateQuestion() {
  // Levels 1-3: multiplication only
  // Levels 4+: multiplication + division
  const generators = level <= 3 ? [genMul] : [genMul, genDiv];

  for (let attempt = 0; attempt < 20; attempt++) {
    const q = pick(generators)(level);
    if (q) return q;
  }
  return { text: '1/2 × 2/3', latex: '\\dfrac{1}{2} \\times \\dfrac{2}{3}', answer: { n: 1, d: 3 } };
}

generateQuestion.getLevel = () => level;
generateQuestion.bumpUp = () => { level++; };
generateQuestion.bumpDown = () => { level = Math.max(1, level - 1); };

export default { generateQuestion, uiType: "numpad" };
