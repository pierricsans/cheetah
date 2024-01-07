import { AppElement, shuffleArray } from "./src/util.js";
import { setTheme } from "./src/theme.js";
import { GridInst } from "./src/grid.js";
import {
  Icons,
  Option,
  RandomOption,
  RandomSelector,
  Selector,
} from "./src/selector.js";
import {
  Game,
  Grid,
  Journey,
  Level,
  Move,
  MoveDirection,
  MoveSpin,
  NextLevelAction,
  Person,
  PersonType,
  Position,
  Theme,
  Trajectory,
} from "./protos/level_pb.js";
import { ScoreBoard } from "./src/scoreboard.js";
import "./static/style.css";

function GetOffset(
  length: number,
  moves: Array<MoveDirection>,
  backwardMoves: Array<MoveDirection>,
  forwardMoves: Array<MoveDirection>,
  doubleBackWardMoves: Array<MoveDirection>,
  doubleForwardMoves: Array<MoveDirection>
): number {
  var currentPosition = 0;
  var backwardsMost = 0;
  var forwardsMost = 0;
  for (const move of moves) {
    if (forwardMoves.includes(move)) {
      currentPosition += 1;
      forwardsMost = Math.max(currentPosition, forwardsMost);
      backwardsMost = Math.min(currentPosition, backwardsMost);
    }
    if (backwardMoves.includes(move)) {
      currentPosition -= 1;
      forwardsMost = Math.max(currentPosition, forwardsMost);
      backwardsMost = Math.min(currentPosition, backwardsMost);
    }
    if (doubleForwardMoves.includes(move)) {
      currentPosition += 2;
      forwardsMost = Math.max(currentPosition, forwardsMost);
      backwardsMost = Math.min(currentPosition, backwardsMost);
    }
    if (doubleBackWardMoves.includes(move)) {
      currentPosition -= 2;
      forwardsMost = Math.max(currentPosition, forwardsMost);
      backwardsMost = Math.min(currentPosition, backwardsMost);
    }
  }
  const max = length - Math.max(0, forwardsMost) + 1;
  const min = Math.abs(backwardsMost);
  const value = Math.floor(Math.random() * (max - min) + min);
  return value;
}

class ValidationElement extends AppElement {
  constructor() {
    super();
    this.element.classList.add("notSelectable");
    this.element.setAttribute("id", "validateButtonContainer");
    this.element.classList.add("bottomBar");
  }

  enableButtonAndWaitForClick(): Promise<void> {
    this.element.classList.add("selectable");
    this.element.classList.remove("notSelectable");
    return new Promise<void>((resolve) => {
      this.element.addEventListener("click", (event) => resolve());
    });
  }
}

export class TapTheDot {
  private game: Game;
  private journey: Journey;
  private level: Level;
  private scoreboard: ScoreBoard;
  private readonly outContainer: HTMLElement = document.body;
  private container: HTMLElement = document.createElement("div");
  private selector: Selector;
  private selection: HTMLElement = document.createElement("div");
  private validateElement: ValidationElement;
  private grid: GridInst;
  private allTrajectories: Array<Trajectory> = new Array<Trajectory>();
  private allPositions: Map<number, Array<Position>> = new Map<
    number,
    Array<Position>
  >();
  private currentScoreDisplay: HTMLElement = document.createElement("div");

  constructor(game: Game) {
    this.game = game;
    this.journey = new Journey().fromJsonString(
      getJourney(game).toJsonString()
    );
    this.level = new Level().fromJsonString(
      getLevel(this.journey, this.journey.nextLevel || 1).toJsonString()
    );
    this.validateElement = new ValidationElement();
    this.scoreboard = new ScoreBoard(this.game);
    this.selector = new Selector(this.journey, this.level);
    this.grid = new GridInst(this.journey, this.level);
  }

  Init() {
    this.cleanup();
    this.StoreGameAsLocalStorage();
    this.selection.hidden = false;
    this.journey = new Journey().fromJsonString(
      getJourney(this.game).toJsonString()
    );
    this.level = new Level().fromJsonString(
      getLevel(this.journey, this.journey.nextLevel || 1).toJsonString()
    );
    this.container.setAttribute("id", "selectorContainer");
    this.container.classList.add("banner");
    if (this.level.movesAreRandomlyGenerated) {
      this.selector = new RandomSelector(this.journey, this.level);
    } else {
      this.selector = new Selector(this.journey, this.level);
    }
    this.WaitForUserSelection();
    this.AppendSelector();
    this.GenerateSelectionElement();
    this.validateElement = new ValidationElement();
    this.grid = new GridInst(this.journey, this.level);
    this.container.appendChild(this.validateElement.GetAsElement());
    setTheme(this.journey);
    this.GenerateColors();
    this.scoreboard = new ScoreBoard(this.game);
    this.container.appendChild(this.scoreboard.GetAsElement());
    this.appendContainer();
  }

