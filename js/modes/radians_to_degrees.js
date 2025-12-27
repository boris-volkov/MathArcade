let level = 1;

function ri(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; }

function denomFromLevel(lv) {
  // Use denominators that keep degrees integer: 1,2,3,4,6,12
  if (lv <= 2) return [2, 3, 4, 6];
  if (lv <= 4) return [1, 2, 3, 4, 6];
  return [1, 2, 3, 4, 6, 12];
}

function latexForRadian(num, den) {
  if (num === 0) return "0";
  const sign = num < 0 ? "-" : "";
  const n = Math.abs(num);
  if (den === 1) {
    if (n === 1) return `${sign}\\pi`;
    return `${sign}${n}\\pi`;
  }
  // Omit the coefficient 1 in the numerator: \frac{\pi}{den}
  if (n === 1) return `${sign}\\frac{\\pi}{${den}}`;
  return `${sign}\\frac{${n}\\pi}{${den}}`;
}

function generateQuestion() {
  const dens = denomFromLevel(level);
  let den = dens[ri(0, dens.length - 1)];
  // Choose a numerator range that yields readable angles; expand with level
  const mult = (level <= 3) ? 2 : (level <= 6 ? 3 : 4);
  const maxNum = den * mult; // allows going beyond 2π gradually
  let num = ri(0, maxNum);

  // introduce negatives later
  if (level >= 5 && Math.random() < 0.35) num = -num;

  // Simplify the rational multiple num/den
  if (num !== 0) {
    const g = gcd(num, den);
    num = num / g;
    den = den / g;
  }

  const deg = Math.trunc((180 * num) / den); // remains integer

  const radLx = latexForRadian(num, den);
  const latex = `${radLx}`; // show only the radian measure (no equals sign)

  // Plaintext fallback without '=' as requested
  const sign = num < 0 ? '-' : '';
  const nAbs = Math.abs(num);
  const text = (num === 0)
    ? '0'
    : (den === 1
        ? (nAbs === 1 ? `${sign}pi` : `${sign}${nAbs}pi`)
        : (nAbs === 1 ? `${sign}pi/${den}` : `${sign}${nAbs}pi/${den}`));

  return { latex, text, answer: deg };
}

generateQuestion.getLevel = () => level;
generateQuestion.bumpUp   = () => { level++; console.log("[Level]", level); };
generateQuestion.bumpDown = () => { level = Math.max(1, level - 1); console.log("[Level]", level); };

export default { generateQuestion, uiType: "numpad" };
