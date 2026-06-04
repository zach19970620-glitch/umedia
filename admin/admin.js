const api = {
  auth: "/admin/api/auth",
  content: "/admin/api/content",
  logout: "/admin/api/logout",
  upload: "/admin/api/upload",
};

const modules = [
  { id: "site", title: "全站設定", eyebrow: "Global" },
  { id: "homeHero", title: "首頁第一屏", eyebrow: "Homepage" },
  { id: "homeValues", title: "核心價值", eyebrow: "Homepage" },
  { id: "homeUnico", title: "Unico 區塊", eyebrow: "Homepage" },
  { id: "homeProducts", title: "產品矩陣", eyebrow: "Homepage" },
  { id: "homeCapabilities", title: "首頁能力區", eyebrow: "Homepage" },
  { id: "homeSolutions", title: "首頁方案區", eyebrow: "Homepage" },
  { id: "homeTechnology", title: "首頁技術區", eyebrow: "Homepage" },
  { id: "homeAbout", title: "首頁關於區", eyebrow: "Homepage" },
  { id: "homeContact", title: "首頁聯絡", eyebrow: "Homepage" },
  { id: "unicoPage", title: "Unico 頁", eyebrow: "Page" },
  { id: "solutionsPage", title: "方案頁", eyebrow: "Page" },
  { id: "technologyPage", title: "技術頁", eyebrow: "Page" },
  { id: "aboutPage", title: "關於頁", eyebrow: "Page" },
  { id: "ua32", title: "UA32 產品頁", eyebrow: "Product" },
  { id: "ua55", title: "UA55 產品頁", eyebrow: "Product" },
  { id: "contact", title: "聯絡頁", eyebrow: "Contact" },
  { id: "seo", title: "SEO 設定", eyebrow: "Search" },
];

const labels = {
  "site.brand": "品牌名稱",
  "site.headerCta": "右上角按鈕",
  "site.footerCopyright": "頁腳版權",
  "home.seoTitle": "SEO 標題",
  "home.seoDescription": "SEO 描述",
  "home.heroEyebrow": "Hero 小標",
  "home.heroTitle": "Hero 標題",
  "home.heroCopy": "Hero 文案",
  "home.heroImage": "Hero 主圖",
  "home.heroPrimaryCta": "主按鈕文字",
  "home.heroSecondaryCta": "副按鈕文字",
  "home.introEyebrow": "核心價值小標",
  "home.introTitle": "核心價值標題",
  "home.platformTitle": "Unico 區塊標題",
  "home.platformCopy": "Unico 區塊文案",
  "home.platformImage": "Unico 區塊圖片",
  "home.productsTitle": "產品區標題",
  "home.productsCopy": "產品區文案",
  "home.contactTitle": "首頁聯絡標題",
  "home.contactCopy": "首頁聯絡文案",
  "contact.seoTitle": "SEO 標題",
  "contact.seoDescription": "SEO 描述",
  "contact.eyebrow": "小標",
  "contact.title": "標題",
  "contact.summary": "文案",
  "contact.discussionTitle": "Demo 討論內容標題",
  "homeExtra.capabilityOneEyebrow": "第一個能力小標",
  "homeExtra.capabilityOneTitle": "第一個能力標題",
  "homeExtra.capabilityOneCopy": "第一個能力文案",
  "homeExtra.capabilityTwoEyebrow": "第二個能力小標",
  "homeExtra.capabilityTwoTitle": "第二個能力標題",
  "homeExtra.capabilityTwoCopy": "第二個能力文案",
  "homeExtra.solutionsEyebrow": "方案區小標",
  "homeExtra.solutionsTitle": "方案區標題",
  "homeExtra.solutionsCopy": "方案區文案",
  "homeExtra.technologyEyebrow": "技術區小標",
  "homeExtra.technologyTitle": "技術區標題",
  "homeExtra.aboutEyebrow": "關於區小標",
  "homeExtra.aboutTitle": "關於區標題",
  "homeExtra.aboutCopy": "關於區文案",
};

