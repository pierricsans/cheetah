import { AppElement } from "./src/util.js";
import { GAME } from "./src/levels.js";
import {
  Game,
  Journey,
  Level,
  NextLevelAction,
} from "./protos/level_pb.js";
import { ScoreBoard } from "./src/scoreboard.js";
import "./static/style.css";
import { LevelGame } from "./src/level_game.js";


export class GoSpotItApp extends AppElement {
  private game: Game;
  private journey: Journey | null;
  private level: Level | null;
  private levelGame: LevelGame | null;
  private scoreboard: ScoreBoard | null;
  private readonly outContainer: HTMLElement = document.body;

  constructor(game: Game) {
    super();
    this.game = game;
    this.levelGame = null;
    this.journey = null;
    this.level = null;
    this.scoreboard = null;
    this.element.setAttribute("id", "selectorContainer");
    this.element.classList.add("banner");
    this.outContainer.appendChild(this.element);
  }

  StartNewGameLevel() {
    this.cleanup();
    this.StoreGameAsLocalStorage();
    this.journey = new Journey().fromJsonString(
      getJourney(this.game).toJsonString()
    );
    this.level = new Level().fromJsonString(
      getLevel(this.journey, this.journey.nextLevel || 1).toJsonString()
    );
    this.levelGame = new LevelGame(this.journey, this.level);
    this.Append(this.levelGame);
    this.scoreboard = new ScoreBoard(this.game);
    this.Append(this.scoreboard);
    this.levelGame.Start().then(() => {this.UpdateAndShowScoreBoard()});
  }

  private StoreGameAsLocalStorage() {
    localStorage.setItem("game", this.game.toJsonString());
  }

  private cleanup() {
    this.Remove(this.levelGame);
    if (this.scoreboard) {   
      this.scoreboard.Hide();
    }
  }

  private UpdateAndShowScoreBoard() {
    if (!this.scoreboard) {
      return;
    }
    if (!this.journey) {
      return;
    }
    if (!this.level) {
      return;
    }
    this.levelGame?.Hide();
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

  private restartJourneyFromScratch() {
    // Scracth all scores from current journey
    for (const journey of this.game.journeys) {
      if (journey.number !== this.game.nextJourney) {
        continue;
      }
      this.resetJourney(journey);
    }
    this.StartNewGameLevel();
  }

  private restartGameFromScratch() {
    // Scracth all scores from current journey
    for (const journey of this.game.journeys) {
      this.resetJourney(journey);
    }
    this.game.nextJourney = 1;
    this.StartNewGameLevel();
  }

  private resetJourney(journey: Journey) {
    for (const level of journey.levels) {
      level.score = undefined;
    }
    journey.nextLevel = 1;
  }

  private triggerNextLevel() {
    if (!this.journey) {
      return;
    }
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
      this.StartNewGameLevel();
      return;
    }
    gameJourney.nextLevel += 1;
    this.StartNewGameLevel();
  }
}

function getGame(): Game {
  const storedGameStr = localStorage.getItem("game");
  if (!storedGameStr) {
    return GAME;
  }
  const storedGame = new Game().fromJsonString(storedGameStr, {
    ignoreUnknownFields: true,
  });
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

function getJourney(game: Game): Journey {
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

function getLevel(journey: Journey, levelNumber: number): Level {
  for (const level of journey.levels) {
    if (level.number === levelNumber) {
      return level;
    }
  }
  throw new Error("Journey is completed");
}

function clear(node: Node) {
  while (node.hasChildNodes()) {
    clear(node.firstChild!);
  }
  node.parentNode?.removeChild(node);
}

function Init() {
  const game: Game = getGame();
  const app = new GoSpotItApp(game);
  app.StartNewGameLevel();
}

Init();
