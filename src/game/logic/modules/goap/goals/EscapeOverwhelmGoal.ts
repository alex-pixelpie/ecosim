import {GoapState} from "../GoapStateComponent.ts";
import {Goal} from "../GoapModule.ts";

export class EscapeOverwhelmGoal implements Goal {
    desiredState = { [GoapState.overwhelmed]: false};
    priority = 1;

    updatePriority(_: Record<string, boolean>): void {
        this.priority = 10;
    }
}