  private GenerateColors() {
    shuffleArray(this.journey.symbols);
  }

  private StoreGameAsLocalStorage() {
    localStorage.setItem("game", this.game.toJsonString());
  }

  UpdateAndShowScoreBoard() {
    this.selection.hidden = true;
    this.grid.Hide();
    getLevel(getJourney(this.game), this.journey.nextLevel || 1).score =
      this.level.score;
    this.StoreGameAsLocalStorage();
    this.scoreboard.Update();
    this.scoreboard.Show();
    this.scoreboard
      .waitforUserSelection()
      .then((nextLevelAction: NextLevelAction) => {
        switch (nextLevelAction) {
          case NextLevelAction.RESTART_GAME:
            this.restartGameFromScratch();
            break;
          case NextLevelAction.RESTART_JOURNEY:
            this.restartJourneyFromScratch();
            break;
          case NextLevelAction.TRIGGER_NEXT_LEVEL:
            this.triggerNextLevel();
            break;
          default:
            throw Error("Unknown level action: " + nextLevelAction);
        }
      });
  }

  GetNextColor(): string {
    const color = this.journey.symbols.pop();
    if (color === undefined) {
      console.log("No more colors");
      return "";
    } else {
      return color;
    }
  }

  FillLevel() {
    const grid: Grid = this.level.grid!;
    grid.height = this.level.size;
    grid.width = this.level.size;
    this.GenerateInitialState(grid.indigenous!);
    this.AddAliens();
  }

  private GenerateInitialState(person: Person, generateMoves: boolean = false) {
    person.color = this.GetNextColor();
    if (generateMoves) {
      this.GenerateMoves(person);
    } else {
      this.allTrajectories.push(person.trajectory!);
    }
    this.GenerateInitialPosition(person);
  }

  refreshCurrentScoreDisplay(score: number) {
    this.currentScoreDisplay.textContent = score.toString();
  }

  private GenerateInitialPosition(person: Person) {
    const y_moves = new Array<MoveDirection>();
    const x_moves = new Array<MoveDirection>();
    if (!person.trajectory) {
      throw Error("Person has no trajectory: " + person);
    }
    for (const move of person.trajectory?.moves!) {
      switch (move.direction) {
        case MoveDirection.NORTH:
          y_moves.push(move.direction);
          break;
        case MoveDirection.SOUTH:
          y_moves.push(move.direction);
          break;
        case MoveDirection.WEST:
          x_moves.push(move.direction);
          break;
        case MoveDirection.EAST:
          x_moves.push(move.direction);
          break;
        case MoveDirection.SOUTH_EAST:
          y_moves.push(move.direction);
          x_moves.push(move.direction);
          break;
        case MoveDirection.SOUTH_WEST:
          y_moves.push(move.direction);
          x_moves.push(move.direction);
          break;
        case MoveDirection.NORTH_EAST:
          y_moves.push(move.direction);
          x_moves.push(move.direction);
          break;
        case MoveDirection.NORTH_WEST:
          y_moves.push(move.direction);
          x_moves.push(move.direction);
          break;
        case MoveDirection.DOUBLE_NORTH:
          y_moves.push(move.direction);
          break;
        case MoveDirection.DOUBLE_SOUTH:
          y_moves.push(move.direction);
          break;
        case MoveDirection.DOUBLE_WEST:
          x_moves.push(move.direction);
          break;
        case MoveDirection.DOUBLE_EAST:
          x_moves.push(move.direction);
          break;
        default:
          throw Error("Unknown move direction: " + move.direction);
      }
    }
    if (person.position === undefined) {
      person.position = new Position();
    }
    person.position.xOffset = GetOffset(
      this.level.grid?.width!,
      x_moves,
      [MoveDirection.WEST, MoveDirection.NORTH_WEST, MoveDirection.SOUTH_WEST],
      [MoveDirection.EAST, MoveDirection.NORTH_EAST, MoveDirection.SOUTH_EAST],
      [MoveDirection.DOUBLE_WEST],
      [MoveDirection.DOUBLE_EAST]
    );
    person.position.yOffset = GetOffset(
      this.level.grid?.width!,
      y_moves,
      [MoveDirection.SOUTH, MoveDirection.SOUTH_EAST, MoveDirection.SOUTH_WEST],
      [MoveDirection.NORTH, MoveDirection.NORTH_EAST, MoveDirection.NORTH_WEST],
      [MoveDirection.DOUBLE_SOUTH],
      [MoveDirection.DOUBLE_NORTH]
    );
    if (!this.registerPosition(person)) {
      delete person.position;
      console.log("unlucky-position");
      this.GenerateInitialPosition(person);
    }
  }

