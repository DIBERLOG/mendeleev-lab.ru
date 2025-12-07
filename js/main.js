// === Химический калькулятор: логика ===

function openCalc() {
  const modal = document.getElementById('calcModal');
  if (modal) modal.style.display = 'flex';
}

function closeCalc() {
  const modal = document.getElementById('calcModal');
  if (modal) modal.style.display = 'none';
}

function toggleHistory() {
  const box = document.getElementById('calcHistory');
  if (!box) return;
  box.style.display = box.style.display === 'none' || box.style.display === '' ? 'block' : 'none';
}

const modesHTML = {
  molar: `
    <label>Формула вещества:</label>
    <input id="formulaInput" class="calc-input" placeholder="H2SO4, KMnO4">
    <button class="calc-run-btn" onclick="runMolar()">Рассчитать</button>
  `,
  conversion: `
    <label>Режим:</label>
    <select id="convType" class="calc-select">
      <option value="mass-to-moles">Масса → моль</option>
      <option value="moles-to-mass">Моль → масса</option>
      <option value="moles-to-molecules">Моль → молекулы</option>
    </select>
    <label>Числовое значение:</label>
    <input id="convValue" class="calc-input" placeholder="значение">
    <label>Молярная масса (г/моль) — для переводов масса ⇄ моль:</label>
    <input id="convMolarMass" class="calc-input" placeholder="например, 98.079">
    <button class="calc-run-btn" onclick="runConversion()">Рассчитать</button>
  `,
  concentration: `
    <label>Масса растворённого вещества (г):</label>
    <input id="massS" class="calc-input" placeholder="m, г">
    <label>Объём раствора (л):</label>
    <input id="volS" class="calc-input" placeholder="V, л">
    <label>Молярная масса вещества (г/моль):</label>
    <input id="molarS" class="calc-input" placeholder="M, г/моль">
    <button class="calc-run-btn" onclick="runConc()">Рассчитать</button>
  `,
  gas: `
    <label>Что найти?</label>
    <select id="gasType" class="calc-select">
      <option value="n">Количество вещества n</option>
      <option value="P">Давление P</option>
      <option value="V">Объём V</option>
      <option value="T">Температура T</option>
    </select>
    <label>Давление P (атм):</label>
    <input id="P" class="calc-input" placeholder="P, атм">
    <label>Объём V (л):</label>
    <input id="V" class="calc-input" placeholder="V, л">
    <label>Количество вещества n (моль):</label>
    <input id="n" class="calc-input" placeholder="n, моль">
    <label>Температура T (K):</label>
    <input id="T" class="calc-input" placeholder="T, К">
    <button class="calc-run-btn" onclick="runGas()">Рассчитать</button>
  `,
  composition: `
    <label>Формула вещества:</label>
    <input id="compFormula" class="calc-input" placeholder="C6H12O6">
    <button class="calc-run-btn" onclick="runComp()">Рассчитать</button>
  `,
  ph: `
    <label>[H⁺] (моль/л):</label>
    <input id="H" class="calc-input" placeholder="например, 1e-3">
    <button class="calc-run-btn" onclick="runPh()">Рассчитать pH</button>
  `,
  osmotic: `
    <label>Молярность раствора M (моль/л):</label>
    <input id="Mosm" class="calc-input" placeholder="M">
    <label>Коэффициент Вант-Гоффа i:</label>
    <input id="iOsm" class="calc-input" placeholder="i">
    <label>Температура T (K):</label>
    <input id="TOsm" class="calc-input" placeholder="T, К">
    <button class="calc-run-btn" onclick="runOsm()">Рассчитать осмотическое давление</button>
  `,
  oxidation: `
    <label>Формула соединения:</label>
    <input id="oxFormula" class="calc-input" placeholder="H2SO4, KMnO4">
    <button class="calc-run-btn" onclick="runOx()">Определить степени окисления</button>
  `
};

