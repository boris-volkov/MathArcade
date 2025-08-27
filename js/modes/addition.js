let level = 1;
function maxFromLevel(lv) {
  return [10, 10, 15, 20, 50, 100, 200, 500][lv - 1] ?? 1000;
}
function generateQuestion() {
  const max = maxFromLevel(level);
  const a = Math.floor(Math.random() * max) + 1;
  const b = Math.floor(Math.random() * max) + 1;
  console.log(`[Add] L${level} → max=${max} :: ${a}+${b}`);
  return { text: `${a} + ${b} = `, answer: a + b };
}
generateQuestion.getLevel = () => level;
generateQuestion.bumpUp   = () => { level++; console.log("[Level] →", level); };
generateQuestion.bumpDown = () => { level = Math.max(1, level - 1); console.log("[Level] →", level); };
export default { generateQuestion };
