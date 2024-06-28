import {Action} from "./Action.ts";
import {GoapStateConst} from "../GoapStateComponent.ts";
import {GameLogic} from "../../../GameLogic.ts";

export class LootAction extends Action {
    preconditions = {[GoapStateConst.seeLoot]:true, [GoapStateConst.hasLootTarget]: true, [GoapStateConst.hasMoveTarget]:true, [GoapStateConst.isAtMoveTarget]: true};
    effects = {[GoapStateConst.hasLootTarget]: false, [GoapStateConst.hasMoveTarget]: false, [GoapStateConst.isAtMoveTarget]: true, [GoapStateConst.wantLoot]: false};
    cost: number = 0;
    type: string = LootAction.name;
    name: string = "Loot";

    override hasCompleted(entity: number, game: GameLogic): boolean {
        const areEffectsImplemented = super.hasCompleted(entity, game);
        return areEffectsImplemented;
    }
}
