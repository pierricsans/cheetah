import axios from 'axios';
import { Grid, Level, Move, MoveDirection, Person, PersonType } from './protos/level_pb.js';

var LEVEL: Level = new Level();

const ICONS: Map<MoveDirection, string> =  new Map([
    [MoveDirection.LEFT, "arrow_back"],
    [MoveDirection.RIGHT, "arrow_forward"],
    [MoveDirection.DOWN, "arrow_forward"],
    [MoveDirection.UP, "arrow_upward"],
    [MoveDirection.UNSPECIFIED, "question_mark"],
]);

class Option {
    text: string;
    move: Move;
    option: HTMLElement = document.createElement("p");
    optionContainer: MainContentElement;

    constructor(move: Move, optionContainer: MainContentElement) {
        this.move = move;
        this.text = MoveDirection[move?.direction!];
        this.optionContainer = optionContainer;
        this.prepareElement(this.option);
        this.option.addEventListener('click', event => this.AddSelectedOption(event));
    }

    GetOptionAsElement(): HTMLElement {
        return this.option;
    }

    GenerateSelectedOptionAsElement(): HTMLElement {
        const selectedOption = document.createElement("p");
        this.prepareElement(selectedOption);
        return selectedOption;
    }

    private prepareElement(element: HTMLElement) {
        element.classList.add('option');
        element.setAttribute("alt", this.text);
        element.textContent = ICONS.get(this.move?.direction!)!;
    }

    private AddSelectedOption(ev: MouseEvent) {
        this.optionContainer.AddSelectedOption(this);
    }

}

class ValidationElement {
    private validateContainer = document.createElement("div");
    private validateButton = document.createElement("button");
    private parentSelectorElement: MainContentElement;

    constructor(parentSelectorElement: MainContentElement) {
        this.validateContainer.classList.add("buttonNotReady");
        this.validateButton.textContent = "Not ready";
        this.validateContainer.appendChild(this.validateButton);
        this.parentSelectorElement = parentSelectorElement
    }

    GetAsElement() {
        return this.validateContainer;
    }

    EnableValidateButton() {
        this.validateContainer.classList.add("buttonReady");
        this.validateContainer.classList.remove("buttonNotReady");
        this.validateContainer.firstChild!.textContent = "Ready";
        this.validateContainer.addEventListener("click", event => this.Validate(event));
    }

    Validate(event: Event) {
        const parentSelectorElement = this.parentSelectorElement;
        axios.get('fillLevel', {
            params: {
                level: LEVEL.toJsonString(),
            }
        }).then(function (response) {
            LEVEL = new Level();
            LEVEL.fromJson(response.data);
            parentSelectorElement.Validate();
        })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
            .finally(function () {
                console.log("All good");
            });
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
    private grid?: GridInst;

    constructor(parentWhereIsMyDotApp: WhereIsMyDotApp) {
        this.init();
        this.GenerateOptions();
        this.GenerateSelectorElement();
        this.GenerateSelectionElement();
        this.validateElement = new ValidationElement(this);
        this.selector.appendChild(this.validateElement.GetAsElement());
        this.parentWhereIsMyDotApp = parentWhereIsMyDotApp;
    }

    GetAsElement(): HTMLElement {
        return this.container;
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
            this.optionsContainer.appendChild(option.GetOptionAsElement());
        }
        this.selector.appendChild(this.optionsContainer);
    }

    private GenerateSelectionElement() {
        this.selection.setAttribute("id", "selection");
        this.container.appendChild(this.selection);
        for (var i = 0; i < LEVEL.moves!; i++) {
            const emptyOption = document.createElement("span");
            emptyOption.classList.add("emptyOption");
            this.selection.appendChild(emptyOption);
        }
    }

