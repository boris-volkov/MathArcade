
// logarithms_simple.js
// Simple integer-answer log quiz that fits a generic shell used by addition/multiplication.
// All answers are integers. We render the prompt in LaTeX; one of a,b,c is x.
// Form: log_b(a) = c  with b in [2..9], c in [0..6], a = b^c.
//
// Integration expectations (adjust to your shell if needed):
//   window.GAME_SPECS['logarithms'] = {
//     id, label, next():Question, check(q,input):boolean, render(el,q):void, inputMode:'integer'
//   }
// The shell should call spec.render(questionEl, q) instead of setting innerText, so KaTeX can render.
// If your shell sets the text directly, just replace that line with spec.render(...) for this mode.

(function(){
  function ensureKatex(){
    if (window.katex && window.renderMathInElement) return;
    // Inject KaTeX if not present
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
    document.head.appendChild(css);
    const s1 = document.createElement('script');
    s1.defer = true;
    s1.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
    document.head.appendChild(s1);
    const s2 = document.createElement('script');
    s2.defer = true;
    s2.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js';
    s2.onload = () => {
      const el = document.querySelector('[data-log-q]');
      if (el) renderMathInElement(el, {delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]});
    };
    document.head.appendChild(s2);
  }

  const randint = (a,b) => a + Math.floor(Math.random()*(b-a+1));

  function makeLogQuestion(){
    // Choose base and exponent so that 'a' is always an integer.
    const b = randint(2,9);
    const c = randint(0,6);  // allow c=0 so that a=1 case appears
    const a = Math.pow(b, c);

    // Choose which symbol to hide. To keep answers integer, all three are fine.
    const hideIdx = randint(0,2); // 0->a, 1->b, 2->c
    const hide = ['a','b','c'][hideIdx];

    // Build LaTeX
    const aT = hide==='a' ? 'x' : String(a);
    const bT = hide==='b' ? 'x' : String(b);
    const cT = hide==='c' ? 'x' : String(c);
    const latex = `$$\\log_{${bT}}(${aT}) = ${cT}$$`;

    // Integer answer
    const answer = hide==='a' ? a : hide==='b' ? b : c;

    return { kind:'log', a, b, c, hide, latex, answer };
  }

  function renderLogQuestion(el, q){
    ensureKatex();
    el.setAttribute('data-log-q','');
    el.innerHTML = q.latex;
    if (window.renderMathInElement){
      renderMathInElement(el, {delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]});
    }
  }

  function isLogCorrect(q, userInput){
    if (userInput==null) return false;
    const v = Number(String(userInput).trim());
    if (!Number.isFinite(v)) return false;
    return Math.trunc(v) === q.answer;
  }

  // Export spec for a common shell that uses .next/.check/.render
  window.GAME_SPECS = window.GAME_SPECS || {};
  window.GAME_SPECS['logarithms'] = {
    id: 'logarithms',
    label: 'Logarithms',
    inputMode: 'integer',  // lets your shell show an integer-only keypad if it has modes
    next: makeLogQuestion,
    check: isLogCorrect,
    render: renderLogQuestion
  };

  // Also export helpers in case your shell prefers free functions
  window.makeLogQuestion = makeLogQuestion;
  window.renderLogQuestion = renderLogQuestion;
  window.isLogCorrect = isLogCorrect;
})();
