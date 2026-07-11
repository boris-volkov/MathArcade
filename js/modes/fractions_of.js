import { gcd, ri } from "../utils.js";

let level = 1;

function pick(arr) { return arr[ri(0, arr.length - 1)]; }

function denomsForLevel(lv) {
  if (lv <= 2) return [2, 3, 4];
  if (lv <= 4) return [2, 3, 4, 5, 6];
  if (lv <= 6) return [2, 3, 4, 5, 6, 8];
  return [2, 3, 4, 5, 6, 8, 10, 12];
}

function kMaxForLevel(lv) {
  return Math.min(4 + lv, 12);
}

function generateQuestion() {
  for (let i = 0; i < 60; i++) {
    const d = pick(denomsForLevel(level));
    // Unit fractions early; proper simplified fractions after
    const n = level <= 2 ? 1 : ri(1, d - 1);
    if (gcd(n, d) !== 1) continue;

    const k = ri(2, kMaxForLevel(level));
    const whole = d * k;
    const part = n * k;

    // From level 7, sometimes ask for the whole instead of the part
    const findWhole = level >= 7 && Math.random() < 0.35;
    if (findWhole) {
      return {
        text: `${n}/${d} of ? = ${part}`,
        latex: `\\dfrac{${n}}{${d}} \\text{ of } ? = ${part}`,
        answer: whole,
      };
    }
    return {
      text: `${n}/${d} of ${whole}`,
      latex: `\\dfrac{${n}}{${d}} \\text{ of } ${whole}`,
      answer: part,
    };
  }
  return { text: '1/2 of 10', latex: '\\dfrac{1}{2} \\text{ of } 10', answer: 5 };
}

generateQuestion.getLevel = () => level;
generateQuestion.bumpUp = () => { level++; };
generateQuestion.bumpDown = () => { level = Math.max(1, level - 1); };

export default { generateQuestion, targetMs: 6000, uiType: "numpad" };
