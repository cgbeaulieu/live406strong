// Imported FIRST from application.js — runs even if Stimulus/controllers fail to load later.

function carouselParseInterval(root) {
  const raw = root.getAttribute("data-carousel-interval")
  if (!raw) return 8000
  const n = parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : 8000
}

function mountCarousels() {
  document.querySelectorAll("[data-carousel-root]").forEach((root) => {
    if (root.dataset.carouselMounted === "true") return

    const slides = [...root.querySelectorAll("[data-carousel-slide]")]
    if (slides.length === 0) return

    root.dataset.carouselMounted = "true"

    const dots = [...root.querySelectorAll("[data-carousel-dot]")]
    const prevBtn = root.querySelector("[data-carousel-prev]")
    const nextBtn = root.querySelector("[data-carousel-next]")

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const count = slides.length
    let current = 0

    const ac = new AbortController()
    root._carouselAbort = ac
    const sig = { signal: ac.signal }

    function show(i) {
      current = ((i % count) + count) % count
      slides.forEach((slide, idx) => {
        const active = idx === current
        slide.classList.toggle("opacity-100", active)
        slide.classList.toggle("opacity-0", !active)
        slide.classList.toggle("z-10", active)
        slide.classList.toggle("z-0", !active)
        slide.classList.toggle("pointer-events-auto", active)
        slide.classList.toggle("pointer-events-none", !active)
        slide.setAttribute("aria-hidden", String(!active))
      })
      dots.forEach((dot, idx) => {
        const on = idx === current
        dot.setAttribute("aria-selected", String(on))
        dot.setAttribute("tabindex", on ? "0" : "-1")
        dot.classList.toggle("bg-white", on)
        dot.classList.toggle("bg-white/45", !on)
        dot.classList.toggle("w-8", on)
        dot.classList.toggle("w-2.5", !on)
      })
    }

    function stopTimer() {
      if (root._carouselTimer) {
        clearInterval(root._carouselTimer)
        root._carouselTimer = null
      }
    }

    function startTimer() {
      stopTimer()
      const ms = carouselParseInterval(root)
      if (prefersReduced || ms <= 0) return
      root._carouselTimer = window.setInterval(() => {
        show(current + 1)
      }, ms)
    }

    function resetTimer() {
      if (prefersReduced || carouselParseInterval(root) <= 0) return
      stopTimer()
      startTimer()
    }

    function next(e) {
      e?.preventDefault()
      e?.stopPropagation()
      show(current + 1)
      resetTimer()
    }

    function prev(e) {
      e?.preventDefault()
      e?.stopPropagation()
      show(current - 1)
      resetTimer()
    }

    nextBtn?.addEventListener("click", next, sig)
    prevBtn?.addEventListener("click", prev, sig)
    dots.forEach((dot, idx) => {
      dot.addEventListener(
        "click",
        (e) => {
          e.preventDefault()
          e.stopPropagation()
          show(idx)
          resetTimer()
        },
        sig
      )
    })

    show(0)
    startTimer()
  })
}

function teardownCarouselsForCache() {
  document.querySelectorAll("[data-carousel-root]").forEach((root) => {
    root._carouselAbort?.abort()
    delete root._carouselAbort
    if (root._carouselTimer) {
      clearInterval(root._carouselTimer)
      root._carouselTimer = null
    }
    root.dataset.carouselMounted = "false"
  })
}

document.addEventListener("turbo:before-cache", teardownCarouselsForCache)

function startCarousels() {
  mountCarousels()
}

startCarousels()
document.addEventListener("turbo:load", startCarousels)
