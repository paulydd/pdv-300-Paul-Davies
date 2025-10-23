import { Vec2 } from './geometry';
import { checkCollision, resolveCollision, type Collision } from './collisions';
import type { Entity } from './entity';
import { World } from './physics';
export { Body } from './body';
export { Interaction } from './interaction';
export { Vec2 } from './geometry';
export { Shape, Circle, Rectangle, Polygon, Line } from './shape';
export { Entity } from './entity';
export { DrawableShape, Sprite, Label, } from './drawable';

export class Engine {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null;
    size: { width: number; height: number; } = { width: 800, height: 600 };
    // private get width() { return this.canvas?.width || 0; }
    // private get height() { return this.canvas?.height || 0; }
    scale: number = 2;
    timer: number | null = null;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        // Request a desynchronized context for lower-latency rendering (may allow tearing)
        this.ctx = (this.canvas.getContext('2d', { desynchronized: true, alpha: false }) as CanvasRenderingContext2D | null)
            || this.canvas.getContext('2d');
        this.size.width = this.canvas.width;
        this.size.height = this.canvas.height;

        const getMouseLoc = (event: MouseEvent) => new Vec2(event.offsetX, event.offsetY);

        canvas.onmousemove = (event) => {
            const mouseLoc = getMouseLoc(event);
            const hitEntities = this.entitiesAtPoint(mouseLoc);
            for (const entity of hitEntities) {
                entity.interaction?.onMouseMove?.(mouseLoc);
            }
        };

        canvas.onmousedown = (event) => {
            const mouseLoc = getMouseLoc(event);
            const hitEntities = this.entitiesAtPoint(mouseLoc);
            for (const entity of hitEntities) {
                entity.interaction?.onMouseDown?.(mouseLoc);
            }
        };

        canvas.onmouseup = (event) => {
            const mouseLoc = getMouseLoc(event);
            const hitEntities = this.entitiesAtPoint(mouseLoc);
            for (const entity of hitEntities) {
                entity.interaction?.onMouseUp?.(mouseLoc);
            }
        };

        document.onkeydown = (event) => {
            for (const entity of this.entities) {
                entity.interaction?.onKeyDown(event.key);
            }
        };

        document.onkeyup = (event) => {
            for (const entity of this.entities) {
                entity.interaction?.onKeyUp(event.key);
            }
        };
    }

    // ###### Callbacks ######

    /** Set this function to a custom game update loop. */
    gameUpdate = () => { };

    /** Set this function to a custom collision handler.
     *  @return `true` if the objects should bounce off each other, `false` otherwise.
     */
    onCollision = (collision: Collision): boolean => { return true; };

    private _entities: Entity[] = [];
    get entities() {
        return this._entities;
    }

    addEntity(entity: Entity) {
        this.entities.push(entity);
    }

    removeEntity = (entity: Entity) => {
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
    };

    removeAllEntities() {
        this._entities = [];
    }

    // ## INTERACTIONS ####

    private touchCtx = document.createElement('canvas').getContext('2d');

    private entitiesAtPoint = (point: Vec2): Entity[] => {
        const ctx = this.touchCtx;
        if (!ctx) return [];

        return this.entities.filter(entity => {
            if (!entity.interaction?.hitBox) return false;

            ctx.save();
            const transform = entity.transform;
            ctx.translate(transform.translation.x, transform.translation.y);
            ctx.rotate(transform.rotation);
            ctx.scale(transform.scale.x, transform.scale.y);
            // console.log(entity.interaction.hitShape, point);
            const isInside = ctx.isPointInPath(entity.interaction.hitBox.path(), point.x, point.y);
            ctx.restore();

            return isInside;
        });
    };

    private _isRunning = false;
    public get isRunning() {
        return this._isRunning;
    }

    public set isRunning(isRunning: boolean) {

        if (this.isRunning === isRunning) return;
        this._isRunning = isRunning;
        if (this.isRunning) window.requestAnimationFrame(this.doFrame);
    }

    private lastUpdateTime: number | null = null;

    private lastRenderTime: number | null = null;
    private renderTime = 0;
    private renderCount = 0;
    fps = 0;

    doFrame = () => {
        const now = performance.now() / 1000.0;

        if (!this.lastUpdateTime) {
            this.lastUpdateTime = now;
            this.lastRenderTime = now;
        } else {
            const diff = now - this.lastRenderTime!;
            this.lastRenderTime = now;
            this.renderTime += diff;
            this.renderCount += 1;
            if (this.renderCount === 10) {
                this.fps = 1 / (this.renderTime / this.renderCount);
                this.renderTime = 0;
                this.renderCount = 0;
            }

            const timeStep = 1.0 / 240;
            while (this.lastUpdateTime + timeStep <= now) {
                this.lastUpdateTime += timeStep;
                this.applyPhysics(timeStep);
                this.gameUpdate();
            }

            this.render();
        };

        if (this.isRunning) {
            window.requestAnimationFrame(this.doFrame);
        } else {
            this.lastUpdateTime = null;
        }
    };

    // #### PHYSICS ####
    world = new World();

    applyPhysics = (dT: number) => {
        this.world.applyInterbodyGravity(this.entities);

        // Update all bodies
        this.world.updateEntities(this.entities, dT);

        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];
            if (!entity.body) continue;

            // Check for collisions with other bodies
            for (let j = i + 1; j < this.entities.length; j++) {
                const other = this.entities[j];
                if (!other.body) continue; // Skip entities without bodies
                if (entity === other) continue; // Skip self-collision
                const col = checkCollision(entity, other);
                if (col) {
                    if (this.onCollision(col)) resolveCollision(col);
                }
            }
        }
    };

    // #### GRAPHICS ####
    render = () => {
        const ctx = this.ctx;
        if (!ctx) return;

        ctx.save();
        ctx.scale(this.scale, this.scale);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, this.size.width, this.size.height);

        // Draw all entities
        for (const entity of this.entities) {
            ctx.save();
            const transform = entity.transform;
            ctx.translate(transform.translation.x, transform.translation.y);
            ctx.rotate(entity.transform.rotation);
            ctx.scale(transform.scale.x, transform.scale.y);
            entity.drawable?.draw(ctx);
            if (entity.body?.debugDraw) {
                ctx.save();
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 1;
                ctx.stroke(entity.body.shape.path());
                ctx.restore();
            }
            ctx.restore();
        }

        ctx.restore();
    };

    resize(width: number, height: number, scale: number) {
        if (!this.canvas) return;

        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        this.canvas.width = width * scale;
        this.canvas.height = height * scale;
        this.size.width = width;
        this.size.height = height;
        this.scale = scale;

        const touchCanvas = document.createElement('canvas');
        touchCanvas.width = width;
        touchCanvas.height = height;
        this.touchCtx = touchCanvas.getContext('2d');
    }
}
