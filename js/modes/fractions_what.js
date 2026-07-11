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
  return Math.min(2 + lv, 10);
}

function generateQuestion() {
  for (let i = 0; i < 60; i++) {
    const d = pick(denomsForLevel(level));
    const n = ri(1, d - 1);
    if (gcd(n, d) !== 1) continue;

    // part/whole reduces to exactly n/d since gcd(nk, dk) = k
    const k = ri(2, kMaxForLevel(level));
    const whole = d * k;
    const part = n * k;

    return {
      text: `${part} is ?/? of ${whole}`,
      latex: `${part} = \\dfrac{?}{?} \\text{ of } ${whole}`,
      answer: { n, d },
    };
  }
  return { text: '4 is ?/? of 6', latex: '4 = \\dfrac{?}{?} \\text{ of } 6', answer: { n: 2, d: 3 } };
}

generateQuestion.getLevel = () => level;
generateQuestion.bumpUp = () => { level++; };
generateQuestion.bumpDown = () => { level = Math.max(1, level - 1); };

export default { generateQuestion, targetMs: 6000, uiType: "numpad" };
