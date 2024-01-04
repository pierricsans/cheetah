import { App, OptionTemplate } from './app.js';
import { Journey, Level, Move, MoveDirection } from './protos/level_pb.js';

// Map between MoveDirection and Material Icon name.
export const Icons: Map<MoveDirection, string> = new Map([
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

// A selector is the part of the app where the user can input their
// selection of movements. It generally includes one Option (see below)
// for each direction (e.g. UP, DOWN, ...).
export class Selector {
  protected journey: Journey;
  protected level: Level;
  protected options: Array<Option> = new Array<Option>();
  protected optionsContainer: HTMLElement = document.createElement("div");
  protected app: App;
  protected main: HTMLElement = document.createElement("div");

  constructor(journey: Journey, level: Level, app: App) {
    this.journey = journey;
    this.level = level;
    this.app = app;
    this.main.setAttribute("id", "selector");
    this.optionsContainer.setAttribute("id", "optionsContainer")
    this.GenerateOptions();
  }

  // Hides the entire selector.
  // Intended to be called once the selection is done.
  Hide() {
    this.main.hidden = true;
  }

  GetAsElement(): HTMLElement {
    return this.main;
  }

  protected GenerateOptions() {
    for (const move of this.journey.allowedMoves) {
      const option = new ExplicitOption(move);
      this.options.push(option);
      this.optionsContainer.appendChild(option.GetAsElement());
      this.WaitAndRegisterUserSelection(option);
    }
    this.main.appendChild(this.optionsContainer);
  }

  // Handles the user selection event:
  //   - Registers selection to the App
  //   - Makes this and/or option selectable or not
  protected WaitAndRegisterUserSelection(option: Option) {
    const promise: Promise<void> = option.initAndWaitForUserSelection()
    .then(() => {
      this.app.AddSelectedOption(option);
      option.MakeUnselectable();
      var atLeastOneSelectable = false;
      for (const option of this.options) {
          if (option.IsSelectable()) {
              atLeastOneSelectable = true;
          }
      }
      if (!atLeastOneSelectable) {
          for (const option of this.options) {
              option.MakeSelectable();
          }
      }
    })
  }

  // Makes all options unselectable.
  // Intended to be called once the entire trajectory has been decided.
  MakeAllOptionsUnselectable() {
    for (const option of this.options) {
        if (option.IsSelectable()) {
            option.MakeUnselectable();
        }
    }
}
}

// Instead of the user clicking on several options, a RandomSelector is
// one where an Option is selected at random as the user clicks on it.
export class RandomSelector extends Selector {

  protected GenerateOptions() {
    const option = new RandomOption(this.journey.allowedMoves);
    this.optionsContainer.appendChild(option.GetAsElement());
    this.main.appendChild(this.optionsContainer);
    this.options.push(option);
    this.WaitAndRegisterUserSelection(option);
  }

  protected WaitAndRegisterUserSelection(option: Option) {
    const promise: Promise<void> = option.initAndWaitForUserSelection()
    .then(() => {
      this.app.AddSelectedOption(option);
      this.WaitAndRegisterUserSelection(option);
    })
  }
}

export class Option implements OptionTemplate {
  move: Move = new Move();
  protected text: string = '';
  protected element: HTMLElement = document.createElement("p");

  constructor() {
    this.element.classList.add('option');
    this.element.classList.add('selectable');
    this.element.setAttribute("tabindex", "0");
  }
  
  initAndWaitForUserSelection() {
    return new Promise<void>((resolve) => {
      this.element.addEventListener('mousedown', (event: Event) => {
        resolve();
      });
    }); 
  }

  GetAsElement(): HTMLElement {
    return this.element;
  }

  MakeSelectable() {
    this.element.classList.add("selectable");
    this.element.classList.remove("notSelectable");
  }

  MakeUnselectable() {
    this.element.classList.remove("selectable");
    this.element.classList.add("notSelectable");
  }

  IsSelectable(): boolean {
    return this.element.classList.contains("selectable");
  }

}

export class ExplicitOption extends Option {
  element: HTMLElement = document.createElement("p");

  constructor(move: Move) {
    super();
    this.move = move;
    this.text = MoveDirection[move?.direction!];
    this.element.setAttribute("alt", this.text);
    this.element.textContent = Icons.get(this.move?.direction!)!;
  }

}

class RandomOption extends Option {
  moves: Array<Move>;
  private timerId: ReturnType<typeof setInterval> | undefined = undefined;

  constructor(moves: Array<Move>) {
    super();
    this.moves = moves;
    this.timerId = setInterval(this.updateText, 100, this.moves, this);
  }
  
  updateText(moves: Array<Move>, option: RandomOption) {
    const nextMove = moves.shift();
    if (nextMove !== undefined) {
      option.move = nextMove;
      option.element.setAttribute("alt", MoveDirection[nextMove?.direction!]);
      option.element.textContent = Icons.get(nextMove.direction!)!;
      moves.push(nextMove);
    } else {
      console.log("No next move: " + moves);
    }
  }

  MakeUnselectable() {
    this.element.classList.remove("selectable");
    this.element.classList.add("notSelectable");
    this.move = new Move();
    this.element.textContent = '';
    this.element.removeAttribute("alt");
    clearInterval(this.timerId);
  }

 }