const productLabels = {
  seoTitle: "SEO 標題",
  seoDescription: "SEO 描述",
  kicker: "小標",
  title: "產品標題",
  image: "產品主圖",
  summary: "產品摘要",
  positioningTitle: "定位標題",
  positioningCopy: "定位文案",
  specsTitle: "規格標題",
  useCaseTitle: "場景標題",
  ctaTitle: "底部 CTA 標題",
};

["ua32", "ua55"].forEach((productKey) => {
  Object.entries(productLabels).forEach(([key, label]) => {
    labels[`products.${productKey}.${key}`] = `${productKey.toUpperCase()} ${label}`;
  });
});

["unico", "solutions", "technology", "about"].forEach((pageKey) => {
  const prefix = `pages.${pageKey}`;
  labels[`${prefix}.seoTitle`] = "SEO 標題";
  labels[`${prefix}.seoDescription`] = "SEO 描述";
  labels[`${prefix}.eyebrow`] = "頁面小標";
  labels[`${prefix}.title`] = "頁面標題";
  labels[`${prefix}.image`] = "頁面主圖";
  labels[`${prefix}.summary`] = "頁面文案";
  labels[`${prefix}.ctaTitle`] = "底部 CTA 標題";
});

Object.assign(labels, {
  "pages.unico.workflowEyebrow": "工作流程小標",
  "pages.unico.workflowTitle": "工作流程標題",
  "pages.unico.workflowCopy": "工作流程文案",
  "pages.unico.modulesTitle": "功能模組標題",
  "pages.solutions.flowTitle": "核心流程標題",
  "pages.solutions.featuredTitle": "高頻場景標題",
  "pages.solutions.matrixTitle": "行業矩陣標題",
  "pages.solutions.hardwareTitle": "硬件搭配標題",
  "pages.solutions.hardwareCopy": "硬件搭配文案",
  "pages.technology.directionTitle": "技術方向標題",
  "pages.technology.directionCopy": "技術方向文案",
  "pages.technology.modulesTitle": "技術模組標題",
  "pages.about.missionTitle": "使命標題",
  "pages.about.missionCopy": "使命文案",
  "pages.about.whyTitle": "原因區標題",
  "pages.about.whyCopy": "原因區文案",
  "pages.about.teamTitle": "團隊區標題",
});

const requiredPaths = new Set([
  "site.brand",
  "site.headerCta",
  "home.heroTitle",
  "home.heroCopy",
  "products.ua32.title",
  "products.ua32.summary",
  "products.ua55.title",
  "products.ua55.summary",
  "contact.title",
  "contact.summary",
]);

let content = null;
let activeModule = "site";
let isDirty = false;
let lastSavedAt = "";

const loginPanel = document.querySelector("[data-login]");
const loginForm = document.querySelector("[data-login-form]");
const loginStatus = document.querySelector("[data-login-status]");
const editorTemplate = document.querySelector("[data-editor-template]");
let editorPanel = null;
let editorStatus = null;
let contentForm = null;
let moduleNav = null;
let currentTitle = null;
let currentEyebrow = null;
let saveButton = null;
let saveState = null;
let logoutButton = null;

const showStatus = (element, message, state = "") => {
  element.textContent = message;
  element.hidden = !message;
  if (state) {
    element.dataset.state = state;
  } else {
    delete element.dataset.state;
  }
};

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.message || "操作失敗");
  }
  return data;
};

const getValue = (path) =>
  path.split(".").reduce((value, key) => value?.[key], content);

const setValue = (path, value) => {
  const keys = path.split(".");
  const last = keys.pop();
  const target = keys.reduce((current, key) => current[key], content);
  target[last] = value;
  markDirty();
};

const markDirty = () => {
  isDirty = true;
  saveButton.disabled = false;
  saveState.textContent = "有未保存修改";
  saveState.classList.add("is-dirty");
};

