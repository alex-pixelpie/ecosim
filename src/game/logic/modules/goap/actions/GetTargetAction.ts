import {Action} from "./Action.ts";
import {GameLogic} from "../../../GameLogic.ts";
import {GoapState, MobGoapStateComponent} from "../MobGoapStateComponent.ts";

export class GetTargetAction implements Action {
    preconditions = {[GoapState.hasTarget]: false };
    effects = { [GoapState.hasTarget]:true };
    cost: number = 1;
    type: string = GetTargetAction.name;

    isValid(state: Record<string, boolean>): boolean {
        return !state[GoapState.hasTarget];
    }

    successState(state: Record<string, boolean>): Record<string, boolean> {
        return { ...state, ...this.effects };
    }

    hasCompleted(entity: number, game: GameLogic): boolean {
        const state = game.ecs.getComponent(entity, MobGoapStateComponent);
        return state.state[GoapState.hasTarget];
    }
}