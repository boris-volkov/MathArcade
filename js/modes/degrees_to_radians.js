// Choice-based mode for converting degrees to radians.
// Uses choiceShell.js: export default { choices, generateQuestion, enableNegToggle }

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

function pickDegree() {
  const DEGS = Array.from(DEG_TO_RAD.keys());
  const base = DEGS[Math.floor(Math.random() * DEGS.length)];
  if (level <= 2) return base;
  // Occasionally show negative degrees; user toggles '-' on the answer
  if (Math.random() < Math.min(0.35, 0.1 * (level - 1))) return -base;
  return base;
}

function generateQuestion() {
  const deg = pickDegree();
  const absDeg = Math.abs(deg);
  const baseAns = DEG_TO_RAD.get(absDeg) || "0";

  const questionLatex = `${deg}^{\\circ}`;
  const answerLatex = baseAns; // choiceShell adds '-' if the negate toggle is active

  return { questionLatex, answerLatex };
}

generateQuestion.getLevel = () => level;
generateQuestion.bumpUp   = () => { level++; console.log("[Deg→Rad Level]", level); };
generateQuestion.bumpDown = () => { level = Math.max(1, level - 1); console.log("[Deg→Rad Level]", level); };

export default {
  choices: CHOICES,
  enableNegToggle: true,
  generateQuestion,
};