const mountEditor = () => {
  if (editorPanel) return;
  const fragment = editorTemplate.content.cloneNode(true);
  document.querySelector(".admin-shell").append(fragment);

  editorPanel = document.querySelector("[data-editor]");
  editorStatus = editorPanel.querySelector("[data-editor-status]");
  contentForm = editorPanel.querySelector("[data-content-form]");
  moduleNav = editorPanel.querySelector("[data-module-nav]");
  currentTitle = editorPanel.querySelector("[data-current-title]");
  currentEyebrow = editorPanel.querySelector("[data-current-eyebrow]");
  saveButton = editorPanel.querySelector("[data-save]");
  saveState = editorPanel.querySelector("[data-save-state]");
  logoutButton = editorPanel.querySelector("[data-logout]");

  editorPanel
    .querySelector("[data-refresh]")
    .addEventListener("click", loadContent);
  saveButton.addEventListener("click", saveContent);
  logoutButton.addEventListener("click", logout);
};

const destroyLogin = () => {
  loginPanel?.remove();
};

const markClean = () => {
  isDirty = false;
  saveButton.disabled = true;
  saveState.classList.remove("is-dirty");
  saveState.textContent = lastSavedAt ? `已保存 ${lastSavedAt}` : "已同步";
};

const confirmDiscard = () =>
  !isDirty || window.confirm("目前有未保存修改，確定要放棄並重新載入嗎？");

const createSection = (title, description = "") => {
  const section = document.createElement("section");
  section.className = "section";

  const header = document.createElement("div");
  header.className = "section-header";
  const heading = document.createElement("h2");
  heading.textContent = title;
  header.append(heading);
  if (description) {
    const copy = document.createElement("p");
    copy.textContent = description;
    header.append(copy);
  }

  const body = document.createElement("div");
  body.className = "section-body";
  section.append(header, body);
  contentForm.append(section);
  return body;
};

const isLongField = (path) =>
  path.toLowerCase().includes("description") ||
  path.toLowerCase().includes("copy") ||
  path.toLowerCase().includes("summary");

const createField = (path, options = {}) => {
  const label = document.createElement("label");
  label.className = "field";
  if (requiredPaths.has(path)) label.classList.add("is-required");

  const title = document.createElement("span");
  title.textContent = options.label || labels[path] || path;

  const input = document.createElement(options.multiline ?? isLongField(path) ? "textarea" : "input");
  if (input.tagName === "TEXTAREA") input.rows = options.rows || 4;
  input.value = getValue(path) || "";
  input.addEventListener("input", () => {
    setValue(path, input.value);
    validateInput(label, input, path);
  });

  const hint = document.createElement("small");
  hint.textContent = options.hint || "";
  hint.dataset.default = options.hint || "";

  label.append(title, input, hint);
  validateInput(label, input, path);
  return label;
};

const validateInput = (wrapper, input, path) => {
  const hint = wrapper.querySelector("small");
  const isRequired = requiredPaths.has(path);
  const empty = !input.value.trim();

  wrapper.classList.toggle("has-error", isRequired && empty);
  if (isRequired && empty) {
    hint.textContent = "此欄位不能留空";
  } else if (path.toLowerCase().includes("description")) {
    hint.textContent = `${input.value.length} 字，建議控制在 80-160 字`;
  } else {
    hint.textContent = hint.dataset.default || "";
  }
};

const createGrid = (paths) => {
  const grid = document.createElement("div");
  grid.className = "two-col";
  paths.forEach((path) => grid.append(createField(path)));
  return grid;
};

const fileToBase64 = (file) =>
  new Promise((resolveFile, rejectFile) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const result = String(reader.result || "");
      resolveFile(result.split(",")[1] || "");
    });
    reader.addEventListener("error", () => rejectFile(new Error("圖片讀取失敗")));
    reader.readAsDataURL(file);
  });

const uploadImage = async (file) => {
  const data = await fileToBase64(file);
  return request(api.upload, {
    method: "POST",
    body: JSON.stringify({
      name: file.name,
      type: file.type,
      data,
    }),
  });
};

