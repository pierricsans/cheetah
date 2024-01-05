import { ActiveBead } from './bead.js';
import {
  BeadSelection,
  Journey,
  Grid,
  Level,
  LevelStatus,
  Person,
  PersonType
} from './protos/level_pb.js';
import { CountDown } from './countdown.js';
import { shuffleArray } from './util.js';

export class GridInst {
  grid: Grid;
  journey: Journey;
  level: Level;
  countdown: CountDown;
  private innerContainer: HTMLElement = document.createElement("div");
  private outerContainer: HTMLElement = document.createElement("div");
  private element: HTMLElement = document.createElement("div");
  private inactiveBeadsContainer: HTMLElement = document.createElement("div");
  private beads: Array<ActiveBead> = [];

  constructor(journey: Journey, level: Level) {
    this.journey = journey;
    this.level = level;
    this.grid = this.level.grid!;
    this.countdown = this.AppendCountDown();
    this.outerContainer.setAttribute("id", "outerContainer");
    this.innerContainer.setAttribute("id", "innerContainer");
    for (const alien of this.grid.aliens) {
      this.AppendPerson(alien);
    }
    if (!this.grid.indigenous) {
      throw Error("No indigenous found in grid: " + this.grid);
    }
    this.AppendPerson(this.grid.indigenous);
    this.outerContainer.appendChild(this.innerContainer);
    this.element.appendChild(this.outerContainer);
    this.element.appendChild(this.inactiveBeadsContainer);
    this.AppendInactiveBeads();
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

  StartGameAndWaitForOutcome(): Promise<LevelStatus> {
    return new Promise<LevelStatus>((resolve) => {
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
      })
    }).then((status: LevelStatus) => {
      switch(status) {
        case LevelStatus.WIN:
          return LevelStatus.WIN;
        case LevelStatus.LOSE:
          return LevelStatus.LOSE;
        case LevelStatus.UNSPECIFIED:
          return this.StartGameAndWaitForOutcome();
      }
    });
  }

  private stopAnimations() {
    for (const bead of this.beads) {
      bead.stopAnimation();
    }
  }

  StartGame(): Promise<number | undefined> {
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

  AppendCountDown(): CountDown {
    const countdown = new CountDown();
    this.element.appendChild(countdown.GetAsElement());
    return countdown;
  }

  End() {
    for (const bead of this.beads) {
      bead.Reveal();
    }
  }

}
