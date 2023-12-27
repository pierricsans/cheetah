import axios from 'axios';
import { Grid, Level, Move, MoveDirection, Person, PersonType, Position, Trajectory } from './protos/level_pb.js';

var LEVEL: Level = new Level();

const ICONS: Map<MoveDirection, string> = new Map([
    [MoveDirection.LEFT, "arrow_back"],
    [MoveDirection.RIGHT, "arrow_forward"],
    [MoveDirection.DOWN, "arrow_downward"],
    [MoveDirection.UP, "arrow_upward"],
    [MoveDirection.UNSPECIFIED, "question_mark"],
]);

type PositionObject = {
    x: number,
    y: number
}

function retrySameLevel() {
    LEVEL = getLevel(nextLevel);
    const app = new WhereIsMyDotApp();
    app.Init();
}

function restartFromScratch() {
    nextLevel = 1;
    totalScore = 0
    LEVEL = getLevel(nextLevel);
    const app = new WhereIsMyDotApp();
    app.Init();
}

function triggerNextLevel(points: number) {
    totalScore += points;
    nextLevel += 1;
    LEVEL = getLevel(nextLevel);
    const app = new WhereIsMyDotApp();
    app.Init();
}

function shuffleArray(array: Array<any>) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function GetOffset(
    length: number,
    moves: Array<MoveDirection>,
    backward: MoveDirection,
    forward: MoveDirection): number {
    var currentPosition = 0;
    var backwardsMost = 0;
    var forwardsMost = 0;
    for (const move of moves) {
        switch (move) {
            case forward:
                currentPosition += 1;
                forwardsMost = Math.max(currentPosition, forwardsMost);
                backwardsMost = Math.min(currentPosition, backwardsMost);
                break;
            case backward:
                currentPosition -= 1;
                forwardsMost = Math.max(currentPosition, forwardsMost);
                backwardsMost = Math.min(currentPosition, backwardsMost);
                break;
        }
    }
    const max = length - Math.max(0, forwardsMost) + 1;
    const min = Math.abs(backwardsMost);
    const value = Math.floor(Math.random() * (max - min) + min);
    return value;
}

class Option {
    text: string;
    move: Move;
    option: HTMLElement = document.createElement("p");
    optionContainer: MainContentElement;
    ListenerFunction = (event: Event) => this.AddSelectedOption(event);
 
    constructor(move: Move, optionContainer: MainContentElement) {
        this.move = move;
        this.text = MoveDirection[move?.direction!];
        this.optionContainer = optionContainer;
        this.prepareElement(this.option);
        this.option.addEventListener('click', this.ListenerFunction);
        this.option.addEventListener('keydown', this.ListenerFunction);
    }

    GetOptionAsElement(): HTMLElement {
        return this.option;
    }

    GenerateSelectedOptionAsElement(): HTMLElement {
        const selectedOption = document.createElement("p");
        this.prepareElement(selectedOption, false);
        return selectedOption;
    }

    private prepareElement(element: HTMLElement, isSelectable: boolean = true) {
        element.classList.add('option');
        if (isSelectable) {
            element.classList.add('selectable');
        } else {
            element.classList.add('notSelectable');
        }
        element.setAttribute("alt", this.text);
        element.setAttribute("tabindex", "0");
        element.textContent = ICONS.get(this.move?.direction!)!;
    }

    private AddSelectedOption(event: Event) {
        if (event.type === "click") {
            this.optionContainer.AddSelectedOption(this);
        } else {
            console.log(event);
        }
    }

    MakeSelectable() {
        this.option.classList.add("selectable");
        this.option.classList.remove("notSelectable");
        this.option.addEventListener("click", this.ListenerFunction);
        this.option.addEventListener("keydown", this.ListenerFunction);
    }

    MakeUnselectable() {
        this.option.classList.remove("selectable");
        this.option.classList.add("notSelectable");
        this.option.removeEventListener("click", this.ListenerFunction);
        this.option.removeEventListener("keydown", this.ListenerFunction);
    }

