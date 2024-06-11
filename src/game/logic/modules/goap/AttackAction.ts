import {GameLogic} from "../../GameLogic.ts";
import {Health} from "../weapons/Attack.ts";
import {Action} from "./Action.ts";
import {MobGoapState} from "./MobGoapState.ts";
import {TargetSelection} from "./../Targeting.ts";

export class AttackAction implements Action {
    preconditions = {[MobGoapState.hasTarget]: true, [MobGoapState.inRange]: true};
    effects = {[MobGoapState.hasTarget]: false};
    cost: number;
    type: string = AttackAction.name;

    constructor() {
        this.cost = 5;
    }

    isValid(state: Record<string, boolean>): boolean {
        return state[MobGoapState.hasTarget] && state[MobGoapState.inRange];
    }

    successState(state: Record<string, boolean>): Record<string, boolean> {
        return { ...state, ...this.effects };
    }

    hasCompleted(entity: number, game: GameLogic): boolean {
        const targetSelectionComponent = game.ecs.getComponent<TargetSelection>(entity, TargetSelection);

        if (!targetSelectionComponent || isNaN(targetSelectionComponent.target as number)) {
            return true;
        }

        const healthComponent = game.ecs.getComponent(entity, Health);

        if (!healthComponent) {
            return true;
        }

        return healthComponent.value <= 0;
    }
}