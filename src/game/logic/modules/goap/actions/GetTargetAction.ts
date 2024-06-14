import {Action} from "./Action.ts";
import {GameLogic} from "../../../GameLogic.ts";
import {GoapState, GoapStateComponent} from "../GoapStateComponent.ts";

export class GetTargetAction implements Action {
    preconditions = {[GoapState.hasTarget]: false, [GoapState.targetsInSight]: true};
    effects = { [GoapState.hasTarget]:true };
    cost: number = 10;
    type: string = GetTargetAction.name;

    isValid(state: Record<string, boolean>): boolean {
        return Object.keys(this.preconditions).some(key => state[key] != this.preconditions[key as keyof typeof this.preconditions]);
    }

    successState(state: Record<string, boolean>): Record<string, boolean> {
        return { ...state, ...this.effects };
    }

    hasCompleted(entity: number, game: GameLogic): boolean {
        const state = game.ecs.getComponent(entity, GoapStateComponent);
        return Object.keys(this.effects).every(key => state.state[key as keyof typeof this.effects] == this.effects[key as keyof typeof this.effects]);
    }
}