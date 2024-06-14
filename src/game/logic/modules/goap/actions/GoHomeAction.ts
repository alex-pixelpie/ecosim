import {Action} from "./Action.ts";
import {GameLogic} from "../../../GameLogic.ts";
import {GoapState, GoapStateComponent} from "../GoapStateComponent.ts";

export class GoHomeAction implements Action {
    preconditions = {[GoapState.closeToHome]: false  };
    effects = { [GoapState.closeToHome]: true };
    cost: number = 10;
    type: string = GoHomeAction.name;

    isValid(state: Record<string, boolean>): boolean {
        return !state[GoapState.closeToHome];
    }

    successState(state: Record<string, boolean>): Record<string, boolean> {
        return { ...state, ...this.effects };
    }

    hasCompleted(entity: number, game: GameLogic): boolean {
        const stateComponent = game.ecs.getComponent(entity, GoapStateComponent);
        return stateComponent.state[GoapState.closeToHome];
    }
}
