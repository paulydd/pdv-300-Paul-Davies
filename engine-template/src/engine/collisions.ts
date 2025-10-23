import { Vec2 } from './geometry';
import { Circle, Polygon } from './shape';
import { Entity } from './entity';

/** Represents a detected collision between two entities */
export interface Collision {
    entityA: Entity;
    entityB: Entity;

    /** The normal is the direction of the force vector from entityA -> entityB */
    normal: Vec2;
    /**  */
    loc: Vec2;
    /** Depth of the collision penetration */
    penetration: number;
}

export function checkCollision(A: Entity, B: Entity): Collision | null {
    const shapeA = A.body?.shape;
    const shapeB = B.body?.shape;
    if (!shapeA || !shapeB) return null;

    const bodyA = A.body;
    const bodyB = B.body;
    if (!bodyA || !bodyB) return null;

    let result: { normal: Vec2; loc: Vec2; penetration: number; } | null = null;

    if (shapeA instanceof Circle && shapeB instanceof Circle) {
        result = checkCircleCollision(A.position, B.position, shapeA.radius, shapeB.radius);
    } else if (shapeA instanceof Circle && shapeB instanceof Polygon) {
        result = checkPolyCircleCollision(
            shapeB.vertices.map(v => v.transformed(B.transform)),
            A.position, shapeA.radius
        );
        if (result) {
            // invert normal so that it points from A -> B
            const penetration = result.penetration;
            const normal = new Vec2(-result.normal.x, -result.normal.y);
            const loc = new Vec2(A.position.x + normal.x * shapeA.radius, A.position.y + normal.y * shapeA.radius);
            // console.log(data.loc, loc);
            result = { normal, loc, penetration };
        }
    } else if (shapeA instanceof Polygon && shapeB instanceof Circle) {
        result = checkPolyCircleCollision(
            shapeA.vertices.map(v => v.transformed(A.transform)),
            B.position, shapeB.radius
        );
    } else if (shapeA instanceof Polygon && shapeB instanceof Polygon) {
        result = checkPolyCollision(
            shapeA.vertices.map(v => v.transformed(A.transform)),
            shapeB.vertices.map(v => v.transformed(B.transform)),
        );
    }

    if (!result) return null;

    const collision: Collision = { entityA: A, entityB: B, ...result };

    // apply positional correction
    const invMassA = bodyA.invMass;
    const invMassB = bodyB.invMass;
    const invMassSum = invMassA + invMassB;
    const percent = 0.2;
    const slop = 0.01;
    if (invMassSum > 0) {
        const correctionMag = percent * Math.max(collision.penetration - slop, 0) / invMassSum;
        if (correctionMag > 0) {
            const corrX = collision.normal.x * correctionMag;
            const corrY = collision.normal.y * correctionMag;
            if (invMassA > 0) {
                A.position = new Vec2(A.position.x - corrX * invMassA, A.position.y - corrY * invMassA);
            }
            if (invMassB > 0) {
                B.position = new Vec2(B.position.x + corrX * invMassB, B.position.y + corrY * invMassB);
            }
        }
    }

    return collision;
}

function checkCircleCollision(pA: Vec2, pB: Vec2, rA: number, rB: number): { normal: Vec2; loc: Vec2; penetration: number; } | null {
    const dx = pB.x - pA.x;
    const dy = pB.y - pA.y;
    const distanceSquared = dx * dx + dy * dy;
    const radiusSum = rA + rB;
    if (distanceSquared > radiusSum * radiusSum) return null;

    // Build collision info
    if (distanceSquared === 0) {
        // Coincident centers: choose an arbitrary normal
        return { normal: new Vec2(1, 0), loc: new Vec2(pA.x, pA.y), penetration: radiusSum };
    }
    const dist = Math.sqrt(distanceSquared);
    const nx = dx / dist;
    const ny = dy / dist;
    // Contact point on surface of A along the normal
    const loc = new Vec2(pA.x + nx * rA, pA.y + ny * rA);
    return { normal: new Vec2(nx, ny), loc, penetration: radiusSum - dist };
}

