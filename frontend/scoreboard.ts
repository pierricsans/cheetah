import { Game, Journey, Level } from './protos/level_pb.js';
import { MAXIMUM_LEVEL_POINTS, TOTAL_NUM_STARS } from './constants.js';
import { App } from './app.js';

export class ScoreBoard {
  app: App;
  nextLevelButton: HTMLElement = document.createElement("div");
  private game: Game;
  private element: HTMLElement = document.createElement("div");
  private journeyBoards: Map<number, JourneyBoard> = new Map<number, JourneyBoard>();
  private restartJourneyButton: HTMLElement = document.createElement("div");
  private restartGameButton: HTMLElement = document.createElement("div");
  nextLevelFunction = (event: Event) => this.app.triggerNextLevel(event);

  constructor(game: Game, app: App) {
    this.game = game;
    this.app = app;
    this.build();
  }

  GetAsElement(): HTMLElement {
    return this.element;
  }

  Show() {
    this.element.hidden = false;
    if (this.game.nextJourney === undefined) {
      throw Error("game.nextJourney is undefined");
    }
    if (!this.journeyBoards.has(this.game.nextJourney)) {
      throw Error("Journey not found: " + this.game.nextJourney);
    }
    this.journeyBoards.get(this.game.nextJourney)?.Show();
  }

  Hide() {
    this.element.hidden = true;
  }

  Update() {
    this.journeyBoards.forEach((journeyBoard: JourneyBoard) => journeyBoard.Update())
  }

  private build() {
    this.element.setAttribute('id', 'scoreboard');
    this.element.hidden = true;
    for (const journey of this.game.journeys) {
      if (journey.number === undefined) {
        throw Error("Journey number not defined: " + journey);
      }
      const journeyBoard = new JourneyBoard(journey, this);
      this.journeyBoards.set(journey.number, journeyBoard);
      this.element.appendChild(journeyBoard.GetAsElement())
    }
    this.nextLevelButton.setAttribute('id', 'Next');
    this.nextLevelButton.setAttribute('alt', 'Next level');
    this.nextLevelButton.textContent = 'skip_next';
    this.nextLevelButton.classList.add('selectable');
    this.nextLevelButton.classList.add('option');
    this.nextLevelButton.addEventListener('click', this.nextLevelFunction);
    this.element.appendChild(this.nextLevelButton);
    this.restartJourneyButton.setAttribute('id', 'Retry');
    this.restartJourneyButton.setAttribute('alt', 'Restart from level 1');
    this.restartJourneyButton.classList.add('selectable');
    this.restartJourneyButton.classList.add('option');
    this.restartJourneyButton.addEventListener('click', (event: Event) => this.app.restartJourneyFromScratch(event));
    this.restartJourneyButton.textContent = 'redo';
    this.element.appendChild(this.restartJourneyButton);
    this.restartGameButton.setAttribute('id', 'Restart');
    this.restartGameButton.setAttribute('alt', 'Restart game');
    this.restartGameButton.classList.add('selectable');
    this.restartGameButton.classList.add('option');
    this.restartGameButton.addEventListener('click', (event: Event) => this.app.restartGameFromScratch(event));
    this.restartGameButton.textContent = 'restart_alt';
    this.element.appendChild(this.restartGameButton);
  }

}

class JourneyBoard {
  journey: Journey;
  element: HTMLElement = document.createElement('div');
  levels: Map<number, LevelBoard> = new Map<number, LevelBoard>;
  header = document.createElement("div");
  star = document.createElement("span");
  scoreboard: ScoreBoard;

  constructor(journey: Journey, scoreboard: ScoreBoard) {
    this.journey = journey;
    this.scoreboard = scoreboard;
    this.build();
  }

  GetAsElement(): HTMLElement {
    return this.element;
  }

  Hide() {
    this.element.hidden = true;
  }

  Show() {
    this.element.hidden = false;
  }

  private build() {
    this.element.hidden = true;
    this.element.classList.add('journeyBoard');
    this.header.textContent = this.journey.symbols[0];
    this.header.classList.add('journeyBoardHeader');
    this.star.setAttribute('id', 'starCounter');
    this.header.appendChild(this.star);
    this.element.appendChild(this.header);
    for (const level of this.journey.levels) {
      if (level.number === undefined) {
        throw Error('Level number undefined ' + level);
      }
      const levelBoard = new LevelBoard(level);
      this.levels.set(level.number, levelBoard);
      this.element.appendChild(levelBoard.GetAsElement());
    }
  }

  Update() {
    this.levels.forEach((levelBoard: LevelBoard) => levelBoard.Update());
    const starNum = this.element.getElementsByClassName('filledStar').length;
    this.star.textContent = starNum.toString() + '/' + this.journey.minimumStarNumber;
    if (this.journey.levels.length === this.journey.nextLevel) {
      var allLevelsHaveStars: boolean = true;
      for (const levelBoard of this.levels.values()) {
        if (levelBoard.GetAsElement().getElementsByClassName('filledStar').length === 0) {
          allLevelsHaveStars = false;
        }
      }
      if ((starNum >= this.journey.minimumStarNumber! && !allLevelsHaveStars) ||
        starNum < this.journey.minimumStarNumber! && allLevelsHaveStars) {
        this.scoreboard.nextLevelButton.removeEventListener('click', this.scoreboard.nextLevelFunction);
        this.scoreboard.nextLevelButton.classList.remove('selectable');
      }
    }
  }
}

class LevelBoard {
  level: Level
  element: HTMLElement = document.createElement("div");
  levelNumber: HTMLElement = document.createElement("span");
  levelScore: HTMLElement = document.createElement("span");

  constructor(level: Level) {
    this.level = level;
    this.levelNumber.classList.add('levelBoard-number');
    this.levelNumber.textContent = this.level.number?.toString() || '';
    this.element.appendChild(this.levelNumber);
    this.levelScore.classList.add('levelBoard-score');
    this.setLevelScore();
    this.element.appendChild(this.levelScore);
    this.Update();
  }

  GetAsElement(): HTMLElement {
    return this.element;
  }


  Update() {
    const stars = this.levelScore.children;
    if (this.level.score === undefined) {
      for (var i = 0; i < TOTAL_NUM_STARS; i++) {
          stars[i].classList.remove('filledStar');
          stars[i].classList.add('emptyStar');
        }
      return;
    }
    const numStars = convertScoreToStars(this.level.score);
    for (var i = 0; i < TOTAL_NUM_STARS; i++) {
      if (i < numStars) {
        stars[i].classList.add('filledStar');
        stars[i].classList.remove('emptyStar');
      } else {
        stars[i].classList.remove('filledStar');
        stars[i].classList.add('emptyStar');
      }
    }
  }

  private setLevelScore() {
    for (var i = 0; i < TOTAL_NUM_STARS; i++) {
      const star = document.createElement("span");
      star.textContent = 'star_rate';
      this.levelScore.appendChild(star);
    }
  }

}

function convertScoreToStars(score: number): number {
  const starNum = score / MAXIMUM_LEVEL_POINTS * TOTAL_NUM_STARS;
  return Math.ceil(starNum);
}
