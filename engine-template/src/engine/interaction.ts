import type { Vec2 } from './geometry';
import type { Shape } from './shape';

export class Interaction {
    hitBox: Shape;

    constructor(hitbox: Shape) {
        this.hitBox = hitbox;
    }

    onMouseDown = (loc: Vec2) => { };
    onMouseMove = (loc: Vec2) => { };
    onMouseUp = (loc: Vec2) => { };

    onKeyDown = (key: string) => { console.log(key); };
    onKeyUp = (key: string) => { };
}