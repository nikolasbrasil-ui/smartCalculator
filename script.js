// Calculadora moderna e segura (sem eval)

const displayEl = document.getElementById("display");
const historyEl = document.getElementById("history");
const keysEl = document.querySelector(".keys");

let current = "0";   // número sendo digitado
let prev = null;     // número anterior
let op = null;       // operação atual: + - * /
let justEvaluated = false;

function formatNumber(str) {
  // mantém "-" e "."; formata com separador pt-BR
  if (str === "Erro") return str;

  const n = Number(str);
  if (!Number.isFinite(n)) return "Erro";

  // limita visualmente (evita overflow absurdo)
  const asText = n.toString();
  if (asText.includes("e")) return asText; // científico ok

  const parts = asText.split(".");
  const intPart = Number(parts[0]).toLocaleString("pt-BR");
  if (!parts[1]) return intPart;
  return `${intPart},${parts[1].slice(0, 10)}`; // até 10 casas
}

function setDisplay(value) {
  displayEl.textContent = formatNumber(value);
}

function setHistory(text) {
  historyEl.textContent = text || "";
}

function clearAll() {
  current = "0";
  prev = null;
  op = null;
  justEvaluated = false;
  setHistory("");
  setDisplay(current);
}

function backspace() {
  if (justEvaluated) return;
  if (current.length <= 1 || (current.length === 2 && current.startsWith("-"))) {
    current = "0";
  } else {
    current = current.slice(0, -1);
  }
  setDisplay(current);
}

function inputDigit(d) {
  if (justEvaluated) {
    current = "0";
    justEvaluated = false;
  }

  if (current === "0") current = d;
  else current += d;

  setDisplay(current);
}

function inputDecimal() {
  if (justEvaluated) {
    current = "0";
    justEvaluated = false;
  }
  if (!current.includes(".")) {
    current += ".";
    // aqui não formata a string, só atualiza o visor "bonito"
    displayEl.textContent = current.replace(".", ",");
  }
}

function toggleSign() {
  if (current === "0") return;
  current = current.startsWith("-") ? current.slice(1) : `-${current}`;
  setDisplay(current);
}

function percent() {
  const n = Number(current);
  if (!Number.isFinite(n)) return;
  current = (n / 100).toString();
  setDisplay(current);
}

function compute(a, b, operator) {
  switch (operator) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? NaN : a / b;
    default: return b;
  }
}

function chooseOperator(nextOp) {
  const curNum = Number(current);
  if (!Number.isFinite(curNum)) return;

  if (op && prev !== null && !justEvaluated) {
    // encadeia operações: 12 + 3 + 4 ...
    const result = compute(prev, curNum, op);
    if (!Number.isFinite(result)) {
      current = "Erro";
      setDisplay(current);
      return;
    }
    prev = result;
    current = "0";
  } else {
    prev = curNum;
    current = "0";
  }

  op = nextOp;
  justEvaluated = false;
  setHistory(`${formatNumber(prev.toString())} ${symbol(op)}`);
  setDisplay(current);
}

function symbol(operator) {
  if (operator === "/") return "÷";
  if (operator === "*") return "×";
  return operator;
}

function equals() {
  if (!op || prev === null) return;

  const curNum = Number(current);
  if (!Number.isFinite(curNum)) return;

  const result = compute(prev, curNum, op);

  setHistory(`${formatNumber(prev.toString())} ${symbol(op)} ${formatNumber(curNum.toString())} =`);
  if (!Number.isFinite(result)) {
    current = "Erro";
    setDisplay(current);
    prev = null;
    op = null;
    justEvaluated = true;
    return;
  }

  current = result.toString();
  setDisplay(current);

  prev = null;
  op = null;
  justEvaluated = true;
}

keysEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const value = btn.dataset.value;
  const action = btn.dataset.action;

  if (value) {
    if (/^\d$/.test(value)) inputDigit(value);
    else chooseOperator(value);
    return;
  }

  switch (action) {
    case "clear": clearAll(); break;
    case "backspace": backspace(); break;
    case "decimal": inputDecimal(); break;
    case "toggleSign": toggleSign(); break;
    case "percent": percent(); break;
    case "equals": equals(); break;
  }
});

// Atalhos do teclado
window.addEventListener("keydown", (e) => {
  const k = e.key;

  if (k >= "0" && k <= "9") return inputDigit(k);
  if (k === "," || k === ".") return inputDecimal();

  if (k === "Escape") return clearAll();
  if (k === "Backspace") return backspace();
  if (k === "Enter" || k === "=") return equals();

  if (k === "+" || k === "-" || k === "*" || k === "/") return chooseOperator(k);
});

// Inicializa
clearAll();