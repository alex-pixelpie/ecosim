import {Goal} from "../GoapModule.ts";
import {GoapState, GoapStateConst} from "../GoapStateComponent.ts";

export class KillEnemiesGoal implements Goal {
    desiredState = { [GoapStateConst.seeEnemies]: false, [GoapStateConst.isAttackingEnemy]: false, [GoapStateConst.inRangeToAttackEnemy]:false};
    priority = 1;
    name = "Kill Enemies";
    
    updatePriority(state: GoapState): void {
        this.priority = state.seeEnemies ? 2 : 0;
    }
}