const createImageField = (path, labelText) => {
  const wrapper = document.createElement("div");
  wrapper.className = "image-field";

  const title = document.createElement("p");
  title.className = "group-title";
  title.textContent = labelText || labels[path] || "圖片";

  const preview = document.createElement("img");
  preview.alt = title.textContent;
  preview.src = getValue(path) || "";

  const pathInput = document.createElement("input");
  pathInput.value = getValue(path) || "";
  pathInput.placeholder = "/assets/uploads/example.webp";
  pathInput.addEventListener("input", () => {
    setValue(path, pathInput.value);
    preview.src = pathInput.value;
  });

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/png,image/jpeg,image/webp";

  const status = document.createElement("small");
  status.textContent = "支援 JPG、PNG、WebP，單張不超過 5MB。";

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      status.textContent = "圖片大小不能超過 5MB。";
      status.dataset.state = "error";
      return;
    }

    status.textContent = "正在上傳圖片...";
    delete status.dataset.state;

    try {
      const result = await uploadImage(file);
      setValue(path, result.path);
      pathInput.value = result.path;
      preview.src = result.path;
      status.textContent = "圖片已上傳，請點擊保存修改。";
      status.dataset.state = "success";
      fileInput.value = "";
    } catch (error) {
      status.textContent = error.message;
      status.dataset.state = "error";
    }
  });

  wrapper.append(title, preview, pathInput, fileInput, status);
  return wrapper;
};

const moveArrayItem = (items, index, direction) => {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return;
  const [item] = items.splice(index, 1);
  items.splice(nextIndex, 0, item);
  markDirty();
};

const makeIconButton = (text, title, onClick) => {
  const button = document.createElement("button");
  button.className = "icon-button";
  button.type = "button";
  button.textContent = text;
  button.title = title;
  button.addEventListener("click", onClick);
  return button;
};

const makeRemoveButton = (onClick) => {
  const button = document.createElement("button");
  button.className = "remove";
  button.type = "button";
  button.textContent = "刪除";
  button.addEventListener("click", () => {
    if (window.confirm("確定刪除這一項嗎？")) onClick();
  });
  return button;
};

const createListEditor = (title, path) => {
  const wrapper = document.createElement("div");
  wrapper.className = "list-editor";

  const header = document.createElement("div");
  header.className = "editor-list-header";
  header.innerHTML = `<p class="group-title">${title}</p>`;

  const add = document.createElement("button");
  add.className = "ghost";
  add.type = "button";
  add.textContent = "新增一項";

  const rows = document.createElement("div");
  rows.className = "list-editor";

  const render = () => {
    rows.replaceChildren();
    const items = getValue(path) || [];
    items.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "list-item";
      const input = document.createElement("textarea");
      input.rows = 2;
      input.value = item;
      input.addEventListener("input", () => {
        items[index] = input.value;
        markDirty();
      });

      row.append(
        input,
        makeIconButton("↑", "上移", () => {
          moveArrayItem(items, index, -1);
          render();
        }),
        makeIconButton("↓", "下移", () => {
          moveArrayItem(items, index, 1);
          render();
        }),
        makeRemoveButton(() => {
          if (items.length <= 1) {
            showStatus(editorStatus, "至少保留一項內容。", "error");
            return;
          }
          items.splice(index, 1);
          markDirty();
          render();
        }),
      );
      rows.append(row);
    });
  };

  add.addEventListener("click", () => {
    getValue(path).push("新內容");
    markDirty();
    render();
  });

  render();
  header.append(add);
  wrapper.append(header, rows);
  return wrapper;
};

const createSpecsEditor = (title, path) => {
  const wrapper = document.createElement("div");
  wrapper.className = "spec-editor";

  const header = document.createElement("div");
  header.className = "editor-list-header";
  header.innerHTML = `<p class="group-title">${title}</p>`;

  const add = document.createElement("button");
  add.className = "ghost";
  add.type = "button";
  add.textContent = "新增規格";

  const rows = document.createElement("div");
  rows.className = "spec-editor";

  const render = () => {
    rows.replaceChildren();
    const specs = getValue(path) || [];
    specs.forEach((spec, index) => {
      const row = document.createElement("div");
      row.className = "spec-row";
      const label = document.createElement("input");
      const value = document.createElement("input");
      label.placeholder = "名稱";
      value.placeholder = "內容";
      label.value = spec.label || "";
      value.value = spec.value || "";
      label.addEventListener("input", () => {
        specs[index].label = label.value;
        markDirty();
      });
      value.addEventListener("input", () => {
        specs[index].value = value.value;
        markDirty();
      });
      row.append(
        label,
        value,
        makeIconButton("↑", "上移", () => {
          moveArrayItem(specs, index, -1);
          render();
        }),
        makeIconButton("↓", "下移", () => {
          moveArrayItem(specs, index, 1);
          render();
        }),
        makeRemoveButton(() => {
          if (specs.length <= 1) {
            showStatus(editorStatus, "至少保留一行規格。", "error");
            return;
          }
          specs.splice(index, 1);
          markDirty();
          render();
        }),
      );
      rows.append(row);
    });
  };

  add.addEventListener("click", () => {
    getValue(path).push({ label: "規格名稱", value: "規格內容" });
    markDirty();
    render();
  });

  render();
  header.append(add);
  wrapper.append(header, rows);
  return wrapper;
};

