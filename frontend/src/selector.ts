import { AppElement } from "./util.js";
import {
  Journey,
  Level,
  Move,
  MoveDirection,
  MoveGrow,
  MoveSpin,
} from ".././protos/level_pb.js";
import { MOUSEDOWN } from "./constants.js";

// Map between MoveDirection and Material Icon name.
export const DirectionIcons: Map<MoveDirection, string> = new Map([
  [MoveDirection.NO_MOVE, "block"],
  [MoveDirection.NORTH, "north"],
  [MoveDirection.SOUTH, "south"],
  [MoveDirection.WEST, "west"],
  [MoveDirection.EAST, "east"],
  [MoveDirection.SOUTH_EAST, "south_east"],
  [MoveDirection.SOUTH_WEST, "south_west"],
  [MoveDirection.NORTH_WEST, "north_west"],
  [MoveDirection.NORTH_EAST, "north_east"],
  [MoveDirection.DOUBLE_NORTH, "keyboard_double_arrow_up"],
  [MoveDirection.DOUBLE_SOUTH, "keyboard_double_arrow_down"],
  [MoveDirection.DOUBLE_WEST, "keyboard_double_arrow_left"],
  [MoveDirection.DOUBLE_EAST, "keyboard_double_arrow_right"],
  [MoveDirection.UNSPECIFIED, "question_mark"],
]);

export const SpinIcons: Map<MoveSpin, string> = new Map([
  [MoveSpin.NO_SPIN, "block"],
  [MoveSpin.HALF_CLOCKWISE, "rotate_right"],
  [MoveSpin.HALF_COUNTER_CLOCKWISE, "rotate_left"],
]);

export const GrowIcons: Map<MoveGrow, string> = new Map([
  [MoveGrow.NO_GROW, "block"],
  [MoveGrow.ENLARGE, "open_in_full"],
  [MoveGrow.SHRINK, "close_fullscreen"],

])

// Instead of the user clicking on several options, a RandomSelector is
// one where an Option is selected at random as the user clicks on it.
export class RandomSelector extends AppElement {
  protected journey: Journey;
  protected level: Level;
  protected options: Array<Option> = new Array<Option>();
  protected optionsContainer: HTMLElement = document.createElement("div");
  private acceptsFurtherSelections: boolean = true;

  constructor(journey: Journey, level: Level) {
    super();
    this.journey = journey;
    this.level = level;
    this.element.setAttribute("id", "selector");
    this.optionsContainer.setAttribute("id", "optionsContainer");
    this.GenerateOptions();
  }
  protected GenerateOptions() {
    const option = new Option(this.journey.allowedMoves);
    this.optionsContainer.appendChild(option.GetAsElement());
    this.element.appendChild(this.optionsContainer);
    this.options.push(option);
  }

  WaitAndRegisterSelections(): Array<Promise<Option>> {
    return [
      new Promise<Option>((resolve) => {
        const option = this.options[0]!;
        option.initAndWaitForUserSelection().then(() => {
          resolve(option);
        });
      }),
    ];
  }

  getOption(): Option {
    return this.options[0]!;
  }

  // Makes all options unselectable.
  // Intended to be called once the entire trajectory has been decided.
  MakeAllOptionsUnselectable() {
    this.acceptsFurtherSelections = false;
    for (const option of this.options) {
      if (option.IsSelectable()) {
        option.MakeUnselectable();
      }
    }
  }
}

export class Option extends AppElement {
  move: Move = new Move();
  private moves: Array<Move>;
  protected text: string = "";
  private timerId: ReturnType<typeof setInterval> | undefined = undefined;

  constructor(moves: Array<Move>) {
    super();
    this.moves = moves;
    this.element.classList.add("option");
    this.element.classList.add("selectable");
    this.element.setAttribute("tabindex", "0");
    this.timerId = setInterval(this.updateText, 100, this.moves, this);
  }

  initAndWaitForUserSelection(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.element.addEventListener(MOUSEDOWN, (event: Event) => {
        resolve();
      });
    });
  }

  MakeSelectable() {
    this.element.classList.add("selectable");
    this.element.classList.remove("notSelectable");
  }

  MakeUnselectable() {
    this.element.classList.remove("selectable");
    this.element.classList.add("notSelectable");
    this.move = new Move();
    this.element.textContent = "";
    this.element.removeAttribute("alt");
    clearInterval(this.timerId);
  }

  IsSelectable(): boolean {
    return this.element.classList.contains("selectable");
  }

  updateText(moves: Array<Move>, option: Option) {
    const nextMove = moves.shift();
    if (nextMove) {
      option.move = nextMove;
      option.element.textContent = "";
      if (nextMove.direction) {
        option.element.textContent += DirectionIcons.get(nextMove.direction)!;
        option.element.setAttribute("alt", MoveDirection[nextMove.direction]);
      }
      if (nextMove.spin) {
        option.element.textContent +=
          (option.element.textContent ? " " : "") + SpinIcons.get(nextMove.spin)!;
        option.element.setAttribute("alt", MoveSpin[nextMove.spin]);
      }
      if (nextMove.grow) {
        option.element.textContent +=
          (option.element.textContent ? " " : "") + GrowIcons.get(nextMove.grow)!;
        option.element.setAttribute("alt", MoveGrow[nextMove.grow]);
      }
      moves.push(nextMove);
    } else {
      console.log("No next move: " + moves);
    }
  }
}
