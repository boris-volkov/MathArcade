// Choice-based mode with dynamic 6 choices per question (positive angles only).
// Used with choiceDynamicShell.js via dynamicChoices flag.

const CHOICES = [
  "0",
  "\\frac{\\pi}{6}",
  "\\frac{\\pi}{4}",
  "\\frac{\\pi}{3}",
  "\\frac{\\pi}{2}",
  "\\frac{2\\pi}{3}",
  "\\frac{3\\pi}{4}",
  "\\frac{5\\pi}{6}",
  "\\pi",
  "\\frac{7\\pi}{6}",
  "\\frac{5\\pi}{4}",
  "\\frac{4\\pi}{3}",
  "\\frac{3\\pi}{2}",
  "\\frac{5\\pi}{3}",
  "\\frac{7\\pi}{4}",
  "\\frac{11\\pi}{6}",
  "2\\pi",
];

const DEG_TO_RAD = new Map([
  [0, "0"],
  [30, "\\frac{\\pi}{6}"],
  [45, "\\frac{\\pi}{4}"],
  [60, "\\frac{\\pi}{3}"],
  [90, "\\frac{\\pi}{2}"],
  [120, "\\frac{2\\pi}{3}"],
  [135, "\\frac{3\\pi}{4}"],
  [150, "\\frac{5\\pi}{6}"],
  [180, "\\pi"],
  [210, "\\frac{7\\pi}{6}"],
  [225, "\\frac{5\\pi}{4}"],
  [240, "\\frac{4\\pi}{3}"],
  [270, "\\frac{3\\pi}{2}"],
  [300, "\\frac{5\\pi}{3}"],
  [315, "\\frac{7\\pi}{4}"],
  [330, "\\frac{11\\pi}{6}"],
  [360, "2\\pi"],
]);

let level = 1;

function pickDegreePositive() {
  const DEGS = Array.from(DEG_TO_RAD.keys());
  // filter to positive/zero only
  const POS = DEGS.filter(d => d >= 0);
  return POS[Math.floor(Math.random() * POS.length)];
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateQuestion() {
  const deg = pickDegreePositive();
  const correct = DEG_TO_RAD.get(deg) || "0";

  // Build a dynamic set of 6 choices including the correct one
  const pool = CHOICES.filter(x => x !== correct);
  // choose 5 random distractors
  const distractors = shuffle(pool.slice()).slice(0, 5);
  const choicesLatex = shuffle([correct, ...distractors]);
  const correctIndex = choicesLatex.indexOf(correct);

  const questionLatex = `${deg}^{\\circ}`;
  return { questionLatex, choicesLatex, correctIndex };
}

generateQuestion.getLevel = () => level;
generateQuestion.bumpUp   = () => { level++; console.log("[Deg→Rad Level]", level); };
generateQuestion.bumpDown = () => { level = Math.max(1, level - 1); console.log("[Deg→Rad Level]", level); };

export default {
  dynamicChoices: true,
  generateQuestion,
};