function checkPolyCollision(pA: Vec2[], pB: Vec2[]): { normal: Vec2; loc: Vec2; penetration: number; } | null {
    const countA = pA.length;
    const countB = pB.length;
    if (countA === 0 || countB === 0) return null;

    const axes: Vec2[] = [];
    const addAxes = (poly: Vec2[]) => {
        for (let i = 0; i < poly.length; i++) {
            const v0 = poly[i];
            const v1 = poly[(i + 1) % poly.length];
            const edgeX = v1.x - v0.x;
            const edgeY = v1.y - v0.y;
            const lenSq = edgeX * edgeX + edgeY * edgeY;
            if (lenSq === 0) continue; // Degenerate edge
            const invLen = 1 / Math.sqrt(lenSq);
            axes.push(new Vec2(-(edgeY * invLen), edgeX * invLen)); // outward normal
        }
    };

    // Standard SAT: gather candidate separating axes from both polygons.
    addAxes(pA);
    addAxes(pB);
    if (axes.length === 0) return null;

    let minOverlap = Infinity;
    let bestAxis = new Vec2(0, 0);

    // Project a polygon onto an axis and return the scalar extent.
    const project = (poly: Vec2[], axis: Vec2): { min: number; max: number; } => {
        let min = Infinity;
        let max = -Infinity;
        for (let i = 0; i < poly.length; i++) {
            const p = poly[i];
            const projection = p.x * axis.x + p.y * axis.y;
            if (projection < min) min = projection;
            if (projection > max) max = projection;
        }
        return { min, max };
    };

    for (let i = 0; i < axes.length; i++) {
        const axis = axes[i];
        const projA = project(pA, axis);
        const projB = project(pB, axis);
        const overlap = Math.min(projA.max, projB.max) - Math.max(projA.min, projB.min);
        if (overlap <= 0) {
            return null;
        }
        if (overlap < minOverlap) {
            minOverlap = overlap;
            bestAxis = axis;
        }
    }

    // Orient the normal so it points from polygon A toward polygon B.
    const centroid = (poly: Vec2[]): Vec2 => {
        let sx = 0;
        let sy = 0;
        for (let i = 0; i < poly.length; i++) {
            sx += poly[i].x;
            sy += poly[i].y;
        }
        const inv = 1 / poly.length;
        return new Vec2(sx * inv, sy * inv);
    };

    const centroidA = centroid(pA);
    const centroidB = centroid(pB);
    const dirX = centroidB.x - centroidA.x;
    const dirY = centroidB.y - centroidA.y;
    if (bestAxis.x * dirX + bestAxis.y * dirY < 0) {
        bestAxis = new Vec2(-bestAxis.x, -bestAxis.y);
    }

    const normal = bestAxis;
    const tangent = new Vec2(-normal.y, normal.x);
    const EPS = 1e-6;

    // Collect the face (or vertex) that is furthest along the supplied axis.
    const collectSupport = (
        poly: Vec2[],
        count: number,
        axis: Vec2,
        findMax: boolean
    ): { value: number; points: Vec2[]; } => {
        let extreme = findMax ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
        const points: Vec2[] = [];
        for (let i = 0; i < count; i++) {
            const p = poly[i];
            const proj = p.x * axis.x + p.y * axis.y;
            const better = findMax ? proj > extreme + EPS : proj < extreme - EPS;
            const close = Math.abs(proj - extreme) <= EPS;
            if (better) {
                extreme = proj;
                points.length = 0;
                points.push(p);
            } else if (close) {
                points.push(p);
            }
        }
        return { value: extreme, points };
    };

    const supportA = collectSupport(pA, countA, normal, true);
    const supportB = collectSupport(pB, countB, normal, false);

    const average = (pts: Vec2[]): Vec2 => {
        let sx = 0;
        let sy = 0;
        for (let i = 0; i < pts.length; i++) {
            sx += pts[i].x;
            sy += pts[i].y;
        }
        const inv = pts.length === 0 ? 0 : 1 / pts.length;
        return new Vec2(sx * inv, sy * inv);
    };

    // Compute centroids of the features touching the separating plane.
    const supportCenterA = average(supportA.points);
    const supportCenterB = average(supportB.points);

    // Project a set of points onto an axis and return the scalar range.
    const projectRange = (pts: Vec2[], axis: Vec2): { min: number; max: number; } => {
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        for (let i = 0; i < pts.length; i++) {
            const proj = pts[i].x * axis.x + pts[i].y * axis.y;
            if (proj < min) min = proj;
            if (proj > max) max = proj;
        }
        if (!isFinite(min) || !isFinite(max)) {
            min = max = 0;
        }
        return { min, max };
    };

    let loc: Vec2;
    // Position of polygon A's support plane along the normal.
    const planeDistance = supportA.value;

    if (supportA.points.length <= 1 && supportB.points.length <= 1) {
        // Vertex-vertex or vertex-edge grazing: take midpoint projected back onto the plane.
        const midX = (supportCenterA.x + supportCenterB.x) * 0.5;
        const midY = (supportCenterA.y + supportCenterB.y) * 0.5;
        const distance = midX * normal.x + midY * normal.y;
        const correction = planeDistance - distance;
        loc = new Vec2(midX + normal.x * correction, midY + normal.y * correction);
    } else if (supportA.points.length <= 1) {
        // Polygon A contributes a single feature; that point already lies on the plane.
        loc = supportA.points[0] ?? supportCenterB;
    } else if (supportB.points.length <= 1) {
        // Polygon B contributes a single feature projected onto A's plane.
        const source = supportB.points[0] ?? supportCenterA;
        const distance = source.x * normal.x + source.y * normal.y;
        const correction = planeDistance - distance;
        loc = new Vec2(source.x + normal.x * correction, source.y + normal.y * correction);
    } else {
        // Face-face: clamp along the tangent direction to the overlapping span, then slide back to the plane.
        const spanA = projectRange(supportA.points, tangent);
        const spanB = projectRange(supportB.points, tangent);
        const overlapMin = Math.max(spanA.min, spanB.min);
        const overlapMax = Math.min(spanA.max, spanB.max);

        if (overlapMax >= overlapMin - EPS) {
            const target = (overlapMin + overlapMax) * 0.5;
            const base = supportA.points[0] ?? supportCenterA;
            const baseProj = base.x * tangent.x + base.y * tangent.y;
            const slide = target - baseProj;
            let contactX = base.x + tangent.x * slide;
            let contactY = base.y + tangent.y * slide;
            const distance = contactX * normal.x + contactY * normal.y;
            const correction = planeDistance - distance;
            contactX += normal.x * correction;
            contactY += normal.y * correction;
            loc = new Vec2(contactX, contactY);
        } else {
            // Parallel faces with no measurable span overlap—fallback to midpoint.
            const midX = (supportCenterA.x + supportCenterB.x) * 0.5;
            const midY = (supportCenterA.y + supportCenterB.y) * 0.5;
            const distance = midX * normal.x + midY * normal.y;
            const correction = planeDistance - distance;
            loc = new Vec2(midX + normal.x * correction, midY + normal.y * correction);
        }
    }

    return { normal, loc, penetration: minOverlap };
}