    IsSelectable(): boolean {
        return this.option.classList.contains("selectable");
    }

}

class ValidationElement {
    private validateContainer = document.createElement("div");
    private parentSelectorElement: MainContentElement;

    constructor(parentSelectorElement: MainContentElement) {
        this.validateContainer.classList.add("notSelectable");
        this.validateContainer.setAttribute("id", "validateButtonContainer");
        this.validateContainer.classList.add("bottomBar")
        this.parentSelectorElement = parentSelectorElement
    }

    GetAsElement() {
        return this.validateContainer;
    }

    EnableValidateButton() {
        this.validateContainer.addEventListener("click", event => this.Validate(event));
        this.validateContainer.classList.add("selectable");
        this.validateContainer.classList.remove("notSelectable");
    }

    Validate(event: Event) {
        this.parentSelectorElement.FillLevel();
        this.parentSelectorElement.Validate();
    }

    Hide() {
        this.validateContainer.hidden = true;
    }
}

class MainContentElement {
    private container: HTMLElement = document.createElement("div");
    private selector: HTMLElement = document.createElement("div");
    private selection: HTMLElement = document.createElement("div");
    private optionsContainer: HTMLElement = document.createElement("div");
    private validateElement: ValidationElement;
    private parentWhereIsMyDotApp: WhereIsMyDotApp;
    private options: Array<Option> = new Array<Option>();
    grid?: GridInst;
    private colors: Array<string>;
    private allTrajectories: Array<Trajectory> = new Array<Trajectory>();
    private allPositions: Map<number, Array<Position>> = new Map<number, Array<Position>>();
    private currentLevelDisplay: HTMLElement = document.createElement("div");
    private totalScoreDisplay: HTMLElement = document.createElement("div");
    private currentScoreDisplay: HTMLElement = document.createElement("div");

    constructor(parentWhereIsMyDotApp: WhereIsMyDotApp) {
        this.init();
        this.GenerateOptions();
        this.GenerateSelectorElement();
        this.GenerateSelectionElement();
        this.validateElement = new ValidationElement(this);
        this.container.appendChild(this.validateElement.GetAsElement());
        this.parentWhereIsMyDotApp = parentWhereIsMyDotApp;
        this.colors = this.GenerateColors();
        this.appendCurrentLevelDisplay();
        this.appendTotalScoreDisplay();
        this.appendCurrentScoreDisplay();
    }

    GetAsElement(): HTMLElement {
        return this.container;
    }

    private GenerateColors(): Array<string> {
        const colors = Array<string>();
        colors.push("#001219");  // Rich black
        colors.push("#005F73");  // Midnight green
        colors.push("#0A9396");  // Dark Cyan
        colors.push("#94D2BD");  // Tiffany Blue
        colors.push("#E9D8A6");  // Vanilla
        colors.push("#EE9B00");  // Gamboge
        colors.push("#CA6702");  // Alloy orange
        colors.push("#BB3E03");  // Rust
        colors.push("#AE2012");  // Rufous
        colors.push("#9B2226");  // Auburn
        shuffleArray(colors);
        return colors;
    }

    GetNextColor(): string {
        const color = this.colors.pop();
        if (color === undefined) {
            console.log('No more colors');
            return ''
        } else {
            return color;
        }
    }


    FillLevel() {
        const grid: Grid = LEVEL.grid!;
        grid.name = LEVEL.name
        grid.height = LEVEL.size
        grid.width = LEVEL.size
        this.GenerateInitialState(grid.indigenous!)
        this.AddAliens();
    }

    private GenerateInitialState(person: Person, generateMoves: boolean = false) {
        person.color = this.GetNextColor()
        if (generateMoves) {
            this.GenerateMoves(person);
        } else {
            this.allTrajectories.push(person.trajectory!);
        }
        this.GenerateInitialPosition(person);
    }

