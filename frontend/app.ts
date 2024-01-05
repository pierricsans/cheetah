export interface App {
  restartJourneyFromScratch(event: Event): void;
  restartGameFromScratch(event: Event): void;
  triggerNextLevel(event: Event): void;
}

export function shuffleArray(array: Array<any>) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
}