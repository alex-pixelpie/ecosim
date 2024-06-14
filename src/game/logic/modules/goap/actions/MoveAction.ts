import {Action} from "./Action.ts";
import {GameLogic} from "../../../GameLogic.ts";
import {GoapState, GoapStateComponent} from "../GoapStateComponent.ts";

export class MoveAction implements Action {
    preconditions = {[GoapState.inRangeOfTarget]: false  };
    effects = { [GoapState.inRangeOfTarget]: true };
    cost: number = 10;
    type: string = MoveAction.name;

    isValid(state: Record<string, boolean>): boolean {
        return !state[GoapState.inRangeOfTarget];
    }

    successState(state: Record<string, boolean>): Record<string, boolean> {
        return { ...state, ...this.effects };
    }

    hasCompleted(entity: number, game: GameLogic): boolean {
        const stateComponent = game.ecs.getComponent(entity, GoapStateComponent);
        return stateComponent.state[GoapState.inRangeOfTarget];
    }
}
