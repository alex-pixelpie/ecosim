import {Action} from "./Action.ts";
import {MobGoapState} from "./MobGoapState.ts";
import {GameLogic} from "../../GameLogic.ts";
import {TargetSelection} from "./../Targeting.ts";
import {MobGoapStateComponent} from "./MobGoapStateComponent.ts";

export class GetTargetAction implements Action {
    preconditions = {[MobGoapState.hasTarget]: false };
    effects = { [MobGoapState.hasTarget]:true };
    cost: number = 1;
    type: string = GetTargetAction.name;

    isValid(state: Record<string, boolean>): boolean {
        return !state[MobGoapState.hasTarget];
    }

    successState(state: Record<string, boolean>): Record<string, boolean> {
        return { ...state, ...this.effects };
    }

    hasCompleted(entity: number, game: GameLogic): boolean {
        const targetSelection = game.ecs.getComponent<TargetSelection>(entity, TargetSelection);
        const stateComponent = game.ecs.getComponent(entity, MobGoapStateComponent);
        stateComponent.state[MobGoapState.hasTarget] = targetSelection.target !== null;

        return stateComponent.state[MobGoapState.hasTarget];
    }
}