  private registerPosition(person: Person): boolean {
    const initialPosition = person.position!;
    if (!this.allPositions.has(0)) {
      this.allPositions.set(0, new Array());
    }
    for (const registeredPosition of this.allPositions.get(0)!) {
      if (initialPosition.equals(registeredPosition)) {
        return false;
      }
    }
    this.allPositions.get(0)?.push(initialPosition);
    var nextMove: number = 1;
    var currentPosition: Position = initialPosition;
    for (const move of person.trajectory?.moves!) {
      const position: Position = new Position();
      switch (move.direction) {
        case MoveDirection.NORTH:
          position.xOffset = currentPosition.xOffset;
          position.yOffset = currentPosition.yOffset! + 1;
          break;
        case MoveDirection.SOUTH:
          position.xOffset = currentPosition.xOffset;
          position.yOffset = currentPosition.yOffset! - 1;
          break;
        case MoveDirection.EAST:
          position.xOffset = currentPosition.xOffset! + 1;
          position.yOffset = currentPosition.yOffset;
          break;
        case MoveDirection.WEST:
          position.xOffset = currentPosition.xOffset! - 1;
          position.yOffset = currentPosition.yOffset;
          break;
        case MoveDirection.SOUTH_EAST:
          position.xOffset = currentPosition.xOffset! + 1;
          position.yOffset = currentPosition.yOffset! - 1;
          break;
        case MoveDirection.SOUTH_WEST:
          position.xOffset = currentPosition.xOffset! - 1;
          position.yOffset = currentPosition.yOffset! - 1;
          break;
        case MoveDirection.NORTH_EAST:
          position.xOffset = currentPosition.xOffset! + 1;
          position.yOffset = currentPosition.yOffset! + 1;
          break;
        case MoveDirection.NORTH_WEST:
          position.xOffset = currentPosition.xOffset! - 1;
          position.yOffset = currentPosition.yOffset! + 1;
          break;
        case MoveDirection.DOUBLE_NORTH:
          position.xOffset = currentPosition.xOffset;
          position.yOffset = currentPosition.yOffset! + 2;
          break;
        case MoveDirection.DOUBLE_SOUTH:
          position.xOffset = currentPosition.xOffset;
          position.yOffset = currentPosition.yOffset! - 2;
          break;
        case MoveDirection.DOUBLE_EAST:
          position.xOffset = currentPosition.xOffset! + 2;
          position.yOffset = currentPosition.yOffset;
          break;
        case MoveDirection.DOUBLE_WEST:
          position.xOffset = currentPosition.xOffset! - 2;
          position.yOffset = currentPosition.yOffset;
          break;
        default:
          throw Error("Unknown MoveDirection: " + move.direction);
      }
      if (!this.allPositions.has(nextMove)) {
        this.allPositions.set(nextMove, new Array());
      }
      for (const registeredPosition of this.allPositions.get(nextMove)!) {
        if (registeredPosition.equals(position)) {
          return false;
        }
      }
      this.allPositions.get(nextMove)?.push(position);
      nextMove += 1;
      currentPosition = position;
    }
    return true;
  }

  private GenerateMoves(person: Person) {
    if (person.trajectory === undefined) {
      person.trajectory = new Trajectory();
    }
    for (var i = 0; i < this.level.numMoves!; i++) {
      const randint = Math.floor(
        Math.random() * this.journey.allowedMoves.length
      );
      const randMove = this.journey.allowedMoves[randint];
      const move = new Move().fromJsonString(randMove.toJsonString());
      person.trajectory?.moves.push(move);
    }
    for (const trajectory of this.allTrajectories) {
      if (trajectory.equals(person.trajectory)) {
        if (person.trajectory !== undefined) {
          person.trajectory.moves = [];
        }
        this.GenerateMoves(person);
        return;
      }
    }
    this.allTrajectories.push(person.trajectory);
  }

