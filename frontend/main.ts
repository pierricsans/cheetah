import { AppElement } from "./src/util.js";
import { Game, Journey, Level, NextLevelAction } from "./protos/level_pb.js";
import { ScoreBoard } from "./src/scoreboard.js";
import "./static/style.css";
import { LevelGame } from "./src/level_game.js";
import { GameStorer } from "./src/storer.js";

export class GoSpotItApp extends AppElement {
  private storer: GameStorer;
  private levelGame: LevelGame | null = null;
  private journey: Journey | null = null;
  private level: Level | null = null;
  private scoreboard: ScoreBoard | null = null;
  private readonly outContainer: HTMLElement = document.body;

  constructor() {
    super();
    this.storer = new GameStorer();
    this.element.setAttribute("id", "selectorContainer");
    this.element.classList.add("banner");
    this.outContainer.appendChild(this.element);
  }

  async StartNewGameLevel() {
    this.cleanup();
    this.storer.StoreGameAsLocalStorage();
    this.journey = new Journey().fromJsonString(
      this.storer.getJourney().toJsonString()
    );
    this.level = new Level().fromJsonString(
      this.storer
        .getLevel(this.journey, this.journey.nextLevel || 1)
        .toJsonString()
    );
    this.levelGame = new LevelGame(this.journey, this.level);
    this.Append(this.levelGame);
    this.scoreboard = new ScoreBoard(this.storer);
    this.Append(this.scoreboard);
    const score = await this.levelGame.Start();
    this.storer.storeScore(score);
    this.UpdateAndShowScoreBoard(score);
    const action = await this.scoreboard.waitforUserSelection(this.journey.number);
    this.performNextLevelAction(action);
  }

  private cleanup() {
    this.Remove(this.levelGame);
    this.Remove(this.scoreboard);
  }

  private UpdateAndShowScoreBoard(score: number | undefined) {
    if (!this.scoreboard) {
      return;
    }
    if (!this.journey) {
      return;
    }
    if (!this.level) {
      return;
    }
    if (!score) {
      console.warn("Fallback to score 0");
      score = 0;
    }
    this.levelGame?.Hide();
    this.storer.getLevel(
      this.storer.getJourney(),
      this.journey.nextLevel || 1
    ).score = score;
    this.storer.StoreGameAsLocalStorage();
    this.scoreboard.Update(this.journey.number);
    this.scoreboard.Show();
  }

  private performNextLevelAction(action: NextLevelAction) {
    switch (action) {
      case NextLevelAction.RESTART_GAME:
        this.storer.RestartGame();
        break;
      case NextLevelAction.RESTART_JOURNEY:
        this.storer.RestartJourney();
        break;
      case NextLevelAction.TRIGGER_NEXT_LEVEL:
        this.triggerNextLevel();
        break;
      default:
        throw Error("Unknown level action: " + action);
    }
    this.StartNewGameLevel();
  }

  private triggerNextLevel() {
    if (!this.journey) {
      return;
    }
    if (!this.journey.number) {
      throw new Error("Journey does not have a number");
    }
    var gameJourney = this.storer.GetJourneyFromNumber(this.journey.number);
    if (!gameJourney.nextLevel) {
      gameJourney.nextLevel = 1;
    }
    if (gameJourney.nextLevel >= gameJourney.levels.length) {
      this.storer.IncrementJourney();
      return;
    }
    gameJourney.nextLevel += 1;
  }
}

function Init() {
  const app = new GoSpotItApp();
  app.StartNewGameLevel();
}

Init();
