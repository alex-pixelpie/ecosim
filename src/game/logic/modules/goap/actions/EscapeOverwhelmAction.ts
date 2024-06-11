import {Action} from "./Action.ts";
import {GameLogic} from "../../../GameLogic.ts";
import {GoapState, MobGoapStateComponent} from "./../MobGoapStateComponent.ts";

export class EscapeOverwhelmAction implements Action {
    preconditions = {[GoapState.overwhelmed]: true  };
    effects = { [GoapState.overwhelmed]: false };
    cost: number = 10;
    type: string = EscapeOverwhelmAction.name;

    isValid(state: Record<string, boolean>): boolean {
        return state[GoapState.overwhelmed];
    }

    successState(state: Record<string, boolean>): Record<string, boolean> {
        return { ...state, ...this.effects };
    }

    hasCompleted(entity: number, game: GameLogic): boolean {
        const state = game.ecs.getComponent(entity, MobGoapStateComponent);
        return state.state[GoapState.overwhelmed];
    }
}
