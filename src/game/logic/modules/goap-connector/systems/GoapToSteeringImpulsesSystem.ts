import {GameLogic, GameSystem} from "../../../GameLogic.ts";
import { Steering } from "../../SteeringModule.ts";
import { MoveToTargetAction } from "../../goap/actions/MoveToTargetAction.ts";
import { EscapeOverwhelmAction } from "../../goap/actions/EscapeOverwhelmAction.ts";
import { ActionComponent } from "../../goap/GoapModule.ts";
import { processMoveAction } from "../action-processors/processMoveAction.ts";
import { processEscapeOverwhelmAction } from "../action-processors/processEscapeOverwhelmAction.ts";
import {GoHomeAction} from "../../goap/actions/GoHomeAction.ts";
import {processGoHomeAction} from "../action-processors/processGoHomeAction.ts";
import {PatrolAction} from "../../goap/actions/PatrolAction.ts";
import {processPatrolAction} from "../action-processors/processPatrolAction.ts";

export type ActionProcessor = (game:GameLogic, entity: number, intensity?:number) => void;

const actionProcessors: Map<string, ActionProcessor> = new Map([
    [MoveToTargetAction.name, processMoveAction],
    [EscapeOverwhelmAction.name, processEscapeOverwhelmAction],
    [GoHomeAction.name, processGoHomeAction],
    [PatrolAction.name, processPatrolAction]
]);

export class GoapToSteeringImpulsesSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([Steering, ActionComponent]);

    protected init(): void {
        this.componentsRequired = new Set([Steering, ActionComponent]);
    }

    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const action = this.game.ecs.getComponent(entity, ActionComponent);
            actionProcessors.get(action?.currentAction?.type || '')?.(this.game, entity);
        });
    }
}
