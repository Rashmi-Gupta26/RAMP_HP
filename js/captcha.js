// Simple math CAPTCHA — addition/subtraction of two small numbers.
function makeCaptcha(qEl, inputEl) {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const op = Math.random() > 0.5 ? '+' : '-';
  let answer;
  let display;
  if (op === '+') {
    answer = a + b;
    display = `${a} + ${b}`;
  } else {
    const big = Math.max(a, b), small = Math.min(a, b);
    answer = big - small;
    display = `${big} − ${small}`;
  }
  qEl.textContent = `What is ${display} ?`;
  qEl.dataset.answer = String(answer);
  if (inputEl) inputEl.value = '';
}

function verifyCaptcha(qEl, inputEl) {
  const expected = qEl.dataset.answer;
  return inputEl.value.trim() === expected;
}