function checkPolyCircleCollision(pP: Vec2[], pC: Vec2, rC: number): { normal: Vec2; loc: Vec2; penetration: number; } | null {
    const count = pP.length;
    if (count === 0) return null;

    // Test polygon face normals, then a vertex axis aimed at the circle to catch corner cases.
    let minOverlap = Number.POSITIVE_INFINITY;
    let bestAxisX = 0;
    let bestAxisY = 0;

    for (let i = 0; i < count; i++) {
        // Sweep through polygon edges to perform SAT tests against each outward normal.
        const v0 = pP[i];
        const v1 = pP[(i + 1) % count];
        const edgeX = v1.x - v0.x;
        const edgeY = v1.y - v0.y;
        const lenSq = edgeX * edgeX + edgeY * edgeY;
        if (lenSq === 0) continue;
        const invLen = 1 / Math.sqrt(lenSq);
        const axisX = -(edgeY * invLen);
        const axisY = edgeX * invLen;

        let minA = Number.POSITIVE_INFINITY;
        let maxA = Number.NEGATIVE_INFINITY;
        for (let j = 0; j < count; j++) {
            const proj = pP[j].x * axisX + pP[j].y * axisY;
            if (proj < minA) minA = proj;
            if (proj > maxA) maxA = proj;
        }

        const centerProj = pC.x * axisX + pC.y * axisY;
        const minB = centerProj - rC;
        const maxB = centerProj + rC;
        const overlap = Math.min(maxA, maxB) - Math.max(minA, minB);
        if (overlap <= 0) return null;
        if (overlap < minOverlap) {
            minOverlap = overlap;
            bestAxisX = axisX;
            bestAxisY = axisY;
        }
    }

    let closestIdx = -1;
    let closestDistSq = Number.POSITIVE_INFINITY;
    for (let i = 0; i < count; i++) {
        const v = pP[i];
        const dx = pC.x - v.x;
        const dy = pC.y - v.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < closestDistSq) {
            closestDistSq = distSq;
            closestIdx = i;
        }
    }

    if (closestIdx !== -1 && closestDistSq > 0) {
        // Re-test along the axis pointing from the closest polygon vertex to the circle center.
        const v = pP[closestIdx];
        const dx = pC.x - v.x;
        const dy = pC.y - v.y;
        const invDist = 1 / Math.sqrt(closestDistSq);
        const axisX = dx * invDist;
        const axisY = dy * invDist;

        let minA = Number.POSITIVE_INFINITY;
        let maxA = Number.NEGATIVE_INFINITY;
        for (let j = 0; j < count; j++) {
            const proj = pP[j].x * axisX + pP[j].y * axisY;
            if (proj < minA) minA = proj;
            if (proj > maxA) maxA = proj;
        }

        const centerProj = pC.x * axisX + pC.y * axisY;
        const minB = centerProj - rC;
        const maxB = centerProj + rC;
        const overlap = Math.min(maxA, maxB) - Math.max(minA, minB);
        if (overlap <= 0) return null;
        if (overlap < minOverlap) {
            minOverlap = overlap;
            bestAxisX = axisX;
            bestAxisY = axisY;
        }
    }

    if (!isFinite(minOverlap)) return null;

    let centroidX = 0;
    let centroidY = 0;
    for (let i = 0; i < count; i++) {
        centroidX += pP[i].x;
        centroidY += pP[i].y;
    }
    const invCount = 1 / count;
    centroidX *= invCount;
    centroidY *= invCount;

    // Flip the best axis if it points into the polygon so the normal always pushes toward the circle.
    const dirX = pC.x - centroidX;
    const dirY = pC.y - centroidY;
    if (bestAxisX * dirX + bestAxisY * dirY < 0) {
        bestAxisX = -bestAxisX;
        bestAxisY = -bestAxisY;
    }

    const normal = new Vec2(bestAxisX, bestAxisY);
    const loc = new Vec2(pC.x - normal.x * rC, pC.y - normal.y * rC);

    return { normal, loc, penetration: minOverlap };
}