    private appendCurrentLevelDisplay() {
        this.currentLevelDisplay.setAttribute("id", "currentLevel");
        this.currentLevelDisplay.textContent = nextLevel.toString();
        this.container.appendChild(this.currentLevelDisplay);
    }

    private appendTotalScoreDisplay() {
        this.totalScoreDisplay.setAttribute("id", "totalScore");
        this.totalScoreDisplay.textContent = totalScore.toString();
        this.container.appendChild(this.totalScoreDisplay);
    }

    private appendCurrentScoreDisplay() {
        this.currentScoreDisplay.setAttribute("id", "currentScore");
        this.currentScoreDisplay.textContent = "0";
        this.container.appendChild(this.currentScoreDisplay);
    }

    refreshCurrentScoreDisplay(score: number) {
        this.currentScoreDisplay.textContent = score.toString();
    }

    private GenerateInitialPosition(person: Person) {
        const y_moves = new Array<MoveDirection>();
        const x_moves = new Array<MoveDirection>();
        if (person.trajectory === undefined) {
            person.trajectory = new Trajectory();
        }
        for (const move of person.trajectory?.moves!) {
            switch (move.direction) {
                case MoveDirection.RIGHT:
                    x_moves.push(move.direction);
                    break;
                case MoveDirection.LEFT:
                    x_moves.push(move.direction);
                    break;
                case MoveDirection.UP:
                    y_moves.push(move.direction);
                    break;
                case MoveDirection.DOWN:
                    y_moves.push(move.direction);
                    break;
            }
        }
        if (person.position === undefined) {
            person.position = new Position();
        }
        person.position.xOffset = GetOffset(
            LEVEL.grid?.width!,
            x_moves,
            MoveDirection.LEFT,
            MoveDirection.RIGHT
        )
        person.position.yOffset = GetOffset(
            LEVEL.grid?.width!,
            y_moves,
            MoveDirection.DOWN,
            MoveDirection.UP
        )
        if (!this.registerPosition(person)) {
            delete person.position;
            console.log("unlucky-position");
            this.GenerateInitialPosition(person);
        };
    }

    private registerPosition(person: Person): boolean {
        const initialPosition = person.position!;
        if (!this.allPositions.has(0)) {
            this.allPositions.set(0, new Array());
        }
        for (const registeredPosition of this.allPositions.get(0)!) {
            if (initialPosition.equals(registeredPosition)) {
                return false;
            }
        }
        this.allPositions.get(0)?.push(initialPosition);
        var nextMove: number = 1;
        var currentPosition: Position = initialPosition;
        for (const move of person.trajectory?.moves!) {
            const position: Position = new Position();
            switch (move.direction) {
                case MoveDirection.UP:
                    position.xOffset = currentPosition.xOffset;
                    position.yOffset = currentPosition.yOffset! + 1;
                    break;
                case MoveDirection.DOWN:
                    position.xOffset = currentPosition.xOffset;
                    position.yOffset = currentPosition.yOffset! - 1;
                    break;
                case MoveDirection.RIGHT:
                    position.xOffset = currentPosition.xOffset! + 1;
                    position.yOffset = currentPosition.yOffset;
                    break;
                case MoveDirection.LEFT:
                    position.xOffset = currentPosition.xOffset! - 1;
                    position.yOffset = currentPosition.yOffset;
                    break;
                default:
                    console.log("Unknown direction: " + move.direction);
            }
            if (!this.allPositions.has(nextMove)) {
                this.allPositions.set(nextMove, new Array());
            }
            for (const registeredPosition of this.allPositions.get(nextMove)!) {
                if (registeredPosition.equals(position)) {
                    return false;
                }
            }
            this.allPositions.get(nextMove)?.push(position);
            nextMove += 1;
            currentPosition = position;
        }
        return true;
    }

