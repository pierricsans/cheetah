import {
  FADE_IN_OUT_DURATION_MS,
  PAUSE_BETWEEN_ANIMATION_CYCLES,
  TOTAL_NUM_STARS,
} from "./constants.js";
import { AppElement } from "./util.js";

export class CountDown extends AppElement {
  numStars: number = TOTAL_NUM_STARS;
  private stars: Array<HTMLElement> = [];

  constructor() {
    super();
    this.element.classList.add("horizontalChoices");
    this.element.classList.add("bottomBar");
    for (var i = 0; i < this.numStars; i++) {
      const star = document.createElement("span");
      star.classList.add("iconAction");
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
      };
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
          transform: "scale(2, 2) rotate(0.5turn)",
        },
        {
          color: "var(--secondary-color)",
          transform: "scale(1, 1) rotate(1turn)",
        },
      ],
      {
        duration: FADE_IN_OUT_DURATION_MS + PAUSE_BETWEEN_ANIMATION_CYCLES,
        fill: "forwards",
      }
    );
    return new Animation(keyframes);
  }
}