  private CheckIndigenousHasMoves() {
    if (this.level.grid?.indigenous === undefined) {
      console.log("No indigenous found");
    }
    if (
      this.level.grid?.indigenous?.trajectory?.moves?.length! !==
      this.level.numMoves!
    ) {
      console.log(
        "Required moves: " +
          this.level.numMoves! +
          " vs actual: " +
          this.level.grid?.indigenous?.trajectory?.moves?.length!
      );
    }
  }

  private AddAliens() {
    this.CheckIndigenousHasMoves();
    for (var i = 0; i < this.level.numAliens!; i++) {
      const alien = new Person();
      this.level.grid?.aliens.push(alien);
      alien.type = PersonType.ALIEN;
      this.GenerateInitialState(alien, true);
    }
  }

  private AppendSelector() {
    this.container.appendChild(this.selector.GetAsElement());
  }

  private GenerateSelectionElement() {
    this.selection.setAttribute("id", "selection");
    this.container.appendChild(this.selection);
    var isSelectable = true;
    for (var i = 0; i < this.level.numMoves!; i++) {
      const emptyOption = document.createElement("span");
      emptyOption.classList.add("option");
      if (isSelectable) {
        emptyOption.classList.add("nextSelectable");
        isSelectable = false;
      } else {
        emptyOption.classList.add("notSelectable");
      }
      this.selection.appendChild(emptyOption);
    }
  }

  WaitForUserSelection() {
    for (const promise of this.selector.WaitAndRegisterSelections()) {
      promise.then((option: Option) => {
        this.AddSelectedOption(option);
      });
      promise.catch(() => {
        console.log("No more selection to make");
      });
    }
  }

  AddSelectedOption(option: Option) {
    const selectable =
      this.selection.getElementsByClassName("nextSelectable")[0];
    if (!selectable) {
      // All moves in the trajectory have been filled.
      // This can happen when
      return;
    }
    selectable.classList.add("selected");
    selectable.classList.remove("nextSelectable");
    selectable.textContent = Icons.get(option.move?.direction!)!;
    const nextSelectable =
      this.selection.getElementsByClassName("notSelectable")[0];
    if (nextSelectable !== undefined) {
      nextSelectable.classList.add("nextSelectable");
      nextSelectable.classList.remove("notSelectable");
    }
    this.level.grid?.indigenous?.trajectory?.moves.push(option.move);
    if (
      this.level.grid?.indigenous?.trajectory?.moves?.length! ===
      this.level.numMoves
    ) {
      this.selector.MakeAllOptionsUnselectable();
      this.validateElement.enableButtonAndWaitForClick().then(() => {
        this.FillLevel();
        this.Validate();
      });
    } else {
      // For RandomOptions, we need to re generate a new Promise for the
      // next user selection.
      if (option instanceof RandomOption) {
        this.WaitForUserSelection();
      }
    }
  }

  // Object this.level has been filled in with moves and initial positions.
  Validate() {
    this.selector.Hide();
    this.HideValidateElement();
    this.BuildGrid();
  }

  private HideValidateElement() {
    this.validateElement.Hide();
  }

  private BuildGrid() {
    this.container.appendChild(this.grid.GetAsElement());
    this.grid.StartGame(this.level).then((score: number | undefined) => {
      this.level.score = score;
      this.grid.End();
      setTimeout(() => this.UpdateAndShowScoreBoard(), 1000);
    });
  }

  private appendContainer() {
    this.outContainer.appendChild(this.container);
  }

  private cleanup() {
    this.allTrajectories = new Array<Trajectory>();
    this.allPositions = new Map<number, Array<Position>>();
    while (this.outContainer.hasChildNodes()) {
      clear(this.outContainer.firstChild!);
    }
  }

  private restartJourneyFromScratch() {
    // Scracth all scores from current journey
    for (const journey of this.game.journeys) {
      if (journey.number !== this.game.nextJourney) {
        continue;
      }
      this.resetJourney(journey);
    }
    this.Init();
  }

  private restartGameFromScratch() {
    // Scracth all scores from current journey
    for (const journey of this.game.journeys) {
      this.resetJourney(journey);
    }
    this.game.nextJourney = 1;
    this.Init();
  }

  private resetJourney(journey: Journey) {
    for (const level of journey.levels) {
      level.score = undefined;
    }
    journey.nextLevel = 1;
  }

