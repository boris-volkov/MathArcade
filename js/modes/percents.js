let level = 1;

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function ri(min, max) { // inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[ri(0, arr.length - 1)];
}

function percentMaxFromLevel(lv) {
  // Start with common percentages, then widen into harder territory.
  return Math.min(30 + (Math.max(1, lv) - 1) * 5, 200);
}

function maxWholeFromLevel(lv) {
  // Controls the scale of "of c" to keep answers readable on numpad.
  if (lv <= 2) return 100;
  if (lv <= 4) return 200;
  return Math.min(200 + (Math.max(1, lv) - 4) * 75, 2000);
}

function percentFromLevel(lv) {
  if (lv <= 2) return pick([10, 20, 25, 50]);
  if (lv <= 4) return pick([5, 10, 20, 25, 50]);
  if (lv <= 6) return pick([5, 10, 15, 20, 25, 50, 75]);
  if (lv <= 8) return pick([2, 4, 5, 10, 12, 15, 20, 25, 40, 50, 75]);
  return ri(1, percentMaxFromLevel(lv));
}

function pickUnknown(lv) {
  // Ease in: start by solving for part (a), then introduce ?%,
  // then all three unknown positions.
  if (lv <= 2) return 0;      // ? is b% of c
  if (lv <= 4) return ri(0, 1); // unknown a or b
  return ri(0, 2);            // unknown a, b, or c
}

function buildTriple(lv) {
  const b = percentFromLevel(lv);
  const maxWhole = maxWholeFromLevel(lv);

  // Pick c so that a = (b/100) * c is always an integer.
  const step = 100 / gcd(100, b);
  const kMax = Math.max(1, Math.floor(maxWhole / step));
  const k = ri(1, kMax);
  const c = step * k;
  const a = (b * c) / 100;

  return { a, b, c };
}

function generateQuestion() {
  const { a, b, c } = buildTriple(level);
  const unknown = pickUnknown(level); // 0=a, 1=b, 2=c

  let text = "";
  let answer = 0;
  if (unknown === 0) {
    text = `? is ${b}% of ${c}`;
    answer = a;
  } else if (unknown === 1) {
    text = `${a} is ?% of ${c}`;
    answer = b;
  } else {
    text = `${a} is ${b}% of ?`;
    answer = c;
  }

  console.log(`[Percents] L${level} :: ${text} = ${answer} (a=${a}, b=${b}, c=${c})`);
  return { text, answer };
}

generateQuestion.getLevel = () => level;
generateQuestion.bumpUp = () => { level++; console.log("[Percents Level] +", level); };
generateQuestion.bumpDown = () => { level = Math.max(1, level - 1); console.log("[Percents Level] -", level); };

export default { generateQuestion, targetMs: 6000, uiType: "numpad" };
