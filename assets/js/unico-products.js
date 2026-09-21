(() => {
  const galleries = document.querySelectorAll("[data-unico-gallery]");

  galleries.forEach((gallery) => {
    const stageImage = gallery.querySelector("[data-gallery-image]");
    const caption = gallery.querySelector("[data-gallery-caption]");
    const thumbs = gallery.querySelectorAll("[data-gallery-thumb]");

    if (!stageImage || thumbs.length === 0) return;

    const activate = (button) => {
      const nextSrc = button.getAttribute("data-src");
      const nextAlt = button.getAttribute("data-alt") || "";
      const nextCaption = button.getAttribute("data-caption") || "";
      const nextWidth = button.getAttribute("data-width");
      const nextHeight = button.getAttribute("data-height");

      if (!nextSrc) return;

      stageImage.src = nextSrc;
      stageImage.alt = nextAlt;
      if (nextWidth) stageImage.setAttribute("width", nextWidth);
      if (nextHeight) stageImage.setAttribute("height", nextHeight);
      if (caption) caption.textContent = nextCaption;

      thumbs.forEach((thumb) => {
        const selected = thumb === button;
        thumb.setAttribute("aria-pressed", selected ? "true" : "false");
        thumb.classList.toggle("is-active", selected);
      });
    };

    const list = [...thumbs];
    const current = () => Math.max(0, list.findIndex((t) => t.getAttribute("aria-pressed") === "true"));
    const counter = document.createElement("span");
    counter.className = "unico-gallery-count";
    counter.setAttribute("aria-live", "polite");
    const stage = stageImage.closest(".unico-gallery-stage");

    const go = (delta) => {
      const next = list[(current() + delta + list.length) % list.length];
      activate(next);
      counter.textContent = `${current() + 1} / ${list.length}`;
      next.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    };

    if (stage && list.length > 1) {
      [["prev", "上一張", "‹", -1], ["next", "下一張", "›", 1]].forEach(([cls, label, glyph, delta]) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `unico-gallery-arrow is-${cls}`;
        btn.setAttribute("aria-label", label);
        btn.textContent = glyph;
        btn.addEventListener("click", () => go(delta));
        stage.appendChild(btn);
      });
      stage.appendChild(counter);
      gallery.tabIndex = 0;
      gallery.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") go(-1);
        else if (event.key === "ArrowRight") go(1);
        else return;
        event.preventDefault();
      });
    }

    const updateCounter = () => {
      counter.textContent = `${current() + 1} / ${list.length}`;
    };

    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        activate(thumb);
        updateCounter();
      });
    });
    updateCounter();
  });
})();

// 詳情頁增強：頁內吸頂導航（含捲動高亮）與區塊淡入
(() => {
  const main = document.querySelector(".unico-page main");
  const hero = main && main.querySelector(".unico-detail-hero .unico-detail-grid");
  if (!main || !hero) return;

  const labels = {
    overview: "概覽",
    highlights: "產品特色",
    gallery: "圖片集",
    specifications: "規格",
    compare: "比較",
    "more products": "其他產品",
  };

  const sections = [...main.querySelectorAll(":scope > section")].slice(1);
  const items = [];
  sections.forEach((section, index) => {
    const eyebrow = section.querySelector(".eyebrow");
    const heading = section.querySelector("h2");
    if (!heading) return;
    if (!section.id) section.id = `unico-section-${index}`;
    const key = eyebrow ? eyebrow.textContent.trim().toLowerCase() : "";
    items.push({ section, label: labels[key] || heading.textContent.trim() });
  });
  if (items.length < 2) return;

  const nav = document.createElement("nav");
  nav.className = "unico-subnav";
  nav.setAttribute("aria-label", "頁內導覽");
  const inner = document.createElement("div");
  inner.className = "container unico-subnav-inner";
  items.forEach(({ section, label }) => {
    const link = document.createElement("a");
    link.href = `#${section.id}`;
    link.textContent = label;
    inner.appendChild(link);
  });
  nav.appendChild(inner);
  main.insertBefore(nav, sections[0]);

  const links = [...inner.querySelectorAll("a")];
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            const on = link.getAttribute("href") === `#${entry.target.id}`;
            link.classList.toggle("is-active", on);
            if (on) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
            if (on && inner.scrollWidth > inner.clientWidth) {
              inner.scrollTo({ left: link.offsetLeft - 20, behavior: "smooth" });
            }
          });
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    items.forEach(({ section }) => spy.observe(section));

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const targets = main.querySelectorAll(".unico-feature-block, .unico-card, .spec-table, .unico-compare, .unico-gallery");
      const reveal = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            reveal.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px" }
      );
      targets.forEach((el) => {
        el.classList.add("unico-reveal");
        reveal.observe(el);
      });
    }
  }
})();
