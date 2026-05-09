import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["slide", "indicator"]
  static values = {
    index: { type: Number, default: 0 },
    interval: { type: Number, default: 8000 }
  }

  connect() {
    this.count = this.slideTargets.length
    if (this.count === 0) return

    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!this.reducedMotion && this.intervalValue > 0) {
      this.startTimer()
    }
    this.show(this.indexValue)
  }

  disconnect() {
    this.stopTimer()
  }

  next(event) {
    event?.preventDefault()
    this.show((this.indexValue + 1) % this.count)
    this.resetTimer()
  }

  prev(event) {
    event?.preventDefault()
    this.show((this.indexValue - 1 + this.count) % this.count)
    this.resetTimer()
  }

  goTo(event) {
    event.preventDefault()
    const i = parseInt(event.currentTarget.dataset.slideIndex, 10)
    if (!Number.isNaN(i)) {
      this.show(i)
      this.resetTimer()
    }
  }

  show(i) {
    this.indexValue = i
    this.slideTargets.forEach((el, idx) => {
      const active = idx === i
      el.classList.toggle("opacity-100", active)
      el.classList.toggle("opacity-0", !active)
      el.classList.toggle("z-10", active)
      el.classList.toggle("z-0", !active)
      el.setAttribute("aria-hidden", (!active).toString())
    })

    this.indicatorTargets.forEach((dot, idx) => {
      const on = idx === i
      dot.setAttribute("aria-selected", on.toString())
      dot.setAttribute("tabindex", on ? "0" : "-1")
      dot.classList.toggle("bg-white", on)
      dot.classList.toggle("bg-white/45", !on)
      dot.classList.toggle("w-8", on)
      dot.classList.toggle("w-2.5", !on)
    })
  }

  resetTimer() {
    if (this.reducedMotion || this.intervalValue <= 0) return
    this.stopTimer()
    this.startTimer()
  }

  startTimer() {
    this.timer = window.setInterval(() => this.show((this.indexValue + 1) % this.count), this.intervalValue)
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
};
