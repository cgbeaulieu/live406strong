// 406 Strong — progressive enhancements. Every feature degrades gracefully without JavaScript.

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Header: solid background once the page scrolls.
(() => {
  const header = document.querySelector("[data-header]");
  if (!header) return;
  const update = () => header.toggleAttribute("data-scrolled", scrollY > 8);
  update();
  addEventListener("scroll", update, { passive: true });
})();

// Mobile menu sheet: focus moves in, Escape closes, focus returns to the button.
(() => {
  const menu = document.querySelector("[data-menu]");
  const openBtn = document.querySelector("[data-menu-open]");
  if (!menu || !openBtn) return;
  const closeBtn = menu.querySelector("[data-menu-close]");

  const setOpen = (open) => {
    menu.toggleAttribute("data-open", open);
    openBtn.setAttribute("aria-expanded", String(open));
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open) closeBtn.focus();
  };

  openBtn.addEventListener("click", () => setOpen(true));
  closeBtn.addEventListener("click", () => { setOpen(false); openBtn.focus(); });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  menu.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { setOpen(false); openBtn.focus(); }
    if (e.key !== "Tab") return;
    const focusable = [...menu.querySelectorAll("a, button")];
    const [first, last] = [focusable[0], focusable[focusable.length - 1]];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  matchMedia("(min-width: 1024px)").addEventListener("change", (e) => e.matches && setOpen(false));
})();

// Reveal-on-scroll (CSS only hides elements when JS is on and motion is allowed).
// Content must never stay hidden: anything on screen at load shows immediately, keyboard
// focus reveals its section, and a safety timer reveals everything if observers never fire.
(() => {
  const items = [...document.querySelectorAll(".reveal")];
  const show = (el) => el.classList.add("is-visible");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    items.forEach(show);
    return;
  }
  let observerAlive = false;
  const io = new IntersectionObserver((entries) => {
    observerAlive = true;
    for (const entry of entries) {
      if (entry.isIntersecting) {
        show(entry.target);
        io.unobserve(entry.target);
      }
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  for (const el of items) {
    if (el.getBoundingClientRect().top < innerHeight) setTimeout(() => show(el), 30);
    else io.observe(el);
  }
  document.addEventListener("focusin", (e) => e.target.closest?.(".reveal") && show(e.target.closest(".reveal")));
  // A healthy observer reports every element once right away; if it never does, show everything.
  setTimeout(() => observerAlive || items.forEach(show), 2500);
})();

// Scrollspy: underline the nav link for the section in view.
(() => {
  const links = new Map([...document.querySelectorAll("[data-spy]")].map((a) => [a.dataset.spy, a]));
  if (!links.size) return;
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const link = links.get(entry.target.id);
      if (!link) continue;
      if (entry.isIntersecting) {
        links.forEach((l) => l.removeAttribute("aria-current"));
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  }, { rootMargin: "-45% 0px -50% 0px" });
  links.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) io.observe(section);
  });
})();

// Mobile call-to-action bar: appears after the hero, steps aside at the contact form.
(() => {
  const bar = document.querySelector("[data-cta-bar]");
  const hero = document.getElementById("top");
  const contact = document.getElementById("contact");
  if (!bar || !hero || !contact) return;
  let pastHero = false;
  let atContact = false;
  const update = () => {
    const show = pastHero && !atContact;
    bar.toggleAttribute("data-show", show);
    bar.inert = !show;
  };
  update();
  new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; update(); }).observe(hero);
  new IntersectionObserver(([e]) => { atContact = e.isIntersecting; update(); }).observe(contact);
})();

// Contact form: sends to Formspree in the background. Until a Formspree ID is configured
// (empty action), it opens the visitor's email app with the message ready to send.
(() => {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const status = form.querySelector("[data-form-status]");
  const label = form.querySelector("[data-submit-label]");
  const button = form.querySelector('button[type="submit"]');
  const STYLES = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-red-200 bg-red-50 text-red-900",
  };

  const setStatus = (kind, message) => {
    status.className = `mt-6 rounded-2xl border px-5 py-4 text-sm font-medium ${STYLES[kind]}`;
    status.textContent = message;
  };

  // Validate on blur once a field has been touched, and everything on submit.
  const check = (field) => {
    const ok = field.value.trim() !== "" && field.checkValidity();
    field.setAttribute("aria-invalid", String(!ok));
    return ok;
  };
  form.querySelectorAll("[required]").forEach((field) => {
    field.addEventListener("blur", () => field.value && check(field));
    field.addEventListener("input", () => field.getAttribute("aria-invalid") === "true" && check(field));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const invalid = [...form.querySelectorAll("[required]")].filter((f) => !check(f));
    if (invalid.length) {
      setStatus("error", "Please add your name and a valid email so Sally can reply.");
      invalid[0].focus();
      return;
    }

    const data = new FormData(form);
    const interests = data.getAll("interests");
    data.delete("interests");
    data.set("interests", interests.join(", ") || "Not specified");

    if (!form.getAttribute("action")) {
      const body = [
        `Hi Sally,`,
        ``,
        data.get("message") || "I'd like to set up a free consultation.",
        ``,
        `Interested in: ${data.get("interests")}`,
        data.get("phone") ? `Phone: ${data.get("phone")}` : "",
        ``,
        `— ${data.get("name")}`,
      ].filter((line, i, all) => line !== "" || all[i - 1] !== "").join("\n");
      location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent("Free consultation request")}&body=${encodeURIComponent(body)}`;
      setStatus("success", "Your email app should open with your note ready to send.");
      return;
    }

    button.disabled = true;
    label.textContent = "Sending…";
    try {
      const response = await fetch(form.action, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      form.querySelectorAll("[aria-invalid]").forEach((f) => f.removeAttribute("aria-invalid"));
      setStatus("success", `Thank you, ${data.get("name").split(" ")[0]}! Your note is on its way. Sally will reply personally, usually within one to two business days.`);
    } catch {
      setStatus("error", `Sorry, that didn't go through. Please try again, or email ${form.dataset.email}.`);
    } finally {
      button.disabled = false;
      label.textContent = "Send to Sally";
    }
  });
})();
