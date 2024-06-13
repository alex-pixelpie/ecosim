import {GOAP} from "../GoapModule.ts";
import Goal = GOAP.Goal;
import {GoapState} from "../MobGoapStateComponent.ts";

export class GetToTargetGoal implements Goal {
    desiredState = { [GoapState.inRange]: true };
    priority = 1;

    updatePriority(_: Record<string, boolean>): void {
        this.priority = 1;
    }
}