    private GenerateMoves(person: Person) {
        if (person.trajectory === undefined) {
            person.trajectory = new Trajectory();
        }
        for (var i = 0; i < LEVEL.moves!; i++) {
            const randint = Math.floor(Math.random() * LEVEL.allowedMoves.length);
            const randMove = LEVEL.allowedMoves[randint ];
            const move = new Move().fromJsonString(randMove.toJsonString());
            person.trajectory?.moves.push(move);
        }
        for (const trajectory of this.allTrajectories) {
            if (trajectory.equals(person.trajectory)) {
                if (person.trajectory !== undefined) {
                    person.trajectory.moves = [];
                }
                this.GenerateMoves(person);
                return;
            }
        }
        this.allTrajectories.push(person.trajectory);
    }

    private CheckIndigenousHasMoves() {
        if (LEVEL.grid?.indigenous === undefined) {
            console.log("No indigenous found");
        }
        if (LEVEL.grid?.indigenous?.trajectory?.moves?.length! !== LEVEL.moves!) {
            console.log("Required moves: " + LEVEL.moves! + " vs actual: " + LEVEL.grid?.indigenous?.trajectory?.moves?.length!);
        }
    }

    private AddAliens() {
        this.CheckIndigenousHasMoves();
        for (var i = 0; i < LEVEL.numAliens!; i++) {
            const alien = new Person();
            LEVEL.grid?.aliens.push(alien);
            alien.type = PersonType.ALIEN;
            this.GenerateInitialState(alien, true);
        }
    }


    private init() {
        this.container.setAttribute("id", "selectorContainer");
        this.container.classList.add("banner");
    }

    private GenerateSelectorElement() {
        this.selector.setAttribute("id", "selector");
        this.container.appendChild(this.selector);
    }

    private GenerateOptions() {
        this.optionsContainer.setAttribute("id", "optionsContainer")
        for (const move of LEVEL.allowedMoves) {
            const option = new Option(move, this);
            this.options.push(option);
            this.optionsContainer.appendChild(option.GetOptionAsElement());
        }
        this.selector.appendChild(this.optionsContainer);
    }

    private GenerateSelectionElement() {
        this.selection.setAttribute("id", "selection");
        this.container.appendChild(this.selection);
        var isSelectable = true;
        for (var i = 0; i < LEVEL.moves!; i++) {
            const emptyOption = document.createElement("span");
            emptyOption.classList.add("selectedOption");
            if (isSelectable) {
                emptyOption.classList.add("nextSelectable");
                isSelectable = false;
            } else {
                emptyOption.classList.add("notSelectable");
            }
            this.selection.appendChild(emptyOption);
        }
    }

    AddSelectedOption(option: Option) {
        const selectable = this.selection.getElementsByClassName("nextSelectable")[0];
        selectable.classList.add("selected");
        selectable.classList.remove("nextSelectable");
        selectable.textContent = ICONS.get(option.move?.direction!)!;
        const nextSelectable = this.selection.getElementsByClassName("notSelectable")[0];
        if (nextSelectable !== undefined) {
            nextSelectable.classList.add("nextSelectable");
            nextSelectable.classList.remove("notSelectable")
        }
        option.MakeUnselectable();
        var atLeastOneSelectable = false;
        for (const option of this.options) {
            if (option.IsSelectable()) {
                atLeastOneSelectable = true;
            }
        }
        if (!atLeastOneSelectable) {
            for (const option of this.options) {
                option.MakeSelectable();
            }
        }
        LEVEL.grid?.indigenous?.trajectory?.moves.push(option.move);
        if (LEVEL.grid?.indigenous?.trajectory?.moves?.length! === LEVEL.moves) {
            for (const option of this.options) {
                if (option.IsSelectable()) {
                    option.MakeUnselectable();
                }
            }
            this.validateElement.EnableValidateButton();
        }
    }

    // Object LEVEL has been filled in with moves and initial positions.
    Validate() {
        this.HideSelector();
        this.HideValidateElement();
        this.BuildGrid();
    }

    HideSelector() {
        this.selector.hidden = true;
    }

    HideValidateElement() {
        this.validateElement.Hide();
    }

    BuildGrid() {
        this.grid = new GridInst(this)
        this.grid.Build();
        this.container.appendChild(this.grid.GetAsElement());
    }

}

