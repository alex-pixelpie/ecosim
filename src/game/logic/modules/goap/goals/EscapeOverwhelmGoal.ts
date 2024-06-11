import {GOAP} from "../GoapModule.ts";
import Goal = GOAP.Goal;
import {GoapState} from "../MobGoapStateComponent.ts";

export class EscapeOverwhelmGoal implements Goal {
    desiredState = { [GoapState.overwhelmed]: false};
    priority = 1;

    updatePriority(_: Record<string, boolean>): void {
        this.priority = 10;
    }
}
