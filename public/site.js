// 406 Strong — small progressive enhancements. The site works without JavaScript.

// Mobile menu
(() => {
  const toggle = document.querySelector("[data-menu-toggle]");
  const panel = document.getElementById("mobile-nav");
  if (!toggle || !panel) return;

  const setOpen = (open) => {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    toggle.querySelector('[data-menu-icon="open"]').classList.toggle("hidden", open);
    toggle.querySelector('[data-menu-icon="close"]').classList.toggle("hidden", !open);
  };

  toggle.addEventListener("click", () => setOpen(panel.hidden));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });
  matchMedia("(min-width: 768px)").addEventListener("change", (e) => e.matches && setOpen(false));
})();

// Hero slideshow: crossfades background photos. Pauses on hover/focus, when the tab is hidden,
// via the pause button (WCAG 2.2.2), and never autoplays for prefers-reduced-motion.
(() => {
  const root = document.querySelector("[data-carousel]");
  if (!root) return;

  const slides = [...root.querySelectorAll("[data-slide]")];
  const dots = [...root.querySelectorAll("[data-dots] button")];
  const pauseBtn = root.querySelector("[data-pause]");
  const interval = Number(root.dataset.interval) || 7000;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let current = 0;
  let timer = null;
  let userPaused = reducedMotion;
  let hovering = false;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle("opacity-0", !active);
      slide.setAttribute("aria-hidden", String(!active));
      const img = slide.querySelector("img");
      if (active && !reducedMotion) {
        // Restart the slow zoom on the incoming photo.
        img.classList.remove("animate-hero-zoom");
        void img.offsetWidth;
        img.classList.add("animate-hero-zoom");
      }
    });
    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle("w-10", active);
      dot.classList.toggle("bg-white", active);
      dot.classList.toggle("w-5", !active);
      dot.classList.toggle("bg-white/40", !active);
      if (active) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  };

  const stop = () => {
    clearInterval(timer);
    timer = null;
  };
  const start = () => {
    stop();
    if (!userPaused && !hovering && !document.hidden) {
      timer = setInterval(() => show(current + 1), interval);
    }
  };

  const updatePauseButton = () => {
    pauseBtn.setAttribute("aria-label", userPaused ? "Play slideshow" : "Pause slideshow");
    pauseBtn.querySelector('[data-icon="pause"]').classList.toggle("hidden", userPaused);
    pauseBtn.querySelector('[data-icon="play"]').classList.toggle("hidden", !userPaused);
  };

  dots.forEach((dot, i) => dot.addEventListener("click", () => { show(i); start(); }));
  pauseBtn.addEventListener("click", () => {
    userPaused = !userPaused;
    updatePauseButton();
    start();
  });
  root.addEventListener("mouseenter", () => { hovering = true; stop(); });
  root.addEventListener("mouseleave", () => { hovering = false; start(); });
  root.addEventListener("focusin", () => { hovering = true; stop(); });
  root.addEventListener("focusout", (e) => {
    if (!root.contains(e.relatedTarget)) { hovering = false; start(); }
  });
  document.addEventListener("visibilitychange", start);

  updatePauseButton();
  start();
})();

// Contact form: submits to Formspree in the background. If no Formspree form ID is
// configured yet (empty action), falls back to opening the visitor's email app.
(() => {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const status = form.querySelector("[data-form-status]");
  const button = form.querySelector('button[type="submit"]');
  const STATUS_STYLES = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-red-200 bg-red-50 text-red-900",
  };

  const setStatus = (kind, message) => {
    status.className = `rounded-xl border px-4 py-3 text-sm font-medium ${STATUS_STYLES[kind]}`;
    status.textContent = message;
  };

  const validate = () => {
    let firstInvalid = null;
    for (const field of form.querySelectorAll("[required]")) {
      const ok = field.value.trim() !== "" && field.checkValidity();
      field.setAttribute("aria-invalid", String(!ok));
      if (!ok && !firstInvalid) firstInvalid = field;
    }
    if (firstInvalid) {
      setStatus("error", "Please fill in your name, a valid email, and a message.");
      firstInvalid.focus();
      return false;
    }
    return true;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = new FormData(form);

    if (!form.getAttribute("action")) {
      const subject = `406 Strong — ${data.get("interest") || "Website contact"}`;
      const body = `${data.get("message")}\n\n— ${data.get("name")} (${data.get("email")})`;
      window.location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStatus("success", "Your email app should open with your message ready to send.");
      return;
    }

    button.disabled = true;
    button.textContent = "Sending…";
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      form.querySelectorAll("[aria-invalid]").forEach((f) => f.removeAttribute("aria-invalid"));
      setStatus("success", "Thank you—your message is on its way. Sally will reply within one to two business days.");
    } catch {
      setStatus("error", `Sorry, that didn't go through. Please try again or email ${form.dataset.email}.`);
    } finally {
      button.disabled = false;
      button.textContent = "Send message";
    }
  });
})();
