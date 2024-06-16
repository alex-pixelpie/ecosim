import {GameLogic, GameSystem} from "../../../GameLogic.ts";
import { ActionComponent } from "../../goap/GoapModule.ts";
import {startPatrolAction} from "../action-processors/startPatrolAction.ts";
import {StartPatrolAction} from "../../goap/actions/StartPatrolAction.ts";
import {MoveAction} from "../../goap/actions/MoveAction.ts";
import {processMoveAction} from "../action-processors/processMoveAction.ts";

export type ActionProcessor = (game:GameLogic, entity: number) => void;

const actionProcessors: Map<string, ActionProcessor> = new Map([
    [StartPatrolAction.name, startPatrolAction],
    [MoveAction.name, processMoveAction]
]);

export class GoapActionProcessorSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([ActionComponent]);

    protected init(): void {
        this.componentsRequired = new Set([ActionComponent]);
    }

    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const action = this.game.ecs.getComponent(entity, ActionComponent);
            actionProcessors.get(action?.currentAction?.type || '')?.(this.game, entity);
        });
    }
}
