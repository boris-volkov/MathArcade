let level = 1;

function maxGrowing(lv) { return Math.min(7 + (lv - 1) * 4, 199); } // grows quicker, higher cap
function maxStable()    { return 12; }                               // classic times-table range

function generateQuestion() {
  const a = Math.floor(Math.random() * maxStable())  + 1;   // 1…12
  const b = Math.floor(Math.random() * maxGrowing(level)) + 1; // grows with level
  // optional swap so the “big” number isn’t always second
  const swap = Math.random() < 0.5;
  const x = swap ? b : a;
  const y = swap ? a : b;

  console.log(`[Mult] L${level} → big≤${maxGrowing(level)} :: ${x}×${y}`);
  return { text: `${x} × ${y}`, answer: x * y };
}

generateQuestion.getLevel = () => level;
generateQuestion.bumpUp   = () => { level++; console.log("[Level] →", level); };
generateQuestion.bumpDown = () => { level = Math.max(1, level - 1); console.log("[Level] →", level); };

export default { generateQuestion };


//Why this shape? Your numpad shell currently receives just { generateQuestion } 
// (it destructures the object) and doesn’t keep a reference to the whole mode object. 
// By hanging getLevel() on the function, the shell can still call it without any refactor.