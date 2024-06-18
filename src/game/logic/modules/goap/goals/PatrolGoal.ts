import {Goal} from "../GoapModule.ts";
import {GoapState, GoapStateConst} from "../GoapStateComponent.ts";

export class PatrolGoal implements Goal {
    desiredState = { [GoapStateConst.isAtMoveTarget]: true, [GoapStateConst.patrolling]: true};
    priority = 1;

    updatePriority(state: GoapState): void {
        this.priority = state.isPatrolOnCooldown ? 0 : 1;
    }
}

