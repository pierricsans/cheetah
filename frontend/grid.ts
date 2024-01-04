import { Bead, InactiveBead } from './bead.js';
import { Journey, Grid, Level } from './protos/level_pb.js';
import { CountDown } from './countdown.js';
import { App, GridTemplate, shuffleArray } from './app.js';
import { DEFAULT_DELAY_BETWEEN_FADE_IN_AND_MAIN_ANIMATION_MS, DEFAULT_FADE_IN_OUT_DURATION_MS, FALLBACK_COUNTDOWN_DURATION_MS, RATE_OF_ANIMATION_SLOWDOWN } from './constants.js';

export class GridInst implements GridTemplate {
  grid: Grid;
  journey: Journey;
  level: Level;
  countdown: CountDown;
  app: App;
  private innerContainer: HTMLElement = document.createElement("div");
  private outerContainer: HTMLElement = document.createElement("div");
  private overallContainer: HTMLElement = document.createElement("div");
  private inactiveBeadsContainer: HTMLElement = document.createElement("div");
  private beads: Array<Bead> = [];
  private inactiveBeads: Array<InactiveBead> = [];

  constructor(journey: Journey, level: Level, app: App) {
    this.journey = journey;
    this.app = app;
    this.level = level;
    this.grid = this.level.grid!;
    this.countdown = this.AppendCountDown();
  }

  GetAsElement(): HTMLElement {
    return this.overallContainer;
  }

  Hide() {
    this.overallContainer.hidden = true;
  }

  Show() {
    this.overallContainer.hidden = false;
  }

  Build() {
    this.outerContainer.setAttribute("id", "outerContainer");
    this.innerContainer.setAttribute("id", "innerContainer");
    for (const alien of this.grid.aliens) {
      const bead = new Bead(this, alien);
      this.beads.push(bead);
      this.innerContainer.appendChild(bead.GetAsElement());
      this.inactiveBeads.push(bead.GetInactiveBead());
    }
    const bead = new Bead(this, this.grid.indigenous!);
    this.beads.push(bead);
    this.innerContainer.appendChild(bead.GetAsElement());
    this.outerContainer.appendChild(this.innerContainer);
    this.overallContainer.appendChild(this.outerContainer);
    this.overallContainer.appendChild(this.inactiveBeadsContainer);
    this.inactiveBeads.push(bead.GetInactiveBead());
    this.AppendInactiveBeads();
    this.countdown.Start();
  }

  AppendInactiveBeads() {
    shuffleArray(this.inactiveBeads);
    this.inactiveBeadsContainer.setAttribute("id", "inactiveBeadsContainer");
    for (const bead of this.inactiveBeads) {
      this.inactiveBeadsContainer.appendChild(bead.GetAsElement());
    }
  }

  AppendCountDown(): CountDown {
    var duration: number = this.getCountdownDuration();
    const countdown = new CountDown(this, duration);
    this.overallContainer.appendChild(countdown.GetAsElement());
    return countdown;
  }

  private getCountdownDuration(): number {
    if (this.level.trajectoryIterationsAllowed === undefined ||
      this.level.numMoves === undefined ||
      this.level.timePerMoveMs === undefined) {
      return FALLBACK_COUNTDOWN_DURATION_MS;
    }
    var duration: number = 0;
    var fadeDuration: number = DEFAULT_FADE_IN_OUT_DURATION_MS;
    var mainAnimationDuration: number = (this.level.timePerMoveMs * this.level.numMoves);
    for (var i = 0; i < this.level.trajectoryIterationsAllowed; i++) {
      duration += (2 * fadeDuration) + mainAnimationDuration + DEFAULT_DELAY_BETWEEN_FADE_IN_AND_MAIN_ANIMATION_MS;
      fadeDuration = fadeDuration * RATE_OF_ANIMATION_SLOWDOWN;
      mainAnimationDuration = mainAnimationDuration * RATE_OF_ANIMATION_SLOWDOWN;
    }
    return duration;
  }

  Win() {
    this.countdown.Win();
    for (const bead of this.beads) {
      bead.Win();
    }
  }

  Lose() {
    for (const bead of this.beads) {
      bead.EndGame();
    }
    this.countdown.Lose();
  }

  RegisterWrongGuess() {
    this.countdown.RegisterWrongGuess();
  }
}
