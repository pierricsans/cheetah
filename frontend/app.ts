import { Grid, Journey, Level } from './protos/level_pb.js';
import { Option } from './selector.js';

export interface App {
  journey: Journey;
  level: Level;
  refreshCurrentScoreDisplay(score: number): void;
  restartJourneyFromScratch(event: Event): void;
  restartGameFromScratch(event: Event): void;
  triggerNextLevel(event: Event): void;
  refreshCurrentScoreDisplay(score: number): void;
  UpdateAndShowScoreBoard(): void;
}

export interface GridTemplate {
  grid: Grid;
  app: App;
  RegisterWrongGuess(): void;
  Win(): void;
  Lose(): void
}

export function shuffleArray(array: Array<any>) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
}