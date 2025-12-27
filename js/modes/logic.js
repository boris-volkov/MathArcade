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
  if (node.kind === 'not') {
    const inner = toAscii(node.node, null);
    // Only parenthesize NOT operand if it's a binary op
    return node.node.kind === 'op' ? `!(${inner})` : `!${inner}`;
  }
  const prec = { '||': 1, '&&': 2 };
  const L = toAscii(node.left, node.sym);
  const R = toAscii(node.right, node.sym);
  const lNeeds = node.left.kind === 'op' && prec[node.left.sym] < prec[node.sym];
  // For associative ops, do not parenthesize equal precedence
  const rNeeds = node.right.kind === 'op' && prec[node.right.sym] < prec[node.sym];
  const lp = lNeeds ? `(${L})` : L;
  const rp = rNeeds ? `(${R})` : R;
  const body = `${lp} ${node.sym} ${rp}`;
  return body;
}

function toLatex(node, parentOp = null) {
  if (node.kind === 'lit') return String(node.v);
  if (node.kind === 'not') {
    const inner = toLatex(node.node, null);
    return node.node.kind === 'op' ? `\\lnot\\left(${inner}\\right)` : `\\lnot ${inner}`;
  }
  const prec = { '||': 1, '&&': 2 };
  const symLx = node.sym === '&&' ? '\\land' : '\\lor';
  const Ls = toLatex(node.left, node.sym);
  const Rs = toLatex(node.right, node.sym);
  const lNeeds = node.left.kind === 'op' && prec[node.left.sym] < prec[node.sym];
  const rNeeds = node.right.kind === 'op' && prec[node.right.sym] < prec[node.sym];
  const Lp = lNeeds ? `\\left(${Ls}\\right)` : Ls;
  const Rp = rNeeds ? `\\left(${Rs}\\right)` : Rs;
  const body = `${Lp}\\;${symLx}\\;${Rp}`;
  return body;
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

  function stripOuterParensAscii(s) {
    s = s.trim();
    while (s.startsWith('(') && s.endsWith(')')) {
      let depth = 0, ok = true;
      for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (ch === '(') depth++;
        else if (ch === ')') {
          depth--;
          if (depth === 0 && i !== s.length - 1) { ok = false; break; }
        }
      }
      if (ok) s = s.slice(1, -1).trim(); else break;
    }
    return s;
  }

  function stripOuterParensLatex(s) {
    s = s.trim();
    const L = '\\left('; const R = '\\right)';
    while (s.startsWith(L) && s.endsWith(R)) {
      const inner = s.slice(L.length, s.length - R.length);
      // Check matching of \left( .. \right) pairs inside
      let depth = 0, ok = true;
      for (let i = 0; i < inner.length; i++) {
        if (inner.startsWith('\\left(', i)) { depth++; i += 5; }
        else if (inner.startsWith('\\right)', i)) { depth--; i += 6; if (depth < 0) { ok = false; break; } }
      }
      if (ok && depth === 0) s = inner.trim(); else break;
    }
    return s;
  }

  function stripOuterPlainParens(s) {
    s = s.trim();
    while (s.startsWith('(') && s.endsWith(')')) {
      const inner = s.slice(1, -1);
      let depth = 0, ok = true;
      for (let i = 0; i < inner.length; i++) {
        const ch = inner[i];
        if (ch === '(') depth++;
        else if (ch === ')') { depth--; if (depth < 0) { ok = false; break; } }
      }
      if (ok && depth === 0) s = inner.trim(); else break;
    }
    return s;
  }

  const val = evalTree(expr);
  const ascii = stripOuterParensAscii(toAscii(expr));
  const latex = stripOuterPlainParens(stripOuterParensLatex(toLatex(expr)));
  console.log(`[Logic] L${level} :: ${ascii} = ${val}`);
  return { text: ascii, latex, answer: val };
}

generateQuestion.getLevel = () => level;
generateQuestion.bumpUp   = () => { level++; console.log('[Logic Level]', level); };
generateQuestion.bumpDown = () => { level = Math.max(1, level - 1); console.log('[Logic Level]', level); };

export default { generateQuestion, uiType: "numpad" };
