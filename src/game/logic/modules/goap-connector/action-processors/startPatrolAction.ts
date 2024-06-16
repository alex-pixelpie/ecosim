import {ActionProcessor} from "../systems/GoapActionProcessorSystem.ts";
import {GameLogic} from "../../../GameLogic.ts";
import {MathUtils} from "../../../../utils/Math.ts";
import {Patrol} from "../GoapConnectorModule.ts";
import {LocomotionTarget} from "../../LocomotionModule.ts";

export const startPatrolAction: ActionProcessor = (game: GameLogic, entity: number): void => {
    const patrol = game.ecs.getComponent(entity, Patrol);

    if (!patrol || patrol.onPatrol) {
        return;
    }

    const target = MathUtils.randomPointOnCircumference(patrol.config.targetPosition, patrol.config.range);
    patrol.startPatrol(target);
    
    const locomotionTarget = game.ecs.getComponent(entity, LocomotionTarget);
    if (!locomotionTarget) {
        return;
    }
    
    locomotionTarget.x = target.x;
    locomotionTarget.y = target.y;
}