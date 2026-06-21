import { gcd, lcm, ri } from "../utils.js";

let level = 1;

function pick(arr) { return arr[ri(0, arr.length - 1)]; }

function denomsForLevel(lv) {
  if (lv <= 2) return [2, 3, 4, 5, 6];
  if (lv <= 4) return [2, 3, 4, 5, 6, 8];
  return [2, 3, 4, 5, 6, 8, 10, 12];
}

function genAdd(lv) {
  const denoms = denomsForLevel(lv);
  for (let i = 0; i < 60; i++) {
    const d1 = pick(denoms);
    const d2 = lv <= 1 ? d1 : pick(denoms);
    const n1 = ri(1, d1);
    const n2 = ri(1, d2);
    const L = lcm(d1, d2);
    if (L > 60) continue;
    const resN = n1 * (L / d1) + n2 * (L / d2);
    const g = gcd(resN, L);
    const ansN = resN / g, ansD = L / g;
    if (ansD === 1 || ansN > 30 || ansD > 30) continue;
    return {
      text: `${n1}/${d1} + ${n2}/${d2}`,
      latex: `\\dfrac{${n1}}{${d1}} + \\dfrac{${n2}}{${d2}}`,
      answer: { n: ansN, d: ansD },
    };
  }
  return null;
}

function genSub(lv) {
  const denoms = denomsForLevel(lv);
  for (let i = 0; i < 60; i++) {
    const d1 = pick(denoms);
    const d2 = pick(denoms);
    const n1 = ri(1, d1 * 2);
    const n2 = ri(1, d2);
    const L = lcm(d1, d2);
    if (L > 60) continue;
    const resN = n1 * (L / d1) - n2 * (L / d2);
    if (resN <= 0) continue;
    const g = gcd(resN, L);
    const ansN = resN / g, ansD = L / g;
    if (ansD === 1 || ansN > 30 || ansD > 30) continue;
    return {
      text: `${n1}/${d1} - ${n2}/${d2}`,
      latex: `\\dfrac{${n1}}{${d1}} - \\dfrac{${n2}}{${d2}}`,
      answer: { n: ansN, d: ansD },
    };
  }
  return null;
}

function generateQuestion() {
  // Levels 1-4: addition only (same denom early, different denom later)
  // Levels 5+: addition + subtraction
  const generators = level <= 4 ? [genAdd] : [genAdd, genSub];

  for (let attempt = 0; attempt < 20; attempt++) {
    const q = pick(generators)(level);
    if (q) return q;
  }
  return { text: '1/2 + 1/3', latex: '\\dfrac{1}{2} + \\dfrac{1}{3}', answer: { n: 5, d: 6 } };
}

generateQuestion.getLevel = () => level;
generateQuestion.bumpUp = () => { level++; };
generateQuestion.bumpDown = () => { level = Math.max(1, level - 1); };

export default { generateQuestion, uiType: "numpad" };
