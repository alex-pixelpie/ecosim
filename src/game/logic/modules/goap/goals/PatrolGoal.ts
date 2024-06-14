import {GoapState} from "../GoapStateComponent.ts";
import {Goal} from "../GoapModule.ts";

export class PatrolGoal implements Goal {
    desiredState = { [GoapState.homePatrolled]: true };
    priority = 1;

    updatePriority(_: Record<string, boolean>): void {
        this.priority = 5;
    }
}
