import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static targets = ["menu"];

    declare readonly menuTarget: Element;

    toggleMenu(event: Event) {
        event.preventDefault();
        this.menuTarget.classList.toggle("menu-visible");
    }
}
