import {Action} from "./Action.ts";
import {GameLogic} from "../../../GameLogic.ts";
import {GoapState, MobGoapStateComponent} from "../MobGoapStateComponent.ts";

export class AttackAction implements Action {
    preconditions = {[GoapState.hasTarget]: true, [GoapState.inRange]: true};
    effects = {[GoapState.hasTarget]: false};
    cost: number;
    type: string = AttackAction.name;

    constructor() {
        this.cost = 5;
    }

    isValid(state: Record<string, boolean>): boolean {
        return state[GoapState.hasTarget] && state[GoapState.inRange];
    }

    successState(state: Record<string, boolean>): Record<string, boolean> {
        return { ...state, ...this.effects };
    }

    hasCompleted(entity: number, game: GameLogic): boolean {
        const state = game.ecs.getComponent(entity, MobGoapStateComponent);
        return !state.state[GoapState.hasTarget] || !state.state[GoapState.inRange];
    }
}