import {GameLogic, TimedGameSystem} from "../../GameLogic.ts";
import {Component} from "../../../core/ECS.ts";
import {MobGoapStateComponent} from "./MobGoapStateComponent.ts";
import {Action} from "./Action.ts";
import {MobGoapState} from "./MobGoapState.ts";
import {PhysicsModule} from "../PhysicsModule.ts";
import Position = PhysicsModule.Position;
import {PhaserPhysicsModule} from "../PhaserPhysicsModule.ts";
import PhysicsBody = PhaserPhysicsModule.PhysicsBody;
import {MathUtils} from "../../../utils/Math.ts";

export class GetTargetAction implements Action {
    preconditions = {[MobGoapState.hasTarget]: false };
    effects = { [MobGoapState.hasTarget]:true };
    cost: number = 1;

    isValid(state: Record<string, boolean>): boolean {
        return !state[MobGoapState.hasTarget];
    }

    successState(state: Record<string, boolean>): Record<string, boolean> {
        return { ...state, ...this.effects };
    }

    hasCompleted(entity: number, game: GameLogic): boolean {
        const targetSelectionComponent = game.ecs.getComponent<TargetSelection>(entity, TargetSelection);
        return targetSelectionComponent.target !== null;
    }
}

export class TargetSelection implements Component {
    target: number | null = null;
    x: number = 0;
    y: number = 0;
}

export class TargetSelectionSystem extends TimedGameSystem {
    public componentsRequired: Set<Function> = new Set([MobGoapStateComponent, TargetSelection]);

    protected init(): void {
        this.componentsRequired = new Set([MobGoapStateComponent, TargetSelection]);
    }

    public updateTimed(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const stateComponent = this.game.ecs.getComponent<MobGoapStateComponent>(entity, MobGoapStateComponent);
            const targetSelection = this.game.ecs.getComponent<TargetSelection>(entity, TargetSelection);

            // If we have a target, and it's no longer valid, clear it
            if (targetSelection.target && !this.game.mobs.has(targetSelection.target)) {
                targetSelection.target = null;
                stateComponent.state[MobGoapState.hasTarget] = false;
            }

                // If we don't have a target, select one
            if (!stateComponent.state[MobGoapState.hasTarget]) {
                targetSelection.target = this.selectTarget(entity, entities);
                stateComponent.state[MobGoapState.hasTarget] = targetSelection.target !== null;
            }

            // If we have a target, track its position
            if (targetSelection.target) {
                const targetPosition = this.game.ecs.getComponent<Position>(targetSelection.target, Position);
                
                if (targetPosition){
                    targetSelection.x = targetPosition.x;
                    targetSelection.y = targetPosition.y;
                    return;
                }

                // Maybe the target is a physical object without a Position component
                const body = this.game.ecs.getComponent(targetSelection.target, PhysicsBody);
                if (body) {
                    targetSelection.x = body.body.x;
                    targetSelection.y = body.body.y;
                }
            }
        });
    }

    private selectTarget(entity: number, entities: Set<number>): number | null {
        const position = this.game.ecs.getComponent<Position>(entity, Position);
        if (!position) {
            return null;
        }

        const potentialTargets = [...entities].filter(e => e !== entity && e !== null);
        
        if (potentialTargets.length === 0) {
            return null;
        }
        
        const targetsByDistance = potentialTargets.map(e => {
            const targetPosition = this.game.ecs.getComponent<Position>(e, Position);
            if (!targetPosition) {
                return null;
            }
            
            return {
                entity: e,
                distance: MathUtils.distance(position, targetPosition)
            };
        }).filter(v=>v).sort((a, b) => (a?.distance ?? 0) - (b?.distance ?? 0));
        
        return targetsByDistance[0]!.entity;
    }
}