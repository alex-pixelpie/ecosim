import {Action} from "./Action.ts";
import {GameLogic} from "../../../GameLogic.ts";
import {GoapState, GoapStateComponent} from "../GoapStateComponent.ts";

export class AttackAction implements Action {
    preconditions = {[GoapState.hasTarget]: true, [GoapState.inRangeOfTarget]: true};
    effects = {[GoapState.hasTarget]: false};
    cost: number;
    type: string = AttackAction.name;

    constructor() {
        this.cost = 5;
    }

    isValid(state: Record<string, boolean>): boolean {
        return state[GoapState.hasTarget] && state[GoapState.inRangeOfTarget];
    }

    successState(state: Record<string, boolean>): Record<string, boolean> {
        return { ...state, ...this.effects };
    }

    hasCompleted(entity: number, game: GameLogic): boolean {
        const state = game.ecs.getComponent(entity, GoapStateComponent);
        return !state.state[GoapState.hasTarget] || !state.state[GoapState.inRangeOfTarget];
    }
}