const atomicMasses = {
  H: 1.008, He: 4.003,
  Li: 6.94, Be: 9.012, B: 10.81, C: 12.01, N: 14.01, O: 16.00, F: 19.00, Ne: 20.18,
  Na: 22.99, Mg: 24.31, Al: 26.98, Si: 28.09, P: 30.97, S: 32.07, Cl: 35.45, Ar: 39.95,
  K: 39.10, Ca: 40.08, Sc: 44.96, Ti: 47.87, V: 50.94, Cr: 52.00, Mn: 54.94, Fe: 55.85,
  Co: 58.93, Ni: 58.69, Cu: 63.55, Zn: 65.39, Br: 79.90, Ag: 107.87, I: 126.90,
  Ba: 137.33, Pb: 207.2, Sn: 118.71
};

// --- утилиты ---

function parseFormula(formula) {
  // Парсер с поддержкой скобок ()
  let i = 0;
  const len = formula.length;

  function skipSpaces() {
    while (i < len && /\s/.test(formula[i])) i++;
  }

  function parseNumber() {
    let start = i;
    while (i < len && /[0-9]/.test(formula[i])) i++;
    if (start === i) return 1;
    return parseInt(formula.slice(start, i), 10);
  }

  function parseSegment() {
    let counts = {};
    while (i < len) {
      skipSpaces();
      const ch = formula[i];
      if (!ch) break;
      if (ch === ')') {
        break;
      }
      if (ch === '(') {
        i++;
        let inner = parseSegment();
        if (formula[i] !== ')') {
          throw new Error("Неверная формула: отсутствует закрывающая скобка");
        }
        i++;
        let mult = parseNumber();
        for (let el in inner) {
          counts[el] = (counts[el] || 0) + inner[el] * mult;
        }
      } else if (/[A-Z]/.test(ch)) {
        let symbol = ch;
        i++;
        if (i < len && /[a-z]/.test(formula[i])) {
          symbol += formula[i];
          i++;
        }
        let num = parseNumber();
        counts[symbol] = (counts[symbol] || 0) + num;
      } else {
        throw new Error("Неверный символ в формуле: " + ch);
      }
    }
    return counts;
  }

  const result = parseSegment();
  return result;
}

function molarMassFromCounts(counts) {
  let total = 0;
  for (let el in counts) {
    const m = atomicMasses[el];
    if (!m) continue;
    total += m * counts[el];
  }
  return total;
}

let historyEntries = [];

function addHistoryEntry(label, value) {
  const box = document.getElementById('calcHistory');
  if (!box) return;
  const entry = document.createElement('div');
  entry.className = 'calc-history-entry';
  entry.textContent = label + ": " + value;
  box.prepend(entry);
  historyEntries.unshift({ label, value });
  if (historyEntries.length > 50) {
    historyEntries.pop();
    if (box.lastChild) box.removeChild(box.lastChild);
  }
}

function showResult(text, labelForHistory) {
  const box = document.getElementById('calcResult');
  if (!box) return;
  box.style.display = 'block';
  box.textContent = text;
  if (labelForHistory) {
    addHistoryEntry(labelForHistory, text);
  }
}

// --- режимы ---

function runMolar() {
  const f = (document.getElementById('formulaInput') || {}).value;
  if (!f) {
    showResult("Введите формулу вещества", "Молярная масса");
    return;
  }
  try {
    const counts = parseFormula(f.trim());
    const M = molarMassFromCounts(counts);
    if (!M) {
      showResult("Не удалось найти атомные массы элементов в формуле.", "Молярная масса");
      return;
    }
    showResult("Молярная масса " + f + " = " + M.toFixed(3) + " г/моль", "Молярная масса");
  } catch (e) {
    showResult("Ошибка: " + e.message, "Молярная масса");
  }
}