class Bead {
    beadElement: HTMLElement = document.createElement("span");
    parentGrid: GridInst;
    person: Person;
    movementIncrement: number;
    private animationOffset: number;
    private inactiveBead: InactiveBead | null = null;
    private fadeIn: Animation = new Animation();
    private mainAnimation: Animation = new Animation();
    private fadeOut: Animation = new Animation();

    constructor(grid: GridInst, person: Person) {
        this.parentGrid = grid;
        this.person = person;
        this.movementIncrement = 0;
        this.animationOffset = 0;
        this.movementIncrement = 100 / this.parentGrid.grid.width!;
        this.Init();
    }

    Init() {
        this.beadElement.classList.add('bead');
        this.beadElement.classList.add('activeBead');
        this.beadElement.style.backgroundColor = this.person.color!;
        this.beadElement.addEventListener("click", event => this.RegisterClick(event))
        this.animationOffset = 1 / this.person.trajectory?.moves?.length!;
        this.beadElement.style.bottom = (this.movementIncrement * this.person.position?.yOffset!).toString() + '%';
        this.beadElement.style.left = (this.movementIncrement * this.person.position?.xOffset!).toString() + '%';
        this.animateElement(100, 100 * this.person.trajectory?.moves?.length!);
        this.inactiveBead = new InactiveBead(this.parentGrid, this.person, this);
    }

    GetInactiveBead(): InactiveBead {
        return this.inactiveBead!;
    }

    RegisterClick(event: Event) {
        switch (this.person.type) {
            case PersonType.INDIGENOUS:
                this.RegisterWin();
                break;
            case PersonType.ALIEN:
                this.RegisterWrong();
                break;
        }
    }

    RegisterWin() {
        this.parentGrid.Win();
    }

    RegisterWrong() {
        this.beadElement.style.display = "none";
        if (this.inactiveBead !== null) {
            this.inactiveBead.beadElement.style.display = "none";
        }
        this.parentGrid.RegisterWrongGuess();
    }

    GenerateFadeInAnimation(duration: number): Animation {
        var bottom = this.movementIncrement * this.person.position?.yOffset!;
        var left = this.movementIncrement * this.person.position?.xOffset!;
        const keyframes = new KeyframeEffect(
            this.beadElement,
            [{
                height: "0px",
                width: "0px",
                bottom: bottom.toString() + '%',
                left: left.toString() + '%',
            },
            {
                height: "var(--ball-size)",
                width: "var(--ball-size)",
                bottom: bottom.toString() + '%',
                left: left.toString() + '%',
            }], {
            duration: duration,
            fill: "forwards",
            easing: "ease-in-out"
        });
        const animation = new Animation(keyframes, document.timeline);
        return animation;
    }

    GenerateFadeOutAnimation(duration: number): Animation {
        const keyframes = new KeyframeEffect(
            this.beadElement,
            [{
                height: "var(--ball-size)",
                width: "var(--ball-size)",
            },
            {
                height: "0px",
                width: "0px"
            }], {
            duration: duration,
            fill: "forwards",
            easing: "ease-in-out"
        });
        const animation = new Animation(keyframes, document.timeline);
        return animation;
    }

    GetAsElement(): HTMLElement {
        return this.beadElement;
    }

