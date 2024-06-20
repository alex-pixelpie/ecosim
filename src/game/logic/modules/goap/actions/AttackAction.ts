import {Action} from "./Action.ts";
import {GoapStateConst} from "../GoapStateComponent.ts";

export class AttackAction extends Action {
    preconditions = {[GoapStateConst.inRangeToAttackEnemy]:true};
    effects = {[GoapStateConst.inRangeToAttackEnemy]:false};
    cost: number = 10;
    type: string = AttackAction.name;
    name: string = "Attack";
}
