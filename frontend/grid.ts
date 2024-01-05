import { ActiveBead } from './bead.js';
import {
  BeadSelection,
  Journey,
  Level,
  LevelStatus,
  Person,
  PersonType
} from './protos/level_pb.js';
import { CountDown } from './countdown.js';
import { AppElement, shuffleArray } from './util.js';

export class GridInst extends AppElement {
  journey: Journey;
  level: Level;
  countdown: CountDown;
  private innerContainer: HTMLElement = document.createElement("div");
  private outerContainer: HTMLElement = document.createElement("div");
  private inactiveBeadsContainer: HTMLElement = document.createElement("div");
  private beads: Array<ActiveBead> = [];

  constructor(journey: Journey, level: Level) {
    super()
    this.journey = journey;
    this.level = level;
    this.countdown = this.AppendCountDown();
    this.outerContainer.setAttribute("id", "outerContainer");
    this.innerContainer.setAttribute("id", "innerContainer");
    this.outerContainer.appendChild(this.innerContainer);
    this.element.appendChild(this.outerContainer);
    this.element.appendChild(this.inactiveBeadsContainer);
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
    console.log(this.level.grid?.indigenous);
    for (const alien of this.level.grid.aliens) {
      this.AppendPerson(alien);
    }
    if (!this.level.grid.indigenous) {
      throw Error("No indigenous found in grid: " + this.level.grid);
    }
    this.AppendPerson(this.level.grid.indigenous);
    this.AppendInactiveBeads();
    const seenCycles = new Set<number>();
    return new Promise<number | undefined>((resolve) => {
      for (const bead of this.beads) {
        bead.GetAsElement().addEventListener("progress", (event) => {
          if (!seenCycles.has(event.total)) {
            seenCycles.add(event.total);
            if (!this.countdown.RemoveStar()) {
              this.stopAnimations();
              resolve(0);
            }
          }
        });
        bead.animateElement();
      }
      this.StartGameAndWaitForOutcome().then((outcome: LevelStatus) => {
        this.stopAnimations();
        if (outcome == LevelStatus.LOSE) {
          resolve(undefined);
        }
        resolve(this.countdown.numStars);
      })
    });
  }

  private async StartGameAndWaitForOutcome(): Promise<LevelStatus> {
    const status: LevelStatus = await new Promise<LevelStatus>((resolve) => {
      this.startBeadAnimationsAndWait().then((status: BeadSelection) => {
        switch (status) {
          case BeadSelection.WRONG_GUESS:
            if (this.countdown.RemoveStar()) {
              resolve(LevelStatus.UNSPECIFIED);
            } else {
              resolve(LevelStatus.LOSE);
            }
            break;
          case BeadSelection.CORRECT_GUESS:
            resolve(LevelStatus.WIN);
            break;
        }
      });
    });
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
    const bead = new ActiveBead(person, this.level);
    this.beads.push(bead);
    this.innerContainer.appendChild(bead.GetAsElement());
  }

  private AppendInactiveBeads() {
    shuffleArray(this.beads);
    this.inactiveBeadsContainer.setAttribute("id", "inactiveBeadsContainer");
    for (const bead of this.beads) {
      const inactiveBead = bead.GetInactiveBead();
      this.inactiveBeadsContainer.appendChild(inactiveBead.GetAsElement());
    }
  }

  private stopAnimations() {
    for (const bead of this.beads) {
      bead.stopAnimation();
    }
  }

  private startBeadAnimationsAndWait(): Promise<BeadSelection> {
    return new Promise<BeadSelection>((resolve) => {
      for (const bead of this.beads) {
        const inactiveBead = bead.GetInactiveBead();
        bead.initAndWaitForUserSelection()
          .then((type: PersonType) => {
            if (type === PersonType.INDIGENOUS) {
              resolve(BeadSelection.CORRECT_GUESS);
            } else {
              bead.Hide();
              inactiveBead.Hide();
              resolve(BeadSelection.WRONG_GUESS);
            }
          })
      }
    });
  }

  private AppendCountDown(): CountDown {
    const countdown = new CountDown();
    this.element.appendChild(countdown.GetAsElement());
    return countdown;
  }

}
