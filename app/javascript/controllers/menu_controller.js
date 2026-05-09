import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["panel", "toggle"]

  connect() {
    this.panelTarget.hidden = true
  }

  toggle(event) {
    event.preventDefault()
    this.panelTarget.hidden = !this.panelTarget.hidden
    this.toggleTarget.setAttribute("aria-expanded", (!this.panelTarget.hidden).toString())
  }
}