    GenerateMainAnimation(duration: number): Animation {
        var bottom = this.movementIncrement * this.person.position?.yOffset!;
        var left = this.movementIncrement * this.person.position?.xOffset!;
        var animationOffset = 0;
        const frames = [{
            offset: animationOffset,
            bottom: bottom.toString() + '%',
            left: left.toString() + '%',
            easing: 'ease-in-out'
        }];
        for (const move of this.person.trajectory?.moves!) {
            animationOffset = animationOffset + this.animationOffset;
            switch (move.direction!) {
                case MoveDirection.UP:
                    bottom = bottom + this.movementIncrement;
                    break;
                case MoveDirection.DOWN:
                    bottom = bottom - this.movementIncrement;
                    break;
                case MoveDirection.LEFT:
                    left = left - this.movementIncrement
                    break;
                case MoveDirection.RIGHT:
                    left = left + this.movementIncrement;
                    break;
                default:
                    console.log('unknown code: ' + move.direction);
            }
            frames.push({
                offset: Math.min(animationOffset, 1),
                bottom: bottom.toString() + '%',
                left: left.toString() + '%',
                easing: 'ease-in-out'
            })
        }
        const keyframes = new KeyframeEffect(this.beadElement, frames,
            {
                duration: duration,
                fill: "forwards",
                delay: 100
            });
        const animation = new Animation(keyframes, document.timeline);
        return animation;
    }

    animateElement(fadeDuration: number, mainAnimationDuration: number) {
        console.log("main animation duration: " + mainAnimationDuration);
        this.fadeIn = this.GenerateFadeInAnimation(fadeDuration);
        this.mainAnimation = this.GenerateMainAnimation(mainAnimationDuration);
        this.fadeOut = this.GenerateFadeOutAnimation(fadeDuration);
        this.fadeIn.play();
        this.fadeIn.onfinish = (event: Event) => {
            this.mainAnimation.play();
        }
        this.mainAnimation.onfinish = (event: Event) => {
            this.fadeOut.play();
        }
        this.fadeOut.onfinish = (event: Event) => {
            this.animateElement(fadeDuration * 1.2, mainAnimationDuration * 1.2);
        }
    }

    Win() {
        switch (this.person.type) {
            case PersonType.INDIGENOUS:
                this.beadElement.style.opacity = "100%";
                if (this.inactiveBead !== null) {
                    this.inactiveBead.GetAsElement().style.opacity = "100%";
                }
                break;
            case PersonType.ALIEN:
                this.beadElement.style.opacity = "20%"
                if (this.inactiveBead !== null) {
                    this.inactiveBead.GetAsElement().style.opacity = "20%";
                }
                break;
        }
        this.EndGame();
    }

    EndGame() {
        this.fadeIn.onfinish = null;
        this.mainAnimation.onfinish = null;
        this.fadeOut.onfinish = null;
    }

}

class InactiveBead extends Bead {
    parentBead: Bead;

    constructor(grid: GridInst, person: Person, parentBead: Bead) {
        super(grid, person);
        this.parentBead = parentBead;
    }

    Init() {
        this.beadElement.classList.add("bead");
        this.beadElement.classList.add('inactiveBead');
        this.beadElement.style.backgroundColor = this.person.color!;
        this.beadElement.addEventListener("click", event => this.RegisterClick(event))
        this.GenerateFadeInAnimation(50).play();
    }

    RegisterWrong() {
        this.beadElement.style.display = "none";
        this.parentBead.beadElement.style.display = "none";
        this.parentGrid.RegisterWrongGuess();
    }

}

class CountDown {
    private outerContainer: HTMLElement = document.createElement("div");
    private startAgain: HTMLElement = document.createElement("span");
    private retry: HTMLElement = document.createElement("span");
    private nextLevel: HTMLElement = document.createElement("span");
    private timeRemainingContainer: HTMLElement = document.createElement("div");
    private animation: Animation;
    private startingScore = 1000;
    private totalDuration = 20000;
    private score = this.startingScore;
    private startTime: number = 0;
    private parentGrid: GridInst;
    private timerId: ReturnType<typeof setInterval> | undefined = undefined;

