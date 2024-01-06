import { FADE_IN_OUT_DURATION_MS, TOTAL_NUM_STARS } from './constants.js';
import { AppElement } from './util.js';

export class CountDown extends AppElement {
  numStars: number = TOTAL_NUM_STARS;
  private stars: Array<HTMLElement> = [];


  constructor() {
    super();
    this.element.setAttribute("id", "countdown");
    this.element.classList.add("bottomBar");
    for (var i = 0; i < this.numStars; i++) {
      const star = document.createElement("span");
      star.classList.add("levelAction");
      star.classList.add("validAction");
      star.textContent = "star_rate";
      this.element.appendChild(star);
      this.stars.push(star);
    }
  }

  RemoveStar(playbackRate: number): Promise<boolean> {
    return new Promise((resolve) => {
      const animation = this.FadeOutStar(this.stars[this.numStars - 1]);
      animation.playbackRate = playbackRate;
      animation.onfinish = (event) => {
        this.stars[this.numStars - 1].classList.remove("validAction");
        this.stars[this.numStars - 1].classList.add("invalidAction");
        this.numStars -= 1;
        resolve(this.numStars > 0);
      }
      animation.play();
    });
  }

  private FadeOutStar(star: HTMLSpanElement): Animation {
    const keyframes = new KeyframeEffect(
      star,
      [
        {
          color: "var(--body-background)",
        },
        {
          color: "var(--secondary-color)",
        }
      ],
      {
        duration: FADE_IN_OUT_DURATION_MS,
        fill: "forwards",
      }
    );
    return new Animation(keyframes);
  }

}