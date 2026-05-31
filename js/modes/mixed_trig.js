// js/modes/mixed_trig.js
// Mixed trig speed-test practice: five question types in random rotation.
//   1. sin/cos/tan of angle in DEGREES
//   2. sin/cos/tan of angle in RADIANS
//   3. Radians → Degrees conversion
//   4. Degrees → Radians conversion
//   5. Inverse trig (arcsin / arccos / arctan)
// Every question is 6-choice multiple choice. No leveling — uniform difficulty.

import { ri } from "../utils.js";

// ---------- data tables ----------

// 16 standard angles, 0–360° (including 0° / 2π)
const ANGLES = [
  { deg:   0, rad: "0",                  sin: "0",                     cos: "1",                     tan: "0"                    },
  { deg:  30, rad: "\\frac{\\pi}{6}",    sin: "\\frac{1}{2}",          cos: "\\frac{\\sqrt{3}}{2}",  tan: "\\frac{\\sqrt{3}}{3}" },
  { deg:  45, rad: "\\frac{\\pi}{4}",    sin: "\\frac{\\sqrt{2}}{2}",  cos: "\\frac{\\sqrt{2}}{2}",  tan: "1"                    },
  { deg:  60, rad: "\\frac{\\pi}{3}",    sin: "\\frac{\\sqrt{3}}{2}",  cos: "\\frac{1}{2}",          tan: "\\sqrt{3}"            },
  { deg:  90, rad: "\\frac{\\pi}{2}",    sin: "1",                     cos: "0",                     tan: "undef"                },
  { deg: 120, rad: "\\frac{2\\pi}{3}",   sin: "\\frac{\\sqrt{3}}{2}",  cos: "-\\frac{1}{2}",         tan: "-\\sqrt{3}"           },
  { deg: 135, rad: "\\frac{3\\pi}{4}",   sin: "\\frac{\\sqrt{2}}{2}",  cos: "-\\frac{\\sqrt{2}}{2}", tan: "-1"                   },
  { deg: 150, rad: "\\frac{5\\pi}{6}",   sin: "\\frac{1}{2}",          cos: "-\\frac{\\sqrt{3}}{2}", tan: "-\\frac{\\sqrt{3}}{3}"},
  { deg: 180, rad: "\\pi",               sin: "0",                     cos: "-1",                    tan: "0"                    },
  { deg: 210, rad: "\\frac{7\\pi}{6}",   sin: "-\\frac{1}{2}",         cos: "-\\frac{\\sqrt{3}}{2}", tan: "\\frac{\\sqrt{3}}{3}" },
  { deg: 225, rad: "\\frac{5\\pi}{4}",   sin: "-\\frac{\\sqrt{2}}{2}", cos: "-\\frac{\\sqrt{2}}{2}", tan: "1"                    },
  { deg: 240, rad: "\\frac{4\\pi}{3}",   sin: "-\\frac{\\sqrt{3}}{2}", cos: "-\\frac{1}{2}",         tan: "\\sqrt{3}"            },
  { deg: 270, rad: "\\frac{3\\pi}{2}",   sin: "-1",                    cos: "0",                     tan: "undef"                },
  { deg: 300, rad: "\\frac{5\\pi}{3}",   sin: "-\\frac{\\sqrt{3}}{2}", cos: "\\frac{1}{2}",          tan: "-\\sqrt{3}"           },
  { deg: 315, rad: "\\frac{7\\pi}{4}",   sin: "-\\frac{\\sqrt{2}}{2}", cos: "\\frac{\\sqrt{2}}{2}",  tan: "-1"                   },
  { deg: 330, rad: "\\frac{11\\pi}{6}",  sin: "-\\frac{1}{2}",         cos: "\\frac{\\sqrt{3}}{2}",  tan: "-\\frac{\\sqrt{3}}{3}"},
];

// All possible trig output values — used as distractor pool for types 1 & 2
const TRIG_VAL_POOL = [
  "0", "1", "-1",
  "\\frac{1}{2}", "-\\frac{1}{2}",
  "\\frac{\\sqrt{2}}{2}", "-\\frac{\\sqrt{2}}{2}",
  "\\frac{\\sqrt{3}}{2}", "-\\frac{\\sqrt{3}}{2}",
  "\\frac{\\sqrt{3}}{3}", "-\\frac{\\sqrt{3}}{3}",
  "\\sqrt{3}", "-\\sqrt{3}",
  "undef",
];

