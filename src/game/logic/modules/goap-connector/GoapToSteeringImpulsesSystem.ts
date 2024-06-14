import {GameLogic, GameSystem} from "../../GameLogic.ts";
import { Steering } from "../SteeringModule.ts";
import { MoveAction } from "../goap/actions/MoveAction.ts";
import { EscapeOverwhelmAction } from "../goap/actions/EscapeOverwhelmAction.ts";
import { ActionComponent } from "../goap/GoapModule.ts";
import { processMoveAction } from "./action-processors/processMoveAction.ts";
import { processEscapeOverwhelmAction } from "./action-processors/processEscapeOverwhelmAction.ts";

export type ActionProcessor = (game:GameLogic, entity: number, intensity?:number) => void;

const actionProcessors: Map<string, ActionProcessor> = new Map([
    [MoveAction.name, processMoveAction],
    [EscapeOverwhelmAction.name, processEscapeOverwhelmAction],
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
