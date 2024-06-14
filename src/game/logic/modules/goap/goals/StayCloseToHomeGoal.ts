import {GoapState} from "../GoapStateComponent.ts";
import {Goal} from "../GoapModule.ts";

export class StayCloseToHomeGoal implements Goal {
    desiredState = { [GoapState.closeToHome]: true };
    priority = 1;

    updatePriority(_: Record<string, boolean>): void {
        this.priority = 1;
    }
}
