import { Label, type Drawable } from './drawable';
import { Transform, Vec2 } from './geometry';
import { Interaction } from './interaction';
import { Body } from './body';

export class Entity {
  addChild(stripeEntity: Entity) {
    throw new Error('Method not implemented.');
  }

    constructor(name: string) {
        this.name = name;
    }

    /** The translation, scale, and rotation of the Entity */
    transform: Transform = new Transform();

    /** Entities with a Body are updated by the Physics engine */
    body: Body | null = null;

    /** Entities with a Drawable are visible onscreen */
    drawable: Drawable | null = null;

    /** Entities with an Interaction receive mouse and keyboard events */
    interaction: Interaction | null = null;

    // conveniences to get the position and rotation from the Transform
    get position() { return this.transform.translation; };
    set position(newP: Vec2) { this.transform.translation = newP; }
    get rotation() { return this.transform.rotation; }
    set rotation(newR: number) { this.transform.rotation = newR; }

    /** The name of the Entity is a convenient way to check what kind of Entity this is */
    name: string = '';
}

export class Button extends Entity {
    ctx: WeakRef<CanvasRenderingContext2D>;

    constructor(text: string, ctx: CanvasRenderingContext2D) {
        super(text + '-button');
        this.ctx = new WeakRef(ctx);
        this.drawable = new Label(text);
        this.label.backgroundColor = 'gold'
        this.label.foregroundColor = 'maroon'
        this.interaction = new Interaction(this.label.getShape(ctx));
        this.updateHitBox();
    }

    get label(): Label {
        return this.drawable as Label;
    }

    get buttonInteraction(): Interaction {
        return this.interaction!;
    }

    updateHitBox() {
        this.buttonInteraction.hitBox = this.label.getShape(this.ctx.deref()!);
    }
}