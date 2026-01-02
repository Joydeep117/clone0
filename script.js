(function () {
  'use strict';

  /**
   * A tiny calculator state machine supporting +, -, *, /, %, sign toggle, and decimal input.
   */

  const displayEl = document.getElementById('display');
  const keysEl = document.querySelector('.keys');

  /**
   * Internal state
   */
  let current = '0';
  let previous = null; // string
  let operator = null; // '+', '-', '*', '/'
  let justEvaluated = false;

  function updateDisplay(value) {
    displayEl.value = value;
  }

  function clearAll() {
    current = '0';
    previous = null;
    operator = null;
    justEvaluated = false;
    updateDisplay(current);
  }

  function inputDigit(digit) {
    if (justEvaluated) {
      current = digit;
      justEvaluated = false;
      return updateDisplay(current);
    }
    if (current === '0') {
      current = digit;
    } else {
      current += digit;
    }
    updateDisplay(current);
  }

  function inputDot() {
    if (justEvaluated) {
      current = '0.';
      justEvaluated = false;
      return updateDisplay(current);
    }
    if (!current.includes('.')) {
      current += '.';
      updateDisplay(current);
    }
  }

  function setOperator(nextOperator) {
    if (operator && !justEvaluated) {
      // chain operations: perform previous operator first
      evaluate();
    }
    previous = current;
    operator = nextOperator;
    justEvaluated = false;
    current = '0';
  }

  function toggleSign() {
    if (current === '0') return;
    if (current.startsWith('-')) current = current.slice(1);
    else current = '-' + current;
    updateDisplay(current);
  }

  function percent() {
    const value = parseFloat(current);
    if (Number.isFinite(value)) {
      current = (value / 100).toString();
      updateDisplay(current);
    }
  }

  function backspace() {
    if (justEvaluated) {
      // After equals, backspace behaves like clear entry
      current = '0';
      justEvaluated = false;
      return updateDisplay(current);
    }
    if (current.length <= 1 || (current.length === 2 && current.startsWith('-'))) {
      current = '0';
    } else {
      current = current.slice(0, -1);
    }
    updateDisplay(current);
  }

  function safeDivide(a, b) {
    if (b === 0) return 'Error';
    return a / b;
  }

  function evaluate() {
    if (operator == null || previous == null) return;
    const a = parseFloat(previous);
    const b = parseFloat(current);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return;

    let result;
    switch (operator) {
      case '+':
        result = a + b; break;
      case '-':
        result = a - b; break;
      case '*':
        result = a * b; break;
      case '/':
        result = safeDivide(a, b); break;
      default:
        return;
    }

    if (result === 'Error') {
      current = 'Error';
      updateDisplay(current);
      previous = null;
      operator = null;
      justEvaluated = true;
      return;
    }

    // Trim trailing zeros for decimals
    const resultString = String(result);
    const normalized = resultString.includes('.')
      ? result.toFixed(12).replace(/\.0+$|\.(?=\d*[^0])0+$/g, '')
      : resultString;

    current = normalized;
    updateDisplay(current);
    previous = null;
    operator = null;
    justEvaluated = true;
  }

  // Event handling: click
  keysEl.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.classList.contains('key')) return;

    const value = target.getAttribute('data-value');
    const action = target.getAttribute('data-action');

    if (value != null) {
      if (value >= '0' && value <= '9') return inputDigit(value);
      if (value === '.') return inputDot();
      if ('+-*/'.includes(value)) return setOperator(value);
    }

    if (action === 'clear') return clearAll();
    if (action === 'sign') return toggleSign();
    if (action === 'percent') return percent();
    if (action === 'backspace') return backspace();
    if (action === 'equals') return evaluate();
  });

  // Keyboard support
  window.addEventListener('keydown', (e) => {
    const key = e.key;
    if (key >= '0' && key <= '9') return inputDigit(key);
    if (key === '.') return inputDot();
    if (key === '+' || key === '-' || key === '*' || key === '/') return setOperator(key);
    if (key === 'Enter' || key === '=') return evaluate();
    if (key === 'Backspace') return backspace();
    if (key === 'Escape') return clearAll();
    if (key === '%') return percent();
  });

  // Initialize
  updateDisplay(current);
})();


