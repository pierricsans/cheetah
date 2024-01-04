import { Level, Person, MoveDirection, PersonType } from './protos/level_pb.js';
import { GridTemplate } from './app.js';
import { DEFAULT_DELAY_BETWEEN_FADE_IN_AND_MAIN_ANIMATION_MS, DEFAULT_FADE_IN_OUT_DURATION_MS, RATE_OF_ANIMATION_SLOWDOWN } from './constants.js';

abstract class Bead {
    protected element: HTMLElement = document.createElement("span");
    protected readonly person: Person;
    protected readonly level: Level;

    constructor(person: Person, level: Level) {
        this.person = person;
        this.level = level;
        this.element.classList.add('bead');
        this.element.textContent = this.person.color!;
    }

    GetAsElement(): HTMLElement {
        return this.element;
    }

    Hide() {
        this.element.style.display = "none";
    }
}

export class ActiveBead extends Bead {
    private movementIncrement: number;
    private inactiveBead: InactiveBead | null = null;
    private animationOffset: number;
    private fadeIn: Animation = new Animation();
    private mainAnimation: Animation = new Animation();
    private fadeOut: Animation = new Animation();
    private fadeInFrames: Array<Keyframe> = new Array();
    private mainAnimationFrames: Array<Keyframe> = new Array();
    private fadeOutFrames: Array<Keyframe> = new Array();

    constructor(person: Person, level: Level) {
        super(person, level);
        this.animationOffset = 0;
        this.movementIncrement = 100 / this.level.grid?.width!;
        this.element.classList.add('activeBead');
        this.animationOffset = 1 / this.person.trajectory?.moves?.length!;
        this.element.style.bottom = (this.movementIncrement * this.person.position?.yOffset!).toString() + '%';
        this.element.style.left = (this.movementIncrement * this.person.position?.xOffset!).toString() + '%';
        this.inactiveBead = new InactiveBead(this.person, this.level);
        this.fadeInFrames = this.generateFadeInFrames();
        this.mainAnimationFrames = this.generateMainAnimationFrames();
        this.fadeOutFrames = this.generateFadeOutFrames();
        this.animateElement(DEFAULT_FADE_IN_OUT_DURATION_MS, (this.level.timePerMoveMs || 200) * this.person.trajectory?.moves?.length!);
    }

    GetInactiveBead(): InactiveBead {
        return this.inactiveBead!;
    }
    
    initAndWaitForUserSelection(): Promise<PersonType> {
        return new Promise<PersonType>((resolve) => {
            for (const element of [this.element, this.inactiveBead?.GetAsElement()]) {
                if (!element) {
                    throw Error("No element found " + element);
                }
                element.addEventListener('mousedown', (event: Event) => {
                  resolve(this.person.type || PersonType.UNSPECIFIED);
                });
            }
        });
      }

