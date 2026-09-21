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

    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => activate(thumb));
    });
  });
})();
