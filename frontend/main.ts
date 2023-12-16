import axios from 'axios';
import { Level, Move, MoveDirection } from './protos/level_pb.js';

var LEVEL: Level = new Level();

class Option {
    text: string;
    move: Move;
    option: HTMLElement = document.createElement("p");
    selectedOption: HTMLElement = document.createElement("p");
    optionContainer: SelectorElement;
    
    constructor(move: Move, optionContainer: SelectorElement) {
        this.move = move;
        this.text = MoveDirection[move?.direction!];
        this.optionContainer = optionContainer;
        this.prepareElement(this.option);
        this.option.addEventListener('click', event => this.AddSelectedOption(event));
    }
    
    GetOptionAsElement(): HTMLElement {
        return this.option;
    }
    
    GetSelectedOptionAsElement(): HTMLElement {
        return this.selectedOption;
    }
    
    private prepareElement(element: HTMLElement) {
        element.classList.add('option');
        element.textContent = this.text;
    }
    
    private AddSelectedOption(ev: MouseEvent) {
        this.prepareElement(this.selectedOption);
        this.optionContainer.AddSelectedOption(this);
    }
    
}

class ValidationElement {
    private validateContainer = document.createElement("div");
    private validateButton = document.createElement("button");
    private parentSelectorElement: SelectorElement;
    
    constructor(parentSelectorElement: SelectorElement) {
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

class SelectorElement {
    private container: HTMLElement = document.createElement("div");
    private selector: HTMLElement = document.createElement("div");
    private selection: HTMLElement = document.createElement("div");
    private optionsContainer: HTMLElement = document.createElement("div");
    private validateElement: ValidationElement;
    private parentWhereIsMyDotApp: WhereIsMyDotApp;
    
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
        elementToReplace.replaceWith(option.GetSelectedOptionAsElement());
        LEVEL.grid?.indigenous?.trajectory?.moves.push(option.move);
        if (LEVEL.grid?.indigenous?.trajectory?.moves?.length! === LEVEL.moves) {
            this.validateElement.EnableValidateButton();
        }
    }

    // Object LEVEL has been filled in with moves and initial positions.
    Validate() {
        this.parentWhereIsMyDotApp.BuildGrid();
    }

    HideSelector() {
        console.log("hidden");
        this.selector.hidden = true;
    }

    HideValidateElement() {
        this.validateElement.Hide();
    }

}

class WhereIsMyDotApp {
    private readonly container: HTMLElement = document.body;
    private readonly header: HTMLElement = document.createElement("div");
    private readonly footer: HTMLElement = document.createElement('div');
    private selectorElement: SelectorElement;

    constructor() {
        this.selectorElement = new SelectorElement(this)
    }

    Init() {
        this.appendHeader();
        this.appendSelectorElement();
        this.appendFooter();
    }

    private appendSelectorElement() {
        this.container.appendChild(this.selectorElement.GetAsElement())
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

    BuildGrid() {
        this.selectorElement.HideSelector();
        this.selectorElement.HideValidateElement();
    }
}

function handleMoveChoice(this: HTMLElement, event: Event) {
    console.log(this.textContent);
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