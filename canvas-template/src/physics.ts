import { Vec2 } from "./entity";
import { Entity } from "./entity";


export class PhysicalBody {
    velocity = new Vec2(0, 0);

}
export function updateEntity(myEntity: Entity, deltaT: number) {
    if (myEntity.body) {
        myEntity.position.x = myEntity.position.x + (myEntity.body.velocity.x * deltaT)
        myEntity.position.y = myEntity.position.y + (myEntity.body.velocity.y * deltaT)
    }



}