  private triggerNextLevel() {
    var gameJourney: Journey = new Journey();
    for (const journey of this.game.journeys) {
      if (journey.number === this.journey.number) {
        gameJourney = journey;
      }
    }
    if (!gameJourney.nextLevel) {
      gameJourney.nextLevel = 1;
    }
    if (gameJourney.nextLevel === gameJourney.levels.length) {
      this.game.nextJourney! += 1;
      this.Init();
      return;
    }
    gameJourney.nextLevel += 1;
    this.Init();
  }
}

function Init() {
  const game: Game = getGame();
  const app = new TapTheDot(game);
  app.Init();
}

function getGame(): Game {
  const storedGameStr = localStorage.getItem("game");
  if (!storedGameStr) {
    return GAME;
  }
  const storedGame = new Game().fromJsonString(storedGameStr);
  var nextJourney = storedGame.nextJourney;
  if (!nextJourney) {
    nextJourney = 1;
  }
  GAME.nextJourney = nextJourney;
  for (var i = 0; i < nextJourney; i++) {
    const storedJourney = storedGame.journeys.at(i);
    const journey = GAME.journeys.at(i);
    if (storedJourney && journey) {
      if (!storedJourney.nextLevel) {
        storedJourney.nextLevel = 1;
      }
      journey.nextLevel = storedJourney.nextLevel;
      for (var j = 0; j < GAME.journeys[i].levels.length; j++) {
        const storedLevel = storedJourney.levels.at(j);
        const level = journey.levels.at(j);
        if (storedLevel && storedLevel.score && level) {
          level.score = storedLevel.score;
        }
      }
    }
  }
  return GAME;
}

export function getJourney(game: Game): Journey {
  var fallbackJourney: Journey = new Journey();
  for (const journey of game.journeys) {
    if (journey.number === game.nextJourney) {
      return journey;
    }
    if (fallbackJourney === undefined) {
      fallbackJourney = journey;
    }
  }
  return fallbackJourney;
}

export function getLevel(journey: Journey, levelNumber: number): Level {
  for (const level of journey.levels) {
    if (level.number === levelNumber) {
      return level;
    }
  }
  throw new Error("Journey is completed");
}

function getDefaultGrid(): Grid {
  return new Grid({
    indigenous: new Person({
      trajectory: new Trajectory(),
      type: PersonType.INDIGENOUS,
    }),
  });
}

function clear(node: Node) {
  while (node.hasChildNodes()) {
    clear(node.firstChild!);
  }
  node.parentNode?.removeChild(node);
}

