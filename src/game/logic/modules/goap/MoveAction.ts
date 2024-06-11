import {Action} from "./Action.ts";
import {MobGoapState} from "./MobGoapState.ts";
import {GameLogic} from "../../GameLogic.ts";
import {RangeFromTarget, TargetSelection} from "./../Targeting.ts";
import {MobGoapStateComponent} from "./MobGoapStateComponent.ts";
import {PhysicsModule} from "../PhysicsModule.ts";
import Position = PhysicsModule.Position;

export class MoveAction implements Action {
    preconditions = {[MobGoapState.inRange]: false  };
    effects = { [MobGoapState.inRange]: true };
    cost: number = 10;
    type: string = MoveAction.name;

    isValid(state: Record<string, boolean>): boolean {
        return !state[MobGoapState.inRange];
    }

    successState(state: Record<string, boolean>): Record<string, boolean> {
        return { ...state, ...this.effects };
    }

    hasCompleted(entity: number, game: GameLogic): boolean {
        const targetSelectionComponent = game.ecs.getComponent(entity, TargetSelection);

        if (!targetSelectionComponent || isNaN(targetSelectionComponent.target as number)) {
            return false;
        }

        const positionComponent = game.ecs.getComponent(entity, Position);

        if (!positionComponent) {
            return false;
        }

        const rangeComponent = game.ecs.getComponent(entity, RangeFromTarget);

        if (!rangeComponent) {
            return false;
        }

        const isInRange = rangeComponent.inRange(positionComponent, targetSelectionComponent);

        const stateComponent = game.ecs.getComponent(entity, MobGoapStateComponent);
        if (stateComponent) {
            stateComponent.state[MobGoapState.inRange] = isInRange;
        }

        return isInRange;
    }
}
