import {Goal} from "../GoapModule.ts";
import {GoapStateConst} from "../GoapStateComponent.ts";

export class PatrolGoal implements Goal {
    desiredState = { [GoapStateConst.isAtMoveTarget]: true, [GoapStateConst.patrolling]: true};
    priority = 1;

    updatePriority(_: Record<string, boolean>): void {
        this.priority = 5;
    }
}
