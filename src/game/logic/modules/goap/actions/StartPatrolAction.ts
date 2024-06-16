import {Action} from "./Action.ts";
import {GoapStateConst} from "../GoapStateComponent.ts";

export class StartPatrolAction extends Action {
    preconditions = {[GoapStateConst.patrolling]: false, [GoapStateConst.hasMoveTarget]:false};
    effects = {[GoapStateConst.patrolling]: true, [GoapStateConst.hasMoveTarget]:true};
    cost: number = 10;
    type: string = StartPatrolAction.name;
}