// Inverse trig entries — principal-value results only
// arcsin: [-π/2, π/2]   arccos: [0, π]   arctan: (-π/2, π/2)
const INV_ENTRIES = [
  // arcsin
  { fn: "\\sin^{-1}", input: "1",                     answer: "\\frac{\\pi}{2}"   },
  { fn: "\\sin^{-1}", input: "\\frac{\\sqrt{3}}{2}",  answer: "\\frac{\\pi}{3}"   },
  { fn: "\\sin^{-1}", input: "\\frac{\\sqrt{2}}{2}",  answer: "\\frac{\\pi}{4}"   },
  { fn: "\\sin^{-1}", input: "\\frac{1}{2}",          answer: "\\frac{\\pi}{6}"   },
  { fn: "\\sin^{-1}", input: "0",                     answer: "0"                 },
  { fn: "\\sin^{-1}", input: "-\\frac{1}{2}",         answer: "-\\frac{\\pi}{6}"  },
  { fn: "\\sin^{-1}", input: "-\\frac{\\sqrt{2}}{2}", answer: "-\\frac{\\pi}{4}"  },
  { fn: "\\sin^{-1}", input: "-\\frac{\\sqrt{3}}{2}", answer: "-\\frac{\\pi}{3}"  },
  { fn: "\\sin^{-1}", input: "-1",                    answer: "-\\frac{\\pi}{2}"  },
  // arccos
  { fn: "\\cos^{-1}", input: "1",                     answer: "0"                 },
  { fn: "\\cos^{-1}", input: "\\frac{\\sqrt{3}}{2}",  answer: "\\frac{\\pi}{6}"   },
  { fn: "\\cos^{-1}", input: "\\frac{\\sqrt{2}}{2}",  answer: "\\frac{\\pi}{4}"   },
  { fn: "\\cos^{-1}", input: "\\frac{1}{2}",          answer: "\\frac{\\pi}{3}"   },
  { fn: "\\cos^{-1}", input: "0",                     answer: "\\frac{\\pi}{2}"   },
  { fn: "\\cos^{-1}", input: "-\\frac{1}{2}",         answer: "\\frac{2\\pi}{3}"  },
  { fn: "\\cos^{-1}", input: "-\\frac{\\sqrt{2}}{2}", answer: "\\frac{3\\pi}{4}"  },
  { fn: "\\cos^{-1}", input: "-\\frac{\\sqrt{3}}{2}", answer: "\\frac{5\\pi}{6}"  },
  { fn: "\\cos^{-1}", input: "-1",                    answer: "\\pi"              },
  // arctan
  { fn: "\\tan^{-1}", input: "\\sqrt{3}",             answer: "\\frac{\\pi}{3}"   },
  { fn: "\\tan^{-1}", input: "1",                     answer: "\\frac{\\pi}{4}"   },
  { fn: "\\tan^{-1}", input: "\\frac{\\sqrt{3}}{3}",  answer: "\\frac{\\pi}{6}"   },
  { fn: "\\tan^{-1}", input: "0",                     answer: "0"                 },
  { fn: "\\tan^{-1}", input: "-\\frac{\\sqrt{3}}{3}", answer: "-\\frac{\\pi}{6}"  },
  { fn: "\\tan^{-1}", input: "-1",                    answer: "-\\frac{\\pi}{4}"  },
  { fn: "\\tan^{-1}", input: "-\\sqrt{3}",            answer: "-\\frac{\\pi}{3}"  },
];

// Radian angle choices used as distractor pool for inverse trig (type 5)
const RAD_ANGLE_POOL = [
  "-\\frac{\\pi}{2}", "-\\frac{\\pi}{3}", "-\\frac{\\pi}{4}", "-\\frac{\\pi}{6}",
  "0",
  "\\frac{\\pi}{6}", "\\frac{\\pi}{4}", "\\frac{\\pi}{3}", "\\frac{\\pi}{2}",
  "\\frac{2\\pi}{3}", "\\frac{3\\pi}{4}", "\\frac{5\\pi}{6}", "\\pi",
];

// ---------- helpers ----------

// Fisher-Yates in-place shuffle
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = ri(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Return {choicesLatex, correctIndex} with exactly 6 choices from pool
function pick6(correct, pool) {
  const others = pool.filter(v => v !== correct);
  shuffle(others);
  const choices = [correct, ...others.slice(0, 5)];
  shuffle(choices);
  return { choicesLatex: choices, correctIndex: choices.indexOf(correct) };
}

function pickAngle() { return ANGLES[ri(0, ANGLES.length - 1)]; }
function pickFn()    { return ["sin", "cos", "tan"][ri(0, 2)]; }

// ---------- question generators ----------

// Type 1: sin/cos/tan of an angle shown in DEGREES
function makeTrigDeg() {
  const a = pickAngle(), fn = pickFn();
  return {
    questionLatex: `\\${fn}(${a.deg}^{\\circ})`,
    ...pick6(a[fn], TRIG_VAL_POOL),
  };
}

// Type 2: sin/cos/tan of an angle shown in RADIANS
function makeTrigRad() {
  const a = pickAngle(), fn = pickFn();
  return {
    questionLatex: `\\${fn}\\left(${a.rad}\\right)`,
    ...pick6(a[fn], TRIG_VAL_POOL),
  };
}

// Type 3: Radians → Degrees
function makeRadToDeg() {
  const a = pickAngle();
  const correct = `${a.deg}^{\\circ}`;
  const pool = ANGLES.map(x => `${x.deg}^{\\circ}`);
  return {
    questionLatex: `${a.rad} = \\mathord{?}^{\\circ}`,
    ...pick6(correct, pool),
  };
}

// Type 4: Degrees → Radians
function makeDegToRad() {
  const a = pickAngle();
  const pool = ANGLES.map(x => x.rad);
  return {
    questionLatex: `${a.deg}^{\\circ} = \\;?`,
    ...pick6(a.rad, pool),
  };
}

// Type 5: Inverse trig (principal value, answer in radians)
function makeInvTrig() {
  const e = INV_ENTRIES[ri(0, INV_ENTRIES.length - 1)];
  return {
    questionLatex: `${e.fn}\\!\\left(${e.input}\\right)`,
    ...pick6(e.answer, RAD_ANGLE_POOL),
  };
}

// ---------- main ----------

const TYPES = [makeTrigDeg, makeTrigRad, makeRadToDeg, makeDegToRad, makeInvTrig];

function generateQuestion() {
  return TYPES[ri(0, TYPES.length - 1)]();
}

export default { generateQuestion, dynamicChoices: true, uiType: "choice" };