    constructor(grid: GridInst) {
        this.parentGrid = grid;
        this.outerContainer.setAttribute("id", "countdown");
        this.outerContainer.classList.add("bottomBar");
        this.timeRemainingContainer.setAttribute("id", "timeRemainingContainer");
        this.outerContainer.appendChild(this.timeRemainingContainer);
        this.startAgain.classList.add("levelAction");
        this.startAgain.classList.add("validAction");
        this.startAgain.textContent = "skip_previous";
        this.startAgain.setAttribute("alt", "Restart");
        this.startAgain.setAttribute("id", "Restart");
        this.retry.classList.add("levelAction");
        this.retry.classList.add("validAction");
        this.retry.textContent = "forward_media";
        this.retry.setAttribute("alt", "Retry");
        this.retry.setAttribute("id", "Retry");
        this.nextLevel.classList.add("levelAction");
        this.nextLevel.classList.add("validAction");
        this.nextLevel.textContent = "skip_next";
        this.nextLevel.setAttribute("alt", "Next");
        this.nextLevel.setAttribute("id", "Next");
        this.outerContainer.appendChild(this.startAgain);
        this.outerContainer.appendChild(this.retry);
        this.outerContainer.appendChild(this.nextLevel);
        this.animation = this.GenerateCountdownAnimation(this.totalDuration);
    }

    GenerateCountdownAnimation(duration: number, width: string = "100%"): Animation {
        const keyframes = new KeyframeEffect(
            this.timeRemainingContainer,
            [{
                width: width,
            },
            {
                width: "0%",
            }], {
            duration: duration,
            fill: "forwards",
        });
        const animation = new Animation(keyframes, document.timeline);
        animation.onfinish = (event: Event) => {
            this.Lose();
        }
        return animation;
    }

    GetAsElement(): HTMLElement {
        return this.outerContainer;
    }

    Lose() {
        this.parentGrid.Lose();
    }

    Stop() {
        this.animation.finish();
        clearInterval(this.timerId);
        this.startAgain.addEventListener("click", restartFromScratch);
        this.startAgain.classList.add("selectable");
    }

    Pause() {
        this.animation.pause();
        clearInterval(this.timerId);
        if (this.nextLevel.classList.contains('validAction')) {
            this.nextLevel.addEventListener("click", (event) => this.triggerNextLevel(event));
            this.nextLevel.classList.add("selectable");
        }
        if (this.retry.classList.contains('validAction')) {
            this.retry.addEventListener("click", retrySameLevel);
            this.retry.classList.add("selectable");
        }
        this.startAgain.addEventListener("click", restartFromScratch);
        this.startAgain.classList.add("selectable");
    }

    triggerNextLevel(event: Event)  {
        triggerNextLevel(this.score);
    }

    Resume() {
        this.animation.play();
    }

    Start() {
        this.startTime = Date.now();
        this.animation.play();
        this.timerId = setInterval(() => this.ShowCurrentScore(), 5);
    }

    ShowCurrentScore() {
        const ratio = this.timeRemainingContainer.offsetWidth / this.outerContainer.offsetWidth;
        if (ratio < 0.8) {
            this.nextLevel.classList.add("invalidAction");
            this.nextLevel.classList.remove("validAction");
        }
        if (ratio < 0.5) {
            this.retry.classList.add("invalidAction");
            this.retry.classList.remove("validAction");
        }
        this.score = Math.floor(ratio * this.startingScore)
        this.parentGrid.app.refreshCurrentScoreDisplay(this.score);
    }

    RegisterWrongGuess() {
        this.totalDuration = this.totalDuration - (Date.now() - this.startTime);
        this.animation = this.GenerateCountdownAnimation(this.totalDuration, this.timeRemainingContainer.offsetWidth - 50 + "px");
        this.startTime = Date.now();
        this.animation.play();
    }
}

class GridInst {
    grid: Grid;
    countdown: CountDown = new CountDown(this);
    app: MainContentElement;
    private innerContainer: HTMLElement = document.createElement("div");
    private outerContainer: HTMLElement = document.createElement("div");
    private overallContainer: HTMLElement = document.createElement("div");
    private inactiveBeadsContainer: HTMLElement = document.createElement("div");
    private beads: Array<Bead> = [];
    private inactiveBeads: Array<InactiveBead> = [];

    constructor(app: MainContentElement) {
        this.grid = LEVEL.grid!;
        this.app = app;
    }

    GetAsElement(): HTMLElement {
        return this.overallContainer;
    }

