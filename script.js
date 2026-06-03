const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const header = document.querySelector("[data-header]");

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const scrollBehavior = prefersReducedMotion ? "auto" : "smooth";

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: scrollBehavior, block: "start" });
  });
});

const setFormStatus = (form, message, state) => {
  const status = form.querySelector(".form-status");
  if (!status) return;
  status.textContent = message;
  status.hidden = !message;
  if (state) {
    status.dataset.state = state;
  } else {
    delete status.dataset.state;
  }
};

const submitContactForm = async (form, button, originalText) => {
  const endpoint = window.UMEDIA_FORM_ENDPOINT?.trim();

  if (!endpoint) {
    setFormStatus(
      form,
      "表單尚未設定提交地址，請聯絡網站管理員。",
      "error",
    );
    return;
  }

  button.disabled = true;
  button.textContent = "提交中…";
  setFormStatus(form, "", "");

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    button.textContent = "已收到，我們會盡快聯絡";
    setFormStatus(form, "提交成功，感謝你的查詢。", "success");
    form.reset();
    window.setTimeout(() => {
      button.textContent = originalText;
    }, 2600);
  } catch {
    button.textContent = originalText;
    setFormStatus(
      form,
      "提交失敗，請稍後再試或直接聯絡我們。",
      "error",
    );
  } finally {
    button.disabled = false;
    if (button.textContent === "提交中…") {
      button.textContent = originalText;
    }
  }
};

document.querySelectorAll(".contact-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;

    const originalText = button.textContent;
    submitContactForm(form, button, originalText);
  });
});