    AddSelectedOption(option: Option) {
        const elements = this.selection.getElementsByClassName("emptyOption");
        const elementToReplace = elements[0]
        elementToReplace.replaceWith(option.GenerateSelectedOptionAsElement());
        LEVEL.grid?.indigenous?.trajectory?.moves.push(option.move);
        if (LEVEL.grid?.indigenous?.trajectory?.moves?.length! === LEVEL.moves) {
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
    private beadElement: HTMLElement = document.createElement("span");
    private parentGrid: GridInst;
    private movementIncrement: number;
    private animationOffset: number;
    private person: Person;

    constructor(grid: GridInst, person: Person) {
        this.parentGrid = grid;
        this.person = person;
        this.beadElement.classList.add('bead');
        this.beadElement.style.backgroundColor = person.color!;
        this.beadElement.addEventListener("click", event => this.RegisterClick(event))
        this.movementIncrement = 100 / grid.grid.width!;
        this.animationOffset = 1 / person.trajectory?.moves?.length!;
        this.beadElement.style.bottom = (this.movementIncrement * person.position?.yOffset!).toString() + '%';
        this.beadElement.style.left = (this.movementIncrement * person.position?.xOffset!).toString() + '%';
        this.GenerateFadeInAnimation().play();
        this.GenerateMainAnimation().play();
    }

    RegisterClick(event: Event) {
        switch (this.person.type) {
            case PersonType.INDIGENOUS:
                alert('YES');
                break;
            case PersonType.ALIEN:
                alert('NO');
                break;
        }
    }

    GenerateFadeInAnimation(): Animation {
        const keyframes = new KeyframeEffect(
            this.beadElement,
            [{
                height: "0px",
                width: "0px"
            },
            {
                height: "var(--ball-size)",
                width: "var(--ball-size)"
            }], {
            duration: 1000,
            fill: "forwards",
            easing: "ease-in-out"
        }
        );
        const animation = new Animation(keyframes,document.timeline);
        return animation;
    }

    GetAsElement(): HTMLElement {
        return this.beadElement;
    }

    GenerateMainAnimation(): Animation {
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
            switch(move.direction!) {
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
                offset: animationOffset,
                bottom: bottom.toString() + '%',
                left: left.toString() + '%',
                easing: 'ease-in-out'
            })
        }
        const keyframes = new KeyframeEffect(this.beadElement, frames,
            {
                duration: 1000,
                fill: "forwards",
                delay: 1000
            });
        const animation = new Animation(keyframes, document.timeline);
        return animation;
    }
}

class GridInst {
    grid: Grid;
    private outerContainer: HTMLElement = document.createElement("div");
    private innerContainer: HTMLElement = document.createElement("div");
    private app: MainContentElement;

    constructor(app: MainContentElement) {
        this.grid = LEVEL.grid!;
        this.app = app;
    }

    GetAsElement(): HTMLElement {
        return this.outerContainer;
    }

    Build() {
        this.outerContainer.setAttribute("id", "outerContainer");
        this.innerContainer.setAttribute("id", "innerContainer");
        for (const alien of this.grid.aliens) {
            const bead = new Bead(this, alien);
            this.innerContainer.appendChild(bead.GetAsElement());
        }
        const bead = new Bead(this, this.grid.indigenous!);
        this.innerContainer.appendChild(bead.GetAsElement());
        this.outerContainer.appendChild(this.innerContainer);
    }
}

class WhereIsMyDotApp {
    private readonly container: HTMLElement = document.body;
    private readonly header: HTMLElement = document.createElement("div");
    private readonly footer: HTMLElement = document.createElement('div');
    private contentElement: MainContentElement;

    constructor() {
        this.contentElement = new MainContentElement(this)
    }

    Init() {
        this.appendHeader();
        this.appendSelectorElement();
        this.appendFooter();
    }

    private appendSelectorElement() {
        this.container.appendChild(this.contentElement.GetAsElement())
    }

    private appendHeader() {
        this.header.classList.add('banner');
        this.header.setAttribute('id', 'header');
        this.header.textContent = "Where is my dot?";
        this.container.appendChild(this.header);
    }

    private appendFooter() {
        this.footer.classList.add('banner');
        this.footer.setAttribute('id', 'footer');
        this.footer.textContent = "2023";
        this.container.appendChild(this.footer);
    }

}

function getInitialLevel() {
    axios({
        method: 'get',
        url: 'getInitialLevel'
    }).then(function (response) {
        // handle success
        LEVEL.fromJson(response.data);
        const app = new WhereIsMyDotApp();
        app.Init();
    })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .finally(function () {
            console.log("All good");
        });
}

function Init() {
    getInitialLevel();
}

Init();