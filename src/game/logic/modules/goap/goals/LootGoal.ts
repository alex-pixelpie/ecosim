import {Goal} from "../GoapModule.ts";
import {GoapState, GoapStateConst} from "../GoapStateComponent.ts";

export class LootGoal implements Goal {
    desiredState = {[GoapStateConst.wantLoot]: false};
    priority = 1;
    name = "Loot";
    
    updatePriority(state: GoapState): void {
        this.priority = state.seeLoot ? 1 : 0;
    }
}

