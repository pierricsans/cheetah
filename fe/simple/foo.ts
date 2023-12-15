import axios from 'axios';
import { Level, Move, MoveDirection } from './../protos/level_pb.js';

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

class SelectorElement {
    private level: Level;
    private selector: HTMLElement = document.createElement("div");
    private selection: HTMLElement = document.createElement("div");

    constructor(level: Level) {
        this.level = level;
        this.GenerateOptions();
        this.GenerateSelectorElement();
        this.GenerateSelectionElement();
    }

    GetAsElement(): HTMLElement {
        return this.selector;
    }

    private GenerateSelectorElement() {
        this.selector.setAttribute("id", "selector");
        this.selector.classList.add("banner");
    }

    private GenerateOptions() {
        const optionsContainer = document.createElement("div");
        for (const move of this.level.allowedMoves) {
            console.log(move);
            const option = new Option(move, this);
            optionsContainer.appendChild(option.GetOptionAsElement());
        }
        this.selector.appendChild(optionsContainer);
    }

    private GenerateSelectionElement() {
        if (this.level.moves === undefined) {
            console.log('0 moves');
            return;
        }
        this.selection.setAttribute("id", "selection");
        this.selector.appendChild(this.selection);
        for (var i = 0; i < this.level.moves; i++) {
            const emptyOption = document.createElement("span");
            emptyOption.classList.add("emptyOption");
            this.selection.appendChild(emptyOption);
        }
    }

    AddSelectedOption(option: Option) {
        const elements = this.selection.getElementsByClassName("emptyOption");
        const elementToReplace = elements[0]
        elementToReplace.replaceWith(option.GetSelectedOptionAsElement());
        this.level.grid?.indigenous?.trajectory?.moves.push(option.move)
        console.log(this.level.toJson());
    }

}

class WhereIsMyDotApp {
    private readonly level: Level;
    private readonly container: HTMLElement = document.body;
    private readonly header: HTMLElement = document.createElement("div");
    private readonly footer: HTMLElement = document.createElement('div');
    private selectorElement: SelectorElement;
    
    constructor(level: Level) {
        this.level = level;
        this.selectorElement = new SelectorElement(this.level)
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
}

function handleMoveChoice(this: HTMLElement, event: Event) {
    console.log(this.textContent);
}

function getInitialLevel() {
    const level = new Level();
    axios({
        method: 'get',
        url: 'getInitialLevel'
    }).then(function (response) {
        // handle success
        level.fromJson(response.data);
        const app = new WhereIsMyDotApp(level);
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