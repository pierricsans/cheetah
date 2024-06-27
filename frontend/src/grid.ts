import { BoardBead, endOfCycleParams } from "./bead.js";
import {
  BeadSelection,
  Journey,
  Level,
  LevelStatus,
  Person,
  PersonType,
} from ".././protos/level_pb.js";
import { CountDown } from "./countdown.js";
import { AppElement, shuffleArray } from "./util.js";

class InnerContainer extends AppElement {
  constructor() {
    super();
    this.element.setAttribute("id", "innerContainer");
  }
}

class OuterContainer extends AppElement {
  constructor() {
    super();
    this.element.setAttribute("id", "outerContainer");
  }
}

class BeadsContainer extends AppElement {
  constructor() {
    super();
    this.element.setAttribute("id", "avatarBeadsContainer");
  }
}

export class GridInst extends AppElement {
  journey: Journey;
  level: Level;
  countdown: CountDown;
  private innerContainer: InnerContainer = new InnerContainer();
  private outerContainer: OuterContainer = new OuterContainer();
  private avatarBeadsContainer: BeadsContainer = new BeadsContainer();
  private beads: Array<BoardBead> = [];

  constructor(journey: Journey, level: Level) {
    super();
    this.journey = journey;
    this.level = level;
    this.countdown = this.AppendCountDown();
    this.outerContainer.Append(this.innerContainer);
    this.Append(this.outerContainer);
    this.Append(this.avatarBeadsContainer);
  }

  End() {
    for (const bead of this.beads) {
      bead.Reveal();
    }
  }

  StartGame(level: Level): Promise<number | undefined> {
    this.level = level;
    if (!this.level.grid) {
      throw Error("No grid found in level: " + this.level);
    }
    for (const alien of this.level.grid.aliens) {
      this.AppendPerson(alien);
    }
    if (!this.level.grid.indigenous) {
      throw Error("No indigenous found in grid: " + this.level.grid);
    }
    this.AppendPerson(this.level.grid.indigenous);
    this.AppendAvatarBeads();
    const seenCycles = new Set<number>();
    return new Promise<number | undefined>(async (resolve) => {
      for (const bead of this.beads) {
        // The beads fire a window event with payload endOfCycleParams
        // to signal that they have finished one cycle.
        // Whenever that happens, remove 1 star.
        window.addEventListener(
          "message",
          async (event: MessageEvent<endOfCycleParams>) => {
            if (!seenCycles.has(event.data.iterationNum)) {
              seenCycles.add(event.data.iterationNum);
              const hasStarsRemaining: boolean =
                await this.countdown.RemoveStar(event.data.playbackRate);
              if (!hasStarsRemaining) {
                this.stopAnimations();
                resolve(0);
              }
            }
          }
        );
        bead.animateElement();
      }
      const outcome: LevelStatus = await this.StartGameAndWaitForOutcome();
      this.stopAnimations();
      if (outcome == LevelStatus.LOSE) {
        resolve(undefined);
      }
      resolve(this.countdown.numStars);
    });
  }

  private async StartGameAndWaitForOutcome(): Promise<LevelStatus> {
    const status: LevelStatus = await new Promise<LevelStatus>(
      async (resolve) => {
        const status: BeadSelection = await this.startBeadAnimationsAndWait();
        switch (status) {
          case BeadSelection.WRONG_GUESS:
            const hasStarsRemaining: boolean = await this.countdown.RemoveStar(
              /*playbackRate=*/ 1
            );
            if (hasStarsRemaining) {
              resolve(LevelStatus.UNSPECIFIED);
            } else {
              resolve(LevelStatus.LOSE);
            }
            break;
          case BeadSelection.CORRECT_GUESS:
            this.countdown.CancelAnimationAndRestoreStar();
            resolve(LevelStatus.WIN);
            break;
        }
      }
    );
    switch (status) {
      case LevelStatus.WIN:
        return LevelStatus.WIN;
      case LevelStatus.LOSE:
        return LevelStatus.LOSE;
      case LevelStatus.UNSPECIFIED:
        return this.StartGameAndWaitForOutcome();
      default:
        throw Error("Unknown LevelStatus: " + status);
    }
  }

  private AppendPerson(person: Person) {
    const bead = new BoardBead(person, this.level);
    this.beads.push(bead);
    this.innerContainer.Append(bead);
  }

  private AppendAvatarBeads() {
    shuffleArray(this.beads);
    for (const bead of this.beads) {
      const avatarBead = bead.GetAvatarBead();
      this.avatarBeadsContainer.Append(avatarBead);
    }
  }

  private stopAnimations() {
    for (const bead of this.beads) {
      bead.stopAnimation();
    }
  }

  private startBeadAnimationsAndWait(): Promise<BeadSelection> {
    return new Promise<BeadSelection>(async (resolve) => {
      const promises: Array<Promise<PersonType>> = [];
      for (const bead of this.beads) {
        promises.push(bead.initAndWaitForUserSelection());
      }
      const type: PersonType = await Promise.any(promises);
      if (type === PersonType.INDIGENOUS) {
        resolve(BeadSelection.CORRECT_GUESS);
      } else {
        resolve(BeadSelection.WRONG_GUESS);
      }
    });
  }

  private AppendCountDown(): CountDown {
    const countdown = new CountDown();
    this.Append(countdown);
    return countdown;
  }
}
