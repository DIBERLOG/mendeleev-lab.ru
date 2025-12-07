// js/search-modal.js
import { elementsData } from "./data/data_periodic-table/elements.js";
import { ions } from "./data/data_solubility-table/elements_sb.js";

const modal = document.getElementById("searchModal");
const closeBtn = modal.querySelector(".search-close");
const input = modal.querySelector("#searchInput");
const results = modal.querySelector("#searchResults");
const searchButton = modal.querySelector("#searchButton");

// === Открытие модалки ===
document.querySelectorAll(".ai-mode-button, .searchButton, .search-btn, .solubility-search").forEach(btn => {
  btn.addEventListener("click", e => {
    e.preventDefault();
    modal.style.display = "flex";
    input.value = "";
    results.innerHTML = "";
    input.focus();
  });
});

// === Закрытие ===
closeBtn.onclick = () => (modal.style.display = "none");
window.onclick = e => {
  if (e.target === modal) modal.style.display = "none";
};

// === Объединяем данные: Периодическая + Растворимость ===
const allElements = [
  ...elementsData.map(el => ({ ...el, source: "periodic" })),
  ...ions.map(el => ({ ...el, source: "solubility" }))
];

// === Основная функция поиска ===
function performSearch() {
  const query = input.value.trim().toLowerCase();
  results.innerHTML = "";
  if (!query) return;

  const matches = allElements.filter(el => {
    const fields = [
      el.name,
      el.fullName,
      el.symbol,
      el.formula,
      el.charge,
      el.number,
      el.mass,
      el.group,
      el.period,
      el.type
    ]
      .map(v => (v ? v.toString().toLowerCase() : ""))
      .join(" ");
    return fields.includes(query);
  });

  if (matches.length === 0) {
    results.innerHTML = `<li style="opacity:0.7;">Ничего не найдено</li>`;
    return;
  }

  matches.slice(0, 10).forEach(el => {
    const li = document.createElement("li");
    li.classList.add("search-result-item");

    const highlight = text =>
      text.replace(new RegExp(query, "gi"), m => `<mark>${m}</mark>`);

    li.innerHTML = `
      <b>${highlight(el.symbol || el.formula || "?")}</b> — 
      ${highlight(el.name || el.fullName || "Без названия")}
      <span style="opacity:0.6; font-size:0.8em;">[${
        el.source === "periodic" ? "Таблица Менделеева" : "Растворимость"
      }]</span>
    `;

    li.addEventListener("click", () => {
      openElement(el);
    });

    results.appendChild(li);
  });
}

// === Запуск поиска при вводе ===
input.addEventListener("input", performSearch);

// === Кнопка "Найти" ===
searchButton.addEventListener("click", () => {
  performSearch();
  const first = results.querySelector(".search-result-item");
  if (first) first.click();
});

// === Enter в поле ввода ===
input.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (!results.querySelector(".search-result-item")) {
      performSearch();
    }
    const first = results.querySelector(".search-result-item");
    if (first) first.click();
  }
});

// === Открытие элемента / иона ===
function openElement(el) {
  modal.style.display = "none";

  if (el.source === "periodic") {
    // Открыть элемент таблицы Менделеева
    localStorage.setItem("openElementSymbol", el.symbol);
    window.location.href = "periodic-table.html";
  } else if (el.source === "solubility") {
    // Открыть ион в таблице растворимости
    localStorage.setItem("openIonSymbol", el.symbol || el.name);
    window.location.href = "solubility-table.html";
  }
}

console.log("✅ Search modal loaded successfully!");

