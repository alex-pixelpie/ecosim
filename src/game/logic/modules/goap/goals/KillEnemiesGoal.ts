import {GoapState} from "../GoapStateComponent.ts";
import {Goal} from "../GoapModule.ts";

export class KillEnemiesGoal implements Goal {
    desiredState = { [GoapState.hasTarget]: false, [GoapState.inRange]: true };
    priority = 1;

    updatePriority(_: Record<string, boolean>): void {
        this.priority = 1;
    }
}
