import { GameSystem } from "../../../GameLogic.ts";
import {GoapStateComponent, GoapStateConst} from "../../goap/GoapStateComponent.ts";
import {Position} from "../../PhaserPhysicsModule.ts";
import {Patrol} from "../GoapConnectorModule.ts";

export class GoapStateUpdateSystem extends GameSystem {
    public componentsRequired: Set<Function> = new Set([GoapStateComponent]);

    protected init(): void {
        this.componentsRequired = new Set([GoapStateComponent]);
    }

    public update(entities: Set<number>, _: number): void {
        entities.forEach(entity => {
            const state = this.game.ecs.getComponent(entity, GoapStateComponent);

            this.updatePatrolStates(entity, state);
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
}
