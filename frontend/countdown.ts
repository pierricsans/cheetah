import { TOTAL_NUM_STARS } from './constants.js';
import { AppElement } from './util.js';

export class CountDown extends AppElement {
  numStars: number = TOTAL_NUM_STARS;
  private timeRemainingContainer: HTMLElement = document.createElement("div");
  private stars: Array<HTMLElement> = [];


  constructor() {
    super();
    this.element.setAttribute("id", "countdown");
    this.element.classList.add("bottomBar");
    this.timeRemainingContainer.setAttribute("id", "timeRemainingContainer");
    this.element.appendChild(this.timeRemainingContainer);
    for (var i = 0; i < this.numStars; i++) {
      const star = document.createElement("span");
      star.classList.add("levelAction");
      star.classList.add("validAction");
      star.textContent = "star_rate";
      this.element.appendChild(star);
      this.stars.push(star);
    }
  }

  RemoveStar(): boolean {
    this.stars[this.numStars - 1].classList.remove("validAction");
    this.numStars -= 1;
    return this.numStars > 0;
  }

}