function runConversion() {
  const type = (document.getElementById('convType') || {}).value;
  const val = parseFloat((document.getElementById('convValue') || {}).value);
  const M = parseFloat((document.getElementById('convMolarMass') || {}).value);
  if (isNaN(val)) {
    showResult("Введите числовое значение.", "Конвертер");
    return;
  }
  let resText = "";
  if (type === "mass-to-moles") {
    if (isNaN(M) || M <= 0) {
      showResult("Укажите молярную массу для перевода масса → моль.", "Конвертер");
      return;
    }
    const n = val / M;
    resText = val + " г → " + n.toFixed(4) + " моль";
  } else if (type === "moles-to-mass") {
    if (isNaN(M) || M <= 0) {
      showResult("Укажите молярную массу для перевода моль → масса.", "Конвертер");
      return;
    }
    const m = val * M;
    resText = val + " моль → " + m.toFixed(4) + " г";
  } else if (type === "moles-to-molecules") {
    const N = val * 6.022e23;
    resText = val + " моль → " + N.toExponential(4) + " частиц";
  }
  showResult(resText, "Конвертер");
}

function runConc() {
  const m = parseFloat((document.getElementById('massS') || {}).value);
  const V = parseFloat((document.getElementById('volS') || {}).value);
  const M = parseFloat((document.getElementById('molarS') || {}).value);
  if ([m,V,M].some(x => isNaN(x) || x <= 0)) {
    showResult("Введите массу, объём (л) и молярную массу.", "Концентрация");
    return;
  }
  const c = m / M / V;
  const text = "Молярная концентрация: c = " + c.toFixed(4) + " моль/л";
  showResult(text, "Концентрация");
}

function runGas() {
  const R = 0.0821;
  const type = (document.getElementById('gasType') || {}).value;
  let P = parseFloat((document.getElementById('P') || {}).value);
  let V = parseFloat((document.getElementById('V') || {}).value);
  let n = parseFloat((document.getElementById('n') || {}).value);
  let T = parseFloat((document.getElementById('T') || {}).value);
  let res = "";
  if (type === "n") {
    if ([P,V,T].some(x => isNaN(x) || x <= 0)) {
      showResult("Введите P, V и T.", "PV=nRT");
      return;
    }
    n = P * V / (R * T);
    res = "n = " + n.toFixed(4) + " моль";
  } else if (type === "P") {
    if ([n,V,T].some(x => isNaN(x) || x <= 0)) {
      showResult("Введите n, V и T.", "PV=nRT");
      return;
    }
    P = n * R * T / V;
    res = "P = " + P.toFixed(4) + " атм";
  } else if (type === "V") {
    if ([n,P,T].some(x => isNaN(x) || x <= 0)) {
      showResult("Введите n, P и T.", "PV=nRT");
      return;
    }
    V = n * R * T / P;
    res = "V = " + V.toFixed(4) + " л";
  } else if (type === "T") {
    if ([n,P,V].some(x => isNaN(x) || x <= 0)) {
      showResult("Введите n, P и V.", "PV=nRT");
      return;
    }
    T = P * V / (n * R);
    res = "T = " + T.toFixed(2) + " K";
  }
  showResult(res, "PV = nRT");
}

function runComp() {
  const f = (document.getElementById('compFormula') || {}).value;
  if (!f) {
    showResult("Введите формулу вещества.", "Процентный состав");
    return;
  }
  try {
    const counts = parseFormula(f.trim());
    const M = molarMassFromCounts(counts);
    if (!M) {
      showResult("Не удалось посчитать молярную массу (нет данных по элементам).", "Процентный состав");
      return;
    }
    let lines = [];
    for (let el in counts) {
      const partMass = (atomicMasses[el] || 0) * counts[el];
      const percent = partMass / M * 100;
      lines.push(el + ": " + percent.toFixed(2) + "%");
    }
    showResult("Процентный состав " + f + ":\n" + lines.join("\n"), "Процентный состав");
  } catch (e) {
    showResult("Ошибка: " + e.message, "Процентный состав");
  }
}

function runPh() {
  const val = parseFloat((document.getElementById('H') || {}).value);
  if (!(val > 0)) {
    showResult("Введите положительное значение [H⁺].", "pH");
    return;
  }
  const ph = -Math.log10(val);
  const poh = 14 - ph;
  showResult("pH = " + ph.toFixed(3) + "\n" + "pOH = " + poh.toFixed(3), "pH");
}

