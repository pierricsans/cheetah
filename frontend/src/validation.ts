import { AppElement, shuffleArray } from "./util.js";
import { MOUSEDOWN } from "./constants.js";

export class ValidationElement extends AppElement {
  textElement = document.createElement("span");
  constructor() {
    super();
    this.element.setAttribute("id", "validateButtonContainer");
    this.element.classList.add("bottomBar");
    this.element.classList.add("horizontalChoices");
    this.element.appendChild(this.textElement);
  }

  listenforPickAMove(): Promise<void> {
    this.element.classList.add("selectable");
    this.textElement.textContent = "spin";
    return new Promise<void>((resolve) => {
      this.element.addEventListener(MOUSEDOWN, (event) => resolve());
    });
  }

  enableButtonAndWaitForClick(): Promise<void> {
    this.element.classList.add("selectable");
    this.textElement.textContent = "spot";
    return new Promise<void>((resolve) => {
      this.element.addEventListener(MOUSEDOWN, (event) => resolve());
    });
  }
}