import { GAME } from "./levels.js";
import { Game, Journey, Level } from ".././protos/level_pb.js";

export class GameStorer {
  protected game: Game;
  constructor() {
    this.game = this.getGame();
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
    GAME.nextJourney = storedGame.nextJourney || 1;
    console.log("J=" + GAME.nextJourney);
    var haveSeenNextJourney = false;
    for (const journey of GAME.journeys) {
      if (journey.number === undefined) {
        throw new Error(
          "All journeys should have a number: " + journey.toJsonString
        );
      }
      if (journey.number === GAME.nextJourney) {
        haveSeenNextJourney = true;
      }
      for (const storedJourney of storedGame.journeys) {
        if (journey.number !== storedJourney.number) {
          continue;
        }
        journey.nextLevel = storedJourney.nextLevel || 1;
        var haveSeenLevel = false;
        for (const level of journey.levels) {
          if (level.number === undefined) {
            throw new Error(
              "All levels should have a number: " + level.toJsonString
            );
          }
          if (level.number === journey.nextLevel) {
            haveSeenLevel = true;
          }
          if (level.number > journey.nextLevel) {
            level.score = undefined;
            continue
          }
          for (const storedLevel of storedJourney.levels) {
            if (level.number !== storedLevel.number) {
              continue;
            }
            level.score = storedLevel.score;
          }
        }
        if (!haveSeenLevel) {
          console.warn(
            "Found corrupted next Level: "
            + storedJourney.nextLevel
            + ". Fallback to 1"
          );
          journey.nextLevel = 1;
        }
      }
    }
    if (!haveSeenNextJourney) {
      console.warn(
        "Found corrupted next Journey: " +
          storedGame.nextJourney +
          ". Fallback to 1."
      );
      GAME.nextJourney = 1;
    }
    return GAME;
  }

  getJourney(): Journey {
    var fallbackJourney: Journey = new Journey();
    for (const journey of this.game.journeys) {
      if (journey.number === this.game.nextJourney) {
        return journey;
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

  getScore(journeyNum: number, levelNum: number): number | undefined {
    for (const journey of this.game.journeys) {
      if (journey.number !== journeyNum) {
        continue;
      }
      for (const level of journey.levels) {
        if (level.number !== levelNum) {
          continue
        }
        return level.score;
      }
    }
  }

  StoreGameAsLocalStorage() {
    localStorage.setItem("game", this.game.toJsonString());
  }

  storeScore(score: number | undefined) {
    for (const journey of this.game.journeys) {
      if (journey.number !== this.game.nextJourney) {
        continue;
      }
      for (const level of journey.levels) {
        if (level.number !== journey.nextLevel) {
          continue;
        }
        level.score = score;
        console.log(
          "Set score " + score + " to J" + journey.number + "L" + level.number
        );
      }
    }
    this.StoreGameAsLocalStorage();
  }

  RestartJourney() {
    // Scracth all scores from current journey
    for (const journey of this.game.journeys) {
      if (journey.number !== this.game.nextJourney) {
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
    this.game.nextJourney = 1;
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
    this.game.nextJourney! += 1;
    console.log("incremented next journey: " + this.game.nextJourney);
  }

  private resetJourney(journey: Journey) {
    for (const level of journey.levels) {
      level.score = undefined;
    }
    journey.nextLevel = 1;
  }
}