    Build() {
        this.outerContainer.setAttribute("id", "outerContainer");
        this.innerContainer.setAttribute("id", "innerContainer");
        for (const alien of this.grid.aliens) {
            const bead = new Bead(this, alien);
            this.beads.push(bead);
            this.innerContainer.appendChild(bead.GetAsElement());
            this.inactiveBeads.push(bead.GetInactiveBead());
        }
        const bead = new Bead(this, this.grid.indigenous!);
        this.beads.push(bead);
        this.innerContainer.appendChild(bead.GetAsElement());
        this.outerContainer.appendChild(this.innerContainer);
        this.overallContainer.appendChild(this.outerContainer);
        this.overallContainer.appendChild(this.inactiveBeadsContainer);
        this.inactiveBeads.push(bead.GetInactiveBead());
        this.AppendInactiveBeads();
        this.AppendCountDown();
        this.countdown.Start();
    }

    AppendInactiveBeads() {
        shuffleArray(this.inactiveBeads);
        for (const bead of this.inactiveBeads) {
            this.inactiveBeadsContainer.appendChild(bead.GetAsElement());
        }
    }

    AppendCountDown() {
        this.overallContainer.appendChild(this.countdown.GetAsElement());
    }

    Win() {
        this.countdown.Pause();
        for (const bead of this.beads) {
            bead.Win();
        }
    }

    Lose() {
        for (const bead of this.beads) {
            console.log("loose");
        }
        for (const bead of this.beads) {
            bead.EndGame();
        }
        this.countdown.Stop();
    }

    RegisterWrongGuess() {
        this.countdown.RegisterWrongGuess();
    }

}

class WhereIsMyDotApp {
    private readonly container: HTMLElement = document.body;
    private contentElement: MainContentElement;

    constructor() {
        this.contentElement = new MainContentElement(this)
    }

    Init() {
        this.cleanup();
        this.appendSelectorElement();
    }

    private appendSelectorElement() {
        this.container.appendChild(this.contentElement.GetAsElement())
    }

    private cleanup() {
        const elements = this.container.children;
        while (this.container.firstChild) {
            this.container.removeChild(this.container.lastChild!);
        }
    }

}

function Init() {
    LEVEL = getLevel(nextLevel);
    const app = new WhereIsMyDotApp();
    app.Init();
}

function getLevel(levelNumber: number): Level {
    const level = new Level();
    var settings = undefined;
    if (LEVEL_SETTINGS.has(levelNumber)) {
        settings = LEVEL_SETTINGS.get(levelNumber);
    } else {
        settings = {
            size: levelNumber,
            moves: levelNumber,
            numAliens: levelNumber,
        }
    }
    level.size = settings?.size;
    document.documentElement.style.setProperty('--box-size-num-moves', level.size!.toString());
    level.moves = settings?.moves;
    level.numAliens = settings?.numAliens;
    level.allowedMoves.push(new Move({ "direction": MoveDirection.UP }));
    level.allowedMoves.push(new Move({ "direction": MoveDirection.DOWN }));
    level.allowedMoves.push(new Move({ "direction": MoveDirection.RIGHT }));
    level.allowedMoves.push(new Move({ "direction": MoveDirection.LEFT }));
    document.documentElement.style.setProperty('--moves-num', level.allowedMoves!.length.toString());
    level.grid = new Grid({
        "indigenous": new Person({
            "trajectory": new Trajectory(),
            "type": PersonType.INDIGENOUS
        })
    });
    return level;
}

var nextLevel: number = 1;
var totalScore: number = 0;

const LEVEL_SETTINGS = new Map(
    [
        [1, {
            size: 5,
            moves: 1,
            numAliens: 1
        }],
        [2, {
            size: 5,
            moves: 2,
            numAliens: 2
        }],
        [3, {
            size: 5,
            moves: 3,
            numAliens: 3
        }],
        [4, {
            size: 5,
            moves: 4,
            numAliens: 4
        }],
    ]
);

Init();
