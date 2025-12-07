export function initModal(elementsData) {
  const modal = document.getElementById("elementModal");
  const closeBtn = modal.querySelector(".em-close-btn");
  const lightbox = modal.querySelector("#em-lightbox");
  const lightboxImg = modal.querySelector("#em-lightbox-img");

  // поведение вкладок (один раз при инициализации)
  const tabButtons = modal.querySelectorAll(".em-tab");
  const tabContents = modal.querySelectorAll(".em-tab-content");
  tabButtons.forEach(tab => {
    tab.addEventListener("click", () => {
      tabButtons.forEach(t => t.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));

      tab.classList.add("active");
      const target = modal.querySelector("#" + tab.dataset.tab);
      if (target) target.classList.add("active");
    });
  });

  // клики по элементам таблицы

// --- ОБЫЧНЫЕ ЭЛЕМЕНТЫ ---
// Всё, что имеет data-number (включая Лантаноиды и Актиниды)
document.querySelectorAll("[data-number]:not([data-key])")
  .forEach(el => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const number = String(el.dataset.number);
      const element = elementsData.find(e => String(e.number) === number);
      if (!element) return;

      openModal(element);
    });
  });



// --- ДОПОЛНИТЕЛЬНЫЕ ГРУППЫ: ОКСИДЫ / ГИДРИДЫ ---
document.querySelectorAll("[data-type][data-key]").forEach(el => {

  el.addEventListener("click", (e) => {
    e.stopPropagation();
    const type = el.dataset.type;
    const key = el.dataset.key;

    const normalize = str => str.replace(/[₂₃₄₅₆₇₈₉₀₁]/g, m =>
      ({ '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' }[m])
    );

    const element = elementsData.find(e => normalize(e.formula || "") === normalize(key || ""));

    if (element) {
  openModal({
    symbol: element.formula,
    name: element.name,
    number: "",
    mass: "",
    electron_config: element.oxidation_state ?? "",
    basic: {
      "Тип": element.type,
      "Группа": element.group,
      "Степень окисления": element.oxidation_state
    },
    physical: element.properties,
    chemical: element.reactions,
    usage: element.uses,
    stability: element.stability,
    images: element.images || ["", ""], 
  });
  return;
}


    const specialGroups = {
      oxide: {
        title: "Высшие оксиды",
        desc: "Общая формула высших оксидов элементов по группам.",
        examples: "R₂O, RO, R₂O₃, RO₂, R₂O₅, RO₃, R₂O₇, RO₄"
      },
      hydride: {
        title: "Летучие водородные соединения",
        desc: "Типичные летучие водородные соединения неметаллов.",
        examples: "RH₄, RH₃, H₂R, HR"
      }
    };

    const info = specialGroups[type];
    if (!info) return;

    openModal({
  symbol: key,
  name: info.title,
  number: "",
  mass: "",
  electron_config: "",
  basic: { "Описание": info.desc },
  chemical: { "Примеры": info.examples },
  images: ["", ""], // 🔹 обязательно добавь
});
  });
});


// --- ЛАНТАНОИДЫ / АКТИНОИДЫ (заглушки, безопасная версия) ---
document.querySelectorAll("th[data-type='Лантаноид'], th[data-type='Актинид']").forEach(el => {
  el.addEventListener("click", (e) => {
    e.stopPropagation();

    const type = el.dataset.type;
    const info = {
      "Лантаноид": {
        title: "Лантаноиды",
        desc: "Элементы с атомными номерами 57–71. Заполнение 4f-подуровня, схожие свойства, электроположительные металлы.",
        examples: "Ce, Pr, Nd, Pm, Sm, Eu, Gd, Tb, Dy, Ho, Er, Tm, Yb, Lu",
        properties: {
          "Кристаллическая структура": "Металлическая (hcp или fcc)",
          "Тип связи": "Металлическая",
          "Цвет": "Серебристо-серый блеск",
          "Плотность": "6–9 г/см³",
          "Температура плавления": "800–1700°C",
        },
        uses: {
          "Промышленность": [
            "Магниты, сплавы, катализаторы, люминофоры",
          ],
          "Наука": [
            "Исследования квантовых и магнитных свойств",
          ],
        },
        images: [
          "https://upload.wikimedia.org/wikipedia/commons/5/57/Cerium_sublimed_dendritic_and_1cm3_cube.jpg",
          "https://upload.wikimedia.org/wikipedia/commons/8/87/Lanthanum.jpg"
        ],
      },
      "Актинид": {
        title: "Актиноиды",
        desc: "Элементы с атомными номерами 89–103. Заполнение 5f-подуровня, все радиоактивны, часть — синтетические.",
        examples: "Th, Pa, U, Np, Pu, Am, Cm, Bk, Cf, Es, Fm, Md, No, Lr",
        properties: {
          "Кристаллическая структура": "Различная (например, α-U — орторомбическая)",
          "Тип связи": "Металлическая",
          "Цвет": "Серебристо-серый, быстро тускнеет на воздухе",
          "Плотность": "10–20 г/см³",
          "Температура плавления": "1000–1500°C",
        },
        uses: {
          "Промышленность": [
            "Ядерное топливо, радиоизотопные источники энергии",
          ],
          "Наука": [
            "Исследование радиоактивности и строения ядра",
          ],
        },
        images: [
          "https://upload.wikimedia.org/wikipedia/commons/4/4a/Uranium_glass_2.jpg",
          "https://upload.wikimedia.org/wikipedia/commons/d/d3/Plutonium_ring.jpg"
        ],
      }
    }[type];

    if (!info) return;

    openModal({
      symbol: type,
      name: info.title,
      number: "",
      mass: "",
      electron_config: "",
      basic: { "Описание": info.desc },
      physical: info.properties,
      chemical: { "Примеры": info.examples },
      usage: info.uses,
      stability: { "Особенности": ["Лантаноиды — редкоземельные металлы", "Все актиноиды радиоактивны"] },
      images: info.images,
    });
  });
});




