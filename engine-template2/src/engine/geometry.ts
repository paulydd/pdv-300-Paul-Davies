export const Epsilon = 1e-6;
export const isZero = (val: number) => Math.abs(val) < Epsilon;

export class Vec2 {
    private xy: [number, number] = [0, 0];

    get x() { return this.xy[0]; }
    set x(newX: number) { this.xy[0] = newX; }
    get y() { return this.xy[1]; }
    set y(newY: number) { this.xy[1] = newY; }

    constructor(x: number = 0, y: number = 0) {
        this.xy = [x, y];
    }

    static get zero() { return new Vec2(); }

    plus(other: Vec2) { return new Vec2(this.x + other.x, this.y + other.y); }
    minus(other: Vec2) { return new Vec2(this.x - other.x, this.y - other.y); }
    scaled(factor: number) { return new Vec2(this.x * factor, this.y * factor); }
    dot(other: Vec2) { return this.x * other.x + this.y * other.y; }
    distance(other: Vec2) { return this.minus(other).mag; }

    get mag(): number { return Math.hypot(this.x, this.y); }
    get normalized(): Vec2 { return isZero(this.mag) ? Vec2.zero : this.scaled(1 / this.mag); }
    get perp(): Vec2 { return new Vec2(-this.y, this.x); }

    transformed(transform: Transform) {
        const { translation, rotation, scale } = transform;

        let x = this.x * scale.x;
        let y = this.y * scale.y;

        if (!isZero(rotation)) {
            const cos = Math.cos(rotation);
            const sin = Math.sin(rotation);
            const rotatedX = x * cos - y * sin;
            const rotatedY = x * sin + y * cos;
            x = rotatedX;
            y = rotatedY;
        }

        return new Vec2(x + translation.x, y + translation.y);
    }
}

export const sum = (a: Vec2, b: Vec2): Vec2 => {
    return new Vec2(a.x + b.x, a.y + b.y);
};

export const diff = (a: Vec2, b: Vec2): Vec2 => {
    return new Vec2(a.x - b.x, a.y - b.y);
};

export const scale = (v: Vec2, s: number) => {
    return new Vec2(v.x * s, v.y * s);
};

export const dot = (a: Vec2, b: Vec2): number => {
    return a.x * b.x + a.y * b.y;
};

export const perp = (v: Vec2): Vec2 => {
    return new Vec2(-v.y, v.x);
};

export const magnitude = (v: Vec2): number => {
    return Math.hypot(v.x, v.y);
};

export const normalize = (v: Vec2): Vec2 => {
    const m = magnitude(v);
    return m === 0 ? Vec2.zero : new Vec2(v.x / m, v.y / m);
};

export class Transform {
    translation: Vec2;
    rotation: number; // in radians
    scale: Vec2;

    constructor(translation = Vec2.zero, rotation = 0, scale = new Vec2(1, 1)) {
        this.translation = translation;
        this.rotation = rotation;
        this.scale = scale;
    }

    apply(ctx: CanvasRenderingContext2D) {
        ctx.translate(this.translation.x, this.translation.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale.x, this.scale.y);
    }
}
