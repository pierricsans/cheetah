export function shuffleArray(array: Array<any>) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

export class AppElement {
  protected element: HTMLDivElement = document.createElement("div");

  Hide() {
    this.element.hidden = true;
  }
  Show() {
    this.element.hidden = false;
  }
  protected GetAsElement(): HTMLDivElement {
    return this.element;
  }
  Remove(element: AppElement | null) {
    if (!element) {
      return;
    }
    this.element.removeChild(element.GetAsElement());
  }
  Append(element: AppElement) {
    this.GetAsElement().appendChild(element.GetAsElement());
  }

}
