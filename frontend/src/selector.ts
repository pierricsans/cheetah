import { AppElement, shuffleArray } from "./util.js";
import {
  Journey,
  Level,
  Move,
  MoveDirection,
  MoveGrow,
  MoveSpin,
} from ".././protos/level_pb.js";
import { MOUSEDOWN } from "./constants.js";

enum OptionState {
  Pending,
  Selectable,
  Finalized,
}

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

  constructor(journey: Journey, level: Level) {
    super();
    this.journey = journey;
    this.level = level;
    this.element.setAttribute("id", "selection");
    this.element.classList.add("horizontalChoices");
  }

  setCurrentOption(): Option {
    const currentOption = this.options.find(
      (option) => option.state === OptionState.Selectable
    );
    if (currentOption === undefined) {
      // All moves in the trajectory have been filled.
      // This can happen when
      throw Error("All moves in the trajectory have been filled.");
    }
    currentOption.finalizeOption();
    const nextOption = this.options.find(
      (option) => option.state === OptionState.Pending
    );
    if (nextOption !== undefined) {
      nextOption.makeSelectable().then(() => this.setCurrentOption());
    }
    this.level.grid?.indigenous?.trajectory?.moves.push(currentOption.move);
    return currentOption;
  }

  GenerateSelectionElement() {
    for (var i = 0; i < this.level.numMoves!; i++) {
      const option = new Option(this.journey.allowedMoves);
      this.element.appendChild(option.GetAsElement());
      this.options.push(option);
    }
    const firstOption = this.options.find(
      (option) => option.state == OptionState.Pending
    );
    if (firstOption) {
      firstOption.makeSelectable().then(() => this.setCurrentOption());
    }
  }
}

export class Option extends AppElement {
  move: Move = new Move();
  state: OptionState;
  private moves: Array<Move>;
  protected text: string = "";
  private timerId: ReturnType<typeof setInterval> | undefined = undefined;

  constructor(moves: Array<Move>) {
    super();
    this.moves = moves;
    shuffleArray(this.moves);
    this.state = OptionState.Pending;
    this.element.classList.add("option");
    this.element.classList.add("notSelectable");
    this.element.setAttribute("tabindex", "0");
  }

  finalizeOption() {
    clearInterval(this.timerId);
    this.element.classList.add("selected");
    this.element.classList.remove("nextSelectable");
    this.element.classList.remove("selectable");
    this.setText(this, this.move);
    this.state = OptionState.Finalized;
  }

  makeSelectable(): Promise<void> {
    this.timerId = setInterval(this.displayNextMove, 60, this.moves, this);
    this.state = OptionState.Selectable;
    this.element.classList.add("nextSelectable");
    this.element.classList.add("selectable");
    this.element.classList.remove("notSelectable");
    return new Promise<void>((resolve) => {
      this.element.addEventListener(MOUSEDOWN, (event) => resolve());
    });
  }

  private displayNextMove(moves: Array<Move>, option: Option) {
    const nextMove = moves.shift();
    if (nextMove) {
      option.move = nextMove;
      option.element.textContent = "";
      option.setText(option, nextMove);
      moves.push(nextMove);
    } else {
      console.log("No next move: " + moves);
    }
  }

  setText(option: Option, move: Move) {
    option.element.textContent = "";
    if (move.direction) {
      option.element.textContent +=
        (option.element.textContent ? " " : "") +
        DirectionIcons.get(move.direction)!;
      option.element.setAttribute("alt", MoveDirection[move.direction]);
    }
    if (move.spin) {
      option.element.textContent +=
        (option.element.textContent ? " " : "") + SpinIcons.get(move.spin)!;
      option.element.setAttribute("alt", MoveSpin[move.spin]);
    }
    if (move.grow) {
      option.element.textContent +=
        (option.element.textContent ? " " : "") + GrowIcons.get(move.grow)!;
      option.element.setAttribute("alt", MoveGrow[move.grow]);
    }
  }
}
