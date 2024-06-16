import { GameLogic } from "../../../GameLogic.ts";
import { Steering } from "../../SteeringModule.ts";
import {Position, Size} from "../../PhaserPhysicsModule.ts";
import { ActionProcessor } from "../systems/GoapActionProcessorSystem.ts";
import {LocomotionTarget} from "../../LocomotionModule.ts";
import {MathUtils} from "../../../../utils/Math.ts";
import {FrameLog, FrameLogType} from "../../FrameLogModule.ts";

export const processMoveAction: ActionProcessor = (game: GameLogic, entity: number, intensity: number = 1) => {
    const steering = game.ecs.getComponent(entity, Steering);
    const locomotionTarget = game.ecs.getComponent(entity, LocomotionTarget);
    const position = game.ecs.getComponent(entity, Position);
    const log = game.ecs.getComponent(entity, FrameLog);
    
    if (!steering || !locomotionTarget || !position || !log) {
        return;
    }

    const size = game.ecs.getComponent(entity, Size)?.radius ?? 0;

    const inRange = locomotionTarget.inRange(position, size);

    if (inRange) {
        
        log.logs.push({
            type: FrameLogType.MoveTargetReached,
            value: 0,
            timestamp: game.currentTime
        });
        
        steering.impulses = [];
        return;
    }

    const impulseToTarget = MathUtils.multiply(MathUtils.normalize({
        x: locomotionTarget.x - position.x,
        y: locomotionTarget.y - position.y
    }), intensity);
    
    steering.impulses.push(impulseToTarget);
};
