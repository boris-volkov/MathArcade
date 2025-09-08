let level = 1;

function ri(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function lit() { return { kind: 'lit', v: Math.random() < 0.5 ? 0 : 1 }; }
function not(node) { return { kind: 'not', node }; }
function op(sym, left, right) { return { kind: 'op', sym, left, right }; }

function targetLeavesFromLevel(lv) {
  // 3–4 leaves at early levels; up to 5 later
  if (lv <= 2) return 3;
  if (lv <= 4) return Math.random() < 0.7 ? 3 : 4;
  return Math.random() < 0.6 ? 4 : 5;
}

function buildTree(leavesTarget, allowNotProb) {
  // Start with a list of leaves and iteratively combine
  let nodes = Array.from({ length: leavesTarget }, () => lit());
  while (nodes.length > 1) {
    // pick two adjacent nodes to combine
    const i = ri(0, nodes.length - 2);
    const a = nodes[i];
    const b = nodes[i + 1];
    const sym = Math.random() < 0.5 ? '&&' : '||';
    let combined = op(sym, a, b);
    // occasionally apply NOT to a subexpression (gated by level)
    if (Math.random() < allowNotProb) {
      const which = Math.random();
      if (which < 0.33) combined = not(combined);
      else if (which < 0.66) combined.left = not(combined.left);
      else combined.right = not(combined.right);
    }
    nodes.splice(i, 2, combined);
  }
  return nodes[0];
}

function evalTree(node) {
  switch (node.kind) {
    case 'lit': return node.v;
    case 'not': return evalTree(node.node) ? 0 : 1;
    case 'op': {
      const a = evalTree(node.left);
      const b = evalTree(node.right);
      if (node.sym === '&&') return (a && b) ? 1 : 0;
      return (a || b) ? 1 : 0; // '||'
    }
    default: return 0;
  }
}

function toAscii(node, parentOp = null) {
  if (node.kind === 'lit') return String(node.v);
  if (node.kind === 'not') return `!(${toAscii(node.node)})`;
  const prec = { '||': 1, '&&': 2 };
  const L = toAscii(node.left, node.sym);
  const R = toAscii(node.right, node.sym);
  const lp = (node.left.kind === 'op' && prec[node.left.sym] < prec[node.sym]) ? `(${L})` : L;
  const rp = (node.right.kind === 'op' && prec[node.right.sym] <= prec[node.sym]) ? `(${R})` : R;
  const body = `${lp} ${node.sym} ${rp}`;
  if (!parentOp) return body;
  return prec[parentOp] > prec[node.sym] ? `(${body})` : body;
}

function toLatex(node, parentOp = null) {
  if (node.kind === 'lit') return String(node.v);
  if (node.kind === 'not') return `\\lnot\\left(${toLatex(node.node)}\\right)`;
  const prec = { '||': 1, '&&': 2 };
  const symLx = node.sym === '&&' ? '\\land' : '\\lor';
  const Ls = toLatex(node.left, node.sym);
  const Rs = toLatex(node.right, node.sym);
  const lNeeds = node.left.kind === 'op' && prec[node.left.sym] < prec[node.sym];
  const rNeeds = node.right.kind === 'op' && prec[node.right.sym] <= prec[node.sym];
  const Lp = lNeeds ? `\\left(${Ls}\\right)` : Ls;
  const Rp = rNeeds ? `\\left(${Rs}\\right)` : Rs;
  const body = `${Lp}\\;${symLx}\\;${Rp}`;
  if (!parentOp) return body;
  return prec[parentOp] > prec[node.sym] ? `\\left(${body}\\right)` : body;
}

function generateQuestion() {
  const leaves = targetLeavesFromLevel(level);
  const allowNotProb = Math.min(0.15 + 0.05 * level, 0.5);
  let expr = buildTree(leaves, allowNotProb);

  // Ensure non-trivial mix (avoid all-lits trivial short forms)
  let guard = 0;
  while (guard < 5) {
    const txt = toAscii(expr);
    if (/[&|!]/.test(txt)) break;
    expr = buildTree(leaves, allowNotProb);
    guard++;
  }

  const val = evalTree(expr);
  const ascii = toAscii(expr);
  const latex = toLatex(expr);
  console.log(`[Logic] L${level} :: ${ascii} = ${val}`);
  return { text: ascii, latex, answer: val };
}

generateQuestion.getLevel = () => level;
generateQuestion.bumpUp   = () => { level++; console.log('[Logic Level]', level); };
generateQuestion.bumpDown = () => { level = Math.max(1, level - 1); console.log('[Logic Level]', level); };

export default { generateQuestion };

