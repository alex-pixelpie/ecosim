import {Action} from "./Action.ts";
import {GoapStateComponent, GoapStateConst} from "../GoapStateComponent.ts";
import {GameLogic} from "../../../GameLogic.ts";

export class MoveAction extends Action {
    preconditions = {[GoapStateConst.isAtMoveTarget]: false, [GoapStateConst.hasMoveTarget]:true};
    effects = {[GoapStateConst.isAtMoveTarget]: true};
    cost: number = 10;
    type: string = MoveAction.name;
    name: string = "Move";

    override hasCompleted(entity: number, game: GameLogic): boolean {
        const areEffectsImplemented = super.hasCompleted(entity, game);
        return areEffectsImplemented || !game.ecs.getComponent(entity, GoapStateComponent)?.state[GoapStateConst.hasMoveTarget];
    }
}
