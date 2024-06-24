import {
  FADE_IN_OUT_DURATION_MS,
  PAUSE_BETWEEN_ANIMATION_CYCLES,
  TOTAL_NUM_STARS,
} from "./constants.js";
import { AppElement } from "./util.js";
import * as emoji from "../emojis.js";

export class CountDown extends AppElement {
  numStars: number = TOTAL_NUM_STARS;
  private stars: Array<HTMLImageElement> = [];

  constructor() {
    super();
    this.element.classList.add("horizontalChoices");
    this.element.classList.add("bottomBar");
    for (var i = 0; i < this.numStars; i++) {
      const star = document.createElement("img");
      star.src = emoji.GLOWING_STAR;
      star.classList.add("active");
      star.classList.add("star");
      this.element.appendChild(star);
      this.stars.push(star);
    }
  }

  RemoveStar(playbackRate: number): Promise<boolean> {
    return new Promise((resolve) => {
      const star = this.stars[this.numStars - 1];
      const animation = this.FadeOutStar(star);
      star.src = emoji.STAR;
      animation.playbackRate = playbackRate;
      animation.onfinish = (event) => {
        star.classList.remove("active");
        star.classList.add("inactive");
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
          offset: 0,
          transform: "scale(1, 1)",
        },
        {
          offset: 0.5,
          transform: "scale(2, 2) rotate(0.5turn)",
        },
        {
          offset: 1,
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
