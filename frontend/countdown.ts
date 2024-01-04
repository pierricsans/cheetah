import { GridTemplate } from './app.js';
import { MAXIMUM_LEVEL_POINTS, TOTAL_NUM_STARS } from './constants.js';

export class CountDown {
  private outerContainer: HTMLElement = document.createElement("div");
  private timeRemainingContainer: HTMLElement = document.createElement("div");
  private animation: Animation;
  private startingScore = MAXIMUM_LEVEL_POINTS;
  private totalDuration;
  private score = this.startingScore;
  private startTime: number = 0;
  private parentGrid: GridTemplate;
  private timerId: ReturnType<typeof setInterval> | undefined = undefined;
  private totalStarNumber: number = TOTAL_NUM_STARS;


  constructor(grid: GridTemplate, totalDuration: number) {
    this.parentGrid = grid;
    this.totalDuration = totalDuration;
    this.outerContainer.setAttribute("id", "countdown");
    this.outerContainer.classList.add("bottomBar");
    this.timeRemainingContainer.setAttribute("id", "timeRemainingContainer");
    this.outerContainer.appendChild(this.timeRemainingContainer);
    for (var i = 0; i < this.totalStarNumber; i++) {
      const star = document.createElement("span");
      star.classList.add("levelAction");
      star.classList.add("validAction");
      star.textContent = "star_rate";
      this.outerContainer.appendChild(star);

    }
    this.animation = this.GenerateCountdownAnimation(this.totalDuration);
  }

  GetAsElement(): HTMLElement {
    return this.outerContainer;
  }

  Lose() {
    clearInterval(this.timerId);
    this.parentGrid.app.level.score = undefined;
    setTimeout(() => { this.parentGrid.app.UpdateAndShowScoreBoard() }, 1000);
  }

  Win() {
    this.animation.pause();
    clearInterval(this.timerId);
    setTimeout(() => { this.parentGrid.app.UpdateAndShowScoreBoard() }, 1000);
  }

  Start() {
    this.startTime = Date.now();
    this.animation.play();
    this.timerId = setInterval(() => this.StoreCurrentScore(), 5);
  }
  
  RegisterWrongGuess() {
    this.totalDuration = this.totalDuration - (Date.now() - this.startTime);
    const width = this.timeRemainingContainer.offsetWidth;
    this.animation.cancel();
    this.animation = this.GenerateCountdownAnimation(this.totalDuration * 0.8, width * 0.8 + "px");
    this.startTime = Date.now();
    this.animation.play();
  }

  private GenerateCountdownAnimation(duration: number, width: string = "100%"): Animation {
    const keyframes = new KeyframeEffect(
      this.timeRemainingContainer,
      [{
        width: width,
      },
      {
        width: "0%",
      }], {
      duration: duration,
      fill: "forwards",
    });
    const animation = new Animation(keyframes, document.timeline);
    animation.onfinish = (event: Event) => {
      this.parentGrid.Lose();
    }
    return animation;
  }

  private StoreCurrentScore() {
    const ratio = this.timeRemainingContainer.offsetWidth / this.outerContainer.offsetWidth;
    this.score = Math.floor(ratio * this.startingScore)
    if (this.score > 0) {
      this.parentGrid.app.level.score = this.score;
    }
  }
}