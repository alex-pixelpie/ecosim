import { GameSystem } from "../../../GameLogic.ts";
import {GoapStateComponent, GoapStateConst} from "../../goap/GoapStateComponent.ts";
import {Position} from "../../PhaserPhysicsModule.ts";
import {Patrol} from "../GoapConnectorModule.ts";
import {Senses} from "../../SensoryModule.ts";
import {Targeting, TargetGroup, TargetOfAttack} from "../../TargetingModule.ts";

export class GoapStateUpdateSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([GoapStateComponent]);

    protected init(): void {
        this.componentsRequired = new Set([GoapStateComponent]);
    }

    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const state = this.game.ecs.getComponent(entity, GoapStateComponent);

            this.updatePatrolStates(entity, state);
            this.updateSensoryStates(entity, state);
            this.updateAttackStates(entity, state);
        });
    }

    private updatePatrolStates(entity: number, state: GoapStateComponent) {
        const patrol = this.game.ecs.getComponent(entity, Patrol);
        
        const wasPatrolling = state.state[GoapStateConst.patrolling];
        const isPatrolling = patrol?.onPatrol;
        state.state[GoapStateConst.patrolling] = isPatrolling;
        state.state[GoapStateConst.isPatrolOnCooldown] = patrol?.isOnCooldown(this.game.currentTime);
        
        if (wasPatrolling){
            state.state[GoapStateConst.hasMoveTarget] = state.state[GoapStateConst.patrolling];
        } 
        
        if (!isPatrolling){
            return;
        }

        state.state[GoapStateConst.hasMoveTarget] = true;
        
        // Update locomotion state
        const position = this.game.ecs.getComponent(entity, Position);
        if (!position) {
            return;
        }
        
        const isPatrolEnded = patrol.inRange(position);
        
        state.state[GoapStateConst.isAtMoveTarget] = isPatrolEnded;
        
        if (isPatrolEnded){
            patrol.endPatrol(this.game.currentTime);
        }
    }

    private updateSensoryStates(entity: number, state: GoapStateComponent) {
        const senses = this.game.ecs.getComponent(entity, Senses);
        if (!senses) {
            return;
        }
        
        const targeting = this.game.ecs.getComponent(entity, Targeting)?.targetGroups;
        if (!targeting) {
            return;
        }
        
        state.state[GoapStateConst.seeEnemies] = senses.entitiesInRange.some(entity => {
            const mobGroup = this.game.ecs.getComponent(entity, TargetGroup);
            return targeting.has(mobGroup?.id);
        });
    }

    private updateAttackStates(entity: number, state: GoapStateComponent) {
        const attackTarget = this.game.ecs.getComponent(entity, TargetOfAttack);
        if (!attackTarget) {
            return;
        }

        const wasAttacking = state.state.isAttackingEnemy;

        if (!attackTarget.attacking){
            if (wasAttacking){
                state.state.isAttackingEnemy = false;
                state.state.inRangeToAttackEnemy = false;
                state.state.hasMoveTarget = false;
                state.state.isAtMoveTarget = false;
            }
            return;
        }

        state.state.isAttackingEnemy = true;

        const position = this.game.ecs.getComponent(entity, Position);
        state.state.isAtMoveTarget = attackTarget.inRange(position);
        state.state.hasMoveTarget = !state.state.isAtMoveTarget;
        state.state.inRangeToAttackEnemy = state.state.isAtMoveTarget;
    }
}
