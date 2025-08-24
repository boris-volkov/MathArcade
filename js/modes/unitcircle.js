// Canonical positive choices (same set you used)
const CHOICES = [
  "0",
  "1",
  "\\frac{1}{2}",
  "\\frac{\\sqrt{2}}{2}",
  "\\frac{\\sqrt{3}}{2}",
  "\\frac{\\sqrt{3}}{3}",
  "\\sqrt{2}",
  "\\sqrt{3}",
  "2",
  "\\frac{2\\sqrt{3}}{3}",
  "undef",
];

// Angles + values (LaTeX strings)
const ANGLES = [
  { rad:"0",               sin:"0",  cos:"1",  tan:"0",  sec:"1",  csc:"undef", cot:"undef" },
  { rad:"\\frac{\\pi}{6}", sin:"\\frac{1}{2}", cos:"\\frac{\\sqrt{3}}{2}", tan:"\\frac{\\sqrt{3}}{3}", sec:"\\frac{2\\sqrt{3}}{3}", csc:"2", cot:"\\sqrt{3}" },
  { rad:"\\frac{\\pi}{4}", sin:"\\frac{\\sqrt{2}}{2}", cos:"\\frac{\\sqrt{2}}{2}", tan:"1", sec:"\\sqrt{2}", csc:"\\sqrt{2}", cot:"1" },
  { rad:"\\frac{\\pi}{3}", sin:"\\frac{\\sqrt{3}}{2}", cos:"\\frac{1}{2}", tan:"\\sqrt{3}", sec:"2", csc:"\\frac{2\\sqrt{3}}{3}", cot:"\\frac{\\sqrt{3}}{3}" },
  { rad:"\\frac{\\pi}{2}", sin:"1",  cos:"0",  tan:"undef", sec:"undef", csc:"1", cot:"0" },
  { rad:"\\frac{2\\pi}{3}", sin:"\\frac{\\sqrt{3}}{2}", cos:"-\\frac{1}{2}", tan:"-\\sqrt{3}", sec:"-2", csc:"\\frac{2\\sqrt{3}}{3}", cot:"-\\frac{\\sqrt{3}}{3}" },
  { rad:"\\frac{3\\pi}{4}", sin:"\\frac{\\sqrt{2}}{2}", cos:"-\\frac{\\sqrt{2}}{2}", tan:"-1", sec:"-\\sqrt{2}", csc:"\\sqrt{2}", cot:"-1" },
  { rad:"\\frac{5\\pi}{6}", sin:"\\frac{1}{2}", cos:"-\\frac{\\sqrt{3}}{2}", tan:"-\\frac{\\sqrt{3}}{3}", sec:"-\\frac{2\\sqrt{3}}{3}", csc:"2", cot:"-\\sqrt{3}" },
  { rad:"\\pi",            sin:"0",  cos:"-1", tan:"0",  sec:"-1", csc:"undef", cot:"undef" },
  { rad:"\\frac{7\\pi}{6}", sin:"-\\frac{1}{2}", cos:"-\\frac{\\sqrt{3}}{2}", tan:"\\frac{\\sqrt{3}}{3}", sec:"-\\frac{2\\sqrt{3}}{3}", csc:"-2", cot:"\\sqrt{3}" },
  { rad:"\\frac{5\\pi}{4}", sin:"-\\frac{\\sqrt{2}}{2}", cos:"-\\frac{\\sqrt{2}}{2}", tan:"1", sec:"-\\sqrt{2}", csc:"-\\sqrt{2}", cot:"1" },
  { rad:"\\frac{4\\pi}{3}", sin:"-\\frac{\\sqrt{3}}{2}", cos:"-\\frac{1}{2}", tan:"\\sqrt{3}", sec:"-2", csc:"-\\frac{2\\sqrt{3}}{3}", cot:"\\frac{\\sqrt{3}}{3}" },
  { rad:"\\frac{3\\pi}{2}", sin:"-1", cos:"0", tan:"undef", sec:"undef", csc:"-1", cot:"0" },
  { rad:"\\frac{5\\pi}{3}", sin:"-\\frac{\\sqrt{3}}{2}", cos:"\\frac{1}{2}", tan:"-\\sqrt{3}", sec:"2", csc:"-\\frac{2\\sqrt{3}}{3}", cot:"-\\frac{\\sqrt{3}}{3}" },
  { rad:"\\frac{7\\pi}{4}", sin:"-\\frac{\\sqrt{2}}{2}", cos:"\\frac{\\sqrt{2}}{2}", tan:"-1", sec:"\\sqrt{2}", csc:"-\\sqrt{2}", cot:"-1" },
  { rad:"\\frac{11\\pi}{6}", sin:"-\\frac{1}{2}", cos:"\\frac{\\sqrt{3}}{2}", tan:"-\\frac{\\sqrt{3}}{3}", sec:"\\frac{2\\sqrt{3}}{3}", csc:"-2", cot:"-\\sqrt{3}" },
];

const FNS = ["sin","cos","tan","sec","csc","cot"];

export default {
  title: "Trig Unit Circle",
  choices: CHOICES,
  enableNegToggle: true,
  // generate one random question
  generateQuestion() {
    const angle = ANGLES[Math.floor(Math.random() * ANGLES.length)];
    const fn = FNS[Math.floor(Math.random() * FNS.length)];
    return {
      questionLatex: `${fn}\\left(${angle.rad}\\right)`,
      answerLatex: angle[fn],
    };
  },
  // strict equality of LaTeX strings is fine here
  isCorrect(user, correct) { return user === correct; },
};
