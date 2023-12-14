import axios from 'axios';
import { Level, MoveDirection } from './../protos/level_pb.js';

class SelectorElement {
    level: Level;

    constructor(level: Level) {
        this.level = level;
    }

    GetAsElement(): HTMLElement {
        const div = document.createElement("div");
        return div;
    }

}

class WhereIsMyDotApp {
    readonly level: Level;
    readonly container: HTMLElement = document.body;
    readonly header: HTMLElement = document.createElement("div");
    readonly footer: HTMLElement = document.createElement('div');
    selectorElement: SelectorElement;
    
    constructor(level: Level) {
        this.level = level;
        this.selectorElement = new SelectorElement(this.level)
    }
    
    Init() {
        this.appendHeader();
        this.appendFooter();
        this.appendSelectorElement();
        this.appendAnswerBox();
        this.appendAvailableButtons();
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

    private appendAvailableButtons() {
        const top = document.getElementById("top");
        for (const move of this.level.allowedMoves) {
            const p = document.createElement("p");
            p.classList.add('moveDirection');
            p.textContent = MoveDirection[move];
            p.addEventListener('click', handleMoveChoice)
            top?.appendChild(p);
        }
    }

    private appendAnswerBox() {
        if (this.level.moves === undefined || this.level.moves === 0) {
            console.log('Number of moves must be set and higher than O.');
            return;
        }
        const top = document.getElementById("top");
        var i = 0;
        for (var i = 0; i < this.level.moves; i++) {
            const p = document.createElement("div");
            p.classList.add('answerBox');
            top?.appendChild(p);
        }
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