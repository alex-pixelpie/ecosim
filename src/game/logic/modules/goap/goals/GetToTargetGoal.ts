import {GoapState} from "../GoapStateComponent.ts";
import {Goal} from "../GoapModule.ts";

export class GetToTargetGoal implements Goal {
    desiredState = { [GoapState.inRangeOfTarget]: true };
    priority = 1;

    updatePriority(_: Record<string, boolean>): void {
        this.priority = 1;
    }
}