// --- ФУНКЦИЯ ОТКРЫТИЯ МОДАЛКИ (общая) ---
function openModal(element) {
  const modal = document.getElementById("elementModal");

  // Заголовок
  modal.querySelector(".em-title-symbol").textContent = element.symbol || "";
  modal.querySelector(".em-title-name").textContent = element.name || "";

  // Верхние карточки
  modal.querySelector("#em-atomic-number").textContent = element.number ?? "";
  modal.querySelector("#em-atomic-mass").textContent = element.mass ?? "";
  modal.querySelector("#em-electron").textContent = element.electron_config ?? "";

  // Вкладки
  const sections = {
    "em-basic": element.basic,
    "em-phys": element.physical,
    "em-chem": element.chemical,
    "em-isotopes": element.isotopes,
    "em-dist": element.distribution,
    "em-obtain": element.obtaining,
    "em-usage": element.usage,
    "em-bio": element.biology
  };

  

  Object.entries(sections).forEach(([id, data]) => {
    const container = modal.querySelector("#" + id);
    if (!container || !data) return;
    container.innerHTML = Object.entries(data)
      .map(([key, val]) => `<div class="em-property-card">${key}: <b>${val}</b></div>`)
      .join("");
  });

  // По умолчанию вкладка "Основные"
  const tabButtons = modal.querySelectorAll(".em-tab");
  const tabContents = modal.querySelectorAll(".em-tab-content");
  tabButtons.forEach(t => t.classList.remove("active"));
  tabContents.forEach(c => c.classList.remove("active"));
  const firstTab = modal.querySelector('.em-tab[data-tab="em-basic"]');
  const firstContent = modal.querySelector("#em-basic");
  if (firstTab) firstTab.classList.add("active");
  if (firstContent) firstContent.classList.add("active");

  // --- изображения (Swiper и лайтбокс) ---
const container = modal.querySelector("#em-swiper-images");
if (container) {
  container.innerHTML = (element.images || [])
    .map(img => `<div class="swiper-slide"><img src="${img}" alt="${element.name}"></div>`)
    .join("");

  if (modal._swiperInstance) {
    modal._swiperInstance.destroy(true, true);
    modal._swiperInstance = null;
  }

  if (element.images && element.images.length) {
    modal._swiperInstance = new Swiper(".em-swiper", {
      loop: element.images.length > 1,
      pagination: { el: ".em-swiper .swiper-pagination", clickable: true },
      navigation: {
        nextEl: ".em-swiper .swiper-button-next",
        prevEl: ".em-swiper .swiper-button-prev"
      }
    });
  }

  container.onclick = (e) => {
    const target = e.target;
    if (target && target.tagName === "IMG") {
      const lightbox = modal.querySelector("#em-lightbox");
      const lightboxImg = modal.querySelector("#em-lightbox-img");
      lightboxImg.src = target.src;
      lightbox.style.display = "flex";
    }
  };
}

// --- Закрытие лайтбокса ---
const lightbox = modal.querySelector("#em-lightbox");
const lightboxImg = modal.querySelector("#em-lightbox-img");

if (lightbox) {
  lightbox.addEventListener("click", (e) => {
    // Закрывать при клике вне картинки
    if (e.target === lightbox) {
      lightbox.style.display = "none";
      lightboxImg.src = "";
    }
  });
}

// Добавим крестик для удобства (если его ещё нет)
let closeBtn = modal.querySelector("#em-lightbox-close");
if (!closeBtn && lightbox) {
  closeBtn = document.createElement("span");
  closeBtn.id = "em-lightbox-close";
  closeBtn.textContent = "×";
  Object.assign(closeBtn.style, {
    position: "absolute",
    top: "15px",
    right: "25px",
    color: "#fff",
    fontSize: "32px",
    fontWeight: "bold",
    cursor: "pointer",
    zIndex: "10001"
  });
  lightbox.appendChild(closeBtn);

  closeBtn.onclick = () => {
    lightbox.style.display = "none";
    lightboxImg.src = "";
  };
}


  modal.style.display = "flex";
}

// --- ЗАКРЫТИЕ МОДАЛКИ ---
closeBtn.onclick = () => (modal.style.display = "none");
window.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});


}
