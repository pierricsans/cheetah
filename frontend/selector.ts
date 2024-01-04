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
      const option = new ExplicitOption(move, this);
      option.init();
      this.options.push(option);
      this.optionsContainer.appendChild(option.GetAsElement());
    }
    this.main.appendChild(this.optionsContainer);
  }

  // Handles the user selection event:
  //   - Registers selection to the App
  //   - Makes this and/or option selectable or not
  AddOptionToSelection(option: Option) {
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
    const option = new RandomOption(this.journey.allowedMoves, this);
    option.init();
    this.optionsContainer.appendChild(option.GetAsElement());
    this.main.appendChild(this.optionsContainer);
    this.options.push(option);
  }

  AddOptionToSelection(option: Option) {
    this.app.AddSelectedOption(option);
  }
}

export class Option implements OptionTemplate {
  move: Move = new Move();
  protected text: string = '';
  protected element: HTMLElement = document.createElement("p");
  protected container: Selector;
  protected ListenerFunction = (event: Event) => this.HandleSelectionEvent(event);

  constructor(container: Selector) {
    this.container = container;
  }

  init() {
    this.prepareElement(this.element);
    this.element.addEventListener('click', this.ListenerFunction);
  }

  GetAsElement(): HTMLElement {
    return this.element;
  }

  protected prepareElement(
    element: HTMLElement,
    isSelectable: boolean = true) {
    element.classList.add('option');
    if (isSelectable) {
      element.classList.add('selectable');
    } else {
      element.classList.add('notSelectable');
    }
    element.setAttribute("alt", this.text);
    element.setAttribute("tabindex", "0");
    element.textContent = Icons.get(this.move?.direction!)!;
  }

  protected HandleSelectionEvent(event: Event) {
    this.container.AddOptionToSelection(this);
  }

  MakeSelectable() {
    this.element.classList.add("selectable");
    this.element.classList.remove("notSelectable");
    this.element.addEventListener("click", this.ListenerFunction);
  }

  MakeUnselectable() {
    this.element.classList.remove("selectable");
    this.element.classList.add("notSelectable");
    this.element.removeEventListener("click", this.ListenerFunction);
  }

  IsSelectable(): boolean {
    return this.element.classList.contains("selectable");
  }

}

export class ExplicitOption extends Option {
  element: HTMLElement = document.createElement("p");

  constructor(move: Move, optionContainer: Selector) {
    super(optionContainer);
    this.move = move;
    this.text = MoveDirection[move?.direction!];
  }
}

class RandomOption extends Option {
  moves: Array<Move>;
  private timerId: ReturnType<typeof setInterval> | undefined = undefined;

  constructor(moves: Array<Move>, optionContainer: Selector) {
    super(optionContainer);
    this.moves = moves;
  }

  init() {
    this.prepareElement(this.element);
    this.element.addEventListener('click', this.ListenerFunction);
  }

  protected prepareElement(
    element: HTMLElement,
    isSelectable: boolean = true) {
    element.classList.add('option');
    if (isSelectable) {
      element.classList.add('selectable');
    } else {
      element.classList.add('notSelectable');
    }
    element.setAttribute("tabindex", "0");
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
    this.element.removeEventListener("click", this.ListenerFunction);
    this.move = new Move();
    this.element.textContent = '';
    this.element.removeAttribute("alt");
    clearInterval(this.timerId);
  }

 }
