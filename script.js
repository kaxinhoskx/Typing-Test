"use strict";

// ---------- Configurações ----------
const DURATION = 30; // segundos
const STORAGE_KEY = "digitacao:ranking";
const LEVEL_NAMES = { easy: "Fácil", medium: "Médio", hard: "Difícil" };

const WORDS = {
  easy: "casa sol mar pão bola gato livro mesa rua dia noite amigo festa verde chuva vento praia carro tempo mundo sorriso janela caminho jardim família".split(" "),
  medium: "computador estrada biblioteca montanha aventura chocolate telefone caderno viagem natureza tecnologia amizade cozinha esporte paisagem semana oceano projeto história música cidade escola trabalho".split(" "),
  hard: "extraordinário guarda-chuva paralelepípedo conhecimento responsabilidade desenvolvimento ininterruptamente acessibilidade sustentabilidade pensamento oftalmologista improvável experiência obrigatório consciência hipopótamo inteligência vulnerabilidade".split(" "),
};

// ---------- Elementos ----------
const $ = (id) => document.getElementById(id);
const el = {
  text: $("text"), input: $("input"), hint: $("hint"), restart: $("restart"),
  time: $("time"), wpm: $("wpm"), acc: $("acc"),
  result: $("result"), resultTitle: $("result-title"), resultText: $("result-text"),
  ranking: $("ranking"), levelButtons: document.querySelectorAll(".level"),
};

// ---------- Estado ----------
let level = "easy";
let target = "";       // texto completo que o usuário deve digitar
let chars = [];        // um <span> para cada caractere do texto
let started = false;
let finished = false;
let startTime = 0;
let timerId = null;
let typedCount = 0;    // total de teclas digitadas (inclusive erradas)
let errors = 0;        // quantas dessas teclas estavam erradas
let prevLength = 0;

// ---------- Montar o texto ----------
function buildText() {
  const pool = WORDS[level];
  const words = Array.from({ length: 100 }, () => pool[Math.floor(Math.random() * pool.length)]);
  target = words.join(" ");

  // Cada palavra vira um <span> (para não quebrar no meio) e cada letra também
  const wordEls = words.map((word, i) => {
    const wordEl = document.createElement("span");
    wordEl.className = "word";
    const text = i < words.length - 1 ? word + " " : word;
    for (const letter of text) {
      const c = document.createElement("span");
      c.className = "char";
      c.textContent = letter;
      wordEl.append(c);
    }
    return wordEl;
  });
  el.text.replaceChildren(...wordEls);
  chars = [...el.text.querySelectorAll(".char")];
}

// ---------- Novo teste ----------
function newTest() {
  clearInterval(timerId);
  started = finished = false;
  typedCount = errors = prevLength = 0;
  el.input.value = "";
  el.input.disabled = false;
  el.result.hidden = true;
  el.hint.hidden = false;
  buildText();
  render();
  updateStats(0);
  el.text.scrollTop = 0;
  el.input.focus();
}

// ---------- Desenhar o estado atual ----------
function render() {
  const typed = el.input.value;
  chars.forEach((c, i) => {
    let state = "";
    if (i < typed.length) state = typed[i] === target[i] ? "ok" : "bad";
    c.className = "char " + state + (i === typed.length ? " caret" : "");
  });

  // Rola o texto para a linha atual ficar sempre visível
  const caret = chars[Math.min(typed.length, chars.length - 1)];
  el.text.scrollTop = Math.max(0, caret.offsetTop - el.text.clientHeight / 3);
}

// ---------- Números ao vivo ----------
function countCorrect() {
  const typed = el.input.value;
  let n = 0;
  for (let i = 0; i < typed.length; i++) if (typed[i] === target[i]) n++;
  return n;
}

function calcWpm(elapsedSeconds) {
  if (elapsedSeconds < 1) return 0;
  // Padrão do mundo da digitação: 5 caracteres corretos = 1 palavra
  return Math.round(countCorrect() / 5 / (elapsedSeconds / 60));
}

function calcAccuracy() {
  return typedCount ? Math.round(((typedCount - errors) / typedCount) * 100) : 100;
}

function updateStats(elapsedSeconds) {
  el.time.textContent = Math.max(0, Math.ceil(DURATION - elapsedSeconds));
  el.wpm.textContent = calcWpm(elapsedSeconds);
  el.acc.textContent = calcAccuracy() + "%";
}

// ---------- Fluxo do teste ----------
function tick() {
  const elapsed = (performance.now() - startTime) / 1000;
  if (elapsed >= DURATION) finish(DURATION);
  else updateStats(elapsed);
}

function finish(elapsedSeconds) {
  clearInterval(timerId);
  finished = true;
  el.input.disabled = true;
  el.hint.hidden = true;
  updateStats(elapsedSeconds);

  const wpm = calcWpm(elapsedSeconds);
  const accuracy = calcAccuracy();
  const isRecord = saveResult({ wpm, accuracy, level, date: Date.now() });

  el.resultTitle.textContent = isRecord ? "Novo recorde!" : "Tempo esgotado!";
  el.resultText.textContent = `${wpm} palavras por minuto, ${accuracy}% de precisão, nível ${LEVEL_NAMES[level].toLowerCase()}.`;
  el.result.hidden = false;
}

el.input.addEventListener("input", () => {
  if (finished) return;
  const typed = el.input.value;

  if (!started && typed.length > 0) {
    started = true;
    startTime = performance.now();
    timerId = setInterval(tick, 100);
  }

  // Só conta como tecla nova quando o texto cresceu (apagar não conta)
  if (typed.length > prevLength) {
    typedCount++;
    if (typed[typed.length - 1] !== target[typed.length - 1]) errors++;
  }
  prevLength = typed.length;

  render();
  if (typed.length >= target.length) finish((performance.now() - startTime) / 1000);
});

el.input.addEventListener("paste", (e) => e.preventDefault()); // sem colar!

// ---------- Ranking (localStorage) ----------
function loadRanking() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

// Salva o resultado, mantém só os 5 melhores e devolve true se for o 1º lugar
function saveResult(entry) {
  if (entry.wpm === 0) return false;
  const ranking = loadRanking();
  ranking.push(entry);
  ranking.sort((a, b) => b.wpm - a.wpm);
  const top = ranking.slice(0, 5);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(top)); } catch {}
  renderRanking();
  return top[0] === entry;
}

function renderRanking() {
  const ranking = loadRanking();
  if (ranking.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "Nenhum resultado ainda. Faça o primeiro teste!";
    el.ranking.replaceChildren(li);
    return;
  }
  el.ranking.replaceChildren(...ranking.map((r) => {
    const li = document.createElement("li");
    const left = document.createElement("span");
    left.textContent = `${r.wpm} PPM · ${r.accuracy}% de precisão`;
    const right = document.createElement("span");
    right.textContent = `${LEVEL_NAMES[r.level]} · ${new Date(r.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`;
    li.append(left, right);
    return li;
  }));
}

// ---------- Eventos gerais ----------
el.levelButtons.forEach((b) => b.addEventListener("click", () => {
  level = b.dataset.level;
  el.levelButtons.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  newTest();
}));

el.restart.addEventListener("click", newTest);
el.text.addEventListener("click", () => el.input.focus());
el.input.addEventListener("focus", () => el.text.classList.remove("unfocused"));
el.input.addEventListener("blur", () => el.text.classList.add("unfocused"));

// ---------- Início ----------
renderRanking();
newTest();