import axios from 'axios';
import { Level, MoveDirection } from './../protos/level_pb.js';

class WhereIsMYDotApp {
    level: Level;
   
    constructor(level: Level) {
      this.level = level;
      this.appendAvailableButtons();
      this.appendAnswerBox();
    }

    appendAvailableButtons() {
        const top = document.getElementById("top");
        for (const move of this.level.allowedMoves) {
            const p = document.createElement("p");
            p.classList.add('moveDirection');
            p.textContent = MoveDirection[move];
            p.addEventListener('click', handleMoveChoice)
            top?.appendChild(p);
        }
    }

    appendAnswerBox() {
        if (this.level.moves === undefined || this.level.moves === 0) {
            console.log('Number of moves must be set and higher than O.');
            return;
        }
        const top = document.getElementById("top");
        var i = 0;
        for (var i = 0; i < this.level.moves; i++ ) {
            const p = document.createElement("div");
            p.classList.add('answerBox');
            top?.appendChild(p);
        }
    }
   
    greet() {
      return "Hello, " + this.level;
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
            new WhereIsMYDotApp(level);
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