const createValuesEditor = () => {
  const wrapper = document.createElement("div");
  wrapper.className = "value-editor";
  wrapper.innerHTML = `<p class="group-title">三個核心價值</p>`;
  const rows = document.createElement("div");
  rows.className = "value-editor";

  content.home.values.forEach((item) => {
    const row = document.createElement("div");
    row.className = "value-row";
    const number = document.createElement("input");
    const title = document.createElement("input");
    const copy = document.createElement("textarea");
    number.placeholder = "序號";
    title.placeholder = "標題";
    copy.placeholder = "文案";
    number.value = item.number || "";
    title.value = item.title || "";
    copy.value = item.copy || "";
    copy.rows = 2;
    number.addEventListener("input", () => {
      item.number = number.value;
      markDirty();
    });
    title.addEventListener("input", () => {
      item.title = title.value;
      markDirty();
    });
    copy.addEventListener("input", () => {
      item.copy = copy.value;
      markDirty();
    });
    row.append(number, title, copy);
    rows.append(row);
  });

  wrapper.append(rows);
  return wrapper;
};

const createCardsEditor = (title, path, options = {}) => {
  const wrapper = document.createElement("div");
  wrapper.className = "value-editor";

  const header = document.createElement("div");
  header.className = "editor-list-header";
  header.innerHTML = `<p class="group-title">${title}</p>`;

  const rows = document.createElement("div");
  rows.className = "value-editor";

  const render = () => {
    rows.replaceChildren();
    const cards = getValue(path) || [];
    cards.forEach((card, index) => {
      const row = document.createElement("div");
      row.className = "card-row";

      if (options.badge !== false) {
        const badge = document.createElement("input");
        badge.placeholder = "標籤 / 序號";
        badge.value = card.number || card.kicker || card.label || "";
        badge.addEventListener("input", () => {
          if ("number" in card) card.number = badge.value;
          else if ("kicker" in card) card.kicker = badge.value;
          else card.label = badge.value;
          markDirty();
        });
        row.append(badge);
      }

      const cardTitle = document.createElement("input");
      cardTitle.placeholder = "標題";
      cardTitle.value = card.title || "";
      cardTitle.addEventListener("input", () => {
        card.title = cardTitle.value;
        markDirty();
      });

      const copy = document.createElement("textarea");
      copy.placeholder = "文案";
      copy.rows = 2;
      copy.value = card.copy || "";
      copy.addEventListener("input", () => {
        card.copy = copy.value;
        markDirty();
      });

      row.append(cardTitle, copy);

      if (Array.isArray(card.items)) {
        const items = document.createElement("textarea");
        items.placeholder = "列表項目，每行一個";
        items.rows = 3;
        items.value = card.items.join("\n");
        items.addEventListener("input", () => {
          card.items = items.value
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean);
          markDirty();
        });
        row.append(items);
      }

      rows.append(row);
      if (index < cards.length - 1) {
        const divider = document.createElement("hr");
        divider.className = "row-divider";
        rows.append(divider);
      }
    });
  };

  render();
  wrapper.append(header, rows);
  return wrapper;
};

