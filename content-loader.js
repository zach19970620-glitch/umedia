(() => {
  const script = document.currentScript;
  const contentUrl = new URL("content/site.json", script?.src || window.location.href);

  const getValue = (source, path) =>
    path.split(".").reduce((value, key) => value?.[key], source);

  const setText = (element, value) => {
    if (typeof value === "string" || typeof value === "number") {
      element.textContent = value;
    }
  };

  const renderList = (element, items) => {
    if (!Array.isArray(items)) return;
    element.replaceChildren(
      ...items.map((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        return li;
      }),
    );
  };

  const renderValues = (element, items) => {
    if (!Array.isArray(items)) return;
    element.replaceChildren(
      ...items.map((item) => {
        const article = document.createElement("article");
        const number = document.createElement("span");
        const title = document.createElement("h3");
        const copy = document.createElement("p");

        number.textContent = item.number || "";
        title.textContent = item.title || "";
        copy.textContent = item.copy || "";

        article.append(number, title, copy);
        return article;
      }),
    );
  };

  const renderSpecs = (element, specs) => {
    if (!Array.isArray(specs)) return;
    element.replaceChildren(
      ...specs.map((spec) => {
        const row = document.createElement("div");
        const label = document.createElement("span");
        const value = document.createElement("strong");

        label.textContent = spec.label || "";
        value.textContent = spec.value || "";

        row.append(label, value);
        return row;
      }),
    );
  };

  const setFirst = (root, selector, value) => {
    const target = root.querySelector(selector);
    if (target && typeof value === "string") target.textContent = value;
  };

  const renderRepeat = (element, items) => {
    if (!Array.isArray(items)) return;

    [...element.children].forEach((child, index) => {
      const item = items[index];
      if (!item) return;

      setFirst(child, "span", item.number || item.kicker || item.label);
      setFirst(child, "h3", item.title);
      setFirst(child, "p", item.copy);

      const list = child.querySelector("ul");
      if (list && Array.isArray(item.items)) {
        list.replaceChildren(
          ...item.items.map((text) => {
            const li = document.createElement("li");
            li.textContent = text;
            return li;
          }),
        );
      }
    });
  };

  const applyContent = (content) => {
    document.querySelectorAll("[data-cms]").forEach((element) => {
      setText(element, getValue(content, element.dataset.cms));
    });

    document.querySelectorAll("[data-cms-title]").forEach((element) => {
      const value = getValue(content, element.dataset.cmsTitle);
      if (typeof value === "string") document.title = value;
    });

    document.querySelectorAll("[data-cms-attr]").forEach((element) => {
      const rules = element.dataset.cmsAttr.split(",");
      rules.forEach((rule) => {
        const [attribute, path] = rule.split(":");
        const value = getValue(content, path);
        if (attribute && typeof value === "string") {
          element.setAttribute(attribute.trim(), value);
        }
      });
    });

    document.querySelectorAll("[data-cms-image]").forEach((element) => {
      const value = getValue(content, element.dataset.cmsImage);
      if (typeof value === "string" && value) {
        element.setAttribute("src", value);
      }
    });

    document.querySelectorAll("[data-cms-list]").forEach((element) => {
      renderList(element, getValue(content, element.dataset.cmsList));
    });

    document.querySelectorAll("[data-cms-values]").forEach((element) => {
      renderValues(element, getValue(content, element.dataset.cmsValues));
    });

    document.querySelectorAll("[data-cms-specs]").forEach((element) => {
      renderSpecs(element, getValue(content, element.dataset.cmsSpecs));
    });

    document.querySelectorAll("[data-cms-repeat]").forEach((element) => {
      renderRepeat(element, getValue(content, element.dataset.cmsRepeat));
    });
  };

  fetch(contentUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
      return response.json();
    })
    .then(applyContent)
    .catch(() => {
      document.documentElement.dataset.cmsContent = "fallback";
    });
})();
