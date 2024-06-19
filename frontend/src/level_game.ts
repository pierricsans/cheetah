// One game:
//   1. Spin the roulette
//   3. Spot the indigenous
//   3. Get your score
//   4. Back to main game, for next level

import { shuffleArray, AppElement } from "./util.js";

import {
  Grid,
  Journey,
  Level,
  Move,
  MoveDirection,
  Person,
  PersonType,
  Position,
  Trajectory,
} from ".././protos/level_pb.js";
import { GridInst } from "./grid.js";
import { Selector } from "./selector.js";
import { TIMEOUT_BETWEEN_GAME_AND_SCOREBOARD } from "./constants.js";

import { ValidationElement } from "./validation.js";

export class LevelGame extends AppElement {
  private level: Level;
  private journey: Journey;
  private selector: Selector;
  private validateElement: ValidationElement;
  private grid: GridInst;
  // Stores all current level's trajectories, to avoid duplicates.
  // Includes the indigenous.
  private trajectoriesRegistar: Array<Trajectory> = new Array<Trajectory>();
  // Stores all positions, for all people, to avoid duplicates.
  // The map's key is the position's number:
  // 0 is initial position, 1 is the position after the first move, etc.
  // The value is an array of all Positions, which should all be unique.
  private positionsRegistar: Map<number, Array<Position>> = new Map<
    number,
    Array<Position>
  >();

  constructor(journey: Journey, level: Level) {
    super();
    this.journey = journey;
    this.level = level;
    shuffleArray(this.journey.symbols);
    this.selector = new Selector(this.journey, this.level);
    this.Append(this.selector);
    this.grid = new GridInst(this.journey, this.level);
    this.validateElement = new ValidationElement();
    this.Append(this.validateElement);
  }

  async Start() {
    await this.WaitForUserSelection();
    await this.BuildGridAndStartGame();
  }

  private BuildGridAndStartGame(): Promise<void> {
    return new Promise(async (resolve) => {
      this.Append(this.grid);
      const score: number | undefined = await this.grid.StartGame(this.level);
      this.level.score = score;
      this.grid.End();
      setTimeout(() => resolve(), TIMEOUT_BETWEEN_GAME_AND_SCOREBOARD);
    });
  }

  // Generate a person's initial state:
  // 1. Gets its symbol (aka color)
  // 2. If alien, will generate its moves then store them. If
  //    indigenous, will go straight to storing them.
  // 3. Will generate its starting position.
  private GenerateInitialState(person: Person, generateMoves: boolean = false) {
    person.color = this.GetNextColor();
    if (generateMoves) {
      this.GenerateMoves(person);
    }
    this.trajectoriesRegistar.push(person.trajectory!);
    this.GenerateInitialPosition(person);
  }

  // Generates a person's random moves. If the moves were
  // already registered, recursively generate new ones.
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
      person.trajectory.moves.push(move);
    }
    if (this.trajectoriesRegistar.length === 0) {
      throw new Error(
        "Before generating random moves, " +
          "the indigenous move should be stored."
      );
    }
    for (const trajectory of this.trajectoriesRegistar) {
      if (trajectory.equals(person.trajectory)) {
        person.trajectory.moves = [];
        this.GenerateMoves(person);
        return;
      }
    }
  }

  private GetNextColor(): string {
    const color = this.journey.symbols.pop();
    if (color === undefined) {
      console.log("No more colors");
      return "";
    } else {
      return color;
    }
  }

  private GenerateInitialPosition(person: Person) {
    const y_moves = new Array<MoveDirection>();
    const x_moves = new Array<MoveDirection>();
    if (!person.trajectory) {
      throw Error("Person has no trajectory: " + person);
    }
    for (const move of person.trajectory?.moves!) {
      switch (move.direction) {
        case MoveDirection.NO_MOVE:
        case MoveDirection.UNSPECIFIED:
        case undefined:
          break;
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
    try {
      this.registerPosition(person);
    } catch {
      delete person.position;
      console.log("unlucky-position");
      this.GenerateInitialPosition(person);
    }
  }

  private registerPosition(person: Person): void {
    const initialPosition = person.position!;
    if (!this.positionsRegistar.has(0)) {
      this.positionsRegistar.set(0, new Array());
    }
    for (const registeredPosition of this.positionsRegistar.get(0)!) {
      if (initialPosition.equals(registeredPosition)) {
        throw new Error();
      }
    }
    this.positionsRegistar.get(0)?.push(initialPosition);
    var nextMove: number = 1;
    var currentPosition: Position = initialPosition;
    for (const move of person.trajectory?.moves!) {
      const position: Position = new Position();
      switch (move.direction) {
        case undefined:
        case MoveDirection.UNSPECIFIED:
        case MoveDirection.NO_MOVE:
          position.xOffset = currentPosition.xOffset;
          position.yOffset = currentPosition.yOffset;
          break;
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
      if (!this.positionsRegistar.has(nextMove)) {
        this.positionsRegistar.set(nextMove, new Array());
      }
      for (const registeredPosition of this.positionsRegistar.get(nextMove)!) {
        if (registeredPosition.equals(position)) {
          throw new Error();
        }
      }
      this.positionsRegistar.get(nextMove)?.push(position);
      nextMove += 1;
      currentPosition = position;
    }
  }

  private GenerateAliensAndStates() {
    const grid: Grid = this.level.grid!;
    grid.height = this.level.size;
    grid.width = this.level.size;
    this.GenerateInitialState(grid.indigenous!);
    this.AddAliens();
  }

  private AddAliens() {
    for (var i = 0; i < this.level.numAliens!; i++) {
      const alien = new Person();
      this.level.grid?.aliens.push(alien);
      alien.type = PersonType.ALIEN;
      this.GenerateInitialState(alien, true);
    }
  }

  private async WaitForUserSelection(): Promise<void> {
    return new Promise(async (resolve) => {
      await this.validateElement.listenForSpinClick();
      await this.selector.TriggerRoll();
      await this.validateElement.listenForSpotClick();
      this.GenerateAliensAndStates();
      this.validateElement.Hide();
      resolve();
    });
  }
}

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