function runOsm() {
  const M = parseFloat((document.getElementById('Mosm') || {}).value);
  const i = parseFloat((document.getElementById('iOsm') || {}).value);
  const T = parseFloat((document.getElementById('TOsm') || {}).value);
  if ([M,i,T].some(x => isNaN(x) || x <= 0)) {
    showResult("Введите M, i и T.", "Осмотическое давление");
    return;
  }
  const R = 0.0821;
  const pi = i * M * R * T;
  showResult("Осмотическое давление π = " + pi.toFixed(3) + " атм", "Осмотическое давление");
}

function runOx() {
  const f = (document.getElementById('oxFormula') || {}).value;
  if (!f) {
    showResult("Введите формулу соединения.", "Степени окисления");
    return;
  }
  try {
    const counts = parseFormula(f.trim());
    // простейший алгоритм: один неизвестный элемент
    const group1 = ["Li","Na","K","Rb","Cs","Fr"];
    const group2 = ["Be","Mg","Ca","Sr","Ba","Ra"];
    const halogens = ["F","Cl","Br","I"];

    let known = {};
    let unknown = [];

    for (let el in counts) {
      if (el === "H") {
        known[el] = 1;
      } else if (el === "O") {
        known[el] = -2;
      } else if (group1.indexOf(el) !== -1) {
        known[el] = 1;
      } else if (group2.indexOf(el) !== -1) {
        known[el] = 2;
      } else if (halogens.indexOf(el) !== -1) {
        known[el] = -1;
      } else {
        unknown.push(el);
      }
    }

    if (unknown.length > 1) {
      showResult("Слишком много неизвестных степеней окисления для автоматического расчёта. Алгоритм A работает для соединений типа H2SO4, KMnO4, HNO3 и похожих.", "Степени окисления");
      return;
    }

    let ox = {};
    let sumKnown = 0;
    for (let el in counts) {
      if (known[el] != null) {
        ox[el] = known[el];
        sumKnown += known[el] * counts[el];
      }
    }

    if (unknown.length === 1) {
      const el = unknown[0];
      const n = counts[el];
      const x = -sumKnown / n;
      ox[el] = x;
    }

    let lines = [];
    for (let el in counts) {
      const v = ox[el];
      if (v == null) {
        lines.push(el + ": ? (не определено)");
      } else {
        lines.push(el + ": " + (v >= 0 ? "+" + v : "" + v));
      }
    }
    showResult("Степени окисления для " + f + ":\n" + lines.join("\n"), "Степени окисления");
  } catch (e) {
    showResult("Ошибка: " + e.message, "Степени окисления");
  }
}

// --- инициализация ---

document.addEventListener("DOMContentLoaded", function() {
  // инициализация переключателя калькулятора
  const buttons = document.querySelectorAll(".calc-mode-btn");
  const content = document.getElementById("calcContent");
  if (buttons.length && content) {
    buttons.forEach(function(btn) {
      btn.addEventListener("click", function() {
        buttons.forEach(function(b) { b.classList.remove("active"); });
        btn.classList.add("active");
        const mode = btn.getAttribute("data-mode");
        content.innerHTML = modesHTML[mode] || "";
        const res = document.getElementById("calcResult");
        if (res) res.style.display = "none";
      });
    });
    // по умолчанию включаем молярную массу
    buttons[0].click();
  }

  // включаем активную вкладку стеклянного переключателя
  const page = document.body.getAttribute("data-page");
  const map = {
    home: "tab-home",
    periodic: "tab-periodic",
    solubility: "tab-solubility"
  };
  const id = map[page] || "tab-home";
  const radio = document.getElementById(id);
  if (radio) radio.checked = true;
});


// === Новая логика таблицы / модального окна ===


