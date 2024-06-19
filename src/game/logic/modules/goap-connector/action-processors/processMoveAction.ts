import { GameLogic } from "../../../GameLogic.ts";
import { Steering } from "../../SteeringModule.ts";
import {Position, Size} from "../../PhaserPhysicsModule.ts";
import { ActionProcessor } from "../systems/GoapActionProcessorSystem.ts";
import {LocomotionTarget} from "../../LocomotionModule.ts";
import {MathUtils} from "../../../../utils/Math.ts";

export const processMoveAction: ActionProcessor = (game: GameLogic, entity: number, intensity: number = 1) => {
    const steering = game.ecs.getComponent(entity, Steering);
    const locomotionTarget = game.ecs.getComponent(entity, LocomotionTarget);
    const position = game.ecs.getComponent(entity, Position);
    
    if (!steering || !locomotionTarget || !position) {
        return;
    }

    const size = game.ecs.getComponent(entity, Size)?.radius ?? 0;

    const inRange = locomotionTarget.inRange(position, size);

    if (inRange) {
        steering.impulses = [];
        return;
    }

    const vectorToTarget = locomotionTarget.tooClose(position, size) ? MathUtils.subtract(position, locomotionTarget) : MathUtils.subtract(locomotionTarget, position);
    const impulseToTarget = MathUtils.multiply(MathUtils.normalize(vectorToTarget), intensity);
    
    steering.impulses.push(impulseToTarget);
};
