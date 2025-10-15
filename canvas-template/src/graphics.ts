import { type Shape } from './shapes.ts'
import { type Entity } from './entity.ts';

interface Drawable {
    draw(ctx: CanvasRenderingContext2D): void;
}
export function draw(drawable: Drawable, ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);
    drawable.draw(ctx);
    ctx.restore();
}
export class DrawableCircle implements Drawable {
    radius: number;
    constructor(radius: number) {
        this.radius = radius;
    }
    draw(ctx: CanvasRenderingContext2D): void {
        const path = new Path2D();
        path.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.fillColor;
        ctx.fill(path);
    }

    fillColor: string = 'lightblue';

}
export class DrawableShape implements Drawable {
    shape: Shape;
    constructor(shape: Shape) {
        this.shape = shape;
    }
    fillColor: string = 'lightblue';
    draw(ctx: CanvasRenderingContext2D): void {
        const path = this.shape.path();
        ctx.fillStyle = this.fillColor;
        ctx.fill(path);
    }

}


export function drawEntity(entity: Entity, ctx: CanvasRenderingContext2D) {
    if (entity.drawable) {
        draw(entity.drawable, ctx, entity.position.x, entity.position.y)
    }
}