const GAME: Game = new Game({
  journeys: [
    new Journey({
      number: 1,
      theme: Theme.BEACH,
      allowedMoves: [
        new Move({ direction: MoveDirection.NORTH }),
        new Move({ direction: MoveDirection.SOUTH }),
        new Move({ direction: MoveDirection.WEST }),
        new Move({ direction: MoveDirection.EAST }),
      ],
      levels: [
        new Level({
          number: 1,
          size: 5,
          numMoves: 3,
          numAliens: 3,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 460,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 2,
          size: 5,
          numMoves: 3,
          numAliens: 3,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 440,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 3,
          size: 5,
          numMoves: 3,
          numAliens: 3,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 420,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 4,
          size: 5,
          numMoves: 3,
          numAliens: 3,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 400,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 5,
          size: 5,
          numMoves: 3,
          numAliens: 3,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 380,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 6,
          size: 5,
          numMoves: 3,
          numAliens: 3,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 360,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 7,
          size: 5,
          numMoves: 3,
          numAliens: 3,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 340,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 8,
          size: 5,
          numMoves: 3,
          numAliens: 3,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 320,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 9,
          size: 5,
          numMoves: 3,
          numAliens: 3,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 300,
          trajectoryIterationsAllowed: 5,
        }),
      ],
      symbols: [
        "waves",
        "pool",
        "surfing",
        "beach_access",
        "sailing",
        "castle",
        "sunny",
        "icecream",
        "phishing",
        "scuba_diving",
        "eyeglasses",
      ],
      minimumStarNumber: 30,
      nextLevel: 1,
    }),
    new Journey({
      number: 2,
      theme: Theme.MOUNTAIN,
      allowedMoves: [
        new Move({ direction: MoveDirection.NORTH_EAST }),
        new Move({ direction: MoveDirection.NORTH_WEST }),
        new Move({ direction: MoveDirection.SOUTH_EAST }),
        new Move({ direction: MoveDirection.SOUTH_WEST }),
      ],
      levels: [
        new Level({
          number: 1,
          size: 5,
          numMoves: 3,
          numAliens: 4,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 440,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 2,
          size: 5,
          numMoves: 3,
          numAliens: 4,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 420,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 3,
          size: 5,
          numMoves: 3,
          numAliens: 4,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 400,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 4,
          size: 5,
          numMoves: 3,
          numAliens: 4,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 380,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 5,
          size: 5,
          numMoves: 3,
          numAliens: 4,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 360,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 6,
          size: 5,
          numMoves: 3,
          numAliens: 4,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 340,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 7,
          size: 5,
          numMoves: 3,
          numAliens: 4,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 320,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 8,
          size: 5,
          numMoves: 3,
          numAliens: 4,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 300,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 9,
          size: 5,
          numMoves: 3,
          numAliens: 4,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 280,
          trajectoryIterationsAllowed: 5,
        }),
      ],
      symbols: [
        "landscape",
        "downhill_skiing",
        "snowmobile",
        "ac_unit",
        "cloudy_snowing",
        "snowing_heavy",
        "sledding",
        "snowshoeing",
        "cabin",
        "cyclone",
        "mode_dual",
      ],
      minimumStarNumber: 30,
      nextLevel: 1,
    }),
    new Journey({
      number: 3,
      theme: Theme.SPACE,
      allowedMoves: [
        new Move({ direction: MoveDirection.NORTH }),
        new Move({ direction: MoveDirection.SOUTH }),
        new Move({ direction: MoveDirection.WEST }),
        new Move({ direction: MoveDirection.EAST }),
        new Move({ direction: MoveDirection.DOUBLE_NORTH }),
        new Move({ direction: MoveDirection.DOUBLE_SOUTH }),
        new Move({ direction: MoveDirection.DOUBLE_WEST }),
        new Move({ direction: MoveDirection.DOUBLE_EAST }),
      ],
      levels: [
        new Level({
          number: 1,
          size: 6,
          numMoves: 3,
          numAliens: 5,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 420,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 2,
          size: 6,
          numMoves: 3,
          numAliens: 5,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 400,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 3,
          size: 6,
          numMoves: 3,
          numAliens: 5,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 380,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 4,
          size: 6,
          numMoves: 3,
          numAliens: 5,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 360,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 5,
          size: 6,
          numMoves: 3,
          numAliens: 5,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 340,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 6,
          size: 6,
          numMoves: 3,
          numAliens: 5,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 320,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 7,
          size: 6,
          numMoves: 3,
          numAliens: 5,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 300,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 8,
          size: 6,
          numMoves: 3,
          numAliens: 5,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 280,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 9,
          size: 6,
          numMoves: 3,
          numAliens: 5,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 260,
          trajectoryIterationsAllowed: 5,
        }),
      ],
      symbols: [
        "rocket_launch",
        "public",
        "sunny",
        "nightlight",
        "star",
        "satellite_alt",
      ],
      minimumStarNumber: 40,
      nextLevel: 1,
    }),
    new Journey({
      number: 5,
      theme: Theme.MOUNTAIN,
      allowedMoves: [
        new Move({ spin: MoveSpin.HALF_CLOCKWISE }),
        new Move({ spin: MoveSpin.HALF_COUNTER_CLOCKWISE }),
      ],
      levels: [
        new Level({
          number: 1,
          size: 5,
          numMoves: 3,
          numAliens: 5,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 420,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 2,
          size: 5,
          numMoves: 3,
          numAliens: 5,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 400,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 3,
          size: 5,
          numMoves: 3,
          numAliens: 5,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 380,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 4,
          size: 5,
          numMoves: 3,
          numAliens: 5,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 360,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 5,
          size: 5,
          numMoves: 3,
          numAliens: 5,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 340,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 6,
          size: 5,
          numMoves: 3,
          numAliens: 5,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 320,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 7,
          size: 5,
          numMoves: 3,
          numAliens: 5,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 300,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 8,
          size: 5,
          numMoves: 3,
          numAliens: 5,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 280,
          trajectoryIterationsAllowed: 5,
        }),
        new Level({
          number: 9,
          size: 5,
          numMoves: 3,
          numAliens: 5,
          grid: getDefaultGrid(),
          movesAreRandomlyGenerated: true,
          timePerMoveMs: 260,
          trajectoryIterationsAllowed: 5,
        }),
      ],
      symbols: [
        "rocket_launch",
        "public",
        "sunny",
        "nightlight",
        "star",
        "satellite_alt",
      ],
      minimumStarNumber: 40,
      nextLevel: 1,
    }),
  ],
  nextJourney: 1,
});

Init();
