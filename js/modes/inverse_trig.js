// Inverse trigonometric functions drill, mirroring unitcircle.js

// canonical angle choices (positive only; negative handled via toggle)
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
];

// Mapping of values to principal angles for each inverse function
const DATA = {
  arcsin: [
    { value: "0", angle: "0" },
    { value: "\\frac{1}{2}", angle: "\\frac{\\pi}{6}" },
    { value: "\\frac{\\sqrt{2}}{2}", angle: "\\frac{\\pi}{4}" },
    { value: "\\frac{\\sqrt{3}}{2}", angle: "\\frac{\\pi}{3}" },
    { value: "1", angle: "\\frac{\\pi}{2}" },
    { value: "-\\frac{1}{2}", angle: "-\\frac{\\pi}{6}" },
    { value: "-\\frac{\\sqrt{2}}{2}", angle: "-\\frac{\\pi}{4}" },
    { value: "-\\frac{\\sqrt{3}}{2}", angle: "-\\frac{\\pi}{3}" },
    { value: "-1", angle: "-\\frac{\\pi}{2}" },
  ],
  arccos: [
    { value: "1", angle: "0" },
    { value: "\\frac{\\sqrt{3}}{2}", angle: "\\frac{\\pi}{6}" },
    { value: "\\frac{\\sqrt{2}}{2}", angle: "\\frac{\\pi}{4}" },
    { value: "\\frac{1}{2}", angle: "\\frac{\\pi}{3}" },
    { value: "0", angle: "\\frac{\\pi}{2}" },
    { value: "-\\frac{1}{2}", angle: "\\frac{2\\pi}{3}" },
    { value: "-\\frac{\\sqrt{2}}{2}", angle: "\\frac{3\\pi}{4}" },
    { value: "-\\frac{\\sqrt{3}}{2}", angle: "\\frac{5\\pi}{6}" },
    { value: "-1", angle: "\\pi" },
  ],
  arctan: [
    { value: "0", angle: "0" },
    { value: "\\frac{\\sqrt{3}}{3}", angle: "\\frac{\\pi}{6}" },
    { value: "1", angle: "\\frac{\\pi}{4}" },
    { value: "\\sqrt{3}", angle: "\\frac{\\pi}{3}" },
    { value: "-\\frac{\\sqrt{3}}{3}", angle: "-\\frac{\\pi}{6}" },
    { value: "-1", angle: "-\\frac{\\pi}{4}" },
    { value: "-\\sqrt{3}", angle: "-\\frac{\\pi}{3}" },
  ],
  arcsec: [
    { value: "1", angle: "0" },
    { value: "\\frac{2\\sqrt{3}}{3}", angle: "\\frac{\\pi}{6}" },
    { value: "\\sqrt{2}", angle: "\\frac{\\pi}{4}" },
    { value: "2", angle: "\\frac{\\pi}{3}" },
    { value: "-2", angle: "\\frac{2\\pi}{3}" },
    { value: "-\\sqrt{2}", angle: "\\frac{3\\pi}{4}" },
    { value: "-\\frac{2\\sqrt{3}}{3}", angle: "\\frac{5\\pi}{6}" },
    { value: "-1", angle: "\\pi" },
  ],
  arccsc: [
    { value: "2", angle: "\\frac{\\pi}{6}" },
    { value: "\\sqrt{2}", angle: "\\frac{\\pi}{4}" },
    { value: "\\frac{2\\sqrt{3}}{3}", angle: "\\frac{\\pi}{3}" },
    { value: "1", angle: "\\frac{\\pi}{2}" },
    { value: "-2", angle: "-\\frac{\\pi}{6}" },
    { value: "-\\sqrt{2}", angle: "-\\frac{\\pi}{4}" },
    { value: "-\\frac{2\\sqrt{3}}{3}", angle: "-\\frac{\\pi}{3}" },
    { value: "-1", angle: "-\\frac{\\pi}{2}" },
  ],
  arccot: [
    { value: "\\sqrt{3}", angle: "\\frac{\\pi}{6}" },
    { value: "1", angle: "\\frac{\\pi}{4}" },
    { value: "\\frac{\\sqrt{3}}{3}", angle: "\\frac{\\pi}{3}" },
    { value: "0", angle: "\\frac{\\pi}{2}" },
    { value: "-\\frac{\\sqrt{3}}{3}", angle: "\\frac{2\\pi}{3}" },
    { value: "-1", angle: "\\frac{3\\pi}{4}" },
    { value: "-\\sqrt{3}", angle: "\\frac{5\\pi}{6}" },
  ],
};

const FNS_ALL = ["arcsin","arccos","arctan","arcsec","arccsc","arccot"];
const FNS_BASIC = FNS_ALL.slice(0, 3);

let useAllFns = false;

const FN_LATEX = {
  arcsin: "\\arcsin",
  arccos: "\\arccos",
  arctan: "\\arctan",
  arcsec: "\\arcsec",
  arccsc: "\\arccsc",
  arccot: "\\arccot",
};

function generateQuestion() {
  const fnSet = useAllFns ? FNS_ALL : FNS_BASIC;
  const fn = fnSet[Math.floor(Math.random() * fnSet.length)];
  const qa = DATA[fn][Math.floor(Math.random() * DATA[fn].length)];
  return {
    questionLatex: `${FN_LATEX[fn]}\\left(${qa.value}\\right)`,
    answerLatex: qa.angle,
  };
}

generateQuestion.setUseAllFns = flag => {
  useAllFns = !!flag;
  console.log(`[Inverse Trig] useAllFns=${useAllFns}`);
};

export default {
  choices: CHOICES,
  enableNegToggle: true,
  generateQuestion,
  isCorrect(user, correct) { return user === correct; },
};
