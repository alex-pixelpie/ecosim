import {Action} from "./Action.ts";
import {GameLogic} from "../../../GameLogic.ts";
import {GoapState, GoapStateComponent} from "../GoapStateComponent.ts";

export class PatrolAction implements Action {
    preconditions = {[GoapState.homePatrolled]: false, [GoapState.closeToHome]: true, [GoapState.overwhelmed]: false, [GoapState.hasTarget]: false};
    effects = { [GoapState.homePatrolled]: true};
    cost: number = 10;
    type: string = PatrolAction.name;

    isValid(state: Record<string, boolean>): boolean {
        return !state[GoapState.homePatrolled];
    }

    successState(state: Record<string, boolean>): Record<string, boolean> {
        return { ...state, ...this.effects };
    }

    hasCompleted(entity: number, game: GameLogic): boolean {
        const stateComponent = game.ecs.getComponent(entity, GoapStateComponent);
        return stateComponent.state[GoapState.homePatrolled];
    }
}
