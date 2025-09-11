let level = 1;

function maxNumber(lv) { return Math.min(4 + 2 * lv, 20); }
function maxDepth(lv)  { return Math.min(1 + Math.floor((lv - 1) / 2), 6); }
function mulBudgetFromLevel(lv) { return Math.min(1 + Math.floor((lv - 1) / 4), 3); } // cap at 3 multiplications

function ri(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function makeNumberNode() { return { kind: 'num', val: ri(1, maxNumber(level)) }; }
function makeOpNode(op, left, right) { return { kind: 'op', op, left, right }; }

function buildExpr(depth, mulBudget) {
  if (depth <= 0) return makeNumberNode();

  // Allowed operators; limit '*' by budget and keep its probability modest
  const canMul = mulBudget > 0;
  const pMul = canMul ? Math.min(0.10 + 0.05 * level, 0.40) : 0; // softer ramp
  const r = Math.random();
  const op = (r < pMul) ? '*' : (Math.random() < 0.5 ? '+' : '-');
  const nextBudget = op === '*' ? (mulBudget - 1) : mulBudget;

  // Randomize subtree depths to create 2, 3, or 4-term expressions (when depth≈2)
  let leftDepth  = ri(0, Math.max(0, depth - 1));
  let rightDepth = ri(0, Math.max(0, depth - 1));
  const chainBias = Math.min(0.10 + 0.05 * level, 0.55);
  if (Math.random() < chainBias && depth > 1) {
    if (Math.random() < 0.5) {
      leftDepth = depth - 1;
    } else {
      rightDepth = depth - 1;
    }
  }

  // Split remaining multiplication budget between branches to cap total '*'
  const split = nextBudget > 0 ? ri(0, nextBudget) : 0;
  const leftBudget = split;
  const rightBudget = nextBudget - split;

  let left  = buildExpr(leftDepth, leftBudget);
  let right = buildExpr(rightDepth, rightBudget);

  // Keep multiplication factors modest
  function clampNumNode(node, min, max) {
    if (node.kind === 'num') node.val = Math.min(Math.max(node.val, min), max);
  }
  if (op === '*') {
    const cap = Math.max(4, Math.floor(maxNumber(level) / 2));
    clampNumNode(left, 2, cap);
    clampNumNode(right, 2, cap);
  }

  return makeOpNode(op, left, right);
}

function evalExpr(node) {
  if (node.kind === 'num') return node.val;
  const a = evalExpr(node.left);
  const b = evalExpr(node.right);
  switch (node.op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    default:  return 0;
  }
}

// Precedence and clean rendering without redundant parentheses
const prec = { '+': 1, '-': 1, '*': 2 };

function render(node) {
  if (node.kind === 'num') return String(node.val);

  const Ls = render(node.left);
  const Rs = render(node.right);

  const lNeeds = node.left.kind === 'op' && prec[node.left.op] < prec[node.op];
  // For '-' right child also needs parens on equal precedence to preserve tree structure
  const rNeeds = node.right.kind === 'op' && (prec[node.right.op] < prec[node.op] || (node.op === '-' && prec[node.right.op] === prec[node.op]));

  const lTxt = lNeeds ? `(${Ls})` : Ls;
  const rTxtRaw = rNeeds ? `(${Rs})` : Rs;

  if (node.op === '*') {
    const omit = rTxtRaw.startsWith('(') && Math.random() < 0.4; // keep it readable
    const rTxt = omit ? rTxtRaw : `* ${rTxtRaw}`;
    return `${lTxt} ${rTxt}`.trim();
  }
  return `${lTxt} ${node.op} ${rTxtRaw}`;
}

function renderLatex(node) {
  if (node.kind === 'num') return String(node.val);

  const Ls = renderLatex(node.left);
  const Rs = renderLatex(node.right);

  const lNeeds = node.left.kind === 'op' && prec[node.left.op] < prec[node.op];
  const rNeeds = node.right.kind === 'op' && (prec[node.right.op] < prec[node.op] || (node.op === '-' && prec[node.right.op] === prec[node.op]));

  const Lp = lNeeds ? `\\left(${Ls}\\right)` : Ls;
  const Rp = rNeeds ? `\\left(${Rs}\\right)` : Rs;

  if (node.op === '*') {
    // Use an explicit multiplication dot in LaTeX for clarity
    return `${Lp}\\cdot ${Rp}`;
  }
  if (node.op === '+') return `${Lp} + ${Rp}`;
  if (node.op === '-') return `${Lp} - ${Rp}`;
  return `${Lp} ${node.op} ${Rp}`;
}

function countLeaves(node) {
  if (node.kind === 'num') return 1;
  return countLeaves(node.left) + countLeaves(node.right);
}

function generateQuestion() {
  // Scale terms with level: up to 6 terms at higher levels
  function desiredLeavesFromLevel(lv) {
    const r = Math.random();
    if (lv <= 2) {
      return r < 0.85 ? 3 : 4;
    } else if (lv <= 4) {
      if (r < 0.55) return 3;
      if (r < 0.90) return 4;
      return 5;
    } else if (lv <= 6) {
      if (r < 0.15) return 3;
      if (r < 0.65) return 4;
      if (r < 0.95) return 5;
      return 6;
    } else if (lv <= 8) {
      if (r < 0.10) return 4;
      if (r < 0.65) return 5;
      return 6;
    }
    return r < 0.25 ? 5 : 6;
  }
  const desiredLeaves = desiredLeavesFromLevel(level);

  let expr, val, text, latex;
  let guard = 0;
  const LIMIT = Math.min(499, 60 * level);
  const budget = mulBudgetFromLevel(level);
  // Ensure we can realize 3 leaves even on early levels
  const depth = Math.max(2, maxDepth(level));

  do {
    expr = buildExpr(depth, budget);
    val = evalExpr(expr);
    text = render(expr);
    latex = renderLatex(expr);
    guard++;
  } while (
    guard < 60 && (
      Math.abs(val) > LIMIT ||
      /(\(\s*\))/.test(text) ||
      text.length < 3 ||
      (desiredLeaves && countLeaves(expr) !== desiredLeaves)
    )
  );

  console.log(`[Expr] L${level} leaves=${countLeaves(expr)} depth=${depth} :: ${text} = ${val}`);
  return { text, latex, answer: val };
}

generateQuestion.getLevel = () => level;
generateQuestion.bumpUp   = () => { level++; console.log('[Level]', level); };
generateQuestion.bumpDown = () => { level = Math.max(1, level - 1); console.log('[Level]', level); };

export default { generateQuestion, timing: { baseMs: 8000 } };
