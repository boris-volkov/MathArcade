let level = 1;
function maxFromLevel(lv) {
  return lv*5;
}
function generateQuestion() {
  const max = maxFromLevel(level);
  const a = Math.floor(Math.random() * max) + 1;
  const b = Math.floor(Math.random() * max) + 1;
  console.log(`[Add] L${level} → max=${max} :: ${a}+${b}`);
  return { text: `${a} + ${b}`, answer: a + b };
}
generateQuestion.getLevel = () => level;
generateQuestion.bumpUp   = () => { level++; console.log("[Level] →", level); };
generateQuestion.bumpDown = () => { level = Math.max(1, level - 1); console.log("[Level] →", level); };
export default { generateQuestion, targetMs: 5000, uiType: "numpad" };