export function resolveCollision(collision: Collision) {
    const { entityA: A, entityB: B, normal, loc } = collision;
    const bodyA = A.body;
    const bodyB = B.body;
    if (!bodyA || !bodyB) return;

    const invMassSum = bodyA.invMass + bodyB.invMass;
    if (invMassSum === 0) return; // Do nothing if both bodies are immovable

    let rA: Vec2 | null = null;
    let rB: Vec2 | null = null;
    let invInertiaA = 0;
    let invInertiaB = 0;
    if (loc) {
        rA = new Vec2(loc.x - A.position.x, loc.y - A.position.y);
        rB = new Vec2(loc.x - B.position.x, loc.y - B.position.y);
        if (!bodyA.isFixed && bodyA.inertia !== 0) invInertiaA = 1 / bodyA.inertia;
        if (!bodyB.isFixed && bodyB.inertia !== 0) invInertiaB = 1 / bodyB.inertia;
    }

    let vRelX = bodyB.velocity.x - bodyA.velocity.x;
    let vRelY = bodyB.velocity.y - bodyA.velocity.y;
    if (rA && rB) {
        const tangentialAx = -bodyA.angularVelocity * rA.y;
        const tangentialAy = bodyA.angularVelocity * rA.x;
        const tangentialBx = -bodyB.angularVelocity * rB.y;
        const tangentialBy = bodyB.angularVelocity * rB.x;
        vRelX += tangentialBx - tangentialAx;
        vRelY += tangentialBy - tangentialAy;
    }

    const velAlongN = vRelX * normal.x + vRelY * normal.y;
    if (velAlongN >= 0) return; // objects are already separating

    const restitution = Math.min(bodyA.restitution, bodyB.restitution);
    let impulseDenom = invMassSum;
    if (rA && rB) {
        const rACrossN = rA.x * normal.y - rA.y * normal.x;
        const rBCrossN = rB.x * normal.y - rB.y * normal.x;
        impulseDenom += rACrossN * rACrossN * invInertiaA + rBCrossN * rBCrossN * invInertiaB;
    }
    if (impulseDenom === 0) return;

    const j = -(1 + restitution) * velAlongN / impulseDenom;
    const impulse = new Vec2(j * normal.x, j * normal.y);

    bodyA.velocity.x -= impulse.x * bodyA.invMass;
    bodyA.velocity.y -= impulse.y * bodyA.invMass;
    bodyB.velocity.x += impulse.x * bodyB.invMass;
    bodyB.velocity.y += impulse.y * bodyB.invMass;

    if (rA && rB) {
        const angularImpulseA = rA.x * impulse.y - rA.y * impulse.x;
        const angularImpulseB = rB.x * impulse.y - rB.y * impulse.x;
        bodyA.angularVelocity -= angularImpulseA * invInertiaA;
        bodyB.angularVelocity += angularImpulseB * invInertiaB;
    }
}
