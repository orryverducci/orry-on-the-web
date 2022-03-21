import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static targets = ["menu"];

    menuTarget: Element;
    menuTargets: Element[];
    hasMenuTarget: boolean;

    toggleMenu(event: Event) {
        event.preventDefault();
        this.menuTarget.classList.toggle("menu-visible");
    }
}
