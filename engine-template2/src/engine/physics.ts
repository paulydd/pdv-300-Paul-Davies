import type { Entity } from './entity';
import { isZero, Vec2 } from './geometry';

export class World {
    /** Gravity applied evenly to all bodies. */
    gravity = Vec2.zero;

    /** Gravitational constant for inter-body attraction. */
    G = 0; // 1 is a good default

    applyInterbodyGravity(entities: Entity[]) {
        if (isZero(this.G)) return; // no inter-body gravity

        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            if (!entity.body) continue;
            // Bodies without finite density are ignored from gravity calculations
            if (!isFinite(entity.body.density)) continue;

            for (let j = i + 1; j < entities.length; j++) {
                const other = entities[j];
                if (!other.body) continue;
                if (!isFinite(entity.body.density)) continue;

                const direction = entity.position.minus(other.position);
                const Fg = direction.normalized.scaled(this.G * entity.body.mass * other.body.mass / Math.pow(direction.mag, 2));
                // Apply equal and opposite forces, unless a body is fixed
                if (!entity.body.isFixed) entity.body.F = entity.body.F.minus(Fg);
                if (!other.body.isFixed) other.body.F = other.body.F.plus(Fg);
            }
        }
    }

    updateEntities(entities: Entity[], dT: number) {
        for (const entity of entities) {
            const body = entity.body;
            if (!body) continue;

            // Skip integrating fixed bodies; also clear any accumulated force
            if (body.isFixed) {
                body.F = Vec2.zero;
                continue;
            }

            const a = body.a.plus(this.gravity);
            body.velocity = body.velocity.plus(a.scaled(dT));
            entity.position = entity.position.plus(body.velocity.scaled(dT));

            entity.transform.rotation += body.angularVelocity * dT;
            body.F = body.thrust;
        }
    }
}
