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

  // 防重複提交
  if (button.disabled) return;

  button.disabled = true;
  button.textContent = "提交中…";
  setFormStatus(form, "", "");

  // 收集表單數據
  const formData = new FormData(form);
  const data = {
    name: formData.get("name")?.toString().trim() || "",
    company: formData.get("company")?.toString().trim() || "",
    contact: formData.get("contact")?.toString().trim() || "",
    interest: formData.get("interest")?.toString().trim() || "",
    message: formData.get("message")?.toString().trim() || "",
  };

  // 客戶端驗證
  if (data.name.length < 2) {
    setFormStatus(form, "請輸入有效的姓名", "error");
    button.disabled = false;
    button.textContent = originalText;
    return;
  }

  if (data.contact.length < 3) {
    setFormStatus(form, "請提供有效的聯絡方式", "error");
    button.disabled = false;
    button.textContent = originalText;
    return;
  }

  if (data.message.length < 10) {
    setFormStatus(form, "需求描述至少需要 10 個字符", "error");
    button.disabled = false;
    button.textContent = originalText;
    return;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    let result;
    try {
      result = await response.json();
    } catch {
      result = { error: "服務暫時不可用" };
    }

    if (!response.ok) {
      throw new Error(result.error || `HTTP ${response.status}`);
    }

    button.textContent = "已收到，我們會盡快聯絡";
    setFormStatus(form, result.message || "提交成功，感謝你的查詢。", "success");
    form.reset();
    window.setTimeout(() => {
      button.textContent = originalText;
    }, 2600);
  } catch (error) {
    button.textContent = originalText;
    setFormStatus(
      form,
      error.message || "提交失敗，請稍後再試或直接聯絡我們。",
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