const renderProduct = (productKey) => {
  const prefix = `products.${productKey}`;

  Object.entries(productLabels).forEach(([key, label]) => {
    labels[`${prefix}.${key}`] = label;
  });

  const hero = createSection("產品主內容", "頁面第一屏和產品定位，這些是銷售最常用的文案。");
  hero.append(
    createImageField(`${prefix}.image`, `${productKey.toUpperCase()} 產品主圖`),
    createGrid([
      `${prefix}.kicker`,
      `${prefix}.title`,
      `${prefix}.summary`,
      `${prefix}.positioningTitle`,
      `${prefix}.positioningCopy`,
      `${prefix}.ctaTitle`,
    ]),
  );

  const lists = createSection("亮點與場景", "可新增、刪除或上下調整順序。");
  lists.append(
    createListEditor("核心亮點", `${prefix}.highlights`),
    createListEditor("使用場景", `${prefix}.useCases`),
  );

  const specs = createSection("主要規格", "左側是規格名稱，右側是對應內容。");
  specs.append(createField(`${prefix}.specsTitle`), createSpecsEditor("規格表", `${prefix}.specs`));

};

const renderActiveModule = () => {
  contentForm.replaceChildren();
  const module = modules.find((item) => item.id === activeModule);
  currentTitle.textContent = module.title;
  currentEyebrow.textContent = module.eyebrow;

  if (activeModule === "site") {
    const section = createSection("全站設定", "影響所有頁面的品牌名稱、右上角按鈕和頁腳版權。");
    section.append(createGrid(["site.brand", "site.headerCta", "site.footerCopyright"]));
  }

  if (activeModule === "homeHero") {
    const hero = createSection("首頁 Hero", "網站首頁第一屏，建議保持短、清楚、有行動引導。");
    hero.append(
      createImageField("home.heroImage", "首頁第一屏主圖"),
      createGrid([
        "home.heroEyebrow",
        "home.heroTitle",
        "home.heroCopy",
        "home.heroPrimaryCta",
        "home.heroSecondaryCta",
      ]),
    );
  }

  if (activeModule === "homeValues") {
    const intro = createSection("核心價值", "首頁第二屏的三個價值點。");
    intro.append(
      createGrid(["home.introEyebrow", "home.introTitle"]),
      createValuesEditor(),
    );
  }

  if (activeModule === "homeUnico") {
    const unico = createSection("Unico 區塊", "首頁介紹 Unico 智慧雲店系統的區域。");
    unico.append(
      createImageField("home.platformImage", "Unico 區塊圖片"),
      createGrid([
        "home.platformTitle",
        "home.platformCopy",
      ]),
    );
  }

  if (activeModule === "homeProducts") {
    const products = createSection("產品矩陣", "首頁兩個產品卡片上方的標題與說明，以及產品卡片摘要。");
    products.append(
      createGrid([
        "home.productsTitle",
        "home.productsCopy",
        "products.ua32.title",
        "products.ua32.summary",
        "products.ua55.title",
        "products.ua55.summary",
      ]),
    );
  }

  if (activeModule === "homeCapabilities") {
    const section = createSection("首頁能力區", "首頁中段兩個能力說明：AI 內容生成與雲端屏幕管理。");
    section.append(
      createGrid([
        "homeExtra.capabilityOneEyebrow",
        "homeExtra.capabilityOneTitle",
        "homeExtra.capabilityOneCopy",
        "homeExtra.capabilityTwoEyebrow",
        "homeExtra.capabilityTwoTitle",
        "homeExtra.capabilityTwoCopy",
      ]),
    );
  }

  if (activeModule === "homeSolutions") {
    const section = createSection("首頁方案區", "首頁行業方案區塊和五個方案卡片。");
    section.append(
      createGrid([
        "homeExtra.solutionsEyebrow",
        "homeExtra.solutionsTitle",
        "homeExtra.solutionsCopy",
      ]),
      createCardsEditor("方案卡片", "homeExtra.solutionCards", { badge: false }),
    );
  }

  if (activeModule === "homeTechnology") {
    const section = createSection("首頁技術區", "首頁核心技術區塊和六個技術卡片。");
    section.append(
      createGrid([
        "homeExtra.technologyEyebrow",
        "homeExtra.technologyTitle",
      ]),
      createCardsEditor("技術卡片", "homeExtra.techCards"),
    );
  }

  if (activeModule === "homeAbout") {
    const section = createSection("首頁關於區", "首頁關於 Umedia 和團隊簡介。");
    section.append(
      createGrid([
        "homeExtra.aboutEyebrow",
        "homeExtra.aboutTitle",
        "homeExtra.aboutCopy",
      ]),
      createCardsEditor("團隊卡片", "homeExtra.teamCards", { badge: false }),
    );
  }

  if (activeModule === "homeContact") {
    const contact = createSection("首頁聯絡區", "首頁底部表單旁邊的引導文案。");
    contact.append(
      createGrid([
        "home.contactTitle",
        "home.contactCopy",
      ]),
    );
  }

  if (activeModule === "unicoPage") {
    const hero = createSection("Unico 頁主內容", "Unico 詳情頁第一屏和工作流程。");
    hero.append(
      createImageField("pages.unico.image", "Unico 頁主圖"),
      createGrid([
        "pages.unico.eyebrow",
        "pages.unico.title",
        "pages.unico.summary",
        "pages.unico.workflowEyebrow",
        "pages.unico.workflowTitle",
        "pages.unico.workflowCopy",
        "pages.unico.modulesTitle",
        "pages.unico.ctaTitle",
      ]),
      createCardsEditor("工作流程", "pages.unico.workflow"),
      createCardsEditor("功能模組", "pages.unico.modules"),
    );
  }

  if (activeModule === "solutionsPage") {
    const section = createSection("方案頁主內容", "行業方案頁第一屏、核心流程和底部 CTA。");
    section.append(
      createImageField("pages.solutions.image", "方案頁主圖"),
      createGrid([
        "pages.solutions.eyebrow",
        "pages.solutions.title",
        "pages.solutions.summary",
        "pages.solutions.flowTitle",
        "pages.solutions.featuredTitle",
        "pages.solutions.matrixTitle",
        "pages.solutions.hardwareTitle",
        "pages.solutions.hardwareCopy",
        "pages.solutions.ctaTitle",
      ]),
      createCardsEditor("方案流程", "pages.solutions.flow"),
      createCardsEditor("高頻場景", "pages.solutions.featured", { badge: false }),
      createCardsEditor("行業矩陣", "pages.solutions.matrix", { badge: false }),
      createListEditor("硬件搭配建議", "pages.solutions.hardwareItems"),
    );
  }

  if (activeModule === "technologyPage") {
    const section = createSection("技術頁主內容", "核心技術頁第一屏、技術方向和底部 CTA。");
    section.append(
      createImageField("pages.technology.image", "技術頁主圖"),
      createGrid([
        "pages.technology.eyebrow",
        "pages.technology.title",
        "pages.technology.summary",
        "pages.technology.directionTitle",
        "pages.technology.directionCopy",
        "pages.technology.modulesTitle",
        "pages.technology.ctaTitle",
      ]),
      createCardsEditor("八大核心技術", "pages.technology.modules"),
    );
  }

  if (activeModule === "aboutPage") {
    const section = createSection("關於頁主內容", "關於頁第一屏、使命、團隊區塊和底部 CTA。");
    section.append(
      createImageField("pages.about.image", "關於頁主圖"),
      createGrid([
        "pages.about.eyebrow",
        "pages.about.title",
        "pages.about.summary",
        "pages.about.missionTitle",
        "pages.about.missionCopy",
        "pages.about.whyTitle",
        "pages.about.whyCopy",
        "pages.about.teamTitle",
        "pages.about.ctaTitle",
      ]),
      createCardsEditor("原因卡片", "pages.about.stories", { badge: false }),
      createCardsEditor("團隊卡片", "pages.about.people"),
    );
  }

  if (activeModule === "seo") {
    const homeSeo = createSection("首頁 SEO", "搜索引擎看到的首頁標題與描述。");
    homeSeo.append(createGrid(["home.seoTitle", "home.seoDescription"]));

    const ua32Seo = createSection("UA32 SEO", "UA32 產品頁的搜索標題與描述。");
    ua32Seo.append(createGrid(["products.ua32.seoTitle", "products.ua32.seoDescription"]));

    const ua55Seo = createSection("UA55 SEO", "UA55 產品頁的搜索標題與描述。");
    ua55Seo.append(createGrid(["products.ua55.seoTitle", "products.ua55.seoDescription"]));

    const contactSeo = createSection("聯絡頁 SEO", "聯絡頁的搜索標題與描述。");
    contactSeo.append(createGrid(["contact.seoTitle", "contact.seoDescription"]));

    const pageSeo = createSection("其他頁面 SEO", "Unico、方案、技術、關於頁的搜索標題與描述。");
    pageSeo.append(
      createGrid([
        "pages.unico.seoTitle",
        "pages.unico.seoDescription",
        "pages.solutions.seoTitle",
        "pages.solutions.seoDescription",
        "pages.technology.seoTitle",
        "pages.technology.seoDescription",
        "pages.about.seoTitle",
        "pages.about.seoDescription",
      ]),
    );
  }

  if (activeModule === "ua32") renderProduct("ua32");
  if (activeModule === "ua55") renderProduct("ua55");

  if (activeModule === "contact") {
    const hero = createSection("聯絡頁主內容", "預約示範頁的主標題和說明。");
    hero.append(
      createGrid([
        "contact.eyebrow",
        "contact.title",
        "contact.summary",
        "contact.discussionTitle",
      ]),
      createCardsEditor("Demo 討論卡片", "contact.discussionItems", { badge: false }),
    );

  }
};

