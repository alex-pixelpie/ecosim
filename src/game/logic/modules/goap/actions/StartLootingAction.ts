import {Action} from "./Action.ts";
import {GoapStateComponent, GoapStateConst} from "../GoapStateComponent.ts";
import {GameLogic} from "../../../GameLogic.ts";

export class StartLootingAction extends Action {
    preconditions = {[GoapStateConst.seeLoot]:true, [GoapStateConst.hasLootTarget]: false};
    effects = {[GoapStateConst.hasLootTarget]: true, [GoapStateConst.hasMoveTarget]: true, [GoapStateConst.isAtMoveTarget]: false};
    cost: number = 0;
    type: string = StartLootingAction.name;
    name: string = "Start Looting";

    override hasCompleted(entity: number, game: GameLogic): boolean {
        const areEffectsImplemented = super.hasCompleted(entity, game);
        const state = game.ecs.getComponent(entity, GoapStateComponent);
        return areEffectsImplemented || !state.state[GoapStateConst.seeLoot];
    }
}
