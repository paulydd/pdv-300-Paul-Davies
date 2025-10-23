import { Vec2 } from './geometry';
import { Shape, Circle, Polygon } from './shape';

export class Body {
    shape: Shape;

    constructor(shape: Shape) {
        this.shape = shape;
    }

    /** if true, this Body will not move, but other Bodies will bounce off. */
    isFixed: boolean = false;

    /** Density in "mass"/pixel^2 */
    density: number = 1;
    
    get mass(): number {
        return this.density * this.shape.area();
    }

    get invMass(): number {
        if (this.isFixed) return 0;
        return 1 / this.mass;
    }

    /** The linear velocity of this Body, in pixels per sec */
    velocity = Vec2.zero;

    /** The angular velocity of this Body, in radians per sec */
    angularVelocity: number = 0;

    /** The force accumulator for this Body */
    F = Vec2.zero;

    /** Effective acceleration on this object based on force accumulation vector */
    get a(): Vec2 { return this.F.scaled(this.invMass); }

    /** Self-powered thrust (like a rocket) */
    thrust = Vec2.zero;

    /** Bounciness: 0=no bounce, 1=perfect bounce */
    restitution: number = 1;

    /** How resistant is the body to movement */
    get inertia(): number {
        if (this.shape instanceof Circle) {
            return (this.mass * this.shape.radius * this.shape.radius) / 2;
        } else if (this.shape instanceof Polygon) {
            const vertices = this.shape.vertices;
            const count = vertices.length;
            if (count < 3) return 0;
            let accum = 0;
            for (let i = 0; i < count; i++) {
                const p0 = vertices[i];
                const p1 = vertices[(i + 1) % count];
                const cross = p0.x * p1.y - p1.x * p0.y;
                const termX = p0.x * p0.x + p0.x * p1.x + p1.x * p1.x;
                const termY = p0.y * p0.y + p0.y * p1.y + p1.y * p1.y;
                accum += cross * (termX + termY);
            }
            return Math.abs(this.density * accum) / 12;
        }
        // other shapes are not supported
        return 0;
    }

    /** If `true`, a red border will be drawn around this Body */
    debugDraw = false;
}