const renderNav = () => {
  moduleNav.replaceChildren(
    ...modules.map((module) => {
      const button = document.createElement("button");
      button.className = "module-button";
      button.type = "button";
      button.classList.toggle("is-active", module.id === activeModule);
      button.innerHTML = `<span class="module-dot"></span><span>${module.title}</span>`;
      button.addEventListener("click", () => {
        activeModule = module.id;
        renderNav();
        renderActiveModule();
      });
      return button;
    }),
  );
};

const validateContent = () => {
  const missing = [...requiredPaths].filter((path) => !String(getValue(path) || "").trim());
  if (missing.length) {
    showStatus(editorStatus, `請補齊必填欄位：${missing.map((path) => labels[path] || path).join("、")}`, "error");
    return false;
  }
  return true;
};

const renderEditor = () => {
  renderNav();
  renderActiveModule();
};

const loadContent = async () => {
  if (!confirmDiscard()) return;
  showStatus(editorStatus, "正在載入內容...");
  const data = await request(api.content);
  content = data.content;
  renderEditor();
  lastSavedAt = "";
  markClean();
  showStatus(editorStatus, "內容已載入。", "success");
};

const showEditor = async () => {
  mountEditor();
  destroyLogin();
  await loadContent();
};

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showStatus(loginStatus, "正在登入...");
  try {
    await request(api.auth, {
      method: "POST",
      body: JSON.stringify({ password: loginForm.password.value }),
    });
    loginForm.reset();
    showStatus(loginStatus, "");
    await showEditor();
  } catch (error) {
    showStatus(loginStatus, error.message, "error");
  }
});

const saveContent = async () => {
  if (!validateContent()) return;
  showStatus(editorStatus, "正在保存...");
  try {
    await request(api.content, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
    lastSavedAt = new Date().toLocaleTimeString("zh-Hant", {
      hour: "2-digit",
      minute: "2-digit",
    });
    markClean();
    showStatus(editorStatus, "已保存，刷新前台頁面即可看到最新內容。", "success");
  } catch (error) {
    showStatus(editorStatus, error.message, "error");
  }
};

const logout = async () => {
  if (isDirty && !window.confirm("目前有未保存修改，確定要退出登入嗎？")) {
    return;
  }

  try {
    await request(api.logout, { method: "POST", body: "{}" });
  } finally {
    window.location.href = "/admin/";
  }
};

window.addEventListener("beforeunload", (event) => {
  if (!isDirty) return;
  event.preventDefault();
  event.returnValue = "";
});

request(api.auth)
  .then((data) => {
    if (data.authenticated) showEditor();
  })
  .catch(() => {
    showStatus(loginStatus, "後台 API 尚未配置完成。", "error");
  });
