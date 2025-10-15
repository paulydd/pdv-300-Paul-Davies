export class Vec2 {
    x: number;
    y: number;
    constructor(x: number, y: number) {

        this.x = x;
        this.y = y;
    }

}
export interface Drawable {
    draw(ctx: CanvasRenderingContext2D): void;
  }
  

export class Entity {
    position: Vec2;
    drawable: Drawable | null = null;
    constructor(position: Vec2,) {
        this.position = position

    }

}