    Win() {
        switch (this.person.type) {
            case PersonType.INDIGENOUS:
                this.element.style.opacity = "100%";
                if (this.inactiveBead !== null) {
                    this.inactiveBead.GetAsElement().style.opacity = "100%";
                }
                break;
            case PersonType.ALIEN:
                this.element.style.opacity = "20%"
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

    private generateFadeInFrames(): Array<Keyframe> {
        var bottom = this.movementIncrement * this.person.position?.yOffset!;
        var left = this.movementIncrement * this.person.position?.xOffset!;
        const frames: Array<Keyframe> = new Array<Keyframe>();
        frames.push({
            fontSize: "0px",
            offset: 0,
            bottom: bottom.toString() + '%',
            left: left.toString() + '%',
        });
        frames.push({
            fontSize: "var(--ball-size)",
            offset: 1,
            bottom: bottom.toString() + '%',
            left: left.toString() + '%',
        })
        return frames;
    }

    private GenerateFadeInAnimation(duration: number): Animation {
        const keyframes = new KeyframeEffect(
            this.element,
            this.fadeInFrames,
            {
                duration: duration,
                fill: "forwards",
                easing: "ease-in-out"
            }
        );
        const animation = new Animation(keyframes, document.timeline);
        return animation;
    }

    private generateFadeOutFrames(): Array<Keyframe> {
        const frames: Array<Keyframe> = new Array<Keyframe>();
        frames.push({
            fontSize: "var(--ball-size)",
            offset: 0,
        });
        frames.push({
            fontSize: "0px",
            offset: 1,
        });
        return frames;
    }

    private GenerateFadeOutAnimation(duration: number): Animation {
        const keyframes = new KeyframeEffect(
            this.element,
            this.fadeOutFrames,
            {
                duration: duration,
                fill: "forwards",
                easing: "ease-in-out"
            }
        );
        const animation = new Animation(keyframes, document.timeline);
        return animation;
    }

    private generateMainAnimationFrames(): Array<Keyframe> {
        var bottom = this.movementIncrement * this.person.position?.yOffset!;
        var left = this.movementIncrement * this.person.position?.xOffset!;
        var animationOffset = 0;
        const frames: Array<Keyframe> = new Array<Keyframe>();
        frames.push({
            offset: 0,
            bottom: bottom.toString() + '%',
            fontSize: "var(--ball-size)",
            left: left.toString() + '%',
            easing: 'ease-in-out'
        })
        for (const move of this.person.trajectory?.moves!) {
            animationOffset = animationOffset + this.animationOffset;
            switch (move.direction!) {
                case MoveDirection.NORTH:
                    bottom = bottom + this.movementIncrement;
                    break;
                case MoveDirection.SOUTH:
                    bottom = bottom - this.movementIncrement;
                    break;
                case MoveDirection.WEST:
                    left = left - this.movementIncrement
                    break;
                case MoveDirection.EAST:
                    left = left + this.movementIncrement;
                    break;
                case MoveDirection.SOUTH_EAST:
                    left = left + this.movementIncrement;
                    bottom = bottom - this.movementIncrement;
                    break;
                case MoveDirection.SOUTH_WEST:
                    left = left - this.movementIncrement
                    bottom = bottom - this.movementIncrement;
                    break;
                case MoveDirection.NORTH_EAST:
                    left = left + this.movementIncrement;
                    bottom = bottom + this.movementIncrement;
                    break;
                case MoveDirection.NORTH_WEST:
                    left = left - this.movementIncrement;
                    bottom = bottom + this.movementIncrement;
                    break;
                case MoveDirection.DOUBLE_NORTH:
                    bottom = bottom + 2 * this.movementIncrement;
                    break;
                case MoveDirection.DOUBLE_SOUTH:
                    bottom = bottom - 2 * this.movementIncrement;
                    break;
                case MoveDirection.DOUBLE_WEST:
                    left = left - 2 * this.movementIncrement
                    break;
                case MoveDirection.DOUBLE_EAST:
                    left = left + 2 * this.movementIncrement;
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
        return frames;
    }

    private GenerateMainAnimation(duration: number): Animation {
        const keyframes = new KeyframeEffect(this.element, this.mainAnimationFrames,
            {
                duration: duration,
                fill: "forwards",
                delay: DEFAULT_DELAY_BETWEEN_FADE_IN_AND_MAIN_ANIMATION_MS
            });
        const animation = new Animation(keyframes);
        return animation;
    }

    private animateElement(fadeDuration: number, mainAnimationDuration: number) {
        this.fadeIn = this.GenerateFadeInAnimation(fadeDuration);
        this.mainAnimation = this.GenerateMainAnimation(mainAnimationDuration);
        this.fadeOut = this.GenerateFadeOutAnimation(fadeDuration);
        // var rate = 1;
        this.fadeOut.onfinish = (event: Event) => {
            // rate =  rate * 0.5;
            // fadeIn.playbackRate = rate;
            // fadeOut.playbackRate = rate;
            // fadeIn.play();
            this.animateElement(fadeDuration * RATE_OF_ANIMATION_SLOWDOWN, mainAnimationDuration * RATE_OF_ANIMATION_SLOWDOWN);
        }
        this.mainAnimation.onfinish = (event: Event) => {
            this.fadeOut.play();
        }
        this.fadeIn.onfinish = (event: Event) => {
            this.mainAnimation.play();
        }

        // fadeIn.playbackRate = 1;
        // fadeOut.playbackRate = 1;
        this.fadeIn.play();
    }

}

class InactiveBead extends Bead {

    protected Init() {
        this.element.classList.add('inactiveBead');
    }

}
