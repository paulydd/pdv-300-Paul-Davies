import { Shape } from './shape';
import { Transform, Vec2 } from './geometry';

export interface Drawable {
    draw(ctx: CanvasRenderingContext2D): void;
}

export class Sprite implements Drawable {
    private image: HTMLImageElement;
    size: Vec2 | null = null;
    offset: Vec2 = Vec2.zero;

    constructor(url: string, size: Vec2 | null = null) {
        this.image = new Image();
        this.image.src = url;
        this.size = size;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.offset.x, this.offset.y);

        if (this.size) {
            ctx.drawImage(this.image, -this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
        } else {
            ctx.drawImage(this.image, -this.image.naturalWidth / 2, -this.image.naturalHeight / 2);
        }

        ctx.restore();
    }
}

export class DrawableShape implements Drawable {
    shape: Shape;

    fillColor: string | null = null;

    strokeColor: string | null = null;
    strokeWidth: number = 1;
    lineCap: CanvasLineCap | null = null;
    lineDash: number[] | null = null;

    shadowColor: string | null = null;
    shadowOffset = Vec2.zero;
    shadowBlur = 0;

    constructor(shape: Shape) {
        this.shape = shape;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();

        const path = this.shape.path();

        if (this.shadowColor) {
            ctx.shadowColor = this.shadowColor;
            ctx.shadowOffsetX = this.shadowOffset.x;
            ctx.shadowOffsetY = this.shadowOffset.y;
            ctx.shadowBlur = this.shadowBlur;
        }

        if (this.fillColor) {
            ctx.fillStyle = this.fillColor;
            ctx.fill(path);
        }

        if (this.strokeColor) {
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.strokeWidth;
            if (this.lineCap) ctx.lineCap = this.lineCap;
            if (this.lineDash) ctx.setLineDash(this.lineDash);
            ctx.stroke(path);
        }

        ctx.restore();
    }
}

export class CompositeDrawable implements Drawable {
    drawables: Drawable[];

    constructor(drawables: Drawable[] = []) {
        this.drawables = drawables;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        for (const drawable of this.drawables) {
            drawable.draw(ctx);
        }
    }
}

export class Label implements Drawable {
    /** Secondary transform applied on top of Entity transform */
    transform = new Transform();

    backgroundColor: string | null = null;
    foregroundColor = 'white';
    text: string;
    fontSize = 30;
    font = 'monospace';
    alignment: 'center' | 'left' | 'right' = 'center';

    padding = 6;

    constructor(text: string) {
        this.text = text;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        this.transform.apply(ctx);

        ctx.font = this.fontSize + 'px ' + this.font;
        ctx.textAlign = this.alignment;
        ctx.textBaseline = 'middle';
        const metrics = ctx.measureText(this.text);
        const boundingBoxWidth = metrics.width;
        const boundingBoxHeight = -metrics.alphabeticBaseline;
        if (this.backgroundColor) {
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(0, 0, boundingBoxWidth + 2 * this.padding, boundingBoxHeight + 2 * this.padding);
            ctx.fillStyle = this.foregroundColor;
        }
        ctx.fillText(this.text, 0, 0);

        ctx.restore();
    }
}