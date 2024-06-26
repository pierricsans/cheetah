import { Game, Journey, Level, NextLevelAction } from ".././protos/level_pb.js";
import { MOUSEDOWN, TOTAL_NUM_STARS } from "./constants.js";
import { AppElement } from "./util.js";
import { GameStorer } from "./storer.js";
import { STAR } from "../emojis.js";

export class ScoreBoard extends AppElement {
  private buttonContainer: HTMLElement = document.createElement("div");
  private storer: GameStorer;
  private journeyBoards: Map<number, JourneyBoard> = new Map<
    number,
    JourneyBoard
  >();

  constructor(storer: GameStorer) {
    super();
    this.storer = storer;
    this.build();
  }

  Update(nextJourney: number | undefined) {
    this.journeyBoards.forEach((journeyBoard: JourneyBoard) => {
      journeyBoard.Update();
      journeyBoard.Hide();
    });
    if (nextJourney === undefined) {
      console.warn("Found unexpected undefined nextJourney");
      nextJourney = 1;
    }
    this.journeyBoards.get(nextJourney)?.Show();
    this.element.appendChild(this.buttonContainer);
    this.buttonContainer.classList.add("horizontalChoices");
    this.buttonContainer.classList.add("bottomBar");
  }

  waitforUserSelection(nextJourney: number | undefined): Promise<NextLevelAction> {
    if (nextJourney === undefined) {
      nextJourney = 1;
      console.warn("Found undefined nextJourney");
    }
    this.buttonContainer.textContent = "";
    return new Promise<NextLevelAction>((resolve) => {
      if (this.journeyBoards.get(nextJourney)?.CanAccessNextLevel()) {
        const nextLevelButton = this.generateButton("next");
        this.buttonContainer.appendChild(nextLevelButton);
        nextLevelButton.addEventListener(MOUSEDOWN, (event: MouseEvent) =>
          resolve(NextLevelAction.TRIGGER_NEXT_LEVEL)
        );
      } else {
        const restartGame = this.generateButton("Reset");
        this.buttonContainer.appendChild(restartGame);
        restartGame.addEventListener(MOUSEDOWN, (event: MouseEvent) =>
          resolve(NextLevelAction.RESTART_GAME)
        );

        const restartJourney = this.generateButton("Retry");
        this.buttonContainer.appendChild(restartJourney);
        restartJourney.addEventListener(MOUSEDOWN, (event: MouseEvent) =>
          resolve(NextLevelAction.RESTART_JOURNEY)
        );
      }
    });
  }

  private build() {
    this.Hide();
    for (const journey of this.storer.GetJourneys()) {
      if (journey.number === undefined) {
        throw Error("Journey number not defined: " + journey);
      }
      const journeyBoard = new JourneyBoard(journey, this.storer);
      this.journeyBoards.set(journey.number, journeyBoard);
      this.Append(journeyBoard);
    }
  }

  private generateButton(text: string): HTMLElement {
    var button = document.createElement("div");
    button.classList.add("selectable");
    button.classList.add("levelAction");
    button.textContent = text;
    return button;
  }
}

class JourneyBoard extends AppElement {
  journey: Journey;
  levels: Map<number, LevelBoard> = new Map<number, LevelBoard>();
  header = document.createElement("img");
  starCounter = document.createElement("span");
  starNum: number = 0;

  constructor(journey: Journey, storer: GameStorer) {
    super();
    this.journey = journey;
    this.Hide();
    this.element.classList.add("journeyBoard");
    this.header.src = this.journey.symbols[0];
    this.header.classList.add("journeyBoardHeader");
    this.starCounter.setAttribute("id", "starCounter");
    this.element.appendChild(this.starCounter);
    this.element.appendChild(this.header);
    for (const level of this.journey.levels) {
      if (level.number === undefined) {
        throw Error("Level number undefined " + level);
      }
      const levelBoard = new LevelBoard(level, storer, journey.number || 1);
      this.levels.set(level.number, levelBoard);
      this.Append(levelBoard);
    }
  }

  Update() {
    this.levels.forEach((levelBoard: LevelBoard) => levelBoard.Update());
    this.starNum = this.element.getElementsByClassName("active").length;
    this.starCounter.textContent =
      this.starNum.toString() + "/" + this.journey.minimumStarNumber;
  }

  CanAccessNextLevel(): boolean {
    if (this.journey.nextLevel === undefined) {
      throw Error("Next level not defined: " + this.journey.nextLevel);
    }
    const lastPlayedLevel = this.levels.get(this.journey.nextLevel);
    if (!lastPlayedLevel) {
      throw Error(
        "Level does not have LevelBoard: " +
          this.levels.get(this.journey.nextLevel)
      );
    }
    if (!lastPlayedLevel.GetNumberOfStars()) {
      // Last played level does not have at least one star
      return false;
    }
    if (this.journey.nextLevel !== this.journey.levels.length) {
      // At least one star and last played lavel is not the last of the journey
      return true;
    }
    if (this.starNum < this.journey.minimumStarNumber!) {
      return false;
    }
    return true;
  }
}

class LevelBoard extends AppElement {
  private level: Level;
  private journeyNumber: number;
  private levelNumber: HTMLElement = document.createElement("span");
  private levelScore: HTMLElement = document.createElement("span");
  storer: GameStorer;

  constructor(level: Level, storer: GameStorer, journeyNumber: number) {
    super();
    this.storer = storer;
    this.journeyNumber = journeyNumber;
    this.level = level;
    this.levelNumber.classList.add("levelBoard-number");
    this.levelNumber.textContent = this.level.number?.toString() || "";
    this.element.appendChild(this.levelNumber);
    this.setLevelScore();
    this.element.appendChild(this.levelScore);
    this.Update();
  }

  Update() {
    this.level.score = this.storer.getScore(this.journeyNumber, this.level.number || 1);
    const stars = this.levelScore.children;
    if (this.level.score === undefined) {
      for (var i = 0; i < TOTAL_NUM_STARS; i++) {
        stars[i].classList.remove("active");
        stars[i].classList.add("inactive");
      }
      return;
    }
    for (var i = 0; i < TOTAL_NUM_STARS; i++) {
      if (i < this.level.score) {
        stars[i].classList.add("active");
        stars[i].classList.remove("inactive");
      } else {
        stars[i].classList.remove("active");
        stars[i].classList.add("inactive");
      }
    }
  }

  GetNumberOfStars(): number {
    return this.GetAsElement().getElementsByClassName("active").length;
  }

  private setLevelScore() {
    for (var i = 0; i < TOTAL_NUM_STARS; i++) {
      const star = document.createElement("img");
      star.classList.add("score");
      star.src = STAR;
      this.levelScore.appendChild(star);
    }
  }
}
