import {Action} from "./Action.ts";
import {GoapStateConst} from "../GoapStateComponent.ts";

export class StartAttackingEnemiesAction extends Action {
    preconditions = {[GoapStateConst.seeEnemies]: true, [GoapStateConst.isAttackingEnemy]: false};
    effects = {[GoapStateConst.isAttackingEnemy]: true, [GoapStateConst.hasMoveTarget]:true};
    cost: number = 10;
    type: string = StartAttackingEnemiesAction.name;
}
