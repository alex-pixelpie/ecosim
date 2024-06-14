import {ActionProcessor} from "../systems/GoapToSteeringImpulsesSystem.ts";
import {GameLogic} from "../../../GameLogic.ts";
import {Steering} from "../../SteeringModule.ts";
import {Position} from "../../PhaserPhysicsModule.ts";
import {MathUtils} from "../../../../utils/Math.ts";
import {Patrol} from "../../PatrolModule.ts";

export const processPatrolAction: ActionProcessor = (game: GameLogic, entity: number, intensity: number = 1): void => {
    const steering = game.ecs.getComponent(entity, Steering);
    const position = game.ecs.getComponent(entity, Position);
    const patrol = game.ecs.getComponent(entity, Patrol);

    if (!steering || !position || !patrol) {
        return;
    }

    const inRange = patrol.inRange(position);
    if (inRange) {
        return;
    }

    const dir = MathUtils.normalize({
        x: patrol.x - position.x,
        y: patrol.y - position.y
    });

    steering.impulses.push(MathUtils.multiply(dir, intensity));
}