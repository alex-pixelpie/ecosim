import { GameSystem } from "../../../GameLogic.ts";
import { GoapState, GoapStateComponent } from "../../goap/GoapStateComponent.ts";
import { OverwhelmComponent } from "../../OverwhelmModule.ts";
import { Position } from "../../PhaserPhysicsModule.ts";
import { RangeFromTarget, TargetSelection } from "../../TargetingModule.ts";
import {Home} from "../../BuildingsModule.ts";
import {Patrol} from "../../PatrolModule.ts";

export class GoapStateUpdateSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([GoapStateComponent]);

    protected init(): void {
        this.componentsRequired = new Set([GoapStateComponent]);
    }

    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const state = this.game.ecs.getComponent(entity, GoapStateComponent);

            this.updateInRangeState(entity, state);
            this.updateOverwhelmState(entity, state);
            this.updateTargetingState(entity, state);
            this.updateCloseToHomeState(entity, state);
            this.updateHomePatrolledState(entity, state);
        });
    }

    private updateInRangeState(entity: number, state: GoapStateComponent) {
        const game = this.game;
        state.state[GoapState.inRangeOfTarget] = false;

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

        state.state[GoapState.inRangeOfTarget] = rangeComponent.inRange(positionComponent, targetSelectionComponent, targetSelectionComponent.targetSize);
    }

    private updateOverwhelmState(entity: number, state: GoapStateComponent) {
        const overwhelm = this.game.ecs.getComponent(entity, OverwhelmComponent);
        state.state[GoapState.overwhelmed] = overwhelm?.overwhelmed || false;
    }

    private updateTargetingState(entity: number, state: GoapStateComponent) {
        const targetSelection = this.game.ecs.getComponent<TargetSelection>(entity, TargetSelection);
        state.state[GoapState.hasTarget] = !!(targetSelection?.target);
    }
    
    private updateCloseToHomeState(entity: number, state: GoapStateComponent) {
        const position = this.game.ecs.getComponent(entity, Position);
        const targetSelection = this.game.ecs.getComponent(entity, TargetSelection);
        const home = this.game.ecs.getComponent(entity, Home);
        
        if (!position || !targetSelection || !home) {
            return;
        }

        state.state[GoapState.closeToHome] = home.inRange(position);
    }

    private updateHomePatrolledState(entity: number, state: GoapStateComponent) {
        const position = this.game.ecs.getComponent(entity, Position);
        const patrol = this.game.ecs.getComponent(entity, Patrol);
        
        if (!position || !patrol) {
            state.state[GoapState.homePatrolled] = false;
            return;
        }

        state.state[GoapState.homePatrolled] = patrol.inRange(position);
    }
}