// main.js — финальная матовая версия
document.addEventListener("DOMContentLoaded", () => {
  const table = document.querySelector("table");
  const modal = document.getElementById("elementModal");

  async function loadPeriodData(period) {
    const path = `js/data/data_periodic-table/${period}period.js`;
    try {
      const script = await import(`../${path}`);
      return script[`period${period}`] || [];
    } catch {
      return [];
    }
  }

  async function getElementData(symbol) {
    for (let i = 1; i <= 7; i++) {
      const data = await loadPeriodData(i);
      const element = data.find(el => el.symbol === symbol);
      if (element) return element;
    }
    return {
      symbol, name: "", number: "", mass: "", mass_number: "", group: "", period: "",
      density: "", melting: "", boiling: "", electronegativity: "",
      oxidation: "", electron_config: "", reactivity: "",
      isotopes: "", abundance: "", obtainment: "", usage: "", biology: "", images: []
    };
  }

  async function openElementModal(symbol) {
    const el = await getElementData(symbol);
    renderModal(el);
  }

  function renderModal(el) {
    modal.innerHTML = `
      <div class='modal'>
        <span class='close-btn'>&times;</span>
        <div class='left-panel'>
          <div class='modal-header'>
            <h1>${el.symbol || ""} <small>${el.name || ""}</small></h1>
          </div>
          <div class='properties-top'>
            <div class='property-card'>⚛ ${el.number || ""}</div>
            <div class='property-card'>⚖ ${el.mass || ""}</div>
            <div class='property-card'>🧪 Группа ${el.group || ""}, период ${el.period || ""}</div>
            <div class='property-card'>🌡 ${el.state || ""}</div>
            <div class='property-card'>🔥 ${el.melting || ""}</div>
          </div>
          <div class='tabs'>
            ${["Основные","Физические","Химические","Изотопы","Распространённость","Получение","Применение","Биология"]
              .map((t,i)=>`<div class='tab ${i===0?"active":""}' data-tab='tab${i}'>${t}</div>`).join("")}
          </div>
          ${createTabContent(el)}
        </div>
        <div class='right-panel'>
          <div class='section-title'>Внешний вид элемента</div>
          <div class='swiper'>
            <div class='swiper-wrapper'>
              ${(el.images?.length?el.images:[
                "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg"
              ]).map(img=>`<div class='swiper-slide'><img src='${img}'></div>`).join("")}
            </div>
            <div class='swiper-button-next'></div>
            <div class='swiper-button-prev'></div>
            <div class='swiper-pagination'></div>
          </div>
        </div>
      </div>
      <div class='lightbox' id='lightbox'><span class='lightbox-close'>&times;</span><img id='lightboxImg'></div>
    `;

    modal.style.display = 'flex';

    modal.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        modal.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        modal.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        modal.querySelector(`#${tab.dataset.tab}`).classList.add('active');
      });
    });

    new Swiper('.swiper', {
      loop: true,
      spaceBetween: 20,
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
    });

    const lb = modal.querySelector('#lightbox');
    const lbImg = modal.querySelector('#lightboxImg');
    modal.querySelectorAll('.swiper-slide img').forEach(img => {
      img.addEventListener('dblclick', () => {
        lbImg.src = img.src;
        lb.classList.add('active');
      });
    });
    modal.querySelector('.lightbox-close').onclick = () => lb.classList.remove('active');
    lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('active'); });

    const closeModal = () => (modal.style.display = 'none');
    modal.querySelector('.close-btn').addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  }

  function createTabContent(el) {
    return `
      <div class='tab-content active' id='tab0'>
        <div class='info-line'><b>Атомный номер:</b> ${el.number || ""}</div>
        <div class='info-line'><b>Атомная масса:</b> ${el.mass || ""}</div>
        <div class='info-line'><b>Массовое число:</b> ${el.mass_number || ""}</div>
        <div class='info-line'><b>Электронная конфигурация:</b> ${el.electron_config || ""}</div>
        <div class='info-line'><b>Степени окисления:</b> ${el.oxidation || ""}</div>
        <div class='info-line'><b>Электроотрицательность:</b> ${el.electronegativity || ""}</div>
      </div>
      <div class='tab-content' id='tab1'>${el.density || ""}</div>
      <div class='tab-content' id='tab2'>${el.reactivity || ""}</div>
      <div class='tab-content' id='tab3'>${el.isotopes || ""}</div>
      <div class='tab-content' id='tab4'>${el.abundance || ""}</div>
      <div class='tab-content' id='tab5'>${el.obtainment || ""}</div>
      <div class='tab-content' id='tab6'>${el.usage || ""}</div>
      <div class='tab-content' id='tab7'>${el.biology || ""}</div>`;
  }

  
});
