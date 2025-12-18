import { Vec2 } from './geometry';

export abstract class Shape {
    private _cachedPath: Path2D | null = null;

    abstract area(): number;

    // Returns a cached Path2D; subclasses build on-demand.
    path(): Path2D {
        if (!this._cachedPath) {
            this._cachedPath = this.makePath();
        }
        return this._cachedPath;
    }

    // Subclasses must implement how to construct their local-space path
    protected abstract makePath(): Path2D;

    // Invalidate cached path when geometry changes
    protected invalidatePath() {
        this._cachedPath = null;
    }
}

export class Circle extends Shape {
    private _radius: number;

    constructor(radius: number) {
        super();
        this._radius = radius;
    }

    get radius() { return this._radius; }
    set radius(r: number) { this._radius = r; this.invalidatePath(); }

    area() {
        return Math.PI * this._radius * this._radius;
    }

    protected makePath(): Path2D {
        const path = new Path2D();
        path.arc(0, 0, this._radius, 0, Math.PI * 2);
        return path;
    }
}

export class Line extends Shape {
    protected _vertices: Vec2[];

    constructor(vertices: Vec2[]) {
        super();
        this._vertices = vertices;
    }

    get vertices(): Vec2[] { return this._vertices; }
    set vertices(vs: Vec2[]) { this._vertices = vs; this.invalidatePath(); }

    override area(): number {
        return 0;
    }

    protected makePath(): Path2D {
        const path = new Path2D();
        if (this._vertices.length > 0) {
            path.moveTo(this._vertices[0].x, this._vertices[0].y);
            for (let i = 1; i < this._vertices.length; i++) {
                path.lineTo(this._vertices[i].x, this._vertices[i].y);
            }
        }
        return path;
    }
}

export class Polygon extends Line {

    override area(): number {
        let area = 0;
        const n = this._vertices.length;
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            area += this._vertices[i].x * this._vertices[j].y - this._vertices[j].x * this._vertices[i].y;
        }
        return Math.abs(area) / 2;
    }

    protected override makePath(): Path2D {
        const path = super.makePath();
        path.closePath();
        return path;
    }
}

export class Rectangle extends Polygon {
    private _size: Vec2;

    constructor(w: number, h: number) {
        super([
            new Vec2(-w / 2, -h / 2),
            new Vec2(w / 2, -h / 2),
            new Vec2(w / 2, h / 2),
            new Vec2(-w / 2, h / 2),
        ]);
        this._size = new Vec2(w, h);
    }

    get size(): Vec2 { return this._size; }

    area() {
        return this._size.x * this._size.y;
    }
}