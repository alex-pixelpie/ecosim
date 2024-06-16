import {Action} from "./Action.ts";
import {GoapStateConst} from "../GoapStateComponent.ts";

export class MoveAction extends Action {
    preconditions = {[GoapStateConst.isAtMoveTarget]: false, [GoapStateConst.hasMoveTarget]:true};
    effects = {[GoapStateConst.isAtMoveTarget]: true};
    cost: number = 10;
    type: string = MoveAction.name;
}
