import {GOAP} from "../GoapModule.ts";
import Goal = GOAP.Goal;
import {GoapState} from "../MobGoapStateComponent.ts";

export class KillEnemiesGoal implements Goal {
    desiredState = { [GoapState.hasTarget]: false, [GoapState.inRange]: true };
    priority = 1;

    updatePriority(_: Record<string, boolean>): void {
        this.priority = 1;
    }
}
