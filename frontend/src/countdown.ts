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
  private nextStar: HTMLImageElement;
  private fadeOutAnimation: Animation = new Animation();

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
    this.nextStar = this.stars[this.numStars - 1];
  }

  CancelAnimationAndRestoreStar() {
    if (this.fadeOutAnimation.playState === "running") {
      const star = this.stars[this.numStars - 1];
      star.src = emoji.GLOWING_STAR;
      this.fadeOutAnimation.cancel();
    }
  }

  RemoveStar(playbackRate: number): Promise<boolean> {
    return new Promise((resolve) => {
      this.fadeOutAnimation = this.FadeOutStar(this.nextStar);
      this.nextStar.src = emoji.STAR;
      this.fadeOutAnimation.playbackRate = playbackRate;
      this.fadeOutAnimation.onfinish = (event) => {
        this.nextStar.classList.remove("active");
        this.nextStar.classList.add("inactive");
        this.numStars -= 1;
        this.nextStar = this.stars[this.numStars - 1];
        resolve(this.numStars > 0);
      };
      this.fadeOutAnimation.play();
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
