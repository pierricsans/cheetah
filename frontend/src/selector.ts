import { AppElement, shuffleArray } from "./util.js";
import {
  Journey,
  Level,
  Move,
  MoveDirection,
  MoveGrow,
  MoveSpin,
} from ".././protos/level_pb.js";

// Map between MoveDirection and Material Icon name.
export const DirectionIcons: Map<MoveDirection, string> = new Map([
  [MoveDirection.NO_MOVE, "block"],
  [MoveDirection.NORTH, "🔼"],
  [MoveDirection.SOUTH, "🔽"],
  [MoveDirection.WEST, "◀️"],
  [MoveDirection.EAST, "▶️"],
  [MoveDirection.SOUTH_EAST, "↘️"],
  [MoveDirection.SOUTH_WEST, "↙️"],
  [MoveDirection.NORTH_WEST, "↖️"],
  [MoveDirection.NORTH_EAST, "↗️"],
  [MoveDirection.DOUBLE_NORTH, "⏫"],
  [MoveDirection.DOUBLE_SOUTH, "⏬"],
  [MoveDirection.DOUBLE_WEST, "⏪"],
  [MoveDirection.DOUBLE_EAST, "⏩"],
  [MoveDirection.UNSPECIFIED, "❓"],
]);

export const SpinIcons: Map<MoveSpin, string> = new Map([
  [MoveSpin.NO_SPIN, "❌"],
  [MoveSpin.HALF_CLOCKWISE, "↪️"],
  [MoveSpin.HALF_COUNTER_CLOCKWISE, "↩️"],
]);

export const GrowIcons: Map<MoveGrow, string> = new Map([
  [MoveGrow.NO_GROW, "❌"],
  [MoveGrow.ENLARGE, "👐"],
  [MoveGrow.SHRINK, "🤏"],
]);

// Instead of the user clicking on several options, a RandomSelector is
// one where an Option is selected at random as the user clicks on it.
export class Selector extends AppElement {
  protected journey: Journey;
  protected level: Level;
  protected options: Array<Option> = new Array<Option>();
  protected selections: Array<Move> = new Array<Move>();

  constructor(journey: Journey, level: Level) {
    super();
    this.journey = journey;
    this.level = level;
    this.element.setAttribute("id", "selection");
    this.element.classList.add("horizontalChoices");
    this.GenerateSelectionElement();
  }

  private GenerateSelectionElement() {
    var maxIterations = 20;
    for (var i = 0; i < this.level.numMoves!; i++) {
      // Copy of this.journey.allowedMoves so that each copy is independent.
      const option = new Option(
        this.journey.clone().allowedMoves,
        maxIterations
      );
      maxIterations = maxIterations + 3;
      this.Append(option);
      this.options.push(option);
    }
  }

  TriggerRoll(): Promise<void> {
    return new Promise<void>((resolve) => {
      const promises: Array<Promise<Move>> = [];
      for (const option of this.options) {
        promises.push(option.triggerApplication());
      }
      Promise.all(promises).then((moves) => {
        for (const move of moves) {
          this.level.grid?.indigenous?.trajectory?.moves.push(move);
        }
        resolve();
      });
    });
  }
}

export class Option extends AppElement {
  private move: Move = new Move();
  private allowedMoves: Array<Move>;
  private duration: number = Math.floor(Math.random() * 5) + 20;
  private numIteration: number = 0;
  private maxIterations: number;
  private event: CustomEvent = new CustomEvent("animationDone");
  // Each move's number of dimensions.
  // If only direction: MOVE_DIRECTION_NORTH, then 1.
  // If direction: MOVE_DIRECTION_NORTH spin: MOVE_SPIN_HALF_CLOCKWISE then 2.
  private numDimensions: number = 0;

  constructor(allowedMoves: Array<Move>, maxIterations: number) {
    super();
    this.allowedMoves = allowedMoves;
    this.maxIterations = maxIterations;
    shuffleArray(this.allowedMoves);
    this.element.classList.add("option");
    this.element.classList.add("notSelectable");
    this.element.setAttribute("tabindex", "0");
    this.createElements();
    this.getNumDimensions();
  }

  private getNumDimensions() {
    // Assumes all allowed moves have the same number of dimensions
    const firstMove = this.allowedMoves[0];
    if (firstMove.direction) {
      this.numDimensions++;
    }
    if (firstMove.spin) {
      this.numDimensions++;
    }
    if (firstMove.grow) {
      this.numDimensions++;
    }
  }

  private createElements() {
    for (var i = 0; i < 4; i++) {
      this.element.appendChild(this.createElement(this.getNextMove()));
    }
  }

  private createElement(move: Move): HTMLElement {
    const element = document.createElement("div");
    element.style.transform = "translateY(50%)";
    this.setText(element, move);
    return element;
  }

  triggerApplication(): Promise<Move> {
    this.animate(this.duration);
    return new Promise<Move>((resolve) => {
      this.element.addEventListener(
        "animationDone",
        (event) => {
          resolve(this.move);
        },
        false
      );
    });
  }

  private animate(duration: number) {
    const frames: Array<Keyframe> = new Array<Keyframe>();
    frames.push({
      transform: "translateY(0)",
      offset: 0,
    });
    frames.push({
      transform:
        "translateY(calc(var(--cell-size) * -1 * " + this.numDimensions + "))",
      offset: 1,
    });
    const keyframes = new KeyframeEffect(this.element, frames, {
      duration: duration,
      fill: "forwards",
    });
    const animation = new Animation(keyframes, document.timeline);
    animation.onfinish = () => {
      this.moveToFrontAnd();
    };
    animation.play();
  }

  private getNextMove(): Move {
    const first = this.allowedMoves.shift();
    if (first) {
      this.allowedMoves.push(first);
      return first;
    }
    throw Error("No next option found");
  }

  private moveToFrontAnd() {
    if (this.element.firstChild == null) {
      return;
    }
    if (this.element.lastChild == null) {
      return;
    }
    if (this.numIteration > this.maxIterations) {
      this.move = this.allowedMoves[this.allowedMoves.length - 2];
      this.element.dispatchEvent(this.event);
      return;
    }
    this.numIteration++;
    this.element.appendChild(this.createElement(this.getNextMove()));
    this.element.removeChild(this.element.firstChild);
    this.duration = this.duration * 1.1;
    this.animate(this.duration);
  }

  private setText(element: HTMLElement, move: Move) {
    element.textContent = "";
    if (move.direction) {
      element.textContent +=
        (element.textContent ? " " : "") + DirectionIcons.get(move.direction)!;
      element.setAttribute("alt", MoveDirection[move.direction]);
    }
    if (move.spin) {
      element.textContent +=
        (element.textContent ? " " : "") + SpinIcons.get(move.spin)!;
      element.setAttribute("alt", MoveSpin[move.spin]);
    }
    if (move.grow) {
      element.textContent +=
        (element.textContent ? " " : "") + GrowIcons.get(move.grow)!;
      element.setAttribute("alt", MoveGrow[move.grow]);
    }
  }
}
