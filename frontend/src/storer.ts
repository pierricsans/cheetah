import { GAME } from "./levels.js";
import { Game, Journey, Level } from ".././protos/level_pb.js";

export class GameStorer {
  protected game: Game;
  protected nextJourney: number;
  constructor() {
    this.game = this.getGame();
    this.nextJourney = this.game.nextJourney || 1;
  }

  GetNextJourney(): number {
    return this.nextJourney;
  }

  GetJourneys(): Array<Journey> {
    return this.game.journeys;
  }

  private getGame(): Game {
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

  getJourney(): Journey {
    var fallbackJourney: Journey = new Journey();
    for (const journey of this.game.journeys) {
      if (journey.number === this.nextJourney) {
        return journey;
      }
      if (fallbackJourney === undefined) {
        fallbackJourney = journey;
      }
    }
    return fallbackJourney;
  }

  getLevel(journey: Journey, levelNumber: number): Level {
    for (const level of journey.levels) {
      if (level.number === levelNumber) {
        return level;
      }
    }
    throw new Error("Journey is completed. Requested: " + levelNumber);
  }

  StoreGameAsLocalStorage() {
    localStorage.setItem("game", this.game.toJsonString());
  }

  RestartJourney() {
    // Scracth all scores from current journey
    for (const journey of this.game.journeys) {
      if (journey.number !== this.nextJourney) {
        continue;
      }
      this.resetJourney(journey);
    }
  }

  RestartGame() {
    // Scracth all scores from current journey
    for (const journey of this.game.journeys) {
      this.resetJourney(journey);
    }
    this.nextJourney = 1;
  }

  GetJourneyFromNumber(num: number): Journey {
    for (const journey of this.game.journeys) {
      if (journey.number === num) {
        return journey;
      }
    }
    throw new Error("Could not find journey #" + num);
  }

  IncrementJourney() {
    this.nextJourney! += 1;
  }

  private resetJourney(journey: Journey) {
    for (const level of journey.levels) {
      level.score = undefined;
    }
    journey.nextLevel = 1;
  }
}
