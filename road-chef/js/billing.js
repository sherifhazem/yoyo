// Two-step billing: first multiply each line (qty × price), then add the line totals.
// As the child improves, both steps merge into a single "total" question.

const sum = (arr) => arr.reduce((a, b) => a + b, 0);

export const MODES = ['auto', 'guided', 'combined'];

export function billMode(S) {
  const pref = S.billPref || 'auto';
  if (pref !== 'auto') return pref;
  return (S.billStreak || 0) >= 3 ? 'combined' : 'guided';
}

export function recordBill(S, b, save) {
  S.billStreak = b.mistakes === 0 ? (S.billStreak || 0) + 1 : 0;
  save();
}

/** lines: [{ emoji, qty, price }] */
export function newBill(lines, mode) {
  const b = {
    lines: lines.map((l) => ({ ...l, value: l.qty === 1 ? l.price : null })),
    tries: 0,
    mistakes: 0,
    total: lines.reduce((s, l) => s + l.qty * l.price, 0),
  };
  const trivial = lines.length === 1 && lines[0].qty === 1;
  b.trivial = trivial;
  b.mode = trivial ? 'combined' : mode;
  if (b.mode === 'combined') b.step = 'all';
  else advance(b);
  return b;
}

function advance(b) {
  const i = b.lines.findIndex((l) => l.value === null);
  if (i >= 0) {
    b.step = 'mul';
    b.idx = i;
  } else {
    b.step = b.lines.length > 1 ? 'add' : 'done';
  }
}

/** Returns 'wrong' | 'next' (same bill, next question) | 'done'. */
export function billSubmit(b, val) {
  let expected;
  if (b.step === 'mul') expected = b.lines[b.idx].qty * b.lines[b.idx].price;
  else if (b.step === 'add') expected = sum(b.lines.map((l) => l.value));
  else expected = b.total;
  if (val !== expected) {
    b.tries += 1;
    b.mistakes += 1;
    return 'wrong';
  }
  b.tries = 0;
  if (b.step === 'mul') {
    b.lines[b.idx].value = expected;
    advance(b);
    return b.step === 'done' ? 'done' : 'next';
  }
  return 'done';
}

export function billBubble(b) {
  if (b.step === 'mul') {
    const l = b.lines[b.idx];
    return `Step 1: multiply!<br>${l.emoji} ${l.qty} × $${l.price} = ?`;
  }
  if (b.step === 'add') return 'Step 2: add them up! ➕';
  return 'What is the total?';
}

export function billHtml(b, fmt) {
  const help = b.tries >= 2;
  const rows = b.lines
    .map((l, i) => {
      const active = b.step === 'mul' && b.idx === i;
      let right;
      if (l.value !== null && b.step !== 'all') right = `<b class="got">${fmt(l.value)}</b>`;
      else if (b.step === 'all' && help) right = `<b class="hintv">${fmt(l.qty * l.price)}</b>`;
      else right = '<b class="ask">?</b>';
      return `<li class="brow ${active ? 'active' : ''} ${l.value !== null && b.step !== 'all' ? 'ok' : ''}"><span>${l.emoji} ${l.qty} × ${fmt(l.price)}</span><span>= ${right}</span></li>`;
    })
    .join('');
  let extra = '';
  if (b.step === 'mul' && help) {
    const l = b.lines[b.idx];
    extra = `<div class="bhint">${Array(l.qty).fill(l.price).join(' + ')} = ?</div>`;
  } else if (b.step === 'add') {
    const vals = b.lines.map((l) => l.value);
    extra = `<div class="sumline">${vals.map(fmt).join(' + ')} = ?</div>`;
    if (help) {
      let run = vals[0];
      const steps = vals.slice(1).map((v) => { const s = `${run} + ${v} = ${run + v}`; run += v; return s; });
      extra += `<div class="bhint">${steps.join(' → ')}</div>`;
    }
  } else if (b.step === 'all' && help) {
    extra = '<div class="bhint">Add them all up! ➕</div>';
  }
  const badge = b.trivial ? '' : b.mode === 'combined' ? '⚡ Total in one step' : b.step === 'add' ? 'Step 2 of 2 · Add' : b.step === 'mul' ? 'Step 1 of 2 · Multiply' : '';
  return `<div class="card receipt bill-card">${badge ? `<small class="badge">${badge}</small>` : ''}<ul>${rows}</ul>${extra}</div>`;
}
